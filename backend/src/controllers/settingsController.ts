import { Request, Response } from 'express';
import { Settings } from '../models';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        businessName: 'ATITHI',
        businessEmail: 'contact@atithi.com',
        phone1: '+91 99999 99999',
        phone2: '+91 88888 88888',
        phone3: '+91 77777 77777',
        instagramUrl: 'https://instagram.com/atithi',
        officeAddress: '123, Luxury Way, New Delhi, India',
        heroNumbers: ['+91 99999 99999', '+91 88888 88888', '+91 77777 77777']
      });
      await settings.save();
    }
    return res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Server error while fetching settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    
    // Ensure sync logic between explicit individual phone variables and hero section list
    settings.heroNumbers = [settings.phone1, settings.phone2, settings.phone3].filter(Boolean);

    await settings.save();
    return res.status(200).json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Server error while updating settings' });
  }
};
