import { Response } from 'express';
import { db, VaccinationRecord } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

export const getVaccinations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const vaccinations = await db.getVaccinations(userId);
    return res.json(vaccinations);
  } catch (error) {
    console.error('getVaccinations error:', error);
    return res.status(500).json({ error: 'Failed to fetch vaccination records' });
  }
};

export const createVaccination = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const {
      vaccineName,
      targetDisease,
      doseNumber,
      totalDoses,
      dateAdministered,
      nextDueDate,
      manufacturer,
      batchNumber,
      clinic,
      status
    } = req.body;

    if (!vaccineName || !dateAdministered) {
      return res.status(400).json({ error: 'Vaccine name and Date Administered are required' });
    }

    const newVaccination: VaccinationRecord = {
      id: `vac-${uuidv4().substring(0, 8)}`,
      userId,
      vaccineName,
      targetDisease: targetDisease || vaccineName,
      doseNumber: Number(doseNumber) || 1,
      totalDoses: Number(totalDoses) || 1,
      dateAdministered,
      nextDueDate: nextDueDate || undefined,
      manufacturer: manufacturer || '',
      batchNumber: batchNumber || '',
      clinic: clinic || 'Community Health Clinic',
      status: status || (nextDueDate && new Date(nextDueDate) < new Date() ? 'due' : 'completed'),
      createdAt: new Date().toISOString()
    };

    await db.addVaccination(newVaccination);

    return res.status(201).json({
      message: 'Vaccination record added to immunization passport',
      vaccination: newVaccination
    });
  } catch (error) {
    console.error('createVaccination error:', error);
    return res.status(500).json({ error: 'Failed to add vaccination record' });
  }
};

export const deleteVaccination = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const { id } = req.params;

    const success = await db.deleteVaccination(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Vaccination record not found' });
    }

    return res.json({ message: 'Vaccination record deleted' });
  } catch (error) {
    console.error('deleteVaccination error:', error);
    return res.status(500).json({ error: 'Failed to delete vaccination record' });
  }
};
