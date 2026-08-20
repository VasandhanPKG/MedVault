import { Router } from 'express';
import { askAssistant, getRiskAnalysis } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/assistant', authenticateToken, askAssistant);
router.get('/risk-analysis', authenticateToken, getRiskAnalysis);

export default router;
