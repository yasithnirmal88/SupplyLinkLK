import { Router } from 'express';
import { confirmDelivery, submitReview } from '../controllers/reviewsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.patch('/:chatId/confirm-delivery', authMiddleware, confirmDelivery);
router.post('/', authMiddleware, submitReview);

export default router;
