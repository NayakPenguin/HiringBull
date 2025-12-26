import { clerkMiddleware, requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';
import prisma from '../prismaClient.js';

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
        let user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: `${clerkId}@clerk.dev`,
                    name: 'User',
                    active: true
                }
            });

            console.log(`User created in DB for Clerk ID: ${clerkId}`);
        }

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

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const now = new Date();
        const isActive = user.isPaid && (!user.planExpiry || user.planExpiry > now);

        if (!isActive) {
            return res.status(403).json({
                message: "Active subscription required",
                code: "PAYMENT_REQUIRED"
            });
        }

        // Attach updated user object to req for convenience
        req.user = user;
        next();
    } catch (error) {
        console.error("Payment check error:", error);
        res.status(500).json({ message: "Internal server error during payment check" });
    }
};
