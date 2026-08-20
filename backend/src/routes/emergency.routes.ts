import { Router } from 'express';
import { generateEmergencyQR, verifyEmergencyToken } from '../controllers/emergency.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/qr', authenticateToken, generateEmergencyQR);
router.get('/verify/:token', verifyEmergencyToken);

export default router;
