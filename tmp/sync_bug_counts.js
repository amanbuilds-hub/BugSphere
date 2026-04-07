import mongoose from 'mongoose';
import Bug from '../server/models/Bug.js';
import Project from '../server/models/Project.js';
import User from '../server/models/User.js';
import 'dotenv/config';

async function sync() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const projects = await Project.find();
    for (const project of projects) {
        const count = await Bug.countDocuments({ projectId: project._id });
        console.log(`Project ${project.name}: Current count ${project.bugCount}, Actual ${count}`);
        project.bugCount = count;
        await project.save();
    }

    const users = await User.find();
    for (const user of users) {
        const count = await Bug.countDocuments({ assignedTo: user._id, status: { $ne: 'closed' } });
        console.log(`User ${user.name}: Current count ${user.activeIssueCount}, Actual ${count}`);
        user.activeIssueCount = count;
        await user.save();
    }

    console.log('Sync complete');
    process.exit(0);
}

sync().catch(err => {
    console.error(err);
    process.exit(1);
});
