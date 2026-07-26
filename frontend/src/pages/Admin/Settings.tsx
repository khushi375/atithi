import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Save, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AdminSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Settings values states
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch Settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSettingsQuery'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/settings`);
      return res.data;
    }
  });

  // Populate states when settings data loads
  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName || '');
      setBusinessEmail(settings.businessEmail || '');
      setPhone1(settings.phone1 || '');
      setPhone2(settings.phone2 || '');
      setPhone3(settings.phone3 || '');
      setInstagramUrl(settings.instagramUrl || '');
      setOfficeAddress(settings.officeAddress || '');
    }
  }, [settings]);

  // Settings update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await axios.put(
        `${API_URL}/settings`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['adminSettingsQuery'] });
      setSuccess('Business configurations updated successfully. All page elements updated in real time.');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update system settings.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    updateSettingsMutation.mutate({
      businessName,
      businessEmail,
      phone1,
      phone2,
      phone3,
      instagramUrl,
      officeAddress
    });
    setSaving(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-gold-400 text-xs animate-pulse">
          Fetching current configurations...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl mx-auto animate-fade-in text-left">
        
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
            System Configuration settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic business details. Changes sync instantly across headers, footers, and hotlines.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs rounded-xl text-center">
            {success}
          </div>
        )}

        <div className="glass p-8 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Cab Line Phone 1</label>
                <input
                  type="text"
                  required
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Cab Line Phone 2</label>
                <input
                  type="text"
                  required
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Cab Line Phone 3</label>
                <input
                  type="text"
                  required
                  value={phone3}
                  onChange={(e) => setPhone3(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Instagram Profile URL</label>
                <input
                  type="url"
                  required
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Office Headquarter Address</label>
              <textarea
                required
                rows={3}
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </div>

            <div className="text-right pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2.5 px-8 rounded-lg text-xs shadow-md shadow-gold-500/10 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating Configurations...' : 'Save Dynamic Configs'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </AdminLayout>
  );
};
export default AdminSettings;
