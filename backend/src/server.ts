import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { authenticateUser, requireVerified, requireAdmin } from './middleware/auth';
import { syncUser, getProfile, sendVerification, sendPasswordReset, sendWelcome } from './controllers/authController';
import { verifySMTP } from './services/email';
import { getSettings, updateSettings } from './controllers/settingsController';
import {
  createDestination,
  getDestinations,
  getDestinationBySlug,
  updateDestination,
  deleteDestination,
  restoreDestination,
  getSitemap
} from './controllers/destinationController';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  restoreBooking
} from './controllers/bookingController';
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
  getMyWishlistIds
} from './controllers/wishlistController';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  createReview,
  getApprovedReviews,
  getAllReviews,
  updateReviewStatus,
  deleteInquiry,
  restoreInquiry,
  deleteReview
} from './controllers/contactController';
import { getDashboardStats, getAdminLogs } from './controllers/adminController';


const app = express();
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Verify Mail Transporter
verifySMTP();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- SEO Dynamic Paths ---
app.get('/sitemap.xml', getSitemap);
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.send(`User-agent: *\nAllow: /\nSitemap: ${frontendUrl}/sitemap.xml`);
});

// --- Health Probe ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// --- API Router Bindings ---

// Auth sync
app.post('/api/auth/sync', authenticateUser, syncUser);
app.get('/api/auth/profile', authenticateUser, getProfile);
app.post('/api/auth/send-verification', authenticateUser, sendVerification);
app.post('/api/auth/send-password-reset', sendPasswordReset);
app.post('/api/auth/send-welcome', authenticateUser, sendWelcome);

// Settings
app.get('/api/settings', getSettings);
app.put('/api/settings', authenticateUser, requireAdmin, updateSettings);

// Destinations
app.get('/api/destinations', getDestinations);
app.get('/api/destinations/:slug', getDestinationBySlug);
app.post('/api/destinations', authenticateUser, requireAdmin, createDestination);
app.put('/api/destinations/:id', authenticateUser, requireAdmin, updateDestination);
app.delete('/api/destinations/:id', authenticateUser, requireAdmin, deleteDestination);
app.patch('/api/destinations/:id/restore', authenticateUser, requireAdmin, restoreDestination);

// Bookings
app.post('/api/bookings', authenticateUser, requireVerified, createBooking);
app.get('/api/bookings/my', authenticateUser, requireVerified, getMyBookings);
app.get('/api/bookings/all', authenticateUser, requireAdmin, getAllBookings);
app.patch('/api/bookings/:id/status', authenticateUser, requireAdmin, updateBookingStatus);
app.delete('/api/bookings/:id', authenticateUser, requireAdmin, deleteBooking);
app.patch('/api/bookings/:id/restore', authenticateUser, requireAdmin, restoreBooking);

// Wishlist
app.get('/api/wishlist', authenticateUser, requireVerified, getMyWishlist);
app.get('/api/wishlist/ids', authenticateUser, requireVerified, getMyWishlistIds);
app.post('/api/wishlist', authenticateUser, requireVerified, addToWishlist);
app.delete('/api/wishlist/:destinationId', authenticateUser, requireVerified, removeFromWishlist);

// Inquiries & Feedback Reviews
app.post('/api/contact/inquiry', createInquiry);
app.get('/api/contact/inquiries', authenticateUser, requireAdmin, getInquiries);
app.patch('/api/contact/inquiries/:id/status', authenticateUser, requireAdmin, updateInquiryStatus);
app.delete('/api/contact/inquiries/:id', authenticateUser, requireAdmin, deleteInquiry);
app.patch('/api/contact/inquiries/:id/restore', authenticateUser, requireAdmin, restoreInquiry);

app.post('/api/contact/review', authenticateUser, requireVerified, createReview);
app.get('/api/contact/reviews/approved', getApprovedReviews);
app.get('/api/contact/reviews/all', authenticateUser, requireAdmin, getAllReviews);
app.patch('/api/contact/reviews/:id/status', authenticateUser, requireAdmin, updateReviewStatus);
app.delete('/api/contact/reviews/:id', authenticateUser, requireAdmin, deleteReview);

// Admin Dashboard stats
app.get('/api/admin/stats', authenticateUser, requireAdmin, getDashboardStats);
app.get('/api/admin/logs', authenticateUser, requireAdmin, getAdminLogs);

// Express Error boundary fallback
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled request boundary error:', err);
  res.status(500).json({ message: 'Internal server unhandled error occurred' });
});

app.listen(port, () => {
  console.log(`ATITHI server running on port ${port}`);
});
