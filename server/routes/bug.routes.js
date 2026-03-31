import express from 'express';
import { z } from 'zod';
import { createBug, getBugs, getBugById, updateBugStatus, assignBug, recommendAssignee, suggestBugResolution, exportBugs, addComment } from '../controllers/bug.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import multer from 'multer';

// Storage configuration for attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// Validation Schemas
const createBugSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 chars'),
    description: z.string().min(10, 'Description must be at least 10 chars'),
    projectId: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
    tags: z.array(z.string()).optional()
});

const statusSchema = z.object({
    status: z.enum(['open', 'in-progress', 'qa', 'closed', 'reopened']),
    note: z.string().optional()
});

const commentSchema = z.object({
    text: z.string().min(1, 'Comment text cannot be empty'),
    mentions: z.array(z.string()).optional()
});

// Middleware
router.use(authenticate);

// Routes
router.post('/', authorize('admin', 'tester'), validate(createBugSchema), createBug);
router.get('/', apiLimiter, getBugs);
router.get('/:id', getBugById);

router.delete('/:id', authorize('admin'), (req, res) => res.json({ success: true, message: 'Delete mocked' }));

router.patch('/:id/status', validate(statusSchema), updateBugStatus);
router.patch('/:id/assign', authorize('admin'), assignBug);

router.post('/:id/comments', validate(commentSchema), addComment);
router.get('/:id/recommend', authorize('admin'), recommendAssignee);
router.get('/:id/suggest', suggestBugResolution);

router.get('/export/:format', authorize('admin', 'tester'), exportBugs);

export default router;
