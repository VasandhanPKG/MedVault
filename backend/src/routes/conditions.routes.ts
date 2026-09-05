import { Router } from 'express';
import { getConditions, createCondition, updateCondition, deleteCondition } from '../controllers/conditions.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getConditions);
router.post('/', createCondition);
router.put('/:id', updateCondition);
router.delete('/:id', deleteCondition);

export default router;
