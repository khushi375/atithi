import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import { 
  Heart, MapPin, Compass, Search, ArrowLeft, Star, 
  Car, SlidersHorizontal, ArrowUpDown, Clock 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CategoryListing: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Normalize Category Name from URL slug
  const normalizedCategory = categorySlug 
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).toLowerCase() 
    : '';

  // Local Filter States
  const [nameSearch, setNameSearch] = useState('');
  const [priceSort, setPriceSort] = useState<'none' | 'low-high' | 'high-low'>('none');
  const [selectedRegion, setSelectedRegion] = useState<string>(normalizedCategory);
  const [travelTimeFilter, setTravelTimeFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');

  // Booking states
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Sync selected region when categorySlug changes in route URL
  useEffect(() => {
    if (normalizedCategory) {
      setSelectedRegion(normalizedCategory);
    }
  }, [categorySlug]);

  // Fetch all destinations
  const { data: destinations, isLoading } = useQuery({
    queryKey: ['allDestinations'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/destinations`);
      return res.data;
    }
  });

  // Fetch Wishlist IDs to style hearts
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

  // Wishlist toggle mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async ({ destinationId, isWishlisted }: { destinationId: string; isWishlisted: boolean }) => {
      if (!currentUser) throw new Error('Authentication required');
      const token = await currentUser.getIdToken();
      
      if (isWishlisted) {
        await axios.delete(`${API_URL}/wishlist/${destinationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
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
      alert(err.message || 'Verification or login required to manage wishlist.');
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

  // Helper to parse hours from travel time string, e.g., "8 hours" -> 8, "1.5 days" -> 36
  const parseTravelHours = (timeStr: string): number => {
    const num = parseFloat(timeStr);
    if (isNaN(num)) return 0;
    if (timeStr.toLowerCase().includes('day')) {
      return num * 24;
    }
    return num;
  };

  // Apply e-commerce filters client-side for dynamic responsive speeds
  const filteredDestinations = destinations
    ? destinations
        .filter((dest: any) => {
          // 1. Region category filter
          if (selectedRegion && dest.category !== selectedRegion) {
            return false;
          }
          
          // 2. Search query by name
          if (nameSearch && !dest.name.toLowerCase().includes(nameSearch.toLowerCase())) {
            return false;
          }

          // 3. Travel duration bounds
          if (travelTimeFilter !== 'all') {
            const hours = parseTravelHours(dest.travelTime);
            if (travelTimeFilter === 'short' && hours >= 5) return false;
            if (travelTimeFilter === 'medium' && (hours < 5 || hours > 10)) return false;
            if (travelTimeFilter === 'long' && hours <= 10) return false;
          }

          return true;
        })
        .sort((a: any, b: any) => {
          // 4. Price sorting
          if (priceSort === 'low-high') return a.price - b.price;
          if (priceSort === 'high-low') return b.price - a.price;
          return 0;
        })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      
      {/* Back button & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 border border-slate-200 dark:border-luxury-800 rounded-full hover:bg-slate-100 dark:hover:bg-luxury-900 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-305" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-slate-800 dark:text-white">
              {selectedRegion ? `${selectedRegion} India Destinations` : 'All India Tours'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse holiday packages and book luxury cab transfers.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Filters Controls Panel */}
      <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-md space-y-6 mb-10">
        <div className="flex items-center gap-2 text-gold-500 font-bold border-b border-slate-250/20 dark:border-luxury-800/50 pb-3">
          <SlidersHorizontal className="w-4.5 h-4.5" />
          <span className="text-xs uppercase tracking-wider">Search Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end text-xs">
          
          {/* Search by Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Destination Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search packages..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                className="w-full text-xs py-2 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Sort by Price */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Sort by Fare</label>
            <div className="relative">
              <select
                value={priceSort}
                onChange={(e: any) => setPriceSort(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="none">Popularity / Default</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter by Category/Region */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Region Territory</label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="">All Regions</option>
                <option value="North">North India</option>
                <option value="South">South India</option>
                <option value="East">East India</option>
                <option value="West">West India</option>
              </select>
            </div>
          </div>

          {/* Travel Duration filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Travel Duration</label>
            <div className="relative">
              <select
                value={travelTimeFilter}
                onChange={(e: any) => setTravelTimeFilter(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="all">Any Duration</option>
                <option value="short">Short Trip ( &lt; 5 hours )</option>
                <option value="medium">Medium Trip ( 5 to 10 hours )</option>
                <option value="long">Long Trip ( &gt; 10 hours )</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-100 dark:border-luxury-850 p-4 animate-pulse space-y-4 bg-slate-50/50 dark:bg-luxury-900/20">
              <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-luxury-800 rounded-xl"></div>
              <div className="h-4 bg-slate-200 dark:bg-luxury-800 w-2/3 rounded"></div>
              <div className="h-8 bg-slate-200 dark:bg-luxury-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-luxury-800 rounded-2xl p-8 max-w-sm mx-auto">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-350">No Packages Match</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            No holiday packages matched your combined filter bounds. Try loosening your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDestinations.map((dest: any) => {
            const isWishlisted = wishlistIds?.includes(dest._id) || false;
            return (
              <div 
                key={dest._id}
                className="group rounded-2xl overflow-hidden border border-slate-100 dark:border-luxury-850 bg-white dark:bg-luxury-900/50 hover:shadow-xl transition duration-300 flex flex-col hover:-translate-y-1 transform"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={dest.coverImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  
                  {/* Category region tag */}
                  <span className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                    {dest.category} India
                  </span>

                  {/* Heart wishlist indicator */}
                  <button
                    onClick={() => handleWishlistToggle(dest._id)}
                    className="absolute top-3.5 right-3.5 p-1.5 bg-white/80 dark:bg-luxury-900/80 backdrop-blur-md rounded-full shadow hover:scale-110 active:scale-95 transition"
                    title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                  >
                    <Heart 
                      className={`w-3.5 h-3.5 transition ${
                        isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-450 dark:text-slate-300'
                      }`} 
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center gap-1 text-[10px] text-slate-405">
                      <MapPin className="w-3.5 h-3.5 text-gold-500" />
                      <span className="line-clamp-1">{dest.bestTime}</span>
                    </div>
                    <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-gold-500 transition">
                      {dest.name}
                    </h3>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                      <span>{dest.distance} km</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {dest.travelTime}</span>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-slate-100 dark:bg-luxury-800 my-3.5"></div>

                  <div className="flex items-center justify-between gap-3 text-left">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block leading-none mb-0.5">Fare</span>
                      <span className="font-serif font-black text-sm text-gold-500 leading-none">
                        ₹{dest.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/destination/${dest.slug}`}
                        className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-gold-450 hover:underline transition"
                      >
                        More
                      </Link>
                      <button
                        onClick={() => handleBookCabClick(dest)}
                        className="bg-nature-900 hover:bg-nature-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition"
                      >
                        Book
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
export default CategoryListing;
