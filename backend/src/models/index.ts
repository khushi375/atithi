import mongoose, { Schema, Document } from 'mongoose';

// 1. Counter Schema (for generating sequential booking references)
export interface ICounter extends Document {
  id: string;
  seq: number;
}
const CounterSchema = new Schema<ICounter>({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});
export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

// 2. User Schema
export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  joinedAt: Date;
  lastVerificationSent?: Date;
  lastPasswordResetSent?: Date;
  welcomeEmailSent?: boolean;
}
const UserSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  joinedAt: { type: Date, default: Date.now },
  lastVerificationSent: { type: Date },
  lastPasswordResetSent: { type: Date },
  welcomeEmailSent: { type: Boolean, default: false }
});
export const User = mongoose.model<IUser>('User', UserSchema);

// 3. Destination Schema
export interface ISection {
  type: 'text' | 'image';
  content: string;
}
export interface IDestination extends Document {
  name: string;
  slug: string;
  category: 'North' | 'South' | 'East' | 'West';
  price: number;
  distance: number; // in km
  travelTime: string; // e.g. "8 hours"
  bestTime: string;
  coverImage: string;
  sections: ISection[];
  status: 'Active' | 'Deleted';
  createdAt: Date;
  updatedAt: Date;
}
const DestinationSchema = new Schema<IDestination>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, enum: ['North', 'South', 'East', 'West'], required: true },
  price: { type: Number, required: true },
  distance: { type: Number, required: true },
  travelTime: { type: String, required: true },
  bestTime: { type: String, required: true },
  coverImage: { type: String, required: true },
  sections: [
    {
      type: { type: String, enum: ['text', 'image'], required: true },
      content: { type: String, required: true }
    }
  ],
  status: { type: String, enum: ['Active', 'Deleted'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// Full-text index for Search Bar
DestinationSchema.index({ name: 'text', category: 'text' });
export const Destination = mongoose.model<IDestination>('Destination', DestinationSchema);

// 4. Booking Schema
export interface IBooking extends Document {
  bookingReference: string; // e.g. "ATH-2026-0001"
  userId: mongoose.Types.ObjectId | string;
  destinationId: mongoose.Types.ObjectId | string;
  fullName: string;
  email: string;
  phone: string;
  travelDate: Date;
  passengers: number;
  vehicleType: 'Sedan' | 'SUV' | 'Tempo Traveller';
  specialRequest?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Archived' | 'Deleted';
  previousStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}
const BookingSchema = new Schema<IBooking>({
  bookingReference: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  travelDate: { type: Date, required: true },
  passengers: { type: Number, required: true },
  vehicleType: { type: String, enum: ['Sedan', 'SUV', 'Tempo Traveller'], required: true },
  specialRequest: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Archived', 'Deleted'], default: 'Pending' },
  previousStatus: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

// 5. Wishlist Schema
export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId | string;
  destinationId: mongoose.Types.ObjectId | string;
  createdAt: Date;
}
const WishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
  createdAt: { type: Date, default: Date.now }
});
// Composite unique constraint
WishlistSchema.index({ userId: 1, destinationId: 1 }, { unique: true });
export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

// 6. Review Schema
export interface IReview extends Document {
  userId: mongoose.Types.ObjectId | string;
  destinationId?: mongoose.Types.ObjectId | string;
  name: string;
  rating: number; // 1 to 5
  review: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
}
const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination' },
  name: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
export const Review = mongoose.model<IReview>('Review', ReviewSchema);

// 7. Contact Schema
export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'Pending' | 'Replied' | 'Closed' | 'Deleted';
  previousStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}
const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Replied', 'Closed', 'Deleted'], default: 'Pending' },
  previousStatus: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
export const Contact = mongoose.model<IContact>('Contact', ContactSchema);

// 8. Settings Schema
export interface ISettings extends Document {
  businessName: string;
  businessEmail: string;
  phone1: string;
  phone2: string;
  phone3: string;
  instagramUrl: string;
  officeAddress: string;
  heroNumbers: string[];
}
const SettingsSchema = new Schema<ISettings>({
  businessName: { type: String, required: true, default: 'ATITHI' },
  businessEmail: { type: String, required: true, default: 'contact@atithi.com' },
  phone1: { type: String, required: true, default: '+91 99999 99999' },
  phone2: { type: String, required: true, default: '+91 88888 88888' },
  phone3: { type: String, required: true, default: '+91 77777 77777' },
  instagramUrl: { type: String, required: true, default: 'https://instagram.com/atithi' },
  officeAddress: { type: String, required: true, default: '123, Luxury Way, New Delhi, India' },
  heroNumbers: { type: [String], required: true, default: ['+91 99999 99999', '+91 88888 88888', '+91 77777 77777'] }
});
export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

// 9. AdminActivityLog Schema
export interface IAdminActivityLog extends Document {
  adminEmail: string;
  action: string;
  recordType: 'Booking' | 'Destination' | 'Contact' | 'Review';
  recordId: string;
  timestamp: Date;
}
const AdminActivityLogSchema = new Schema<IAdminActivityLog>({
  adminEmail: { type: String, required: true },
  action: { type: String, required: true },
  recordType: { type: String, enum: ['Booking', 'Destination', 'Contact', 'Review'], required: true },
  recordId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
export const AdminActivityLog = mongoose.model<IAdminActivityLog>('AdminActivityLog', AdminActivityLogSchema);

