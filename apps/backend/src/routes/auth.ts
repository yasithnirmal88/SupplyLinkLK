import { Router } from 'express';
import { verifyToken, updateRole } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/auth/verify-token
 * Verify Firebase ID token and return/create user profile.
 */
router.post('/verify-token', verifyToken);

/**
 * PATCH /api/v1/auth/role
 * Self-service role selection (buyer/supplier/business) used during onboarding.
 */
router.patch('/role', authMiddleware, updateRole);

export default router;
