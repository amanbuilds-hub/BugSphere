import express from 'express';
import { z } from 'zod';
import { register, login, refresh, logout, getUsers } from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
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

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

router.get('/profile', authenticate, (req, res) => {
    res.status(200).json({ success: true, data: req.user });
});

router.patch('/profile', authenticate, async (req, res) => {
    const { name, skills, notificationPrefs } = req.body;
    if (name) req.user.name = name;
    if (skills) req.user.skills = skills;
    if (notificationPrefs) req.user.notificationPrefs = { ...req.user.notificationPrefs.toObject(), ...notificationPrefs };

    await req.user.save();
    res.status(200).json({ success: true, data: req.user });
});

router.get('/users', authenticate, authorize('admin'), getUsers);

export default router;
