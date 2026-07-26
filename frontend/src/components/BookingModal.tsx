import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Users, Car, HeartHandshake } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface BookingModalProps {
  destination: {
    _id: string;
    name: string;
    price: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ destination, isOpen, onClose }) => {
  const { currentUser, dbUser } = useAuth();
  
  // Form states
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicleType, setVehicleType] = useState<'Sedan' | 'SUV' | 'Tempo Traveller'>('Sedan');
  const [specialRequest, setSpecialRequest] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !destination) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) {
      return setError('Authentication required. Please login first.');
    }

    if (!currentUser.emailVerified) {
      return setError('Email verification required. Please verify your email before booking a trip.');
    }

    if (!phone || !travelDate || !passengers) {
      return setError('All booking details are required.');
    }

    setSubmitting(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/bookings`,
        {
          destinationId: destination._id,
          fullName,
          email,
          phone,
          travelDate,
          passengers,
          vehicleType,
          specialRequest
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(`Trip request submitted! Reference code: ${response.data.bookingReference}. Confirmation emails have been dispatched.`);
      setPhone('');
      setTravelDate('');
      setPassengers(1);
      setSpecialRequest('');
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 4000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-luxury-900 border border-slate-200 dark:border-luxury-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-6 h-6 text-gold-500 animate-bounce" />
            <h3 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">
              Book Cab to {destination.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            Premium travel support. Pricing starts at <strong className="text-gold-500 font-serif text-sm">₹{destination.price.toLocaleString()}</strong>.
          </p>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs rounded-lg mb-4 text-center font-medium leading-relaxed">
              {success}
            </div>
          )}

          {!currentUser ? (
            <div className="p-4 bg-slate-50 dark:bg-luxury-950 text-center rounded-xl border border-slate-200/50 dark:border-luxury-850">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Login required to book cab services.</p>
              <p className="text-xs text-slate-400">Please click the "Login / Register" option in the main navigation bar.</p>
            </div>
          ) : !currentUser.emailVerified ? (
            <div className="p-4 bg-gold-50/30 dark:bg-gold-950/10 text-center rounded-xl border border-gold-400/20">
              <p className="text-sm font-bold text-gold-600 dark:text-gold-400 mb-2">Email Verification Required</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Please verify your email address via the link sent to your inbox to unlock cab bookings.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    disabled
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-100 dark:bg-luxury-900 text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 99999 99999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Travel Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Passengers</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={15}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e: any) => setVehicleType(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Sedan">Executive Sedan (1-4 pax)</option>
                    <option value="SUV">Luxury SUV (1-6 pax)</option>
                    <option value="Tempo Traveller">Tempo Traveller (7-15 pax)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Special Request (Optional)</label>
                <textarea
                  placeholder="E.g., child seat, extra luggage space, hotel transfer details..."
                  rows={2}
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md shadow-gold-500/10 flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>{submitting ? 'Registering Booking...' : 'Request Cab Reservation'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
