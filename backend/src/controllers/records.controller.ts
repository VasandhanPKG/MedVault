import { Response } from 'express';
import { db, MedicalRecord } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ocrService } from '../services/ocr.service';
import { v4 as uuidv4 } from 'uuid';

export const getRecords = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const records = await db.getRecords(userId);
  return res.json(records);
};

export const getRecordById = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const { id } = req.params;
  const record = await db.getRecordById(id, userId);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }
  return res.json(record);
};

export const createRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const { name, category, date, summary, type } = req.body;
    const file = req.file;

    let ocrSummary = summary;
    let detectedCategory = category || 'Lab Report';
    let extractedMarkers: any[] = [];
    let rawText = '';

    if (file) {
      console.log(`🚀 Starting OCR processing for uploaded file: ${file.originalname} (${file.mimetype})`);
      const ocrResult = await ocrService.processDocument(file.path, file.mimetype);
      ocrSummary = ocrResult.summary;
      detectedCategory = category || ocrResult.detectedCategory;
      extractedMarkers = ocrResult.extractedMarkers;
      rawText = ocrResult.rawText;
    } else {
      // Direct text / metadata upload
      extractedMarkers = ocrService.extractBiomarkers(summary || name || '');
      ocrSummary = summary || `Extracted metrics for ${name || 'Medical Report'}`;
    }

    const recordName = name || (file ? file.originalname.replace(/\.[^/.]+$/, "") : 'Medical Lab Report');

    const newRecord: MedicalRecord = {
      id: `rec-${uuidv4().substring(0, 8)}`,
      userId,
      name: recordName,
      date: date || new Date().toISOString().split('T')[0],
      type: type || (file ? file.mimetype.split('/')[1]?.toUpperCase() || 'PDF' : 'PDF'),
      category: detectedCategory,
      status: 'processed',
      size: file ? `${Math.round(file.size / 1024)} KB` : '320 KB',
      summary: ocrSummary,
      fileUrl: file ? `/uploads/${file.filename}` : undefined,
      extractedMarkers,
      rawText,
      createdAt: new Date().toISOString()
    };

    await db.addRecord(newRecord);

    return res.status(201).json({
      message: 'Document uploaded and OCR processed successfully',
      record: newRecord,
      ocr: {
        rawText,
        extractedMarkers,
        summary: ocrSummary
      }
    });
  } catch (error) {
    console.error('Record creation & OCR processing error:', error);
    return res.status(500).json({ error: 'Failed to process document with OCR' });
  }
};

export const deleteRecord = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const { id } = req.params;
  const success = await db.deleteRecord(id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Record not found or already deleted' });
  }
  return res.json({ message: 'Record deleted successfully' });
};
