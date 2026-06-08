import { Router } from 'express';
import { login, refresh, me, logout, listUsers, createUser, setUserActive } from '../controllers/auth.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/security.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);
router.get('/users', authenticate, listUsers);
router.post('/users', authenticate, requireRole('superadmin'), createUser);
router.patch('/users/:id', authenticate, requireRole('superadmin'), setUserActive);

export default router;
