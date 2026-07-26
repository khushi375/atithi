import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Compass, ArrowRight, PhoneCall } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const carouselSlides = [
  {
    image: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=1600',
    title: 'Discover Incredible India',
    subtitle: 'Journey through majestic peaks, serene backwaters, and heritage palaces.'
  },
  {
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1600',
    title: 'Comfortable Tourist Cab Services',
    subtitle: 'Chauffeur-driven executive sedans, spacious SUVs, and group travelers.'
  },
  {
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600',
    title: 'Explore The Beauty Of India',
    subtitle: 'Luxury tour packages tailored for unforgettable memories.'
  }
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto transition carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Settings Dynamically
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/settings`);
      return res.data;
    }
  });

  const phones = settings?.heroNumbers || settings
    ? [settings.phone1, settings.phone2, settings.phone3].filter(Boolean)
    : ['+91 99999 99999', '+91 88888 88888', '+91 77777 77777'];

  const scrollToDestinations = () => {
    const el = document.getElementById('destinations-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-auto lg:h-[85vh] min-h-[480px] lg:min-h-[500px] overflow-hidden bg-slate-900">
      
      {/* Background Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0.7, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.7 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-black/55 z-10"></div>
          <img
            src={carouselSlides[currentSlide].image}
            alt="Beautiful India"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Layout Grid */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 pt-8 pb-10 lg:py-0">
        
        {/* Left Side: Dynamic Text Intro */}
        <div className="flex-1 text-left text-white max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -25, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="inline-block text-gold-400 text-xs font-bold uppercase tracking-widest px-3 py-1 border border-gold-400/20 bg-gold-400/10 rounded-full">
                Premium Indian Hospitality
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight leading-[1.15]">
                {carouselSlides[currentSlide].title}
              </h1>
              <p className="text-sm md:text-base text-slate-200 font-light leading-relaxed max-w-lg">
                {carouselSlides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={scrollToDestinations}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-8 rounded-full transition shadow-lg shadow-gold-500/20 hover:scale-105 transform duration-200"
            >
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Right Side: Glassmorphic Cab Hotline Widget (Static inside Hero section flow, scales dynamically) */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="w-full lg:w-auto shrink-0 z-30 max-w-[260px] xs:max-w-[300px] sm:max-w-sm lg:max-w-sm transition-all duration-300"
        >
          <div className="glass bg-white dark:bg-luxury-900 bg-opacity-95 dark:bg-opacity-95 p-4 xs:p-5 sm:p-8 rounded-2xl shadow-2xl border border-white/10 dark:border-white/5 text-slate-800 dark:text-white relative overflow-hidden flex flex-col items-center">
            
            {/* Gold highlights design motif */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold-400 to-transparent opacity-10 rounded-full blur-xl"></div>
            
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
              <Phone className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gold-500 dark:text-gold-400 animate-bounce" />
            </div>

            <h3 className="font-serif text-sm xs:text-base sm:text-xl font-bold tracking-wide text-center">
              Book Your Cab Today
            </h3>
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 text-center mt-0.5 leading-relaxed">
              Premium fleet selection. Verified professional drivers.
            </p>

            <div className="w-full h-[1px] bg-slate-200/50 dark:bg-luxury-800/50 my-2.5 xs:my-3.5 sm:my-5"></div>

            {/* Click-to-Call Link Lists */}
            <div className="w-full space-y-2 xs:space-y-2.5 sm:space-y-3">
              {phones.map((phone, idx) => (
                <a
                  key={idx}
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 sm:gap-3 justify-center py-1.5 px-2 xs:py-2 xs:px-3 sm:py-3 sm:px-4 rounded-xl border border-slate-200/60 dark:border-luxury-800 bg-white/40 dark:bg-luxury-950/40 hover:bg-white/80 dark:hover:bg-luxury-850 hover:border-gold-400 dark:hover:border-gold-400 transition-all duration-200 hover:scale-[1.02] transform"
                >
                  <PhoneCall className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-nature-600 dark:text-gold-400" />
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold tracking-wider text-slate-700 dark:text-slate-200">
                    {phone}
                  </span>
                </a>
              ))}

              {/* WhatsApp Contact Action */}
              {phones.length > 0 && (
                <a
                  href={`https://wa.me/${phones[0].replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-1.5 flex items-center gap-1.5 xs:gap-2 justify-center py-1.5 px-2 xs:py-2 xs:px-3 sm:py-2.5 sm:px-4 rounded-xl border border-green-500/30 bg-green-550/10 hover:bg-green-550/20 hover:border-green-500 text-green-600 dark:text-green-400 transition-all duration-200 hover:scale-[1.02] transform font-bold text-[10px] xs:text-xs"
                >
                  <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.729-1.465L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.59 1.973 14.12 1.95 12.01 1.95c-5.437 0-9.863 4.373-9.867 9.803-.001 1.83.5 3.616 1.453 5.216L2.613 21.65l4.034-1.056z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </div>

            <p className="text-[7.5px] xs:text-[8px] sm:text-[9px] text-slate-405 text-center mt-2.5 sm:mt-4">
              *Available 24x7 for all airport and regional transfer inquiries.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
export default Hero;
