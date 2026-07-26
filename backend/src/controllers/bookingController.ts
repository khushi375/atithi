import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Booking, Destination, Counter, User, AdminActivityLog } from '../models';
import { syncBookingToSheet } from '../services/googleSheets';
import { sendBookingNotification, sendStatusUpdateNotification } from '../services/email';

const getNextSequenceValue = async (sequenceName: string): Promise<number> => {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
};

export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { destinationId, fullName, email, phone, travelDate, passengers, vehicleType, specialRequest } = req.body;

    if (!destinationId || !fullName || !email || !phone || !travelDate || !passengers || !vehicleType) {
      return res.status(400).json({ message: 'All booking fields are required.' });
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Selected destination does not exist.' });
    }

    // Retrieve local user document
    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    // Generate Booking ID (ATH-YYYY-XXXX)
    const year = new Date().getFullYear();
    const seq = await getNextSequenceValue('bookingReference');
    const paddedSeq = String(seq).padStart(4, '0');
    const bookingReference = `ATH-${year}-${paddedSeq}`;

    const booking = new Booking({
      bookingReference,
      userId: userDoc._id,
      destinationId,
      fullName,
      email,
      phone,
      travelDate: new Date(travelDate),
      passengers: Number(passengers),
      vehicleType,
      specialRequest,
      status: 'Pending'
    });

    await booking.save();

    // Async Sheets sync wrapped in try/catch to maintain resiliency
    try {
      await syncBookingToSheet(
        booking._id.toString(),
        booking.fullName,
        booking.email,
        destination.name,
        booking.travelDate,
        booking.status,
        booking.createdAt,
        booking.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync booking to Google Sheets:', err);
    }

    // Nodemailer Notification trigger
    try {
      await sendBookingNotification(booking, destination.name);
    } catch (err) {
      console.error('Failed to send booking emails:', err);
    }

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Server error while creating booking' });
  }
};

export const getMyBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const bookings = await Booking.find({ userId: userDoc._id })
      .populate('destinationId')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ message: 'Server error while fetching user bookings' });
  }
};

export const getAllBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('userId')
      .populate('destinationId')
      .sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return res.status(500).json({ message: 'Server error while fetching all bookings' });
  }
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status selection.' });
    }

    const booking = await Booking.findById(id).populate('destinationId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    // Status transition validation rules
    const currentStatus = booking.status;
    if (currentStatus === 'Completed' || currentStatus === 'Rejected' || currentStatus === 'Archived' || currentStatus === 'Deleted') {
      return res.status(400).json({ message: `Cannot change status of a booking in '${currentStatus}' state.` });
    }
    if (currentStatus === 'Pending' && !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: `Pending bookings can only transition to 'Approved' or 'Rejected'.` });
    }
    if (currentStatus === 'Approved' && status !== 'Completed') {
      return res.status(400).json({ message: `Approved bookings can only transition to 'Completed'.` });
    }

    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    const destinationName = (booking.destinationId as any)?.name || 'Unknown Destination';

    // Async Sheets sync wrapped in try/catch to maintain resiliency
    try {
      await syncBookingToSheet(
        booking._id.toString(),
        booking.fullName,
        booking.email,
        destinationName,
        booking.travelDate,
        booking.status,
        booking.createdAt,
        booking.updatedAt
      );
    } catch (err) {
      console.error('Failed to update booking status in Google Sheets:', err);
    }

    // Nodemailer Notification trigger on status change
    try {
      await sendStatusUpdateNotification(booking, destinationName);
    } catch (err) {
      console.error('Failed to send status update notification:', err);
    }

    // Log the admin action
    try {
      if (req.user) {
        let actionLabel = 'Updated Booking';
        if (status === 'Approved') actionLabel = 'Approved Booking';
        else if (status === 'Rejected') actionLabel = 'Rejected Booking';
        else if (status === 'Completed') actionLabel = 'Completed Booking';

        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: actionLabel,
          recordType: 'Booking',
          recordId: booking._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Server error while updating status' });
  }
};

export const deleteBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('destinationId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    const currentStatus = booking.status;
    const targetStatus = currentStatus === 'Completed' ? 'Archived' : 'Deleted';
    const actionLabel = currentStatus === 'Completed' ? 'Archived Booking' : 'Deleted Booking';

    booking.previousStatus = currentStatus;
    booking.status = targetStatus;
    booking.updatedAt = new Date();
    await booking.save();

    const destinationName = (booking.destinationId as any)?.name || 'Unknown Destination';

    // Sync status change to Google Sheets
    try {
      await syncBookingToSheet(
        booking._id.toString(),
        booking.fullName,
        booking.email,
        destinationName,
        booking.travelDate,
        booking.status,
        booking.createdAt,
        booking.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync booking status to Google Sheets:', err);
    }

    // Log the admin action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: actionLabel,
          recordType: 'Booking',
          recordId: booking._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json({ 
      message: currentStatus === 'Completed' 
        ? 'Booking archived successfully' 
        : 'Booking deleted successfully (moved to Trash)' 
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ message: 'Server error while deleting booking' });
  }
};

export const restoreBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('destinationId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    const restoredStatus = booking.previousStatus || 'Pending';

    booking.status = restoredStatus as any;
    booking.previousStatus = undefined;
    booking.updatedAt = new Date();
    await booking.save();

    const destinationName = (booking.destinationId as any)?.name || 'Unknown Destination';

    // Sync status restoration to Google Sheets
    try {
      await syncBookingToSheet(
        booking._id.toString(),
        booking.fullName,
        booking.email,
        destinationName,
        booking.travelDate,
        booking.status,
        booking.createdAt,
        booking.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync restored booking status to Google Sheets:', err);
    }

    // Log the admin action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Restored Booking',
          recordType: 'Booking',
          recordId: booking._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error restoring booking:', error);
    return res.status(500).json({ message: 'Server error while restoring booking' });
  }
};
