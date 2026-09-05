import { Router } from 'express';
import { getVaccinations, createVaccination, deleteVaccination } from '../controllers/vaccinations.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getVaccinations);
router.post('/', createVaccination);
router.delete('/:id', deleteVaccination);

export default router;
