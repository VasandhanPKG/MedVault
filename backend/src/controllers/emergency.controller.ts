import { Response } from 'express';
import { db, EmergencyAccess } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

export const generateEmergencyQR = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const { type = 'emergency', durationHours = 24 } = req.body;
  let user = await db.findUserById(userId);

  if (!user) {
    user = {
      id: userId,
      name: req.user?.name || 'Patient',
      dob: 'Not specified',
      gender: 'Unspecified',
      bloodGroup: 'Not set',
      email: req.user?.email || '',
      phone: '',
      height: '',
      weight: '',
      allergies: [],
      conditions: [],
      emergencyContact: {
        name: 'Not specified',
        relation: 'Family',
        phone: ''
      },
      passwordHash: ''
    };
  }

  // Fetch actual user conditions from the database
  const userConditions = await db.getConditions(userId);
  const conditionTitles = (userConditions || []).map(c => c.title);
  const finalConditions = Array.from(new Set([...(user.conditions || []), ...conditionTitles]));

  const prefixMap: Record<string, string> = {
    emergency: 'EMG',
    doctor: 'DOC',
    pharmacy: 'RX',
    general: 'GEN'
  };

  const prefix = prefixMap[type] || 'EMG';
  const token = `${prefix}-${uuidv4().substring(0, 8).toUpperCase()}`;
  
  // Calculate expiration
  const hours = Number(durationHours) || 24;
  const expiresAt = hours > 0 
    ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const access: EmergencyAccess = {
    token,
    patientId: user.id,
    patientName: user.name,
    bloodGroup: user.bloodGroup || 'Not set',
    allergies: user.allergies || [],
    conditions: finalConditions,
    emergencyContact: user.emergencyContact || { name: 'Not specified', relation: '', phone: '' },
    type: type as any,
    expiresAt,
    createdAt: new Date().toISOString()
  };

  await db.createEmergencyToken(access);

  return res.json({
    message: `${type.toUpperCase()} access QR token generated`,
    token,
    type,
    expiresAt,
    emergencyData: access
  });
};

export const listUserTokens = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const tokens = await db.getUserEmergencyTokens(userId);
    return res.json(tokens || []);
  } catch (error) {
    console.error('listUserTokens error:', error);
    return res.status(500).json({ error: 'Failed to list active tokens' });
  }
};

export const revokeEmergencyToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const { token } = req.params;
    await db.revokeEmergencyToken(token as string, userId);
    return res.json({ message: 'Access token revoked successfully' });
  } catch (error) {
    console.error('revokeEmergencyToken error:', error);
    return res.status(500).json({ error: 'Failed to revoke access token' });
  }
};

export const verifyEmergencyToken = async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.params;
  const access = await db.getEmergencyToken(token as string);

  if (!access) {
    return res.status(404).json({ error: 'Invalid or expired access token' });
  }

  if (new Date(access.expiresAt) < new Date()) {
    return res.status(410).json({ error: 'Access token has expired' });
  }

  const user = await db.findUserById(access.patientId);
  const records = await db.getRecords(access.patientId);
  const vitals = await db.getVitals(access.patientId);
  const conditions = await db.getConditions(access.patientId);
  const vaccinations = await db.getVaccinations(access.patientId);

  const latestVital = vitals && vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const qrType = access.type || 'emergency';

  const basePatient = {
    name: user?.name || access.patientName || 'Patient',
    dob: user?.dob || 'Not specified',
    gender: user?.gender || 'Not specified',
    bloodGroup: user?.bloodGroup || access.bloodGroup || 'Not set',
    allergies: user?.allergies && user.allergies.length > 0 ? user.allergies : access.allergies || [],
    conditions: conditions && conditions.length > 0 ? conditions.map(c => c.title) : access.conditions || [],
    emergencyContact: user?.emergencyContact || access.emergencyContact || { name: 'Not specified', relation: '', phone: '' },
    height: user?.height || 'Not set',
    weight: user?.weight || 'Not set'
  };

  // Scope response payload based on QR role
  if (qrType === 'pharmacy') {
    const prescriptions = (records || []).filter(r => r.category === 'Prescription');
    return res.json({
      status: 'ACTIVE_PHARMACY_ACCESS',
      type: 'pharmacy',
      patient: basePatient,
      prescriptions,
      validUntil: access.expiresAt
    });
  }

  if (qrType === 'general') {
    return res.json({
      status: 'ACTIVE_GENERAL_ACCESS',
      type: 'general',
      patient: basePatient,
      vaccinations,
      latestVital,
      validUntil: access.expiresAt
    });
  }

  if (qrType === 'doctor') {
    return res.json({
      status: 'ACTIVE_DOCTOR_ACCESS',
      type: 'doctor',
      patient: basePatient,
      conditions,
      records,
      vitals,
      vaccinations,
      validUntil: access.expiresAt
    });
  }

  // Default: Emergency Triage Mode
  const recentReports = (records || []).slice(0, 3).map(r => ({
    name: r.name,
    category: r.category,
    date: r.date,
    summary: r.summary,
    extractedMarkers: (r.extractedMarkers || []).slice(0, 3)
  }));

  return res.json({
    status: 'ACTIVE_EMERGENCY_ACCESS',
    type: 'emergency',
    patient: basePatient,
    latestVital,
    activeConditions: conditions.filter(c => c.isOngoing || c.status === 'active'),
    recentReports,
    validUntil: access.expiresAt
  });
};
