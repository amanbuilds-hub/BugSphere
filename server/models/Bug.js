import mongoose from 'mongoose';

/**
 * Bug Status Transitions
 */
const STATUS_ENUM = ['open', 'in-progress', 'qa', 'closed', 'reopened'];
const VALID_TRANSITIONS = {
    open: ['in-progress'],
    'in-progress': ['qa'],
    qa: ['closed', 'reopened'],
    reopened: ['in-progress'],
    closed: []
};

/**
 * Bug Model
 */
const bugSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Bug title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Bug description is required'],
        trim: true,
    },
    stepsToReproduce: {
        type: String,
        trim: true,
    },
    expectedBehavior: {
        type: String,
        trim: true,
    },
    actualBehavior: {
        type: String,
        trim: true,
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        default: 'medium',
    },
    priority: {
        type: String,
        enum: ['urgent', 'high', 'normal', 'low'],
        default: 'normal',
    },
    status: {
        type: String,
        enum: STATUS_ENUM,
        default: 'open',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    tags: [{
        type: String,
    }],
    attachments: [{
        url: String,
        name: String,
        type: { type: String },
        size: Number,
    }],
    watchers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    aiMetadata: {
        classifiedPriority: { type: String, enum: ['urgent', 'high', 'normal', 'low'] },
        suggestedSeverity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
        duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Bug' },
        confidence: { type: Number, default: 0 },
        assignmentScores: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            score: Number,
            reason: String
        }],
        summary: String,
        processed: { type: Boolean, default: false }
    },
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now }
    }],
    statusHistory: [{
        from: { type: String, enum: STATUS_ENUM },
        to: { type: String, enum: STATUS_ENUM },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: String
    }],
}, {
    timestamps: true,
});

// Indexes
bugSchema.index({ status: 1, projectId: 1 });
bugSchema.index({ assignedTo: 1, status: 1 });
bugSchema.index({ reportedBy: 1 });
bugSchema.index({ createdAt: -1 });
// Text index is created in db.js configuration (on connected)

/**
 * Check if the bug can transition to a new status
 * @param {string} newStatus
 * @returns {boolean}
 */
bugSchema.methods.canTransitionTo = function (newStatus) {
    if (this.status === newStatus) return true;
    return VALID_TRANSITIONS[this.status].includes(newStatus);
};

const Bug = mongoose.model('Bug', bugSchema);
export default Bug;
export { VALID_TRANSITIONS };
