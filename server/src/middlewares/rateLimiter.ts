import rateLimit from 'express-rate-limit';

/**
 * Default rate limiter for general API routes
 * 100 requests per 15 minutes
 */
export const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        status: 429,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
});

/**
 * Strict rate limiter for auth-related routes
 * 10 requests per 15 minutes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: {
        status: 429,
        message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * API rate limiter for frequently accessed endpoints
 * 60 requests per minute
 */
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per window
    message: {
        status: 429,
        message: 'Rate limit exceeded, please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
