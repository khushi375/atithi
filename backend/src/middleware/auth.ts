import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name: string;
    emailVerified: boolean;
    role: 'user' | 'admin';
  };
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (!admin.apps.length) {
      // Firebase fallback for local development if firebase admin parameters are missing
      console.warn('Firebase Admin SDK not loaded. Bypassing token validation.');
      req.user = {
        uid: 'dev-uid',
        email: 'admin@atithi.com',
        name: 'Developer Admin',
        emailVerified: true,
        role: 'admin'
      };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isEmailAdmin = decodedToken.email ? adminEmails.includes(decodedToken.email.toLowerCase()) : false;
    const role = isEmailAdmin ? 'admin' : 'user';

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || '',
      emailVerified: decodedToken.email_verified || false,
      role
    };
    next();
  } catch (error) {
    console.error('Auth verification failed:', error);
    return res.status(401).json({ message: 'Unauthorized. Invalid auth token.' });
  }
};

export const requireVerified = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!req.user.emailVerified) {
    return res.status(403).json({ message: 'Email verification required. Please verify your email to unlock all features.' });
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
};
