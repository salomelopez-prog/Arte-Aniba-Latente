import { Router } from 'express';
import { list, getById, getBySlug, create, update, remove, getCategories } from '../controllers/products.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = Router();

router.get('/', list);
router.get('/categories', getCategories);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);

router.post('/', authenticate, requireRole('superadmin', 'editor'), upload.single('image'), handleMulterError, create);
router.put('/:id', authenticate, requireRole('superadmin', 'editor'), upload.single('image'), handleMulterError, update);
router.delete('/:id', authenticate, requireRole('superadmin'), remove);

export default router;
