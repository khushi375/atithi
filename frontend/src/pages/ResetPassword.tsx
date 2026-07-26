import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Lock, CheckCircle, ShieldAlert, KeyRound, Loader, Eye, EyeOff } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  // Loading/Verification states
  const [verifyingCode, setVerifyingCode] = useState(true);
  const [email, setEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const verifyResetCode = async () => {
      if (!oobCode) {
        setVerifyError('Password reset code is missing.');
        setVerifyingCode(false);
        return;
      }

      try {
        setVerifyingCode(true);
        // Verify code is valid and retrieve email address
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
      } catch (err: any) {
        console.error('Password reset code verification failed:', err);
        setVerifyError('The password reset link is invalid or has expired.');
      } finally {
        setVerifyingCode(false);
      }
    };

    verifyResetCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!password || !confirmPassword) {
      return setFormError('Please fill in all fields.');
    }

    if (password.length < 6) {
      return setFormError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setFormError('Passwords do not match.');
    }

    if (!oobCode) {
      return setFormError('Reset code is missing.');
    }

    setSubmitting(true);
    try {
      // Apply the new password in Firebase
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to update password:', err);
      setFormError(err.message || 'Failed to update password. The reset link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifyingCode) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6 text-gold-400">
        <div className="flex flex-col items-center">
          <Loader className="w-12 h-12 animate-spin text-gold-500 mb-4" />
          <h2 className="font-serif text-xl font-bold tracking-wide text-slate-800 dark:text-white">
            Validating Reset Token
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Verifying your password reset credentials...
          </p>
        </div>
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6">
        <div className="max-w-md w-full glass p-8 rounded-2xl border border-red-500/20 dark:border-red-950/30 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-red-500"></div>
          <div className="w-16 h-16 bg-red-400/10 border border-red-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-9 h-9 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-2">
            Invalid Link
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            {verifyError}
          </p>
          <Link
            to="/?showLogin=true"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs"
          >
            Go to Homepage & Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6">
        <div className="max-w-md w-full glass p-8 rounded-2xl border border-gold-400/20 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold-400 to-gold-600"></div>
          <div className="w-16 h-16 bg-gold-400/10 border border-gold-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-9 h-9 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-gold-500 mb-2">
            Password Updated
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            Your password has been successfully updated. You can now log into your ATITHI account using your new credentials.
          </p>
          <Link
            to="/?showLogin=true"
            className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow shadow-gold-500/15 inline-block text-sm"
          >
            Login to Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6">
      <div className="max-w-md w-full glass p-8 rounded-2xl border border-gold-400/20 shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold-400 to-gold-600"></div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gold-400/10 border border-gold-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">
            Set New Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Secure your profile for premium luxury travel experiences.
          </p>
        </div>

        {formError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg mb-4 text-center font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Account Email</label>
            <input
              type="text"
              disabled
              value={email}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-100 dark:bg-luxury-900 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs py-2.5 pl-3 pr-10 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs py-2.5 pl-3 pr-10 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md shadow-gold-500/10 flex items-center justify-center gap-2 mt-2 text-sm"
          >
            {submitting ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
