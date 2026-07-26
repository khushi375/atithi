import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Trash2, ExternalLink, Compass, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ManageDestinations: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');

  // Deletion Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');

  // Fetch all destinations (including deleted ones via status=all)
  const { data: destinations, isLoading } = useQuery({
    queryKey: ['adminDestinations', currentUser?.uid],
    queryFn: async () => {
      let headers = {};
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }
      const res = await axios.get(`${API_URL}/destinations?status=all`, { headers });
      return res.data;
    },
    enabled: !!currentUser
  });

  // Delete destination mutation (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/destinations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDestinations'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete destination.');
    }
  });

  // Restore destination mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.patch(`${API_URL}/destinations/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDestinations'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to restore destination.');
    }
  });

  const handleDeleteTrigger = (id: string, name: string) => {
    setSelectedId(id);
    setSelectedName(name);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(selectedId);
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  // Filter Active vs Trash records
  const activeDestinations = destinations
    ? destinations.filter((d: any) => d.status === 'Active')
    : [];

  const trashDestinations = destinations
    ? destinations.filter((d: any) => d.status === 'Deleted')
    : [];

  const currentList = activeTab === 'active' ? activeDestinations : trashDestinations;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
              Manage Destinations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse published packages, edit attributes, or manage soft-deleted destinations.
            </p>
          </div>
          <Link
            to="/admin/add-destination"
            className="bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2 px-5 rounded-lg text-xs transition"
          >
            Add New Destination
          </Link>
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
            Active Records ({activeDestinations.length})
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`py-2 px-6 font-bold text-xs border-b-2 transition ${
              activeTab === 'trash'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-250'
            }`}
          >
            Trash Records ({trashDestinations.length})
          </button>
        </div>

        {/* Data Table */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg">
          {isLoading ? (
            <div className="py-12 text-center text-gold-400 text-xs animate-pulse">
              Syncing destinations logs...
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <Compass className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                {activeTab === 'active' ? 'No Destinations Listed' : 'Trash Empty'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'active' 
                  ? 'Begin populating your platform by publishing your first luxury tour package.'
                  : 'Soft-deleted destinations will mount here for recovery.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-luxury-850 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Image</th>
                    <th className="py-3 px-2">Destination</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2">Created Date</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-luxury-850">
                  {currentList.map((dest: any) => {
                    const createdDate = new Date(dest.createdAt).toLocaleDateString();
                    return (
                      <tr key={dest._id} className="hover:bg-slate-50/50 dark:hover:bg-luxury-850/40 transition">
                        <td className="py-3 px-2">
                          <div className="relative w-12 h-9 rounded overflow-hidden border border-slate-200 dark:border-luxury-800">
                            <img src={dest.coverImage} alt={dest.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-3 px-2 font-serif font-bold text-slate-800 dark:text-white text-sm">
                          {dest.name}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">{dest.distance} km / {dest.travelTime}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                          {dest.category} India
                        </td>
                        <td className="py-3 px-2 font-bold text-gold-500">
                          ₹{dest.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            dest.status === 'Active'
                              ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-800'
                              : 'bg-slate-100 dark:bg-luxury-800 text-slate-650 dark:text-slate-400 border border-slate-200/50 dark:border-luxury-700'
                          }`}>
                            {dest.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                          {createdDate}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {activeTab === 'active' ? (
                              <>
                                <Link
                                  to={`/destination/${dest.slug}`}
                                  className="p-1.5 text-slate-400 hover:text-gold-500 transition"
                                  title="Open Public Page"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteTrigger(dest._id, dest.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 transition"
                                  title="Delete Package"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestore(dest._id)}
                                className="py-1 px-2.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-800 rounded flex items-center gap-1 transition"
                                title="Restore Package"
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedName}" destination package?`}
      />
    </AdminLayout>
  );
};
export default ManageDestinations;
