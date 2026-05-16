import { Router } from 'express';
import { 
  getQueue, 
  approveKyc, 
  rejectKyc, 
  getStats,
  getReportedReviews,
  removeReview,
  dismissReport
} from '../controllers/adminController';
import { getAnalyticsSummary } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// All admin routes must be protected by auth and admin middlewares
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/v1/admin/analytics/summary
 */
router.get('/analytics/summary', getAnalyticsSummary);

/**
 * GET /api/v1/admin/queue
 */
router.get('/queue', getQueue);

/**
 * GET /api/v1/admin/stats
 */
router.get('/stats', getStats);

/**
 * PATCH /api/v1/admin/queue/:queueId/approve
 */
router.patch('/queue/:queueId/approve', approveKyc);

/**
 * PATCH /api/v1/admin/queue/:queueId/reject
 */
router.patch('/queue/:queueId/reject', rejectKyc);

/**
 * GET /api/v1/admin/reports/reviews
 */
router.get('/reports/reviews', getReportedReviews);

/**
 * POST /api/v1/admin/reports/reviews/:reportId/remove
 */
router.post('/reports/reviews/:reportId/remove', removeReview);

/**
 * POST /api/v1/admin/reports/reviews/:reportId/dismiss
 */
router.post('/reports/reviews/:reportId/dismiss', dismissReport);

export default router;
