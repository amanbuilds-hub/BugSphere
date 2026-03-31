import mongoose from 'mongoose';

/**
 * Project Model
 */
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['owner', 'member'],
            default: 'member',
        },
    }],
    settings: {
        emailNotifications: { type: Boolean, default: true },
    },
    bugCount: {
        type: Number,
        default: 0,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Indexes
projectSchema.index({ 'members.userId': 1 });

// Instance method to get member IDs
projectSchema.methods.getMemberIds = function () {
    return this.members.map(member => member.userId.toString());
};

const Project = mongoose.model('Project', projectSchema);
export default Project;
