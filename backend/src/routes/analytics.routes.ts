import { Router } from 'express';
import { getVitals, addVital } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/vitals', authenticateToken, getVitals);
router.post('/vitals', authenticateToken, addVital);

export default router;
