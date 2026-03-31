import express from 'express';
import { z } from 'zod';
import { chatWithAI } from '../controllers/ai.controller.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const chatSchema = z.object({
    bugId: z.string(),
    message: z.string().min(1, 'Message cannot be empty'),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string()
    })).optional()
});

router.use(authenticate);

router.post('/chat', aiLimiter, validate(chatSchema), chatWithAI);

export default router;
