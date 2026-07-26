import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, MapPin, Phone, MessageSquare, Star, Send, ShieldAlert, HeartHandshake } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Contact: React.FC = () => {
  const { currentUser, dbUser } = useAuth();

  // Inquiry Form state
  const [inqName, setInqName] = useState(currentUser?.displayName || '');
  const [inqEmail, setInqEmail] = useState(currentUser?.email || '');
  const [inqPhone, setInqPhone] = useState('');
  const [inqMessage, setInqMessage] = useState('');
  const [inqSuccess, setInqSuccess] = useState('');
  const [inqError, setInqError] = useState('');
  const [inqSubmitting, setInqSubmitting] = useState(false);

  // Review Form state
  const [revDestination, setRevDestination] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revContent, setRevContent] = useState('');
  const [revSuccess, setRevSuccess] = useState('');
  const [revError, setRevError] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);

  // Fetch Settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/settings`);
      return res.data;
    }
  });

  // Fetch Destinations for drop-down selection in reviews
  const { data: destinations } = useQuery({
    queryKey: ['destinationsDropdown'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/destinations`);
      return res.data;
    }
  });

  const businessEmail = settings?.businessEmail || 'contact@atithi.com';
  const phone1 = settings?.phone1 || '+91 99999 99999';
  const phone2 = settings?.phone2 || '+91 88888 88888';
  const phone3 = settings?.phone3 || '+91 77777 77777';
  const officeAddress = settings?.officeAddress || '123, Luxury Way, New Delhi, India';

  // Submit contact inquiry
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqError('');
    setInqSuccess('');
    setInqSubmitting(true);

    try {
      await axios.post(`${API_URL}/contact/inquiry`, {
        name: inqName,
        email: inqEmail,
        phone: inqPhone,
        message: inqMessage
      });
      setInqSuccess('Thank you for contacting ATITHI! Your inquiry has been logged, and we will get back to you shortly.');
      setInqPhone('');
      setInqMessage('');
    } catch (err: any) {
      setInqError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setInqSubmitting(false);
    }
  };

  // Submit user review/feedback
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevError('');
    setRevSuccess('');
    setRevSubmitting(true);

    if (!currentUser) {
      setRevSubmitting(false);
      return setRevError('Please login first to submit feedback.');
    }

    if (!currentUser.emailVerified) {
      setRevSubmitting(false);
      return setRevError('Email verification required to submit a review.');
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/contact/review`,
        {
          destinationId: revDestination || undefined,
          rating: revRating,
          review: revContent
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRevSuccess('Your review has been submitted for moderation! Once approved, it will appear on our homepage. Thank you!');
      setRevDestination('');
      setRevRating(5);
      setRevContent('');
    } catch (err: any) {
      setRevError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setRevSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Get In Touch</span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mt-1">
          Contact Our Travel Desk
        </h1>
        <div className="w-20 h-[2px] bg-gold-400 mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        
        {/* Column 1: Contact info and Details */}
        <div className="glass p-8 rounded-2xl border border-slate-200/50 dark:border-luxury-850 space-y-6">
          <h3 className="font-serif text-xl font-bold border-b border-slate-200/50 dark:border-luxury-800/50 pb-3">
            Inquiry Information
          </h3>

          <div className="space-y-4 text-xs leading-relaxed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gold-400/5 rounded-xl border border-gold-400/15 shrink-0">
                <MapPin className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <span className="font-bold block text-sm">Office Address</span>
                <span className="text-slate-500 dark:text-slate-400">{officeAddress}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gold-400/5 rounded-xl border border-gold-400/15 shrink-0">
                <Phone className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <span className="font-bold block text-sm">Cab Hotlines</span>
                <span className="text-slate-500 dark:text-slate-400 block">{phone1}</span>
                <span className="text-slate-500 dark:text-slate-400 block">{phone2}</span>
                <span className="text-slate-500 dark:text-slate-400 block">{phone3}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gold-400/5 rounded-xl border border-gold-400/15 shrink-0">
                <Mail className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <span className="font-bold block text-sm">Corporate Email</span>
                <span className="text-slate-500 dark:text-slate-400">{businessEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Inquiry Form */}
        <div className="lg:col-span-2 glass p-8 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg">
          <h3 className="font-serif text-xl font-bold border-b border-slate-200/50 dark:border-luxury-800/50 pb-3 mb-6">
            Submit a Message
          </h3>

          {inqError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg mb-4 text-center">
              {inqError}
            </div>
          )}

          {inqSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs rounded-lg mb-4 leading-relaxed">
              {inqSuccess}
            </div>
          )}

          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={inqName}
                  onChange={(e) => setInqName(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inqEmail}
                  onChange={(e) => setInqEmail(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 99999 99999"
                  value={inqPhone}
                  onChange={(e) => setInqPhone(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Message Body</label>
              <textarea
                required
                rows={4}
                placeholder="Share detail coordinates or specific itineraries you'd like to plan..."
                value={inqMessage}
                onChange={(e) => setInqMessage(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </div>

            <button
              type="submit"
              disabled={inqSubmitting}
              className="bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2.5 px-8 rounded-lg transition duration-200 text-xs shadow-md shadow-gold-500/10 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{inqSubmitting ? 'Sending inquiry...' : 'Send Inquiry'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Review Widget */}
      <div className="max-w-2xl mx-auto glass p-8 rounded-2xl border border-slate-200/50 dark:border-luxury-850 shadow-lg mt-8">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-gold-500" />
          <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-white">
            Write a Review
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Share your transport and travel reviews. Reviews appear on our testimonials after admin review.
        </p>

        {revError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg mb-4 text-center">
            {revError}
          </div>
        )}

        {revSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs rounded-lg mb-4 text-center leading-relaxed">
            {revSuccess}
          </div>
        )}

        {!currentUser ? (
          <div className="p-4 bg-slate-50 dark:bg-luxury-950 text-center rounded-xl border border-slate-200/50 dark:border-luxury-850 text-xs">
            <ShieldAlert className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-350">Login Required</p>
            <p className="text-slate-400 mt-1">Please sign in to write reviews.</p>
          </div>
        ) : !currentUser.emailVerified ? (
          <div className="p-4 bg-gold-50/20 text-center rounded-xl border border-gold-400/20 text-xs">
            <ShieldAlert className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <p className="font-bold text-gold-600 dark:text-gold-400">Verify Email</p>
            <p className="text-slate-400 mt-1">Verify your email to write testimonials.</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            {/* Destination dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Destination Visited (Optional)</label>
              <select
                value={revDestination}
                onChange={(e) => setRevDestination(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100"
              >
                <option value="">General Platform Feedback</option>
                {destinations?.map((dest: any) => (
                  <option key={dest._id} value={dest._id}>{dest.name}</option>
                ))}
              </select>
            </div>

            {/* Star Rating Selectors */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Your Rating</label>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setRevRating(rating)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        rating <= revRating ? 'text-gold-400 fill-gold-400' : 'text-slate-200 dark:text-luxury-800'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback text */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Your Review</label>
              <textarea
                required
                rows={3}
                placeholder="Share details of your driver service, vehicle comfort, and trip memories..."
                value={revContent}
                onChange={(e) => setRevContent(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200/60 dark:border-luxury-800 bg-slate-50 dark:bg-luxury-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </div>

            <button
              type="submit"
              disabled={revSubmitting}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 text-xs shadow-md shadow-gold-500/10 flex items-center justify-center gap-1"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{revSubmitting ? 'Submitting review...' : 'Submit Review'}</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
export default Contact;
