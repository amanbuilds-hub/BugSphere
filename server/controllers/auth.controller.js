import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

// Helper: Generate Access Token (15m)
const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES // 15m
    });
};

// Helper: Generate Refresh Token (7d)
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES // 7d
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, skills } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, 'AUTH_001', 'User already exists');
    }

    const user = await User.create({
        name,
        email,
        passwordHash: password,
        role: role || 'developer',
        skills: skills || []
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set Refresh Token in RT Family
    user.refreshTokenFamily.push({ token: refreshToken });
    await user.save();

    // Set Cookie for Access Token (optional, depends on frontend storage)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                notificationPrefs: user.notificationPrefs,
                isAuthenticated: true
            },
            accessToken,
            refreshToken
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.comparePassword(password)) {
        throw new ApiError(401, 'AUTH_001', 'Invalid credentials');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenFamily.push({ token: refreshToken });
    await user.save();

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                notificationPrefs: user.notificationPrefs,
                isAuthenticated: true
            },
            accessToken,
            refreshToken
        }
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(401, 'AUTH_001', 'Refresh token required');

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, 'AUTH_001', 'User not found');

    // Verify if token is in RT family
    const familyIdx = user.refreshTokenFamily.findIndex(rt => rt.token === refreshToken);
    if (familyIdx === -1) {
        // SECURITY: Potentially compromised. Invalidate family.
        user.refreshTokenFamily = [];
        await user.save();
        throw new ApiError(401, 'AUTH_001', 'Compromised token family. Logging out.');
    }

    // ROTATION: Remove old, issue new
    user.refreshTokenFamily.splice(familyIdx, 1);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshTokenFamily.push({ token: newRefreshToken });
    await user.save();

    res.status(200).json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
    });
});

/**
 * @desc    Logout
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    // Remove current RT from family
    if (refreshToken) {
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { refreshTokenFamily: { token: refreshToken } }
        });
    }

    res.clearCookie('accessToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});
/**
 * @desc    Get all users (searchable)
 * @route   GET /api/auth/users
 * @access  Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const query = { _id: { $ne: req.user._id } };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query).select('name email role isActive').limit(20);
    res.status(200).json({ success: true, data: users });
});
