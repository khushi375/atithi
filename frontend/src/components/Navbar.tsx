import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Heart, Sun, Moon, User, LogOut, LayoutDashboard, 
  Menu, X, Search, Mail, Lock, PhoneCall 
} from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Navbar: React.FC = () => {
  const { currentUser, dbUser, loginWithGoogle, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch Settings Dynamically (No hardcoding)
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/settings`);
      return res.data;
    }
  });

  // Fetch Wishlist count for badges
  const { data: wishlistIds } = useQuery({
    queryKey: ['wishlistIds', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser || !currentUser.emailVerified) return [];
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/wishlist/ids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser && currentUser.emailVerified
  });

  const businessName = settings?.businessName || 'ATITHI';

  // Listen for showLogin parameter to open modal automatically (e.g. redirecting from verification pages)
  // Listen for showLogin parameter to open modal automatically
  useEffect(() => {
    if (searchParams.get('showLogin') === 'true') {
      setAuthError('');
      setIsAuthModalOpen(true);
      // Remove query parameter to avoid opening modal on subsequent re-renders
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('showLogin');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handle Search Submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
    navigate(`/?${searchParams.toString()}`);
  };

  // Google Auth Sign-in
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-luxury-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-luxury-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img 
              src="/logo.png" 
              alt={businessName} 
              className="w-10 h-10 object-contain rounded-full border border-gold-400/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-black tracking-wide bg-gradient-to-r from-nature-900 to-gold-600 dark:from-white dark:to-gold-400 bg-clip-text text-transparent">
                {businessName}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gold-500 dark:text-gold-400 font-medium">
                Atithi Devo Bhava
              </span>
            </div>
          </Link>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-sm w-full relative">
            <input 
              type="text" 
              placeholder="Search destinations (e.g. Manali, Goa)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2 pl-9 pr-4 rounded-full border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 focus:outline-none focus:ring-1 focus:ring-gold-400 dark:focus:ring-gold-400 focus:border-transparent text-slate-800 dark:text-slate-100 transition"
            />
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          </form>

          {/* Navigation Links & Options */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/contact" className="text-sm font-medium hover:text-gold-500 dark:hover:text-gold-400 transition text-slate-600 dark:text-slate-300">
              Contact Us
            </Link>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2 hover:text-red-500 transition text-slate-600 dark:text-slate-300">
              <Heart className="w-5 h-5" />
              {wishlistIds && wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Dark / Light Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition"
              title="Toggle Theme Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Dropdowns */}
            {loading ? (
              <div className="flex items-center gap-2 py-1.5 px-3 border border-slate-200 dark:border-luxury-800 rounded-full text-xs font-semibold text-slate-400">
                <div className="w-3 h-3 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Syncing...</span>
              </div>
            ) : currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-3 border border-slate-200 dark:border-luxury-800 rounded-full text-xs font-semibold hover:bg-slate-50 dark:hover:bg-luxury-800 transition"
                >
                  <User className="w-4 h-4 text-gold-500" />
                  <span>Hi, {dbUser?.name?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Guest'}</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-luxury-900 border border-slate-100 dark:border-luxury-850 shadow-xl py-2 z-50 text-sm">
                    {dbUser?.role === 'admin' ? (
                      <Link 
                        to="/admin/dashboard" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-luxury-800 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gold-500" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link 
                        to="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-luxury-800 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <User className="w-4 h-4 text-gold-500" />
                        My Profile
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100 dark:border-luxury-850" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-luxury-800 text-red-600 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError('');
                  setIsAuthModalOpen(true);
                }}
                className="bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white text-xs font-bold py-2 px-5 rounded-full transition shadow-md shadow-gold-500/10"
              >
                Login / Register
              </button>
            )}
          </nav>

          {/* Mobile Actions Menu Trigger */}
          <div className="flex items-center lg:hidden gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-luxury-900 border-b border-slate-200/50 dark:border-luxury-800/50 px-4 py-4 space-y-4 animate-fade-in">
            {/* Search for mobile */}
            <form onSubmit={handleSearch} className="flex items-center relative w-full">
              <input 
                type="text" 
                placeholder="Search destinations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2 pl-9 pr-4 rounded-full border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 focus:outline-none text-slate-800 dark:text-slate-100"
              />
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            </form>

            <div className="flex flex-col gap-3 text-sm">
              <Link 
                to="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-slate-700 dark:text-slate-200 py-1"
              >
                Contact Us
              </Link>
              <Link 
                to="/wishlist" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-slate-700 dark:text-slate-200 py-1 flex items-center justify-between"
              >
                <span>Wishlist</span>
                {wishlistIds && wishlistIds.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              
              {loading ? (
                <div className="flex items-center gap-2 py-2 text-slate-400 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing profile...</span>
                </div>
              ) : currentUser ? (
                <>
                  {dbUser?.role === 'admin' ? (
                    <Link 
                      to="/admin/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-medium text-gold-500 py-1"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-medium text-gold-500 py-1"
                    >
                      My Profile
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left font-medium text-red-500 py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthError('');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2 px-5 rounded-full transition text-center"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login / Register Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-luxury-900 border border-slate-200 dark:border-luxury-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative animate-slide-up">
            
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <img 
                  src="/logo.png" 
                  alt={businessName} 
                  className="w-16 h-16 object-contain rounded-full border border-gold-400/20 mx-auto mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <h3 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">
                  Welcome to {businessName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Atithi Devo Bhava — Comfort & Luxury Journeys
                </p>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mt-3" />
              </div>

              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg mb-6 text-center font-medium">
                  {authError}
                </div>
              )}

              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Join or sign in to ATITHI securely using your Google account to manage premium transport bookings and track travel history.
                </p>

                <button
                  type="button"
                  disabled={isSigningIn}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-luxury-950 hover:bg-slate-50 dark:hover:bg-luxury-900 border border-slate-200 dark:border-luxury-800 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition duration-200 text-sm shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 text-center border-t border-slate-100 dark:border-luxury-850 pt-4">
                <span className="text-[10px] text-slate-400">
                  By continuing, you agree to our Terms of Service & Privacy Policy.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
