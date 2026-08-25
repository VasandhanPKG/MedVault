import { Response } from 'express';
import { db, VitalRecord } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

export const getVitals = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const vitals = await db.getVitals(userId);
  return res.json(vitals);
};

export const addVital = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const { systolic, diastolic, heartRate, bloodGlucose, weightKg, date } = req.body;

  const newVital: VitalRecord = {
    id: `v-${uuidv4().substring(0, 8)}`,
    userId,
    date: date || new Date().toISOString().split('T')[0],
    systolic: Number(systolic) || 120,
    diastolic: Number(diastolic) || 80,
    heartRate: Number(heartRate) || 72,
    bloodGlucose: Number(bloodGlucose) || 100,
    weightKg: Number(weightKg) || 75
  };

  await db.addVital(newVital);
  return res.status(201).json({ message: 'Vitals logged successfully', vital: newVital });
};
