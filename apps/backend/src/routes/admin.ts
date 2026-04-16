import { Router } from 'express';
import { getQueue, approveKyc, rejectKyc, getStats } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// All admin routes must be protected by auth and admin middlewares
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/v1/admin/queue
 * Get all pending KYC submissions and recent rejections.
 */
router.get('/queue', getQueue);

/**
 * GET /api/v1/admin/stats
 * Get dashboard aggregated statistics.
 */
router.get('/stats', getStats);

/**
 * PATCH /api/v1/admin/queue/:queueId/approve
 * Approve a KYC submission.
 */
router.patch('/queue/:queueId/approve', approveKyc);

/**
 * PATCH /api/v1/admin/queue/:queueId/reject
 * Reject a KYC submission.
 */
router.patch('/queue/:queueId/reject', rejectKyc);

export default router;
