import { Router } from 'express';
import { submitRating, getUserRatings, reportRating } from '../controllers/ratings/ratingsController';
import { authMiddleware } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route POST /api/v1/ratings/create
 * @desc Create a new rating for a completed transaction
 * @access Private
 */
router.post('/create', authMiddleware, rateLimiter, submitRating);

/**
 * @route GET /api/v1/ratings/user/:uid
 * @desc Get all ratings and metrics for a specific user
 * @access Public (or Private based on app needs, here Public)
 */
router.get('/user/:uid', getUserRatings);

/**
 * @route POST /api/v1/ratings/report
 * @desc Report a specific rating for abuse or spam
 * @access Private
 */
router.post('/report', authMiddleware, rateLimiter, reportRating);

export default router;
