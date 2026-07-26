import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Check, X, Compass, CheckCircle2, Trash, RotateCcw, AlertCircle, PhoneCall } from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ManageBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');

  // Deletion Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch all bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/bookings/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser
  });

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await axios.patch(
        `${API_URL}/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  });

  // Delete booking mutation (performs soft-delete / archive)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await axios.delete(
        `${API_URL}/bookings/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete booking.');
    }
  });

  // Restore booking mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await axios.patch(
        `${API_URL}/bookings/${id}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to restore booking.');
    }
  });

  const handleStatusChange = (id: string, status: 'Approved' | 'Rejected' | 'Completed') => {
    statusMutation.mutate({ id, status });
  };

  const handleDeleteTrigger = (id: string, currentStatus: string) => {
    setSelectedId(id);
    setIsArchiving(currentStatus === 'Completed');
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(selectedId);
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  // Filter Active vs Trash records
  const activeBookings = bookings
    ? bookings.filter((b: any) => b.status !== 'Deleted' && b.status !== 'Archived')
    : [];

  const trashBookings = bookings
    ? bookings.filter((b: any) => b.status === 'Deleted' || b.status === 'Archived')
    : [];

  const currentList = activeTab === 'active' ? activeBookings : trashBookings;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in text-left">
        
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
            Cab Bookings Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validate incoming cab requests, confirm driver slots, or moderate archive logs.
          </p>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-slate-200 dark:border-luxury-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-6 font-bold text-xs border-b-2 transition ${
              activeTab === 'active'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-250'
            }`}
          >
            Active Records ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`py-2 px-6 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'trash'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-250'
            }`}
          >
            <span>Trash / Archives ({trashBookings.length})</span>
          </button>
        </div>

        {/* Data list */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg">
          {isLoading ? (
            <div className="py-12 text-center text-gold-400 text-xs animate-pulse">
              Syncing bookings database...
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <Compass className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                {activeTab === 'active' ? 'No Active Bookings' : 'Trash Empty'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'active' 
                  ? 'Once customers verify accounts and book cabs, their logs will mount here.' 
                  : 'Soft-deleted bookings or archived trips will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-luxury-850 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Destination</th>
                    <th className="py-3 px-2">Travel Date</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2">Created Date</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-luxury-850">
                  {currentList.map((b: any) => {
                    const travelDate = new Date(b.travelDate).toLocaleDateString();
                    const createdDate = new Date(b.createdAt).toLocaleDateString();
                    return (
                      <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-luxury-850/40 transition">
                        {/* Customer Column */}
                        <td className="py-4.5 px-2 space-y-1">
                          <strong className="block text-slate-700 dark:text-slate-200">{b.fullName}</strong>
                          <span className="block text-[10px] text-slate-450">{b.email}</span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <PhoneCall className="w-3 h-3 text-gold-500" />
                            <span>{b.phone}</span>
                          </span>
                          <span className="block text-[9px] font-mono text-gold-550 font-bold uppercase tracking-wider mt-1">{b.bookingReference}</span>
                        </td>
                        
                        {/* Destination Column */}
                        <td className="py-4.5 px-2 space-y-0.5">
                          <strong className="block text-gold-500 font-serif">
                            {(b.destinationId as any)?.name || 'Deleted Package'}
                          </strong>
                          <span className="block text-[10px] text-slate-400">
                            {b.vehicleType} &bull; {b.passengers} Pax
                          </span>
                        </td>

                        {/* Travel Date */}
                        <td className="py-4.5 px-2 text-slate-550 dark:text-slate-350">
                          {travelDate}
                        </td>

                        {/* Status (Yellow, Green, Blue, Red, Gray, Purple enums) */}
                        <td className="py-4.5 px-2 text-center">
                          <span 
                            className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              b.status === 'Pending' && 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800'
                            } ${
                              b.status === 'Approved' && 'bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-800'
                            } ${
                              b.status === 'Rejected' && 'bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800'
                            } ${
                              b.status === 'Completed' && 'bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800'
                            } ${
                              b.status === 'Deleted' && 'bg-slate-100 dark:bg-luxury-800 text-slate-650 dark:text-slate-400 border border-slate-200/50 dark:border-luxury-700'
                            } ${
                              b.status === 'Archived' && 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-4.5 px-2 text-slate-500 dark:text-slate-400">
                          {createdDate}
                        </td>

                        {/* Actions */}
                        <td className="py-4.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {activeTab === 'active' ? (
                              <>
                                {b.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(b._id, 'Approved')}
                                      className="p-1.5 text-green-600 hover:bg-green-550/10 hover:border-green-500 rounded border border-green-200 dark:border-green-800 transition"
                                      title="Approve Booking"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(b._id, 'Rejected')}
                                      className="p-1.5 text-red-650 hover:bg-red-550/10 hover:border-red-500 rounded border border-red-200 dark:border-red-800 transition"
                                      title="Reject Booking"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {b.status === 'Approved' && (
                                  <button
                                    onClick={() => handleStatusChange(b._id, 'Completed')}
                                    className="py-1 px-2.5 text-blue-650 hover:bg-blue-550/10 hover:border-blue-500 rounded border border-blue-200 dark:border-blue-800 transition flex items-center gap-1"
                                    title="Mark Completed"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold">Complete</span>
                                  </button>
                                )}
                                {(b.status === 'Completed' || b.status === 'Rejected') && (
                                  <span className="text-[10px] text-slate-450 italic font-medium px-2.5">Locked</span>
                                )}
                                <button
                                  onClick={() => handleDeleteTrigger(b._id, b.status)}
                                  className="p-1.5 text-red-500 hover:bg-red-550/10 hover:border-red-500 rounded border border-red-200 dark:border-red-800 transition"
                                  title={b.status === 'Completed' ? "Archive Booking" : "Delete Booking"}
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestore(b._id)}
                                className="py-1 px-2.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-800 rounded flex items-center gap-1 transition"
                                title="Restore Booking"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">Restore</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Delete/Archive Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={isArchiving ? "Confirm Archive" : "Confirm Delete"}
        message={
          isArchiving 
            ? "Are you sure you want to archive this completed booking record?" 
            : "Are you sure you want to delete this booking item?"
        }
        isArchiving={isArchiving}
      />
    </AdminLayout>
  );
};
export default ManageBookings;
