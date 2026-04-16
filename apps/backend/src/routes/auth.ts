import { Router } from 'express';
import { verifyToken } from '../controllers/authController';

const router = Router();

/**
 * POST /api/v1/auth/verify-token
 * Verify Firebase ID token and return/create user profile.
 */
router.post('/verify-token', verifyToken);

export default router;
