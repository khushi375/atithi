import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { ClipboardList, ShieldAlert, Search, RefreshCw, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AdminLogs: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch admin activity logs
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['adminLogs', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser
  });

  const filteredLogs = logs
    ? logs.filter((log: any) =>
        log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.recordId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-gold-500 animate-pulse" />
              <span>Admin Activity Logs</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit trails of administrative actions including approvals, rejections, updates, and archival details.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 border border-slate-200 dark:border-luxury-800 rounded-xl hover:bg-slate-100 dark:hover:bg-luxury-900 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-gold-500" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filters */}
        <div className="glass p-4 rounded-xl border border-slate-200/50 dark:border-luxury-850 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search logs by email, action, record type or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs py-2 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Data Table */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg">
          {isLoading ? (
            <div className="py-12 text-center text-gold-400 text-xs animate-pulse">
              Retrieving system audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <ClipboardList className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">No Logs Found</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Admin logs will populate here once actions are recorded across the platform.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-luxury-850 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Admin Email</th>
                    <th className="py-3 px-2">Logged Action</th>
                    <th className="py-3 px-2">Record Type</th>
                    <th className="py-3 px-2">Record ID</th>
                    <th className="py-3 px-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-luxury-850">
                  {filteredLogs.map((log: any) => {
                    const formattedDate = new Date(log.timestamp).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    return (
                      <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-luxury-850/40 transition">
                        <td className="py-3 px-2 font-semibold text-slate-750 dark:text-slate-200">
                          {log.adminEmail}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            log.action.includes('Approved') || log.action.includes('Created') || log.action.includes('Restored')
                              ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/30'
                              : log.action.includes('Rejected') || log.action.includes('Deleted')
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/30'
                              : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-200/30'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                          {log.recordType}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-400 text-[10px] tracking-tight">
                          {log.recordId}
                        </td>
                        <td className="py-3 px-2 text-right text-slate-550 dark:text-slate-400 font-medium">
                          {formattedDate}
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
    </AdminLayout>
  );
};
export default AdminLogs;
