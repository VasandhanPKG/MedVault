import { Response } from 'express';
import { db, EmergencyAccess } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

export const generateEmergencyQR = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const user = db.findUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }

  const token = `EMG-${uuidv4().substring(0, 8).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // valid 24h

  const access: EmergencyAccess = {
    token,
    patientId: user.id,
    patientName: user.name,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies,
    conditions: user.conditions,
    emergencyContact: user.emergencyContact,
    expiresAt
  };

  db.saveEmergencyToken(access);

  const qrDataUrl = `https://medvault.health/emergency/verify?token=${token}`;

  return res.json({
    message: 'Emergency access QR token generated',
    token,
    qrDataUrl,
    expiresAt,
    emergencyData: access
  });
};

export const verifyEmergencyToken = (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.params;
  const access = db.getEmergencyToken(token as string);

  if (!access) {
    return res.status(404).json({ error: 'Invalid or expired emergency token' });
  }

  if (new Date(access.expiresAt) < new Date()) {
    return res.status(410).json({ error: 'Emergency token has expired' });
  }

  return res.json({
    status: 'ACTIVE_EMERGENCY_ACCESS',
    patient: {
      name: access.patientName,
      bloodGroup: access.bloodGroup,
      allergies: access.allergies,
      conditions: access.conditions,
      emergencyContact: access.emergencyContact
    },
    validUntil: access.expiresAt
  });
};
