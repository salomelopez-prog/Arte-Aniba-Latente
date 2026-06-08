import { Router } from 'express';
import { getAll, getByKey, update, updateBulk } from '../controllers/settings.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getAll);
router.get('/:key', getByKey);
router.put('/:key', authenticate, update);
router.patch('/bulk', authenticate, updateBulk);

export default router;
