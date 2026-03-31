import express from 'express';
import { z } from 'zod';
import { createProject, getProjects, getProjectById, addProjectMember, removeProjectMember } from '../controllers/project.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const createProjectSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 chars'),
    description: z.string().optional(),
    slug: z.string().min(2, 'Slug must be at least 2 chars')
});

const memberSchema = z.object({
    userId: z.string(),
    role: z.enum(['owner', 'member']).optional()
});

router.use(authenticate);

router.post('/', authorize('admin'), apiLimiter, validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post('/:id/members', authorize('admin'), validate(memberSchema), addProjectMember);
router.delete('/:id/members/:uid', authorize('admin'), removeProjectMember);

export default router;
