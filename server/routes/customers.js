import { Router } from 'express';
import { register, list, getById, update } from '../controllers/customers.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Ruta pública: registro de cliente desde el checkout (sin contraseña)
router.post('/register', register);

router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.put('/:id', authenticate, update);

export default router;
