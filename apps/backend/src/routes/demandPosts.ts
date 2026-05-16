import { Router } from 'express';
import { createDemandPost, getDemandPost } from '../controllers/demandPostsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createDemandPost);
router.get('/:postId', getDemandPost);

export default router;
