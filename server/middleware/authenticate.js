import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication Middleware
 * Verifies JWT from Cookie/Auth Header
 */
const authenticate = asyncHandler(async (req, res, next) => {
    let token;

    // Check Cookie for JWT
    if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        // Check Authorization Header
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'AUTH_001', 'Authentication required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('+isActive');

        if (!user || !user.isActive) {
            throw new ApiError(401, 'AUTH_001', 'User not found or deactivated');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'AUTH_002', 'Token expired');
        }
        throw new ApiError(401, 'AUTH_001', 'Invalid authentication token');
    }
});

export default authenticate;
