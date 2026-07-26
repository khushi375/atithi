import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import { Heart, Trash2, Car, Compass, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const WishlistPage: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Fetch Wishlist Items
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!currentUser
  });

  // Remove from Wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async (destinationId: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/wishlist/${destinationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] });
    }
  });

  const handleRemove = (destId: string) => {
    removeMutation.mutate(destId);
  };

  const handleBookCab = (dest: any) => {
    setSelectedDestination(dest);
    setIsBookingOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Saved Holidays</span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mt-1">
          My Destination Wishlist
        </h1>
        <div className="w-20 h-[2px] bg-gold-400 mx-auto mt-4"></div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-100 dark:border-luxury-850 p-4 animate-pulse space-y-4">
              <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-luxury-800 rounded-xl"></div>
              <div className="h-4 bg-slate-200 dark:bg-luxury-800 w-2/3 rounded"></div>
              <div className="h-8 bg-slate-200 dark:bg-luxury-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : !wishlist || wishlist.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-luxury-800 rounded-2xl p-8 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-350">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Browse our catalog, click the heart indicators on destination cards, and assemble your dream journey list.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs"
          >
            <span>Explore Packages</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item: any) => {
            const dest = item.destinationId;
            if (!dest) return null; // handle gracefully if destination was deleted
            return (
              <div
                key={item._id}
                className="group rounded-2xl overflow-hidden border border-slate-100 dark:border-luxury-850 bg-white dark:bg-luxury-900/50 hover:shadow-xl transition duration-300 flex flex-col hover:-translate-y-1 transform"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={dest.coverImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  
                  {/* Category badge */}
                  <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                    {dest.category} India
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(dest._id)}
                    className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-gold-500" />
                      <span>Best visited: {dest.bestTime}</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-gold-500 transition">
                      {dest.name}
                    </h3>
                  </div>

                  <div className="w-full h-[1px] bg-slate-100 dark:bg-luxury-800 my-4"></div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Cab fare from</span>
                      <span className="font-serif font-black text-sm text-gold-500">
                        ₹{dest.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/destination/${dest.slug}`}
                        className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-gold-400 hover:underline transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleBookCab(dest)}
                        className="bg-nature-900 hover:bg-nature-800 text-white text-[10px] font-bold py-2 px-3 rounded-lg transition flex items-center gap-1"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Book Cab</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Booking Form Dialog Modal */}
      <BookingModal
        destination={selectedDestination}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedDestination(null);
        }}
      />
    </div>
  );
};
export default WishlistPage;
