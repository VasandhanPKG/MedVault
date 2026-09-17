import { Router } from 'express';
import { askAssistant, getRiskAnalysis } from '../controllers/ai.controller';
import {
  getDepartments,
  startInterviewSession,
  submitInterviewAnswer,
  getInterviewSummary,
  updateInterviewSummary,
  verifyInterviewSession,
  getPatientInterviews
} from '../controllers/intake.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// General AI Assistant & Risk Analysis
router.post('/assistant', authenticateToken, askAssistant);
router.get('/risk-analysis', authenticateToken, getRiskAnalysis);

// Department-Specific Adaptive AI Intake (department metadata ontology is public reference data)
router.get('/intake/departments', getDepartments);
router.post('/intake/session/start', authenticateToken, startInterviewSession);
router.post('/intake/session/:sessionId/answer', authenticateToken, submitInterviewAnswer);
router.get('/intake/session/:sessionId/summary', authenticateToken, getInterviewSummary);
router.put('/intake/session/:sessionId/summary', authenticateToken, updateInterviewSummary);
router.post('/intake/session/:sessionId/verify', authenticateToken, verifyInterviewSession);
router.get('/intake/patient/history', authenticateToken, getPatientInterviews);

export default router;
