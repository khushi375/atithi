import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Hero } from '../components/Hero';
import { TrustBar } from '../components/TrustBar';
import { BookingModal } from '../components/BookingModal';
import { Heart, Search, MapPin, Compass, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  // URL queries
  const category = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  // Booking states
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Fetch Destinations
  const { data: destinations, isLoading } = useQuery({
    queryKey: ['destinations', category, searchQuery],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/destinations`, {
        params: { category, q: searchQuery }
      });
      return res.data;
    }
  });

  // Fetch Wishlist IDs to style active hearts
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

  // Fetch approved customer reviews
  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/contact/reviews/approved`);
      return res.data;
    }
  });

  // Wishlist toggle mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async ({ destinationId, isWishlisted }: { destinationId: string; isWishlisted: boolean }) => {
      if (!currentUser) throw new Error('Authentication required');
      const token = await currentUser.getIdToken();
      
      if (isWishlisted) {
        // Remove
        await axios.delete(`${API_URL}/wishlist/${destinationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Add
        await axios.post(
          `${API_URL}/wishlist`,
          { destinationId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] });
    },
    onError: (err) => {
      alert(err.message || 'Verification or signin required to manage wishlist.');
    }
  });

  const handleWishlistToggle = (destId: string) => {
    if (!currentUser) {
      alert('Please login to save destinations to your wishlist.');
      return;
    }
    if (!currentUser.emailVerified) {
      alert('Email verification required to save destinations.');
      return;
    }
    const isWishlisted = wishlistIds?.includes(destId) || false;
    toggleWishlistMutation.mutate({ destinationId: destId, isWishlisted });
  };

  const handleBookCabClick = (dest: any) => {
    setSelectedDestination(dest);
    setIsBookingOpen(true);
  };

  // Seed testimonials if none approved in database yet
  const defaultTestimonials = [
    {
      name: "Amit Sharma",
      rating: 5,
      review: "The cab was extremely clean, and the driver was very professional. Visited Manali with family and had a memorable trip. Kudos to ATITHI!",
      destinationId: { name: "Manali Tour" }
    },
    {
      name: "Priya Patel",
      rating: 5,
      review: "Luxury service indeed! Our journey through Kerala's backwaters was smooth. Highly recommend the SUV service for family tours.",
      destinationId: { name: "Kerala backwaters" }
    }
  ];

  const activeTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <div className="w-full">
      <Hero />
      <TrustBar />

      {/* Destinations grid listing */}
      <section id="destinations-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Incredible India Packages</span>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mt-1">
            Explore Majestic Destinations
          </h2>
          <div className="w-20 h-[2px] bg-gold-400 mx-auto mt-4"></div>
          {searchQuery && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Showing search results for "<strong className="text-gold-500">{searchQuery}</strong>"
            </p>
          )}
        </div>

        {isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-slate-100 dark:border-luxury-850 bg-slate-50 dark:bg-luxury-900/40 p-4 space-y-4 animate-pulse">
                <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-luxury-800 rounded-xl"></div>
                <div className="h-4 bg-slate-200 dark:bg-luxury-800 w-2/3 rounded"></div>
                <div className="h-4 bg-slate-200 dark:bg-luxury-800 w-1/3 rounded"></div>
                <div className="h-8 bg-slate-200 dark:bg-luxury-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : !destinations || destinations.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-luxury-800 rounded-2xl p-8 max-w-md mx-auto">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-spin" style={{ animationDuration: '20s' }} />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">No Destinations Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              We couldn't find destinations matching your search parameters. Try adjusting filters or search queries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest: any) => {
              const isWishlisted = wishlistIds?.includes(dest._id) || false;
              return (
                <div 
                  key={dest._id}
                  className="group rounded-2xl overflow-hidden border border-slate-100 dark:border-luxury-850 bg-white dark:bg-luxury-900/50 hover:shadow-2xl transition duration-300 flex flex-col hover:-translate-y-1 transform"
                >
                  {/* Destination Cover Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={dest.coverImage}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    
                    {/* Category region badge */}
                    <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                      {dest.category} India
                    </span>

                    {/* Wishlist Heart Toggle */}
                    <button
                      onClick={() => handleWishlistToggle(dest._id)}
                      className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-luxury-900/80 backdrop-blur-md rounded-full shadow border border-slate-100 dark:border-luxury-800 hover:scale-110 active:scale-95 transition"
                      title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                    >
                      <Heart 
                        className={`w-4 h-4 transition ${
                          isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400 dark:text-slate-300'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Destination Info Card Body */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-gold-500" />
                        <span>Best: {dest.bestTime}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-gold-500 transition duration-200">
                        {dest.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                        <span>Distance: <strong>{dest.distance} km</strong></span>
                        <span>Time: <strong>{dest.travelTime}</strong></span>
                      </div>
                    </div>

                    <div className="w-full h-[1px] bg-slate-100 dark:bg-luxury-800 my-4"></div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Cab fare from</span>
                        <span className="font-serif font-black text-lg text-gold-500">
                          ₹{dest.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/destination/${dest.slug}`}
                          className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-gold-400 hover:underline transition"
                        >
                          Know More
                        </Link>
                        <button
                          onClick={() => handleBookCabClick(dest)}
                          className="bg-nature-900 hover:bg-nature-800 text-white text-[11px] font-bold py-2 px-4 rounded-lg transition"
                        >
                          Book Cab
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Testimonials Review Display */}
      <section className="bg-slate-100 dark:bg-luxury-950/50 py-16 border-t border-b border-slate-200/50 dark:border-luxury-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Guest Experiences</span>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
              Testimonials From Our Travelers
            </h2>
            <div className="w-16 h-[2px] bg-gold-400 mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {activeTestimonials.map((t: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-luxury-900/60 p-6 rounded-2xl border border-slate-200/30 dark:border-luxury-800 shadow-md text-left flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${
                          s <= t.rating ? 'text-gold-400 fill-gold-400' : 'text-slate-200'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{t.review}"
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-luxury-850 flex items-center justify-between">
                  <strong className="text-xs text-slate-800 dark:text-white">{t.name}</strong>
                  {t.destinationId && (
                    <span className="text-[10px] text-gold-500 bg-gold-400/5 px-2.5 py-0.5 rounded-full font-bold">
                      {t.destinationId.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reusable Booking Form Modal */}
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
export default Home;
