import express from 'express';
import { z } from 'zod';
import { register, login, refresh, setup2FA, verify2FA, logout } from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation Schemas
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'tester', 'developer']).optional(),
    skills: z.array(z.string()).optional()
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

const verify2FASchema = z.object({
    token: z.string().length(6, 'TOTP must be 6 digits'),
    userId: z.string().optional()
});

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', validate(verify2FASchema), verify2FA);

export default router;
