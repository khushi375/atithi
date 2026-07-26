import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const VerificationBanner: React.FC = () => {
  const { currentUser, resendVerification, refreshAuthStatus } = useAuth();
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Only show the banner if user is logged in but email is not verified
  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  const handleSendEmail = async () => {
    setSending(true);
    setMessage('');
    setMessageType('');
    try {
      await resendVerification();
      setMessageType('success');
      setMessage('A verification link has been sent to your inbox. Check spam if you do not see it.');
    } catch (err: any) {
      setMessageType('error');
      setMessage(err.response?.data?.message || err.message || 'Failed to dispatch verification email.');
    } finally {
      setSending(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    setMessage('');
    setMessageType('');
    try {
      await refreshAuthStatus();
    } catch (err: any) {
      setMessageType('error');
      setMessage('Failed to refresh verification status. Try logging in again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="w-full bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/20 text-slate-800 dark:text-amber-200 py-3 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Message */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
          <div className="text-xs sm:text-sm font-medium">
            <span>Your email </span>
            <strong className="text-slate-900 dark:text-white break-all">{currentUser.email}</strong>
            <span> is not verified. </span>
            <span className="text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
              Please check your inbox or request a new verification code.
            </span>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={handleSendEmail}
            disabled={sending}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-slate-950 font-bold py-1.5 px-4 rounded-full text-xs transition duration-200 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Sending...' : 'Send Verification Email'}</span>
          </button>
          
          <button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-luxury-950/60 dark:hover:bg-luxury-900 border border-slate-200 dark:border-luxury-800/80 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-4 rounded-full text-xs transition duration-200 disabled:opacity-50"
            title="Reload verification status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Alert Notification */}
      {message && (
        <div className="max-w-7xl mx-auto mt-2">
          <div className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            messageType === 'success' 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default VerificationBanner;
