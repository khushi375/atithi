import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Destination, AdminActivityLog } from '../models';
import cloudinary from '../config/cloudinary';
import { syncDestinationToSheet } from '../services/googleSheets';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const handleImageUpload = async (imageInput: string): Promise<string> => {
  if (imageInput.startsWith('data:image/')) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(imageInput, {
        folder: 'atithi_destinations'
      });
      return uploadResponse.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed');
    }
  }
  return imageInput; // Return as is if already uploaded or URL
};

export const createDestination = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, price, distance, travelTime, bestTime, coverImage, sections } = req.body;

    if (!name || !category || !price || !distance || !travelTime || !bestTime || !coverImage) {
      return res.status(400).json({ message: 'All destination parameters are required' });
    }

    const slug = generateSlug(name);
    const existing = await Destination.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: `A destination with slug "${slug}" already exists.` });
    }

    // Handle Cloudinary upload
    const finalCoverImage = await handleImageUpload(coverImage);

    // Process blog sections to check for base64 images that require uploading
    const finalSections = [];
    if (sections && Array.isArray(sections)) {
      for (const section of sections) {
        if (section.type === 'image') {
          const uploadedUrl = await handleImageUpload(section.content);
          finalSections.push({ type: 'image', content: uploadedUrl });
        } else {
          finalSections.push(section);
        }
      }
    }

    const destination = new Destination({
      name,
      slug,
      category,
      price: Number(price),
      distance: Number(distance),
      travelTime,
      bestTime,
      coverImage: finalCoverImage,
      sections: finalSections
    });

    await destination.save();

    // Async Sheets sync wrapped in try/catch to maintain resiliency
    try {
      await syncDestinationToSheet(
        destination._id.toString(),
        destination.name,
        destination.category,
        destination.price,
        destination.status,
        destination.createdAt,
        destination.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync destination to Google Sheets:', err);
    }

    // Log the admin action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Created Destination',
          recordType: 'Destination',
          recordId: destination._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(201).json(destination);
  } catch (error) {
    console.error('Error creating destination:', error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Server error while creating destination' });
  }
};

export const getDestinations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, q, status } = req.query;
    let filterQuery: any = {};

    if (category) {
      filterQuery.category = category;
    }

    if (q) {
      filterQuery.$text = { $search: q as string };
    }

    if (status === 'all') {
      // Return all destinations including Deleted (for admin UI view)
    } else if (status) {
      filterQuery.status = status;
    } else {
      filterQuery.status = { $ne: 'Deleted' };
    }

    const destinations = await Destination.find(filterQuery).sort({ createdAt: -1 });
    return res.status(200).json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return res.status(500).json({ message: 'Server error while fetching destinations' });
  }
};

export const getDestinationBySlug = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug, status: { $ne: 'Deleted' } });
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    return res.status(200).json(destination);
  } catch (error) {
    console.error('Error fetching destination slug:', error);
    return res.status(500).json({ message: 'Server error while fetching destination detail' });
  }
};

export const updateDestination = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, price, distance, travelTime, bestTime, coverImage, sections } = req.body;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    if (name && name !== destination.name) {
      destination.name = name;
      destination.slug = generateSlug(name);
    }

    if (category) destination.category = category;
    if (price) destination.price = Number(price);
    if (distance) destination.distance = Number(distance);
    if (travelTime) destination.travelTime = travelTime;
    if (bestTime) destination.bestTime = bestTime;

    if (coverImage) {
      destination.coverImage = await handleImageUpload(coverImage);
    }

    if (sections && Array.isArray(sections)) {
      const finalSections = [];
      for (const section of sections) {
        if (section.type === 'image') {
          const uploadedUrl = await handleImageUpload(section.content);
          finalSections.push({ type: 'image', content: uploadedUrl });
        } else {
          finalSections.push(section);
        }
      }
      destination.sections = finalSections;
    }

    destination.updatedAt = new Date();
    await destination.save();

    // Sync updates to Google Sheets
    try {
      await syncDestinationToSheet(
        destination._id.toString(),
        destination.name,
        destination.category,
        destination.price,
        destination.status,
        destination.createdAt,
        destination.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync updated destination to Google Sheets:', err);
    }

    // Log the admin action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Updated Destination',
          recordType: 'Destination',
          recordId: destination._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json(destination);
  } catch (error) {
    console.error('Error updating destination:', error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Server error while updating destination' });
  }
};

export const deleteDestination = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    destination.status = 'Deleted';
    destination.updatedAt = new Date();
    await destination.save();

    // Sync deletion to Google Sheets by updating status to Deleted
    try {
      await syncDestinationToSheet(
        destination._id.toString(),
        destination.name,
        destination.category,
        destination.price,
        destination.status,
        destination.createdAt,
        destination.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync deleted destination to Google Sheets:', err);
    }

    // Log the admin action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Deleted Destination',
          recordType: 'Destination',
          recordId: destination._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json({ message: 'Destination deleted successfully (moved to Trash)' });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return res.status(500).json({ message: 'Server error while deleting destination' });
  }
};

export const restoreDestination = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    destination.status = 'Active';
    destination.updatedAt = new Date();
    await destination.save();

    // Sync restoration to Google Sheets
    try {
      await syncDestinationToSheet(
        destination._id.toString(),
        destination.name,
        destination.category,
        destination.price,
        destination.status,
        destination.createdAt,
        destination.updatedAt
      );
    } catch (err) {
      console.error('Failed to sync restored destination to Google Sheets:', err);
    }

    // Log the admin action
    try {
      if (req.user) {
        await AdminActivityLog.create({
          adminEmail: req.user.email,
          action: 'Restored Destination',
          recordType: 'Destination',
          recordId: destination._id.toString()
        });
      }
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }

    return res.status(200).json(destination);
  } catch (error) {
    console.error('Error restoring destination:', error);
    return res.status(500).json({ message: 'Server error while restoring destination' });
  }
};

export const getSitemap = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const destinations = await Destination.find({ status: { $ne: 'Deleted' } }, 'slug');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${frontendUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${frontendUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${frontendUrl}/wishlist</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${frontendUrl}/profile</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`;

    destinations.forEach(dest => {
      xml += `
  <url>
    <loc>${frontendUrl}/destination/${dest.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).send('Error generating sitemap.xml');
  }
};
