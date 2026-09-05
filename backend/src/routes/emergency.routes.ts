import { Router } from 'express';
import { generateEmergencyQR, verifyEmergencyToken, listUserTokens, revokeEmergencyToken } from '../controllers/emergency.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate', authenticateToken, generateEmergencyQR);
router.post('/qr', authenticateToken, generateEmergencyQR);
router.get('/tokens', authenticateToken, listUserTokens);
router.delete('/tokens/:token', authenticateToken, revokeEmergencyToken);
router.delete('/revoke/:token', authenticateToken, revokeEmergencyToken);
router.get('/verify/:token', verifyEmergencyToken);

export default router;

