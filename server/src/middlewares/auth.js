import { clerkMiddleware, requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';
import prisma from '../prismaClient.js';
import { log } from '../utils/logger.js';

/**
 * Initialize Clerk middleware for the Express app
 * This should be applied globally before any routes
 */
export const initClerk = clerkMiddleware();

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 * Auto-creates user if they don't exist in DB
 */
export const requireAuth = async (req, res, next) => {
    clerkRequireAuth()(req, res, async (err) => {
        if (err) return next(err);

        const clerkUser = getAuth(req);

        if (!clerkUser?.userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const clerkId = clerkUser.userId;
        const user = await prisma.user.upsert({
            where: { clerkId },
            update: {},
            create: {
                clerkId,
                email: clerkUser.sessionClaims?.email || clerkUser.sessionClaims?.email_address || `${clerkId}@no-email.clerk`,
                name: clerkUser.sessionClaims?.name || 'User',
                active: true
            }
        });

        if (!user.active) {
            return res.status(403).json({ message: "Account disabled or deleted" });
        }

        req.user = user;
        next();
    });
};

/**
 * Middleware to optionally attach user info if authenticated
 * Does not block unauthenticated requests
 * Note: initClerk must be mounted globally before this middleware
 */
export const optionalAuth = (req, res, next) => {
    const auth = getAuth(req);
    if (auth && auth.userId) {
        req.clerkUserId = auth.userId;
    }
    next();
};


/**
 * Middleware to require active payment/subscription
 * Must be used AFTER requireAuth or requireApiKey (if mixed)
 * Assuming requireAuth has already run and populated req.user
 */
export const requirePayment = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const now = new Date();
        const isActive = req.user.isPaid && (!req.user.planExpiry || req.user.planExpiry > now);

        if (!isActive) {
            return res.status(403).json({
                message: "Active subscription required",
                code: "PAYMENT_REQUIRED"
            });
        }

        next();
    } catch (error) {
        log("Payment check error:", error);
        res.status(500).json({ message: "Internal server error during payment check" });
    }
};

/**
 * Middleware to require internal API key
 * Used for bulk data creation/admin tasks
 */
export const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(401).json({ message: "Invalid or missing API key" });
    }

    next();
};
