import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Contact, Review, User, AdminActivityLog } from '../models';
import { syncContactToSheet } from '../services/googleSheets';
import { sendContactAcknowledgementEmail } from '../services/email';

// --- Contact Inquiry handlers ---

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All inquiry details are required' });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      message,
      status: 'Pending'
    });

    await contact.save();

    // Async Sheets sync wrapped in try/catch to maintain resiliency
    try {
      await syncContactToSheet(
        contact._id.toString(),
        contact.name,
        contact.email,
        contact.phone,
        contact.message,
        contact.status,
        contact.createdAt,
        contact.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync contact inquiry to Google Sheets:', err);
    }

    // Branded Nodemailer contact acknowledgement email trigger
    try {
      await sendContactAcknowledgementEmail(contact.name, contact.email, contact.message);
    } catch (err) {
      console.error('Failed to send contact acknowledgement email:', err);
    }

    return res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({ message: 'Server error while submitting inquiry' });
  }
};

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({ message: 'Server error while fetching inquiries' });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Replied', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid inquiry status selection' });
    }

    const inquiry = await Contact.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.status = status;
    inquiry.updatedAt = new Date();
    await inquiry.save();

    // Async Sheets sync wrapped in try/catch to maintain resiliency
    try {
      await syncContactToSheet(
        inquiry._id.toString(),
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.message,
        inquiry.status,
        inquiry.createdAt,
        inquiry.updatedAt
      );
    } catch (err) {
      console.error('Failed to update inquiry status in Google Sheets:', err);
    }

    return res.status(200).json(inquiry);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return res.status(500).json({ message: 'Server error while updating inquiry' });
  }
};

// --- Testimonials & Reviews handlers ---

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { destinationId, rating, review } = req.body;

    if (!rating || !review) {
      return res.status(400).json({ message: 'Rating and review message are required' });
    }

    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ message: 'User record not found' });
    }

    const newReview = new Review({
      userId: userDoc._id,
      destinationId: destinationId || undefined,
      name: userDoc.name,
      rating: Number(rating),
      review,
      status: 'Pending' // Requires admin approval to show on homepage
    });

    await newReview.save();
    return res.status(201).json(newReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ message: 'Server error while submitting review' });
  }
};

// Fetch only approved reviews for homepage testimonials
export const getApprovedReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ status: 'Approved' })
      .populate('destinationId', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    return res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// Fetch all reviews for admin moderation
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate('destinationId', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return res.status(500).json({ message: 'Server error while fetching all reviews' });
  }
};

// Approve or reject reviews
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid review status selection' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.status = status;
    await review.save();

    // Log review status update
    try {
      if ((req as any).user) {
        await AdminActivityLog.create({
          adminEmail: (req as any).user.email,
          action: `${status} Review`,
          recordType: 'Review',
          recordId: review._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ message: 'Server error while updating review status' });
  }
};

export const deleteInquiry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const inquiry = await Contact.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.previousStatus = inquiry.status;
    inquiry.status = 'Deleted';
    inquiry.updatedAt = new Date();
    await inquiry.save();

    // Sync deletion to Google Sheets by updating status to Deleted
    try {
      await syncContactToSheet(
        inquiry._id.toString(),
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.message,
        inquiry.status,
        inquiry.createdAt,
        inquiry.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync deleted inquiry to Google Sheets:', err);
    }

    // Log the action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Deleted Contact',
          recordType: 'Contact',
          recordId: inquiry._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json({ message: 'Inquiry deleted successfully (moved to Trash)' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return res.status(500).json({ message: 'Server error while deleting inquiry' });
  }
};

export const restoreInquiry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const inquiry = await Contact.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.status = (inquiry.previousStatus || 'Pending') as any;
    inquiry.previousStatus = undefined;
    inquiry.updatedAt = new Date();
    await inquiry.save();

    // Sync restoration to Google Sheets
    try {
      await syncContactToSheet(
        inquiry._id.toString(),
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.message,
        inquiry.status,
        inquiry.createdAt,
        inquiry.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync restored inquiry to Google Sheets:', err);
    }

    // Log the action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Restored Contact',
          recordType: 'Contact',
          recordId: inquiry._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json(inquiry);
  } catch (error) {
    console.error('Error restoring inquiry:', error);
    return res.status(500).json({ message: 'Server error while restoring inquiry' });
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Log physical review deletion
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Deleted Review',
          recordType: 'Review',
          recordId: id
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json({ message: 'Review deleted successfully from database' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Server error while deleting review' });
  }
};
