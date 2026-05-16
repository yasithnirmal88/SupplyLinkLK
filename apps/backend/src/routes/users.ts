import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { updateProfile } from '../controllers/usersController';

import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect all user routes
router.use(requireAuth);

router.patch('/profile', rateLimiter, updateProfile);

export default router;
