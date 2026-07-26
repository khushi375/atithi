import React from 'react';
import { ShieldCheck, Clock, UserCheck, HeartHandshake } from 'lucide-react';

const trustItems = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-gold-500" />,
    title: 'Secure Booking',
    description: 'Instant reservation confirmations with end-to-end encrypted databases.'
  },
  {
    icon: <Clock className="w-8 h-8 text-gold-500" />,
    title: '24x7 Active Support',
    description: 'Round-the-clock telephone and message assistance for trip coordinates.'
  },
  {
    icon: <UserCheck className="w-8 h-8 text-gold-500" />,
    title: 'Professional Drivers',
    description: 'Fully vetted, English-speaking tourist guides and experienced chauffeurs.'
  },
  {
    icon: <HeartHandshake className="w-8 h-8 text-gold-500" />,
    title: 'Guest Satisfaction',
    description: 'Bespoke Indian hospitality ("Atithi Devo Bhava") travel layouts.'
  }
];

export const TrustBar: React.FC = () => {
  return (
    <div className="w-full py-10 bg-white dark:bg-luxury-900 border-b border-slate-200/50 dark:border-luxury-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-luxury-850 transition duration-300 group"
            >
              <div className="p-3 bg-gold-400/5 group-hover:bg-gold-400/10 border border-gold-400/10 rounded-xl transition duration-300 shrink-0">
                {item.icon}
              </div>
              <div className="text-left">
                <h4 className="font-serif text-base font-bold text-slate-800 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TrustBar;
