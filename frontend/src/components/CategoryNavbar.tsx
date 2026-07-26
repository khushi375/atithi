import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const CategoryNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const categories = [
    { label: 'All India', path: '/' },
    { label: 'North India', path: '/destinations/north' },
    { label: 'South India', path: '/destinations/south' },
    { label: 'East India', path: '/destinations/east' },
    { label: 'West India', path: '/destinations/west' }
  ];

  const handleCategoryClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-luxury-950 border-b border-slate-200/50 dark:border-luxury-800/50 py-2.5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-start sm:justify-center items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const active = currentPath === cat.path;
          return (
            <button
              key={cat.path}
              onClick={() => handleCategoryClick(cat.path)}
              className={`text-xs px-4 py-1.5 rounded-full font-semibold tracking-wide transition whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-600 dark:hover:bg-luxury-850 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default CategoryNavbar;
