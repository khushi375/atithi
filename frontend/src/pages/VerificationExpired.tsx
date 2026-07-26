import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Mail, ArrowRight, UserPlus, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const VerificationExpired: React.FC = () => {
  const { currentUser, resendVerification } = useAuth();
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResend = async () => {
    setSending(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await resendVerification();
      setSuccessMsg('A new branded verification email has been dispatched to your inbox. Please check your spam or junk folder if you do not see it within a minute.');
    } catch (err: any) {
      console.error('Failed to resend verification email:', err);
      // Retrieve friendly rate limiting message from backend response if available
      const errMsg = err.response?.data?.message || err.message || 'Failed to send verification email. Please try again later.';
      setErrorMsg(errMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6">
      <div className="max-w-md w-full glass p-8 rounded-2xl border border-red-500/20 dark:border-red-950/30 shadow-2xl text-center relative overflow-hidden">
        
        {/* Decorative Alert Accent Top bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-400 via-orange-400 to-red-500"></div>

        <div className="w-16 h-16 bg-red-400/10 border border-red-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-9 h-9 text-red-500" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold font-serif text-slate-800 dark:text-white mb-2">
          Verification Link Expired
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
          The email verification security code is either invalid, has expired, or has already been used to verify this profile.
        </p>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs rounded-xl mb-6 font-medium leading-relaxed">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl mb-6 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {currentUser ? (
            <>
              <div className="p-3 bg-slate-50 dark:bg-luxury-950/50 rounded-xl border border-slate-200/50 dark:border-luxury-850 text-xs text-left mb-2">
                <span className="text-slate-400 block font-medium">Logged in as:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 block break-all">{currentUser.email}</span>
              </div>
              <button
                onClick={handleResend}
                disabled={sending}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transform"
              >
                <Mail className="w-5 h-5" />
                <span>{sending ? 'Sending Link...' : 'Resend Verification Email'}</span>
              </button>
            </>
          ) : (
            <>
              <div className="p-4 bg-slate-50 dark:bg-luxury-950/50 rounded-xl border border-slate-200/50 dark:border-luxury-850 text-xs text-slate-500 leading-relaxed mb-4">
                You must be logged into your ATITHI account to request a new email verification code.
              </div>
              <Link
                to="/?showLogin=true"
                className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transform"
              >
                <UserPlus className="w-5 h-5" />
                <span>Login to Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default VerificationExpired;
