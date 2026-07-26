import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BookingModal } from '../components/BookingModal';
import { MapPin, Calendar, Clock, Milestone, Compass, ArrowLeft, Car } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const DestinationDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Query Destination data by slug
  const { data: destination, isLoading, error } = useQuery({
    queryKey: ['destination', slug],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/destinations/${slug}`);
      return res.data;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] text-gold-400">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-serif text-lg tracking-wide">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] p-6 text-center">
        <div className="max-w-md w-full glass p-8 rounded-2xl border border-gold-400/20">
          <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-white">Destination Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            The page you are looking for does not exist or may have been deleted by administrators.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2 px-6 rounded-lg text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      
      {/* 1. Large Top Hero Banner */}
      <div className="relative w-full h-[55vh] min-h-[350px] overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src={destination.coverImage}
          alt={destination.name}
          className="w-full h-full object-cover"
        />

        {/* Back navigation */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/"
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </Link>
        </div>

        {/* Info Banner Details Card */}
        <div className="absolute bottom-0 inset-x-0 z-20 w-full bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                {destination.category} India Territory
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight">
                {destination.name}
              </h1>
            </div>

            {/* Quick stats board */}
            <div className="glass p-4 rounded-xl border border-white/10 text-slate-800 dark:text-white flex items-center gap-6 shrink-0 text-left max-w-sm">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Distance</span>
                <span className="text-sm font-extrabold tracking-wider">{destination.distance} km</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200 dark:bg-luxury-800"></div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Travel Time</span>
                <span className="text-sm font-extrabold">{destination.travelTime}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200 dark:bg-luxury-800"></div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Price From</span>
                <span className="text-sm font-black text-gold-500 font-serif">₹{destination.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Page Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col lg:flex-row gap-12 text-left">
        
        {/* Left Side: Destination Details Blog Content */}
        <div className="flex-grow max-w-3xl">
          <div className="flex items-center gap-2 text-gold-500 mb-4">
            <Compass className="w-5 h-5 animate-pulse" />
            <h3 className="font-serif text-lg font-bold">About the Destination</h3>
          </div>
          
          <div className="w-full h-[1px] bg-slate-200/50 dark:bg-luxury-800/50 mb-6"></div>

          {/* Dynamic Sections Renderer */}
          <div className="prose dark:prose-invert max-w-none">
            {destination.sections && destination.sections.length > 0 ? (
              destination.sections.map((section: any, idx: number) => {
                if (section.type === 'text') {
                  return (
                    <p 
                      key={idx} 
                      className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-light mb-6 whitespace-pre-line"
                    >
                      {section.content}
                    </p>
                  );
                } else if (section.type === 'image') {
                  return (
                    <div 
                      key={idx} 
                      className="my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-luxury-850"
                    >
                      <img 
                        src={section.content} 
                        alt={`${destination.name} scenery`} 
                        className="w-full max-h-[420px] object-cover" 
                      />
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <p className="text-slate-500 italic text-sm">
                No extra descriptive sections have been added for this destination yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Travel Guidelines & Reservation Panel */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-xl space-y-6">
            <h4 className="font-serif text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-luxury-800/50 pb-3">
              Journey Specifications
            </h4>

            {/* Bullet attributes */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Region / Territory</span>
                  <span className="text-slate-500 dark:text-slate-400">{destination.category} India</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-4.5 h-4.5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Best Time to Visit</span>
                  <span className="text-slate-500 dark:text-slate-400">{destination.bestTime}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4.5 h-4.5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Estimated Travel Time</span>
                  <span className="text-slate-500 dark:text-slate-400">{destination.travelTime}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Milestone className="w-4.5 h-4.5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Travel Distance</span>
                  <span className="text-slate-500 dark:text-slate-400">{destination.distance} km (one-way)</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-slate-200/50 dark:bg-luxury-800/50"></div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Cab Fare Base Rate:</span>
                <span className="font-serif font-black text-slate-800 dark:text-white text-base">
                  ₹{destination.price.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Includes fuel charges, tolls, driver allowances, and standard taxes. No hidden charges.
              </p>
            </div>

            {/* Booking action trigger */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md shadow-gold-500/15 flex items-center justify-center gap-2 hover:scale-[1.02] transform"
            >
              <Car className="w-5 h-5 animate-pulse" />
              <span>Book Cab Service</span>
            </button>
          </div>
        </div>

      </div>

      {/* Booking Form Dialog Modal overlay */}
      <BookingModal
        destination={destination}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
export default DestinationDetail;
