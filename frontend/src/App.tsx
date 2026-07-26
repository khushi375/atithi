import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Splash } from './components/Splash';
import { Navbar } from './components/Navbar';
import { CategoryNavbar } from './components/CategoryNavbar';
import { VerificationBanner } from './components/VerificationBanner';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { DestinationDetail } from './pages/DestinationDetail';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { WishlistPage } from './pages/Wishlist';
import { CategoryListing } from './pages/CategoryListing';
import { EmailVerified } from './pages/EmailVerified';
import { VerificationExpired } from './pages/VerificationExpired';
import { ResetPassword } from './pages/ResetPassword';

// Admin Components
import { AdminDashboard } from './pages/Admin/Dashboard';
import { AddDestination } from './pages/Admin/AddDestination';
import { ManageDestinations } from './pages/Admin/ManageDestinations';
import { ManageBookings } from './pages/Admin/Bookings';
import { ManageReviews } from './pages/Admin/Reviews';
import { ManageInquiries } from './pages/Admin/Inquiries';
import { AdminSettings } from './pages/Admin/Settings';
import { AdminLogs } from './pages/Admin/AdminLogs';

// Route Guards
const VerifiedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, resendVerification, loading } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] text-gold-400">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-serif text-lg tracking-wide">Connecting securely...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!currentUser.emailVerified) {
    const handleResend = async () => {
      setSending(true);
      try {
        await resendVerification();
        setMessage('Verification email sent! Please check your spam folder if you do not see it.');
      } catch (err: any) {
        setMessage(err.response?.data?.message || err.message || 'Failed to send verification email. Please try again later.');
      } finally {
        setSending(false);
      }
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6">
        <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl border border-gold-400/20 text-center">
          <h2 className="text-2xl font-bold font-serif mb-4 text-gold-500">Email Verification Required</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
            Welcome to ATITHI! A verification link was sent to <strong className="text-slate-800 dark:text-white">{currentUser.email}</strong>. 
            Please verify your email address to unlock account bookings and profile pages.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md shadow-gold-500/20"
            >
              I Have Verified - Refresh Page
            </button>
            <button
              onClick={handleResend}
              disabled={sending}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-lg transition duration-200 text-sm"
            >
              {sending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            {message && <p className="text-xs mt-2 text-gold-500 font-medium animate-pulse">{message}</p>}
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] text-gold-400">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-serif text-lg">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || dbUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200">
        <Navbar />
        <CategoryNavbar />
        <VerificationBanner />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/destination/:slug" element={<DestinationDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/destinations/:categorySlug" element={<CategoryListing />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/verification-expired" element={<VerificationExpired />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Client Routes */}
            <Route path="/profile" element={
              <VerifiedRoute>
                <Profile />
              </VerifiedRoute>
            } />
            <Route path="/wishlist" element={
              <VerifiedRoute>
                <WishlistPage />
              </VerifiedRoute>
            } />

            {/* Admin Dashboard Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/add-destination" element={<AdminRoute><AddDestination /></AdminRoute>} />
            <Route path="/admin/manage-destinations" element={<AdminRoute><ManageDestinations /></AdminRoute>} />
            <Route path="/admin/bookings" element={<AdminRoute><ManageBookings /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><ManageReviews /></AdminRoute>} />
            <Route path="/admin/inquiries" element={<AdminRoute><ManageInquiries /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
