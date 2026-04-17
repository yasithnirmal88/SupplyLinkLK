import { Router } from 'express';
import { submitKyc, submitBusinessKyc } from '../controllers/kycController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/kyc/submit
 * Submit supplier KYC documents.
 */
router.post('/submit', authMiddleware, submitKyc);

/**
 * POST /api/v1/kyc/submit-business
 * Submit business KYC documents.
 */
router.post('/submit-business', authMiddleware, submitBusinessKyc);

export default router;
