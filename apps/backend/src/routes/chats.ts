import { Router } from 'express';
import { createChat, notifyNewMessage } from '../controllers/chatsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/create', authMiddleware, createChat);
router.post('/notify-message', authMiddleware, notifyNewMessage);

export default router;
