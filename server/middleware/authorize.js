import ApiError from '../utils/ApiError.js';

/**
 * Authorization Middleware
 * Check if req.user.role is allowed or if user owns the resource
 * @param {...string} roles - Allowed roles [admin, tester, developer]
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'AUTH_001', 'Authentication required'));
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return next(new ApiError(403, 'AUTH_003', 'Insufficient permissions'));
        }

        next();
    };
};

export default authorize;
