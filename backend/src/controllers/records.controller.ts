import { Response } from 'express';
import { db, MedicalRecord } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ocrService } from '../services/ocr.service';
import { uploadFileToStorage } from '../services/supabase';
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
    let fileUrl: string | undefined = undefined;

    if (file) {
      console.log(`🚀 Starting in-memory OCR & Cloud Upload for: ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(1)} KB)`);

      // 1. Process OCR directly from RAM Buffer (0 disk writes)
      const ocrResult = await ocrService.processDocument(file.buffer, file.mimetype, file.originalname);

      // STRICT VALIDATION: If the document is NOT medical (e.g. PPT, electricity bill, invoice, resume, code), REJECT IT!
      if (!ocrResult.isMedical) {
        console.log(`⚠️ Document rejected: "${file.originalname}" is non-medical and will NOT be added to medical records.`);
        return res.status(422).json({
          error: "Document Rejected: The uploaded file does not contain valid medical test results, clinical records, or radiology scans and was NOT added to your medical records.",
          isMedical: false,
          rejected: true,
          ocr: {
            rawText: ocrResult.rawText,
            extractedMarkers: [],
            summary: ocrResult.summary
          }
        });
      }

      ocrSummary = ocrResult.summary;
      detectedCategory = category || ocrResult.detectedCategory;
      extractedMarkers = ocrResult.extractedMarkers;
      rawText = ocrResult.rawText;

      // 2. Upload file Buffer directly to Supabase Storage Bucket ('medical-records')
      const cloudUrl = await uploadFileToStorage(file.buffer, file.originalname, file.mimetype);
      if (cloudUrl) {
        fileUrl = cloudUrl;
      } else {
        fileUrl = `https://medvault.health/documents/${encodeURIComponent(file.originalname)}`;
      }
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
      fileUrl,
      extractedMarkers,
      rawText,
      createdAt: new Date().toISOString()
    };

    await db.addRecord(newRecord);

    return res.status(201).json({
      message: 'Document processed with OCR and uploaded to Cloud Storage successfully',
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
