import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Model
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        select: false, // Don't return password hash in queries
    },
    role: {
        type: String,
        enum: ['admin', 'tester', 'developer'],
        default: 'developer',
    },
    skills: [{
        type: String,
    }],
    about: {
        type: String,
        trim: true,
        default: '',
    },
    activeIssueCount: {
        type: Number,
        default: 0,
    },
    notificationPrefs: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        digest: { type: Boolean, default: false },
    },
    pushSubscription: {
        type: Object,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    refreshTokenFamily: [{
        token: String,
        createdAt: { type: Date, default: Date.now }
    }],
}, {
    timestamps: true,
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Pre-save password hashing
userSchema.pre('save', function (next) {
    if (!this.isModified('passwordHash')) return next();
    const salt = bcrypt.genSaltSync(12);
    this.passwordHash = bcrypt.hashSync(this.passwordHash, salt);
    next();
});

// Instance method to check password
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.passwordHash);
};


const User = mongoose.model('User', userSchema);
export default User;
