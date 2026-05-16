import { Router } from 'express';
import { createSupplyAd } from '../controllers/supplyAdsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/supply-ads
 * Create a new supply ad. User must be an approved supplier.
 */
router.post('/', authMiddleware, createSupplyAd);

export default router;
