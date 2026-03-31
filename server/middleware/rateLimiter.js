import rateLimit from 'express-rate-limit';

/**
 * Auth Rate Limiter
 * 10 attempts / 15 mins
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'AUTH_004',
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * AI Rate Limiter
 * 20 attempts / 1 min
 */
export const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: 'AI_001',
        message: 'Artificial intelligence rate limit reached.'
    }
});

/**
 * General API Rate Limiter
 * 100 attempts / 15 mins
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'API_001',
        message: 'Standard API rate limit reached.'
    }
});
