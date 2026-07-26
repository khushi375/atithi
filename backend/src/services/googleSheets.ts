import axios from 'axios';

// Helper to format date consistently as YYYY-MM-DD HH:mm
const formatDateTime = (dateVal?: string | Date): string => {
  if (!dateVal) return '';
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  // Using local or standard ISO fallback formatted to YYYY-MM-DD HH:mm
  const pad = (num: number) => String(num).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const syncUserToSheet = async (id: string, name: string, email: string, dateJoined: string | Date) => {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    console.warn('GOOGLE_SCRIPT_URL is not configured. User sync skipped.');
    return;
  }
  try {
    const response = await axios.post(url, {
      sheet: 'Users',
      id,
      name,
      email,
      date: formatDateTime(dateJoined)
    });
    console.log('User synced to Google Sheet:', response.data);
  } catch (error) {
    console.error('Google Sheet User Sync Failed:', error instanceof Error ? error.message : error);
  }
};

export const syncDestinationToSheet = async (
  id: string,
  destination: string,
  category: string,
  price: number | string,
  status: string,
  createdAt: string | Date,
  updatedAt?: string | Date
) => {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    console.warn('GOOGLE_SCRIPT_URL is not configured. Destination sync skipped.');
    return;
  }
  try {
    const response = await axios.post(url, {
      sheet: 'Destinations',
      id,
      destination,
      category,
      price: String(price),
      status,
      date: formatDateTime(createdAt),
      updatedDate: formatDateTime(updatedAt || new Date())
    });
    console.log('Destination synced to Google Sheet:', response.data);
  } catch (error) {
    console.error('Google Sheet Destination Sync Failed:', error instanceof Error ? error.message : error);
  }
};

export const syncBookingToSheet = async (
  id: string,
  customer: string,
  email: string,
  destination: string,
  travelDate: string | Date,
  status: string,
  createdAt: string | Date,
  updatedAt?: string | Date
) => {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    console.warn('GOOGLE_SCRIPT_URL is not configured. Booking sync skipped.');
    return;
  }
  try {
    const response = await axios.post(url, {
      sheet: 'Bookings',
      id,
      customer,
      email,
      destination,
      travelDate: travelDate instanceof Date ? travelDate.toISOString().split('T')[0] : String(travelDate).split('T')[0],
      status,
      date: formatDateTime(createdAt),
      updatedDate: formatDateTime(updatedAt || new Date())
    });
    console.log('Booking synced to Google Sheet:', response.data);
  } catch (error) {
    console.error('Google Sheet Booking Sync Failed:', error instanceof Error ? error.message : error);
  }
};

export const syncContactToSheet = async (
  id: string,
  name: string,
  email: string,
  phone: string,
  message: string,
  status: string,
  createdAt: string | Date,
  updatedAt?: string | Date
) => {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    console.warn('GOOGLE_SCRIPT_URL is not configured. Contact sync skipped.');
    return;
  }
  try {
    const response = await axios.post(url, {
      sheet: 'Contacts',
      id,
      name,
      email,
      phone,
      message,
      status,
      date: formatDateTime(createdAt),
      updatedDate: formatDateTime(updatedAt || new Date())
    });
    console.log('Contact inquiry synced to Google Sheet:', response.data);
  } catch (error) {
    console.error('Google Sheet Contact Sync Failed:', error instanceof Error ? error.message : error);
  }
};
