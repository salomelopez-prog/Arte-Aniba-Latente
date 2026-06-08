import { Router } from 'express';
import { handleWebhook, getPaymentStatus } from '../controllers/payments.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/webhook', handleWebhook);
router.get('/status/:orderId', authenticate, getPaymentStatus);

export default router;
