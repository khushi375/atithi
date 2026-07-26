import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Wishlist, User } from '../models';

export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { destinationId } = req.body;
    if (!destinationId) {
      return res.status(400).json({ message: 'Destination ID is required' });
    }

    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if duplicate
    const existing = await Wishlist.findOne({ userId: userDoc._id, destinationId });
    if (existing) {
      return res.status(200).json({ message: 'Destination already in wishlist', wishlist: existing });
    }

    const wishlist = new Wishlist({
      userId: userDoc._id,
      destinationId
    });

    await wishlist.save();
    return res.status(201).json({ message: 'Added to wishlist', wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { destinationId } = req.params;
    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleted = await Wishlist.findOneAndDelete({ userId: userDoc._id, destinationId });
    if (!deleted) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    return res.status(200).json({ message: 'Removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({ message: 'Server error while removing from wishlist' });
  }
};

export const getMyWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = await Wishlist.find({ userId: userDoc._id }).populate('destinationId');
    return res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
};
export const getMyWishlistIds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }
    const wishlist = await Wishlist.find({ userId: userDoc._id }, 'destinationId');
    const ids = wishlist.map(w => w.destinationId.toString());
    return res.status(200).json(ids);
  } catch (error) {
    console.error('Error fetching wishlist ids:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
