import mongoose from 'mongoose';

/**
 * Notification Model
 */
const notificationSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    bugId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bug',
    },
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    eventType: {
        type: String,
        enum: [
            'bug:created',
            'bug:status_changed',
            'bug:assigned',
            'bug:commented',
            'bug:priority_changed',
            'bug:duplicate_detected',
            'project:member_added',
            'project:member_removed'
        ],
        required: true,
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
    },
    recipients: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        email: String,
        sentAt: Date,
        status: {
            type: String,
            enum: ['sent', 'failed', 'unread', 'read'],
            default: 'sent',
        },
        error: String,
    }],
    emailSubject: String,
    emailBody: String,
}, {
    timestamps: true,
});

// Indexes
notificationSchema.index({ projectId: 1, createdAt: -1 });
notificationSchema.index({ bugId: 1 });
notificationSchema.index({ 'recipients.userId': 1, 'recipients.status': 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
