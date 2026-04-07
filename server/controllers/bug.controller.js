import Bug, { VALID_TRANSITIONS } from '../models/Bug.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import notificationService from '../services/notification.js';
import { classifyBug } from '../services/ai/classifyBug.js';
import { detectDuplicate } from '../services/ai/detectDuplicate.js';
import { recommendAssignee as aiRecommendAssignee } from '../services/ai/recommendAssignee.js';
import { summarizeBug } from '../services/ai/summarizeBug.js';
import { suggestResolution } from '../services/ai/suggestResolution.js';
import exportService from '../services/export.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create a new bug
 * @route   POST /api/bugs
 * @access  Tester/Admin
 */
export const createBug = asyncHandler(async (req, res) => {
    const { title, description, projectId, severity, priority, tags, stepsToReproduce, expectedBehavior, actualBehavior, assignedTo } = req.body;

    // 1. Ownership/Project Check
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'PROJ_001', 'Project not found');

    if (req.user.role !== 'admin') {
        const isMember = project.members.some(m => m.userId.toString() === req.user._id.toString());
        if (!isMember) throw new ApiError(403, 'PROJ_002', 'Not a project member');
    }

    // 2. AI Duplicate Detection (Internal check - don't block, just note)
    const duplicateCheck = await detectDuplicate(title, description);

    // 3. Create Bug
    const bug = await Bug.create({
        title,
        description,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        projectId,
        reportedBy: req.user._id,
        assignedTo,
        severity: severity || 'medium',
        priority: priority || 'normal',
        tags: tags || [],
        'aiMetadata.duplicateOf': duplicateCheck.similarBugId,
        'aiMetadata.confidence': duplicateCheck.confidence
    });

    if (assignedTo) {
        await User.findByIdAndUpdate(assignedTo, { $inc: { activeIssueCount: 1 } });
    }

    // 4. Update Project Bug Count
    await Project.findByIdAndUpdate(projectId, { $inc: { bugCount: 1 } });

    // 5. Async AI Processing (Classify)
    // classifyBug(bug._id); // Don't await, let it run in background

    // 6. Trigger Notification
    notificationService.trigger('bug:created', projectId, req.user._id, {
        bugId: bug._id,
        bugTitle: bug.title
    });

    res.status(201).json({
        success: true,
        data: bug,
        message: duplicateCheck.isDuplicate ? 'Potential duplicate detected.' : 'Bug reported successfully.'
    });
});

/**
 * @desc    Get paginated and filtered bugs
 * @route   GET /api/bugs
 * @access  Private
 */
export const getBugs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, priority, severity, assignedTo, projectId, search, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;
    if (assignedTo) query.assignedTo = assignedTo;
    if (projectId) query.projectId = projectId;
    if (search) query.$text = { $search: search };

    // Visibility Layer: Only projects user belongs to (unless admin)
    if (req.user.role !== 'admin') {
        const userProjects = await Project.find({ 'members.userId': req.user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        if (query.projectId) {
            if (!projectIds.some(id => id.toString() === query.projectId)) {
                // Requested a specific project they don't belong to
                return res.status(200).json({ success: true, data: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
            }
        } else {
            query.projectId = { $in: projectIds };
        }
    }

    // Developer Layer: Only view assigned bugs unless admin/tester
    if (req.user.role === 'developer' && !assignedTo) {
        query.assignedTo = req.user._id;
    }

    const skip = (page - 1) * limit;
    const total = await Bug.countDocuments(query);
    const bugs = await Bug.find(query)
        .populate('reportedBy projectId assignedTo', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: bugs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Get bug details (with AI summary)
 * @route   GET /api/bugs/:id
 * @access  Private
 */
export const getBugById = asyncHandler(async (req, res) => {
    const bug = await Bug.findById(req.params.id)
        .populate('reportedBy projectId assignedTo watchers', 'name email role members')
        .populate('comments.userId', 'name role')
        .populate('aiMetadata.duplicateOf', 'title status');

    if (!bug) throw new ApiError(404, 'BUG_001', 'Bug not found');

    // Visibility Check: User must be member of project
    if (req.user.role !== 'admin') {
        const project = await Project.findById(bug.projectId?._id || bug.projectId);
        const isMember = project?.members.some(m => m.userId.toString() === req.user._id.toString());
        if (!isMember) {
            throw new ApiError(403, 'PROJ_002', 'Not a project member');
        }
    }

    // Trigger AI Summary if not exists
    if (!bug.aiMetadata?.summary) {
        // summarizeBug(bug._id); 
    }

    res.status(200).json({ success: true, data: bug });
});

/**
 * @desc    Update bug status (State Machine Enforced)
 * @route   PATCH /api/bugs/:id/status
 * @access  Private (Role Validated)
 */
export const updateBugStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) throw new ApiError(404, 'BUG_001', 'Bug not found');

    // Visibility Check: User must be member of project
    if (req.user.role !== 'admin') {
        const project = await Project.findById(bug.projectId);
        const isMember = project?.members.some(m => m.userId.toString() === req.user._id.toString());
        if (!isMember) {
            throw new ApiError(403, 'PROJ_002', 'Not a project member');
        }
    }

    // 1. Role Validation (Tester/Developer restricted transitions)
    // Layer 3 Enforcement logic happens here.
    const currentStatus = bug.status;
    const requestedStatus = status;

    if (currentStatus === requestedStatus) {
        return res.status(200).json({ success: true, data: bug });
    }

    // 2. Transition State Machine
    if (!bug.canTransitionTo(requestedStatus)) {
        throw new ApiError(400, 'BUG_002', `Cannot transition from ${currentStatus} to ${requestedStatus}`);
    }

    // 3. Permission checks by status transition
    if (requestedStatus === 'in-progress' && req.user.role === 'tester') {
        throw new ApiError(403, 'AUTH_003', 'Testers cannot move bug to in-progress');
    }
    if (['closed', 'reopened'].includes(requestedStatus) && req.user.role === 'developer') {
        throw new ApiError(403, 'AUTH_003', 'Developers cannot close or reopen bugs');
    }

    // 4. Update
    bug.status = requestedStatus;
    bug.statusHistory.push({
        from: currentStatus,
        to: requestedStatus,
        changedBy: req.user._id,
        note
    });

    await bug.save();

    // 5. Trigger Notification
    notificationService.trigger('bug:status_changed', bug.projectId, req.user._id, {
        bugId: bug._id,
        bugTitle: bug.title,
        from: currentStatus,
        to: requestedStatus,
        note
    });

    res.status(200).json({ success: true, data: bug });
});

/**
 * @desc    Assign bug (Admin Only)
 * @route   PATCH /api/bugs/:id/assign
 * @access  Admin
 */
export const assignBug = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) throw new ApiError(404, 'BUG_001', 'Bug not found');

    const user = await User.findById(userId);
    if (!user || user.role !== 'developer') {
        throw new ApiError(400, 'VAL_001', 'Must assign to a valid developer');
    }

    if (bug.assignedTo?.toString() === userId) {
        throw new ApiError(400, 'BUG_003', 'Already assigned to this developer');
    }

    const oldAssigneeId = bug.assignedTo;
    bug.assignedTo = userId;
    await bug.save();

    // Update active issue counts
    if (oldAssigneeId) {
        await User.findByIdAndUpdate(oldAssigneeId, { $inc: { activeIssueCount: -1 } });
    }
    await User.findByIdAndUpdate(userId, { $inc: { activeIssueCount: 1 } });

    // Trigger Notification
    notificationService.trigger('bug:assigned', bug.projectId, req.user._id, {
        bugId: bug._id,
        bugTitle: bug.title,
        assigneeName: user.name
    });

    res.status(200).json({ success: true, data: bug });
});

/**
 * @desc    AI: Recommend Assignee
 * @route   GET /api/bugs/:id/recommend
 * @access  Admin
 */
export const recommendAssignee = asyncHandler(async (req, res) => {
    const recommendations = await aiRecommendAssignee(req.params.id);
    res.status(200).json({ success: true, data: recommendations });
});

/**
 * @desc    AI: Suggest Resolution
 * @route   GET /api/bugs/:id/suggest
 * @access  Private
 */
export const suggestBugResolution = asyncHandler(async (req, res) => {
    const suggestion = await suggestResolution(req.params.id);
    res.status(200).json({ success: true, data: suggestion });
});

/**
 * @desc    Export bugs (PDF/CSV)
 * @route   GET /api/bugs/export/:format
 * @access  Admin/Tester
 */
export const exportBugs = asyncHandler(async (req, res) => {
    const { format } = req.params;
    const { ids } = req.query; // CSV comma-separated ids

    if (!ids) throw new ApiError(400, 'VAL_001', 'Missing bug IDs for export');
    const bugIds = ids.split(',');

    let filePath;
    if (format === 'pdf') {
        filePath = await exportService.toPDF(bugIds);
    } else if (format === 'csv') {
        filePath = await exportService.toCSV(bugIds);
    } else {
        throw new ApiError(400, 'VAL_001', 'Invalid export format');
    }

    res.download(filePath, (err) => {
        if (err) logger.error(`Export download error: ${err.message}`);
        // Optional: Clean up file after download
        // fs.unlinkSync(filePath);
    });
});

/**
 * @desc    Add comment with mentions
 * @route   POST /api/bugs/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
    const { text, mentions } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) throw new ApiError(404, 'BUG_001', 'Bug not found');

    const comment = {
        userId: req.user._id,
        text,
        mentions: mentions || [],
        createdAt: new Date()
    };

    bug.comments.push(comment);
    await bug.save();

    // Trigger Notification
    notificationService.trigger('bug:commented', bug.projectId, req.user._id, {
        bugId: bug._id,
        bugTitle: bug.title,
        text: text.substring(0, 50) + '...'
    });

    const populatedBug = await Bug.findById(bug._id).populate('comments.userId', 'name role');
    const addedComment = populatedBug.comments[populatedBug.comments.length - 1];

    res.status(201).json({ success: true, data: addedComment });
});

/**
 * @desc    Delete bug (Admin Only)
 * @route   DELETE /api/bugs/:id
 * @access  Admin
 */
export const deleteBug = asyncHandler(async (req, res) => {
    const bug = await Bug.findById(req.params.id);
    if (!bug) throw new ApiError(404, 'BUG_001', 'Bug not found');

    // Decrement activeIssueCount for assigned developer
    if (bug.assignedTo) {
        await User.findByIdAndUpdate(bug.assignedTo, { $inc: { activeIssueCount: -1 } });
    }

    // Decrement Project Bug Count
    if (bug.projectId) {
        await Project.findByIdAndUpdate(bug.projectId, { $inc: { bugCount: -1 } });
    }

    await Bug.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Bug deleted successfully' });
});
