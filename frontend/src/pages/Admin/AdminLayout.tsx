import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, Settings as SettingsIcon, 
  Map, FileCheck, Star, MessageSquare, Globe, LogOut, ShieldAlert
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { dbUser, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Add Destination', path: '/admin/add-destination', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Manage Destinations', path: '/admin/manage-destinations', icon: <Map className="w-4 h-4" /> },
    { label: 'Bookings', path: '/admin/bookings', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Contact Inquiries', path: '/admin/inquiries', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'System Settings', path: '/admin/settings', icon: <SettingsIcon className="w-4 h-4" /> },
    { label: 'Activity Logs', path: '/admin/logs', icon: <ShieldAlert className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-luxury-950 flex flex-col md:flex-row text-left transition-colors duration-300">
      
      {/* 1. Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-luxury-800">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <ShieldAlert className="w-6 h-6 text-gold-400 animate-pulse" />
            <div>
              <span className="font-serif text-lg font-black text-white block">ATITHI Control</span>
              <span className="text-[9px] uppercase tracking-widest text-gold-400 font-bold block">Administrator</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-md shadow-gold-500/10'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-3">
          <hr className="border-slate-850" />
          
          <Link
            to="/"
            className="flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Globe className="w-4 h-4" />
            <span>Front Website</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/20 transition hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Page Content Viewport */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-full">
        {children}
      </main>

    </div>
  );
};
export default AdminLayout;
