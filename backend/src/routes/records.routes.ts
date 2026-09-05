import { Router } from 'express';
import multer from 'multer';
import { getRecords, getRecordById, createRecord, deleteRecord } from '../controllers/records.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Store uploaded files in memory buffer (0 local disk writes, direct Supabase Cloud Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max limit
  }
});

router.get('/', authenticateToken, getRecords);
router.get('/:id', authenticateToken, getRecordById);
router.post('/', authenticateToken, upload.single('file'), createRecord);
router.delete('/:id', authenticateToken, deleteRecord);

export default router;
