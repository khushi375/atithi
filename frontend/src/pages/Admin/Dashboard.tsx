import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { 
  Users, MapPin, ClipboardList, AlertCircle, IndianRupee,
  Compass, BarChart as ChartIcon, RefreshCw, Star
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  // Fetch admin dashboard statistical data
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['adminStats', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser
  });

  if (isLoading || !analytics) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-gold-400 font-serif text-lg animate-pulse">
          Retrieving analytics dashboard data...
        </div>
      </AdminLayout>
    );
  }

  const { stats, recentBookings, monthlyStats, categoryStats } = analytics;

  const statCards = [
    { label: 'Total Destinations', value: stats.totalDestinations, icon: <MapPin className="w-5 h-5 text-gold-500" />, desc: 'Active packages' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: <ClipboardList className="w-5 h-5 text-gold-500" />, desc: 'All cab requests' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: <AlertCircle className="w-5 h-5 text-amber-500" />, desc: 'Awaiting approval', alert: stats.pendingBookings > 0 },
    { label: 'Completed Bookings', value: stats.completedBookings, icon: <ClipboardList className="w-5 h-5 text-blue-500" />, desc: 'Fulfillments' },
    { label: 'Total Contacts', value: stats.totalContacts, icon: <Users className="w-5 h-5 text-purple-500" />, desc: 'Customer inquiries' },
    { label: 'Approved Reviews', value: stats.approvedReviews, icon: <Star className="w-5 h-5 text-gold-500 fill-gold-500" />, desc: 'Active testimonials' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5 text-green-500" />, desc: 'Earnings sum' }
  ];

  // Colors for category distribution chart
  const COLORS = ['#1a4335', '#d4aa37', '#73a797', '#cbd5e1'];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
              System Analytics Overview
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time platform stats, cab bookings flow, and Google Sheets sync logs.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 border border-slate-200 dark:border-luxury-800 rounded-xl hover:bg-slate-100 dark:hover:bg-luxury-900 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-gold-500" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* 1. Stat Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {statCards.map((card, idx) => (
            <div 
              key={idx} 
              className={`glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 flex flex-col justify-between hover:shadow-md transition duration-300 ${
                card.alert ? 'border-red-400/20 bg-red-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  {card.label}
                </span>
                <div className="p-2 bg-gold-400/5 rounded-lg border border-gold-400/10">
                  {card.icon}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black text-slate-800 dark:text-white leading-none">
                  {card.value}
                </h3>
                <span className="text-[10px] text-slate-400 mt-1.5 block">
                  {card.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Charts and Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart 1: Monthly booking & revenue trends */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-gold-500" />
              <span>Booking & Revenue Performance</span>
            </h3>
            <div className="w-full h-80 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar name="Cab Bookings" dataKey="bookings" fill="#d4aa37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Regional Holiday Packages distribution */}
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Compass className="w-4 h-4 text-gold-500 animate-spin" style={{ animationDuration: '30s' }} />
              <span>Region Distribution</span>
            </h3>
            <div className="w-full h-80 flex flex-col items-center justify-center">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                      fontSize={10}
                    >
                      {categoryStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Recent Bookings Table */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850">
          <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
            Recent Cab Requests
          </h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-luxury-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Booking ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Destination</th>
                  <th className="py-3 px-2">Travel Date</th>
                  <th className="py-3 px-2">Vehicle Type</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-luxury-850">
                {recentBookings && recentBookings.length > 0 ? (
                  recentBookings.map((b: any) => {
                    const travelDate = new Date(b.travelDate).toLocaleDateString();
                    return (
                      <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-luxury-850/40 transition">
                        <td className="py-3.5 px-2 font-bold tracking-wider text-slate-800 dark:text-white">{b.bookingReference}</td>
                        <td className="py-3.5 px-2 font-medium">{b.fullName}</td>
                        <td className="py-3.5 px-2 font-bold text-gold-500 font-serif">{(b.destinationId as any)?.name || 'Deleted Destination'}</td>
                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">{travelDate}</td>
                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">{b.vehicleType}</td>
                        <td className="py-3.5 px-2 text-right">
                          <span 
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              b.status === 'Pending' && 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200/50'
                            } ${
                              b.status === 'Approved' && 'bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-400 border border-green-200/50'
                            } ${
                              b.status === 'Rejected' && 'bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-200/50'
                            } ${
                              b.status === 'Completed' && 'bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border border-blue-200/50'
                            } ${
                              b.status === 'Archived' && 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No cab requests logged in the system database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
export default AdminDashboard;
