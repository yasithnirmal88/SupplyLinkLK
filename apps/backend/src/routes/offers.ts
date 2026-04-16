import { Router } from 'express';
import { createOffer, acceptOffer, rejectOffer } from '../controllers/offersController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createOffer);
router.patch('/:offerId/accept', authMiddleware, acceptOffer);
router.patch('/:offerId/reject', authMiddleware, rejectOffer);

export default router;
