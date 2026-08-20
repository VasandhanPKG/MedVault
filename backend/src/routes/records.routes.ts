import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getRecords, getRecordById, createRecord, deleteRecord } from '../controllers/records.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', authenticateToken, getRecords);
router.get('/:id', authenticateToken, getRecordById);
router.post('/', authenticateToken, upload.single('file'), createRecord);
router.delete('/:id', authenticateToken, deleteRecord);

export default router;
