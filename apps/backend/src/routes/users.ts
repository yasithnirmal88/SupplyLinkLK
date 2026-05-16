import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { updateProfile } from '../controllers/usersController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect all user routes
router.use(authMiddleware);

router.patch('/profile', rateLimiter, updateProfile);

export default router;
