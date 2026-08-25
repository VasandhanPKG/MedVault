import { Response } from 'express';
import { db } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const user = await db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }
  const { passwordHash, ...profile } = user;
  return res.json(profile);
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const updates = req.body;
  delete updates.passwordHash;
  delete updates.id;

  const updatedProfile = await db.updateUser(userId, updates);
  if (!updatedProfile) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }
  return res.json({ message: 'Profile updated successfully', profile: updatedProfile });
};
