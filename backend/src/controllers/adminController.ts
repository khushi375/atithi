import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User, Booking, Destination, Review, Contact, AdminActivityLog } from '../models';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDestinations = await Destination.countDocuments({ status: { $ne: 'Deleted' } });
    const totalBookings = await Booking.countDocuments({ status: { $ne: 'Deleted' } });
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const completedBookingsCount = await Booking.countDocuments({ status: { $in: ['Completed', 'Archived'] } });
    const totalContacts = await Contact.countDocuments({ status: { $ne: 'Deleted' } });
    const approvedReviews = await Review.countDocuments({ status: 'Approved' });

    // Calculate revenue based on price of completed/archived trips
    const completedBookings = await Booking.find({ status: { $in: ['Completed', 'Archived'] } }).populate('destinationId');
    const revenue = completedBookings.reduce((sum, booking) => {
      const price = (booking.destinationId as any)?.price || 0;
      return sum + price;
    }, 0);

    // Generate recent bookings list (last 5 active ones)
    const recentBookings = await Booking.find({ status: { $ne: 'Deleted' } })
      .populate('destinationId')
      .sort({ createdAt: -1 })
      .limit(5);

    // Create chart data: Bookings count per month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Default chart data for the current year
    const monthlyStatsMap: { [key: string]: { month: string; bookings: number; revenue: number } } = {};
    months.forEach(m => {
      monthlyStatsMap[m] = { month: m, bookings: 0, revenue: 0 };
    });

    const allBookingsForStats = await Booking.find({ status: { $ne: 'Deleted' } }).populate('destinationId');
    allBookingsForStats.forEach(b => {
      const date = new Date(b.createdAt);
      if (date.getFullYear() === currentYear) {
        const monthName = months[date.getMonth()];
        monthlyStatsMap[monthName].bookings += 1;
        if (b.status === 'Completed' || b.status === 'Archived') {
          monthlyStatsMap[monthName].revenue += (b.destinationId as any)?.price || 0;
        }
      }
    });

    const monthlyStats = Object.values(monthlyStatsMap);

    // Calculate Category Distribution of destinations
    const categoryStats = await Destination.aggregate([
      { $match: { status: { $ne: 'Deleted' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalDestinations,
        totalBookings,
        pendingBookings,
        completedBookings: completedBookingsCount,
        totalContacts,
        approvedReviews,
        revenue
      },
      recentBookings,
      monthlyStats,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Server error while calculating dashboard statistics' });
  }
};

export const getAdminLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await AdminActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(100);
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return res.status(500).json({ message: 'Server error while fetching logs' });
  }
};
