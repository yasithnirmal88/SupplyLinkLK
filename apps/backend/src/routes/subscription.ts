import { Router } from 'express';
import { initiateSubscription, payhereWebhook } from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/initiate', authMiddleware, initiateSubscription);
router.post('/webhook', payhereWebhook);

export default router;
