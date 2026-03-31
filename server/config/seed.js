import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';
import Bug from '../models/Bug.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('Database connected for seeding...');

        // 1. Clear existing
        await User.deleteMany({});
        await Bug.deleteMany({});
        await Project.deleteMany({});
        await Notification.deleteMany({});
        logger.info('Database cleared.');

        // 2. Create Users
        const users = await User.create([
            { name: 'Admin User', email: 'admin@demo.com', passwordHash: 'Demo@1234', role: 'admin', isActive: true },
            { name: 'Tester User', email: 'tester@demo.com', passwordHash: 'Demo@1234', role: 'tester', isActive: true },
            { name: 'Dev User', email: 'dev@demo.com', passwordHash: 'Demo@1234', role: 'developer', isActive: true },
        ]);
        logger.info('Users created.');

        const admin = users[0];
        const tester = users[1];
        const dev = users[2];

        // 3. Create Projects
        const projects = await Project.create([
            {
                name: 'Project Alpha',
                description: 'Core infrastructure project',
                slug: 'project-alpha',
                members: [
                    { userId: admin._id, role: 'owner' },
                    { userId: tester._id, role: 'member' },
                    { userId: dev._id, role: 'member' }
                ]
            },
            {
                name: 'Project Beta',
                description: 'Frontend redesign project',
                slug: 'project-beta',
                members: [
                    { userId: admin._id, role: 'owner' },
                    { userId: tester._id, role: 'member' },
                    { userId: dev._id, role: 'member' }
                ]
            }
        ]);
        logger.info('Projects created.');

        const alpha = projects[0];
        const beta = projects[1];

        // 4. Create Bugs
        const bugData = [];
        for (let i = 0; i < 20; i++) {
            const proj = i < 10 ? alpha : beta;
            bugData.push({
                title: `Bug ${i + 1}: ${i % 2 === 0 ? 'Crash' : 'UI Glitch'} in module ${String.fromCharCode(65 + (i % 5))}`,
                description: `Detailed description for bug ${i + 1}. This issue occurs when...`,
                stepsToReproduce: `1. Open app\n2. Click button ${i}\n3. Observe ${i % 2 === 0 ? 'crash' : 'error'}`,
                projectId: proj._id,
                reportedBy: tester._id,
                assignedTo: i % 3 === 0 ? dev._id : null,
                severity: i % 4 === 0 ? 'critical' : i % 4 === 1 ? 'high' : 'medium',
                priority: i % 4 === 0 ? 'urgent' : i % 4 === 1 ? 'high' : 'normal',
                status: i % 5 === 0 ? 'open' : i % 5 === 1 ? 'in-progress' : 'qa',
                tags: ['core', 'urgent'],
                comments: i % 4 === 0 ? [{ userId: dev._id, text: 'Working on it!', createdAt: new Date() }] : []
            });
        }
        const bugs = await Bug.insertMany(bugData);
        logger.info(`${bugs.length} bugs created.`);

        // 5. Update user bug counts for dev
        await User.findByIdAndUpdate(dev._id, { activeIssueCount: bugs.filter(b => b.assignedTo?.toString() === dev._id.toString() && b.status !== 'closed').length });

        // 6. Create notifications
        await Notification.create([
            {
                projectId: alpha._id,
                bugId: bugs[0]._id,
                triggeredBy: tester._id,
                eventType: 'bug:created',
                recipients: [{ userId: admin._id, status: 'unread' }, { userId: dev._id, status: 'unread' }]
            }
        ]);

        logger.info('Seed data created successfully.');
        process.exit(0);
    } catch (error) {
        logger.error(`Seed error: ${error.message}`);
        process.exit(1);
    }
};

seed();
