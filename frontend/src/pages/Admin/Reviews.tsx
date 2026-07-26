import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Check, X, Compass, Star, Trash } from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ManageReviews: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Deletion Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');

  // Fetch all testimonials/reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['adminReviews', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/contact/reviews/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser
  });

  // Moderation status mutation
  const moderationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'Approved' | 'Rejected' }) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.patch(
        `${API_URL}/contact/reviews/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    }
  });

  // Delete review mutation (physical delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/contact/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete review.');
    }
  });

  const handleModerate = (id: string, status: 'Approved' | 'Rejected') => {
    moderationMutation.mutate({ id, status });
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setSelectedId(id);
    setSelectedName(name);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(selectedId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in text-left">
        
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
            Reviews Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Moderate guest testimonials and select feedback blocks to exhibit on the homepage.
          </p>
        </div>

        {/* Data list */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg">
          {isLoading ? (
            <div className="py-12 text-center text-gold-400 text-xs animate-pulse">
              Syncing reviews databases...
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <Compass className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">No Reviews Logged</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Reviews submitted by verified travelers will queue here for moderation.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-luxury-850 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Rating</th>
                    <th className="py-3 px-2">Review</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2">Created Date</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-luxury-850">
                  {reviews.map((r: any) => {
                    const createdDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A';
                    return (
                      <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-luxury-850/40 transition">
                        <td className="py-4.5 px-2 font-bold text-slate-700 dark:text-slate-200">{r.name}</td>
                        <td className="py-4.5 px-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={`w-3.5 h-3.5 ${
                                  s <= r.rating ? 'text-gold-400 fill-gold-400' : 'text-slate-200 dark:text-luxury-800'
                                }`} 
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-4.5 px-2 max-w-sm space-y-1">
                          <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-light font-sans">
                            "{r.review}"
                          </p>
                          {r.destinationId && (
                            <span className="inline-block text-[9px] text-gold-550 font-bold bg-gold-400/5 px-2 py-0.5 rounded border border-gold-400/10">
                              {r.destinationId.name}
                            </span>
                          )}
                        </td>
                        <td className="py-4.5 px-2 text-center">
                          <span 
                            className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              r.status === 'Pending' && 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800'
                            } ${
                              r.status === 'Approved' && 'bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-800'
                            } ${
                              r.status === 'Rejected' && 'bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4.5 px-2 text-slate-500 dark:text-slate-400">
                          {createdDate}
                        </td>
                        <td className="py-4.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {r.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleModerate(r._id, 'Approved')}
                                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-955/20 rounded border border-green-200 dark:border-green-800 transition"
                                  title="Approve Review"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleModerate(r._id, 'Rejected')}
                                  className="p-1.5 text-red-605 hover:bg-red-50 dark:hover:bg-red-955/20 rounded border border-red-200 dark:border-red-800 transition"
                                  title="Reject Review"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {r.status !== 'Pending' && (
                              <span className="text-[10px] text-slate-450 italic font-medium px-2">Moderated</span>
                            )}
                            <button
                              onClick={() => handleDeleteTrigger(r._id, r.name)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded border border-red-200 dark:border-red-800 transition"
                              title="Delete Review"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete review submitted by "${selectedName}"?`}
      />
    </AdminLayout>
  );
};
export default ManageReviews;
