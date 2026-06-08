import { Router } from 'express';
import { list, getById, create, markReplied } from '../controllers/contacts.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', create);
router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.patch('/:id/replied', authenticate, markReplied);

export default router;
