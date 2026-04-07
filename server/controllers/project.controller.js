import Project from '../models/Project.js';
import User from '../models/User.js';
import Bug from '../models/Bug.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import notificationService from '../services/notification.js';

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Admin
 */
export const createProject = asyncHandler(async (req, res) => {
    const { name, description, slug } = req.body;

    const projectExists = await Project.findOne({ slug });
    if (projectExists) {
        throw new ApiError(400, 'VAL_001', 'Slug already exists');
    }

    const project = await Project.create({
        name,
        description,
        slug,
        members: [{ userId: req.user._id, role: 'owner' }]
    });

    res.status(201).json({ success: true, data: project });
});

/**
 * @desc    Get all projects user belongs to
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = asyncHandler(async (req, res) => {
    const query = req.user.role === 'admin' ? {} : { 'members.userId': req.user._id };
    const projects = await Project.find(query).sort('-createdAt');
    res.status(200).json({ success: true, data: projects });
});

/**
 * @desc    Get project details and stats
 * @route   GET /api/projects/:id
 * @access  Private (Member Only)
 */
export const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).populate('members.userId', 'name role email');
    if (!project) throw new ApiError(404, 'PROJ_001', 'Project not found');

    const isMember = project.members.some(m => m.userId?._id.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'admin') {
        throw new ApiError(403, 'PROJ_002', 'Not a project member');
    }

    // Aggregate stats
    const stats = await Bug.aggregate([
        { $match: { projectId: project._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({ success: true, data: { project, stats } });
});

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Admin
 */
export const addProjectMember = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) throw new ApiError(404, 'PROJ_001', 'Project not found');

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'AUTH_001', 'User not found');

    const alreadyMember = project.members.some(m => m.userId.toString() === userId);
    if (alreadyMember) throw new ApiError(400, 'VAL_001', 'Already a member');

    project.members.push({ userId, role: role || 'member' });
    await project.save();

    // Trigger Notification
    notificationService.trigger('project:member_added', project._id, req.user._id, {
        newMemberName: user.name
    });

    res.status(200).json({ success: true, data: project });
});

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:uid
 * @access  Admin
 */
export const removeProjectMember = asyncHandler(async (req, res) => {
    const { id, uid } = req.params;
    const project = await Project.findById(id);
    if (!project) throw new ApiError(404, 'PROJ_001', 'Project not found');

    const memberIdx = project.members.findIndex(m => m.userId.toString() === uid);
    if (memberIdx === -1) throw new ApiError(404, 'PROJ_002', 'Member not found in project');

    project.members.splice(memberIdx, 1);
    await project.save();

    // Trigger Notification
    notificationService.trigger('project:member_removed', project._id, req.user._id, {
        removedMemberId: uid
    });

    res.status(200).json({ success: true, data: project });
});

/**
 * @desc    Delete project and its bugs
 * @route   DELETE /api/projects/:id
 * @access  Admin
 */
export const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) throw new ApiError(404, 'PROJ_001', 'Project not found');

    // Delete all bugs associated with this project
    await Bug.deleteMany({ projectId: project._id });

    // Delete the project
    await Project.findByIdAndDelete(project._id);

    // Trigger Notification (Optional: Notify all members that project is deleted)
    // notificationService.trigger('project:deleted', project._id, req.user._id, { projectName: project.name });

    res.status(200).json({ success: true, message: 'Project and all associated bugs deleted successfully' });
});
