import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ShieldCheck, Compass, ArrowRight, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const EmailVerified: React.FC = () => {
  const { currentUser, syncWithDB } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const verificationStarted = React.useRef(false);

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        // If already logged in and verified, show success
        if (currentUser && currentUser.emailVerified) {
          setSuccess(true);
          setVerifying(false);
        } else {
          // No code and not verified, redirect to expired/invalid route
          navigate('/verification-expired', { replace: true });
        }
        return;
      }

      if (verificationStarted.current) return;
      verificationStarted.current = true;

      try {
        setVerifying(true);
        // 1. Apply Firebase action code (oobCode)
        await applyActionCode(auth, oobCode);

        // 2. Reload user if logged in to refresh local instance
        if (auth.currentUser) {
          await auth.currentUser.reload();
          // 3. Force-sync with backend (refreshes ID token and claims)
          await syncWithDB(auth.currentUser);

          // 4. Trigger Welcome email dispatch from the backend
          const token = await auth.currentUser.getIdToken(true);
          await axios.post(
            `${API_URL}/auth/send-welcome`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        }

        setSuccess(true);
      } catch (err: any) {
        console.error('Email verification failed:', err);
        setError(err.message || 'The verification link is invalid or has expired.');
        navigate('/verification-expired', { replace: true });
      } finally {
        setVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode, currentUser, navigate, syncWithDB]);

  if (verifying) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6 text-gold-400">
        <div className="flex flex-col items-center">
          <Loader className="w-12 h-12 animate-spin text-gold-500 mb-4" />
          <h2 className="font-serif text-xl font-bold tracking-wide text-slate-800 dark:text-white">
            Verifying Your Credentials
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Please wait while we activate your premium travel profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6">
      <div className="max-w-md w-full glass p-8 rounded-2xl border border-gold-400/20 shadow-2xl text-center relative overflow-hidden">
        
        {/* Decorative Gold Accents */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>

        <div className="w-16 h-16 bg-gold-400/10 border border-gold-400/25 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-9 h-9 text-gold-500" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold font-serif text-gold-500 mb-2">
          Email Verified Successfully
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">
          Welcome to ATITHI Travels! Your account is now fully verified. You have unlocked unlimited access to explore premium tours, book luxury cab services, and create travel reviews.
        </p>

        <div className="space-y-4">
          {currentUser ? (
            <Link
              to="/"
              className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transform"
            >
              <Compass className="w-5 h-5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/?showLogin=true"
              className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transform"
            >
              <span>Login to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmailVerified;
