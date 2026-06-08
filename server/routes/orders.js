import { Router } from 'express';
import { list, getById, create, updateStatus } from '../controllers/orders.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', create);
router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.patch('/:id/status', authenticate, updateStatus);

export default router;
