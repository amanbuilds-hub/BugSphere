import express from 'express';
import { getNotifications, markAllAsRead, markAsRead } from '../controllers/notification.controller.js';
import authenticate from '../middleware/authenticate.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.get('/', apiLimiter, getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
