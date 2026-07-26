import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Mail, Check, X, Compass, Clock, CheckSquare, Trash, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ManageInquiries: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');

  // Deletion Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');

  // Expandable message logs state
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Fetch all inquiries
  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['adminInquiries', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/contact/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser
  });

  // Inquiry update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'Replied' | 'Closed' }) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.patch(
        `${API_URL}/contact/inquiries/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    }
  });

  // Soft Delete inquiry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/contact/inquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete inquiry.');
    }
  });

  // Restore inquiry mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.patch(`${API_URL}/contact/inquiries/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to restore inquiry.');
    }
  });

  const handleStatusUpdate = (id: string, status: 'Replied' | 'Closed') => {
    updateMutation.mutate({ id, status });
  };

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

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Filter Active vs Trash records
  const activeInquiries = inquiries
    ? inquiries.filter((inq: any) => inq.status !== 'Deleted')
    : [];

  const trashInquiries = inquiries
    ? inquiries.filter((inq: any) => inq.status === 'Deleted')
    : [];

  const currentList = activeTab === 'active' ? activeInquiries : trashInquiries;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in text-left">
        
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
            Contact Inquiries Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Check questions, proposals, and logs synced directly to Google Sheets database.
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
            Active Records ({activeInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`py-2 px-6 font-bold text-xs border-b-2 transition ${
              activeTab === 'trash'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-250'
            }`}
          >
            Trash Records ({trashInquiries.length})
          </button>
        </div>

        {/* Data list */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg">
          {isLoading ? (
            <div className="py-12 text-center text-gold-400 text-xs animate-pulse">
              Syncing inquiries inbox...
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <Mail className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                {activeTab === 'active' ? 'No Messages Logged' : 'Trash Empty'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'active'
                  ? 'When visitors write messages in the Contact form, their details will sync here.'
                  : 'Soft-deleted inquiry messages will mount here for recovery.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-luxury-850 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2 w-[35px]"></th>
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2">Created Date</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-luxury-850">
                  {currentList.map((inq: any) => {
                    const isExpanded = expandedRows.includes(inq._id);
                    const createdDate = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'N/A';
                    return (
                      <React.Fragment key={inq._id}>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-luxury-850/40 transition">
                          {/* Toggle expand button */}
                          <td className="py-4.5 px-2">
                            <button
                              onClick={() => toggleRow(inq._id)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="py-4.5 px-2 font-bold text-slate-700 dark:text-slate-200">
                            {inq.name}
                          </td>
                          <td className="py-4.5 px-2 text-slate-550 dark:text-slate-350">
                            {inq.email}
                          </td>
                          <td className="py-4.5 px-2 text-slate-500 dark:text-slate-400 font-medium">
                            {inq.phone}
                          </td>
                          <td className="py-4.5 px-2 text-center">
                            <span 
                              className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                inq.status === 'Pending' && 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800'
                              } ${
                                inq.status === 'Replied' && 'bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800'
                              } ${
                                inq.status === 'Closed' && 'bg-purple-50 dark:bg-purple-955/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800'
                              } ${
                                inq.status === 'Deleted' && 'bg-slate-100 dark:bg-luxury-800 text-slate-650 dark:text-slate-400 border border-slate-200/50 dark:border-luxury-700'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </td>
                          <td className="py-4.5 px-2 text-slate-500 dark:text-slate-400">
                            {createdDate}
                          </td>
                          <td className="py-4.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {activeTab === 'active' ? (
                                <>
                                  {inq.status === 'Pending' && (
                                    <button
                                      onClick={() => handleStatusUpdate(inq._id, 'Replied')}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800 transition flex items-center gap-1"
                                      title="Mark as Replied"
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-bold">Replied</span>
                                    </button>
                                  )}
                                  {(inq.status === 'Pending' || inq.status === 'Replied') && (
                                    <button
                                      onClick={() => handleStatusUpdate(inq._id, 'Closed')}
                                      className="p-1.5 text-purple-650 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800 transition flex items-center gap-1"
                                      title="Close Inquiry"
                                    >
                                      <CheckSquare className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-bold">Close</span>
                                    </button>
                                  )}
                                  {inq.status === 'Closed' && (
                                    <span className="text-[10px] text-purple-500 italic font-bold px-2.5">Resolved</span>
                                  )}
                                  <button
                                    onClick={() => handleDeleteTrigger(inq._id, inq.name)}
                                    className="p-1.5 text-red-500 hover:bg-red-550/10 hover:border-red-500 rounded border border-red-200 dark:border-red-800 transition"
                                    title="Delete Inquiry"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRestore(inq._id)}
                                  className="py-1 px-2.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-800 rounded flex items-center gap-1 transition"
                                  title="Restore Inquiry"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold">Restore</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible Message Content Row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50 dark:bg-luxury-950/30">
                            <td colSpan={7} className="py-3 px-8 text-left border-l-2 border-gold-400">
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Submitted Inquiry Message:</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
                                  "{inq.message}"
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
        message={`Are you sure you want to delete inquiry from "${selectedName}"?`}
      />
    </AdminLayout>
  );
};
export default ManageInquiries;
