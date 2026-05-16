import { Router } from 'express';
import { createChat, notifyNewMessage } from '../controllers/chatsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create', authenticate, createChat);
router.post('/notify-message', authenticate, notifyNewMessage);

export default router;
