import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Footer: React.FC = () => {
  // Fetch Settings dynamically
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/settings`);
      return res.data;
    }
  });

  const businessName = settings?.businessName || 'ATITHI';
  const businessEmail = settings?.businessEmail || 'contact@atithi.com';
  const phone = settings?.phone1 || '+91 99999 99999';
  const address = settings?.officeAddress || '123, Luxury Way, New Delhi, India';
  const instagram = settings?.instagramUrl || 'https://instagram.com/atithi';

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-luxury-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo & Intro Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt={businessName} 
                className="w-10 h-10 object-contain rounded-full border border-gold-400/20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-serif text-lg font-black tracking-wide text-white">
                  {businessName}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-gold-400 font-medium">
                  Atithi Devo Bhava
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Premium Indian hospitality meets modern startup logistics. We provide executive tourist cab services across India's most breathtaking locations.
            </p>
            {/* Social channels */}
            <div className="pt-2">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-full border border-slate-800 hover:border-gold-400 text-slate-400 hover:text-gold-400 transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick navigations */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-5">
              Explore ATITHI
            </h4>
            <ul className="space-y-3 text-xs font-light">
              <li>
                <Link to="/" className="hover:text-gold-400 transition">Explore Destinations</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition">Contact Support</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-gold-400 transition">Your Wishlist</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-gold-400 transition">My Trips</Link>
              </li>
            </ul>
          </div>

          {/* Regional Categories */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-5">
              Tour Categories
            </h4>
            <ul className="space-y-3 text-xs font-light">
              <li>
                <Link to="/destinations/north" className="hover:text-gold-400 transition">North India Holidays</Link>
              </li>
              <li>
                <Link to="/destinations/south" className="hover:text-gold-400 transition">South India Escapes</Link>
              </li>
              <li>
                <Link to="/destinations/east" className="hover:text-gold-400 transition">East India Wildlife</Link>
              </li>
              <li>
                <Link to="/destinations/west" className="hover:text-gold-400 transition">West India Deserts</Link>
              </li>
            </ul>
          </div>

          {/* Contacts Details */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-5">
              Office Locations
            </h4>
            <ul className="space-y-4 text-xs font-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="text-slate-400">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-slate-400">{phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-slate-400">{businessEmail}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="w-full h-[1px] bg-slate-800 my-10"></div>

        {/* copyright and security notes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <p>© {new Date().getFullYear()} {businessName} Tour & Travel. All Rights Reserved. Made with premium care.</p>
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-gold-500" />
            <span>Secure SSL Booking Interface</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
