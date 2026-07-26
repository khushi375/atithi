import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models';
import { syncUserToSheet } from '../services/googleSheets';
import { admin } from '../config/firebase';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/email';

export const syncUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { uid, email, name, role } = req.user;

  try {
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      // Check if user already exists by email to link them and prevent duplicate key index errors
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.firebaseUid = uid;
        if (name && user.name !== name) {
          user.name = name;
        }
        await user.save();
      } else {
        user = new User({
          firebaseUid: uid,
          name: name || 'Valued Guest',
          email,
          role
        });
        await user.save();
      }
      
      // Async Sheet sync wrapped in try/catch to maintain resiliency
      try {
        await syncUserToSheet(user._id.toString(), user.name, user.email, user.joinedAt);
      } catch (err) {
        console.error('Failed to sync user to Google Sheets:', err);
      }

      // Automatically send branded verification email for new unverified accounts
      if (!req.user.emailVerified) {
        try {
          const link = await admin.auth().generateEmailVerificationLink(email);
          const urlParams = new URL(link).searchParams;
          const oobCode = urlParams.get('oobCode');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const customLink = `${frontendUrl}/email-verified?oobCode=${oobCode}`;
          
          await sendVerificationEmail(email, customLink);
          user.lastVerificationSent = new Date();
          await user.save();
        } catch (err) {
          console.error('Failed to send auto-verification email on registration:', err);
        }
      } else {
        // Since user is already verified (Google registration), send welcome email directly
        try {
          await sendWelcomeEmail(email, user.name);
          user.welcomeEmailSent = true;
          await user.save();
        } catch (err) {
          console.error('Failed to send welcome email on Google registration:', err);
        }
      }
    } else {
      // Sync role updates if required
      if (user.role !== role) {
        user.role = role;
        await user.save();
      }
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ message: 'Server error while syncing user' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found in local database' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Send / Resend Verification Email
export const sendVerification = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { uid, email } = req.user;

  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User account record not found.' });
    }

    // Rate Limiting Cooldown: 60 seconds
    const cooldown = 60 * 1000;
    const now = Date.now();
    if (user.lastVerificationSent && (now - user.lastVerificationSent.getTime() < cooldown)) {
      const secondsLeft = Math.ceil((cooldown - (now - user.lastVerificationSent.getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${secondsLeft} seconds before requesting another email.` });
    }

    // Verify if already marked verified in Firebase token claims
    if (req.user.emailVerified) {
      return res.status(400).json({ message: 'Email address is already verified.' });
    }

    // Generate link via Firebase Admin SDK
    const link = await admin.auth().generateEmailVerificationLink(email);
    const urlParams = new URL(link).searchParams;
    const oobCode = urlParams.get('oobCode');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const customLink = `${frontendUrl}/email-verified?oobCode=${oobCode}`;

    await sendVerificationEmail(email, customLink);

    user.lastVerificationSent = new Date();
    await user.save();

    return res.status(200).json({ message: 'Verification email sent successfully.' });
  } catch (error: any) {
    console.error('Error in sendVerification controller:', error);
    return res.status(500).json({ message: error.message || 'Server error while dispatching verification link.' });
  }
};

// Send Password Reset Email
export const sendPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    // Rate Limiting Cooldown: 60 seconds
    const cooldown = 60 * 1000;
    const now = Date.now();
    if (user.lastPasswordResetSent && (now - user.lastPasswordResetSent.getTime() < cooldown)) {
      const secondsLeft = Math.ceil((cooldown - (now - user.lastPasswordResetSent.getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${secondsLeft} seconds before requesting another link.` });
    }

    // Generate link via Firebase Admin SDK
    const link = await admin.auth().generatePasswordResetLink(email);
    const urlParams = new URL(link).searchParams;
    const oobCode = urlParams.get('oobCode');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const customLink = `${frontendUrl}/reset-password?oobCode=${oobCode}`;

    await sendPasswordResetEmail(user.email, customLink);

    user.lastPasswordResetSent = new Date();
    await user.save();

    return res.status(200).json({ message: 'Password reset link sent successfully.' });
  } catch (error: any) {
    console.error('Error in sendPasswordReset controller:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'No registered user found with this email address.' });
    }
    return res.status(500).json({ message: error.message || 'Server error while dispatching reset instructions.' });
  }
};

// Send Welcome Email
export const sendWelcome = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { uid, email, emailVerified } = req.user;

  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    if (!emailVerified) {
      return res.status(400).json({ message: 'Email address is not verified yet.' });
    }

    if (!user.welcomeEmailSent) {
      await sendWelcomeEmail(email, user.name);
      user.welcomeEmailSent = true;
      await user.save();
      return res.status(200).json({ message: 'Welcome email sent successfully.', welcomeEmailSent: true });
    }

    return res.status(200).json({ message: 'Welcome email was already sent.', welcomeEmailSent: true });
  } catch (error: any) {
    console.error('Error in sendWelcome controller:', error);
    return res.status(500).json({ message: error.message || 'Server error while sending welcome email.' });
  }
};
