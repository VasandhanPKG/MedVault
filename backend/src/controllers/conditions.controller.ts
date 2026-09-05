import { Response } from 'express';
import { db, HealthCondition } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

export const getConditions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const conditions = await db.getConditions(userId);
    return res.json(conditions);
  } catch (error) {
    console.error('getConditions error:', error);
    return res.status(500).json({ error: 'Failed to fetch health conditions' });
  }
};

export const createCondition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const {
      title,
      category,
      startDate,
      endDate,
      isOngoing,
      status,
      severity,
      symptoms,
      diagnosis,
      treatingDoctor,
      hospital,
      outcome,
      linkedRecordIds
    } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ error: 'Title and Start Date are required' });
    }

    const newCondition: HealthCondition = {
      id: `con-${uuidv4().substring(0, 8)}`,
      userId,
      title,
      category: category || 'General',
      startDate,
      endDate: isOngoing ? undefined : endDate,
      isOngoing: isOngoing ?? !endDate,
      status: status || 'active',
      severity: severity || 'mild',
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      diagnosis: diagnosis || title,
      treatingDoctor: treatingDoctor || '',
      hospital: hospital || '',
      outcome: outcome || '',
      linkedRecordIds: Array.isArray(linkedRecordIds) ? linkedRecordIds : [],
      createdAt: new Date().toISOString()
    };

    await db.addCondition(newCondition);

    return res.status(201).json({
      message: 'Health condition recorded in patient timeline',
      condition: newCondition
    });
  } catch (error) {
    console.error('createCondition error:', error);
    return res.status(500).json({ error: 'Failed to record health condition' });
  }
};

export const updateCondition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateCondition(id, userId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Health condition not found' });
    }

    return res.json({
      message: 'Health condition updated',
      condition: updated
    });
  } catch (error) {
    console.error('updateCondition error:', error);
    return res.status(500).json({ error: 'Failed to update health condition' });
  }
};

export const deleteCondition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const { id } = req.params;

    const success = await db.deleteCondition(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Health condition not found' });
    }

    return res.json({ message: 'Health condition removed from timeline' });
  } catch (error) {
    console.error('deleteCondition error:', error);
    return res.status(500).json({ error: 'Failed to delete health condition' });
  }
};
