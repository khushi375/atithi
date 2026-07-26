import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Compass, Calendar, Car, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Profile: React.FC = () => {
  const { currentUser, dbUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'trips'>('profile');

  // Fetch user specific bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser
  });

  const joinedDate = dbUser ? new Date(dbUser.joinedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Loading...';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Sidebar Controls */}
        <div className="w-full lg:w-64 shrink-0 glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
              <User className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">
                {dbUser?.name || 'Valued Guest'}
              </h3>
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider mt-0.5">
                {dbUser?.role === 'admin' ? 'Administrator' : 'Standard Member'}
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-slate-200/50 dark:bg-luxury-800/50 my-4"></div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-luxury-850 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold transition ${
                activeTab === 'trips'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-luxury-850 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              My Trips ({bookings ? bookings.length : 0})
            </button>
          </div>
        </div>

        {/* Display Panel */}
        <div className="flex-grow w-full glass p-8 rounded-2xl border border-slate-200/50 dark:border-luxury-850 min-h-[400px]">
          
          {/* Tab 1: Profile Details */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-luxury-800/50 pb-3">
                Account Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{dbUser?.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{dbUser?.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider block">System Access Role</span>
                  <span className="text-sm font-bold text-gold-500 capitalize">{dbUser?.role}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider block">Date Joined</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{joinedDate}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Booked Trips */}
          {activeTab === 'trips' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-luxury-800/50 pb-3">
                My Trips History
              </h2>

              {bookingsLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
                  Fetching your travel logs...
                </div>
              ) : !bookings || bookings.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-200 dark:border-luxury-800 rounded-xl p-8 max-w-sm mx-auto">
                  <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-slate-700 dark:text-slate-350">No Trips Booked Yet</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    You haven't scheduled any tours. Explore our nature destinations and book a premium cab today!
                  </p>
                  <Link
                    to="/"
                    className="mt-5 inline-flex items-center gap-1 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2 px-5 rounded-lg text-[10px] shadow"
                  >
                    <span>Browse Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-luxury-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-2">Booking ID</th>
                        <th className="py-3 px-2">Destination</th>
                        <th className="py-3 px-2">Travel Date</th>
                        <th className="py-3 px-2">Vehicle</th>
                        <th className="py-3 px-2">Pax</th>
                        <th className="py-3 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-luxury-850">
                      {bookings.map((booking: any) => {
                        const travelDate = new Date(booking.travelDate).toLocaleDateString();
                        return (
                          <tr key={booking._id} className="hover:bg-slate-50/50 dark:hover:bg-luxury-850/40 transition">
                            <td className="py-4 px-2 font-bold tracking-wider text-slate-800 dark:text-white">
                              {booking.bookingReference}
                            </td>
                            <td className="py-4 px-2 font-serif font-bold text-gold-500">
                              {(booking.destinationId as any)?.name || 'Destination Deleted'}
                            </td>
                            <td className="py-4 px-2 text-slate-500 dark:text-slate-400">
                              {travelDate}
                            </td>
                            <td className="py-4 px-2 text-slate-500 dark:text-slate-400">
                              {booking.vehicleType}
                            </td>
                            <td className="py-4 px-2 font-bold text-slate-700 dark:text-slate-350">
                              {booking.passengers}
                            </td>
                            <td className="py-4 px-2 text-right">
                              <span 
                                className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  booking.status === 'Pending' && 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800'
                                } ${
                                  booking.status === 'Approved' && 'bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-800'
                                } ${
                                  booking.status === 'Rejected' && 'bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800'
                                } ${
                                  booking.status === 'Completed' && 'bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800'
                                } ${
                                  booking.status === 'Archived' && 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default Profile;
