import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 800); // Wait for fade-out animation to finish
    }, 3200);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-nature-950 via-luxury-900 to-nature-900 text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="text-center flex flex-col items-center px-4 max-w-lg">
            {/* Traditional Namaste visual and logo wrapper */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="mb-6 relative"
            >
              <div
                className="w-56 h-56 md:w-64 md:h-64 rounded-full flex items-center justify-center overflow-hidden border border-gold-400/25 bg-transparent relative z-10"
                style={{
                  boxShadow: `
      0 0 12px rgba(255,215,0,0.12),
      0 0 24px rgba(255,215,0,0.08)
    `
                }}
              >
                <img
                  src="/logo.png"
                  alt="ATITHI Tour and Travel"
                  className="w-full h-full object-contain rounded-full"
                  style={{
                    filter: `
    brightness(1.08)
    contrast(1.12)
    saturate(1.05)
    drop-shadow(0 0 2px rgba(255,255,255,0.15))
  `,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Soft decorative glow ring behind the circle */}
              <div
                className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 opacity-8 blur-md"
                style={{
                  filter: "blur(18px)",
                }}
              ></div>
            </motion.div>

            {/* Title / Brand Tagline */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-4xl md:text-5xl font-extrabold tracking-wide uppercase font-serif"
            >
              <span className="bg-gradient-to-r from-gold-200 via-gold-400 to-gold-300 bg-clip-text text-transparent">
                ATITHI
              </span>
            </motion.h1>

            {/* Traditional Hospitality Mantra */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="mt-2 text-xl font-medium tracking-widest text-gold-300 italic font-serif"
            >
              Atithi Devo Bhava
            </motion.p>

            {/* Startup Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 1.5, duration: 1.0 }}
              className="mt-6 text-sm md:text-base font-light tracking-wide text-slate-300"
            >
              Comfortable Journeys, Memorable Destinations
            </motion.p>

            {/* Beautiful traditional Indian floral border motif */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.5 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mt-4"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
