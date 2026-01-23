import { clerkMiddleware, getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import prisma from "../prismaClient.js";
import { log } from "../utils/logger.js";

/**
 * Clerk backend client (lazy init)
 */
let clerkClient = null;
const getClerk = () => {
  if (!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return clerkClient;
};

/**
 * 🔐 Initialize Clerk middleware
 * Must be mounted BEFORE protected routes
 */
export const initClerk = clerkMiddleware();

/**
 * 🔐 Require authenticated user
 * - Validates Clerk JWT / session
 * - Creates user ONLY if not exists
 * - Updates name/email ONLY if missing
 * - Attaches `req.user`
 */
export const requireAuth = async (req, res, next) => {
  try {
    const auth = getAuth(req);

    if (!auth?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const clerkId = auth.userId;

    // Try to find user first
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // Defaults (used only if needed)
    let email = `${clerkId}@no-email.clerk`;
    let name = "User";

    // Fetch Clerk user safely
    try {
      const clerkUser = await getClerk().users.getUser(clerkId);

      email =
        clerkUser.emailAddresses?.[0]?.emailAddress ?? email;

      if (clerkUser.firstName) {
        name = clerkUser.firstName +
          (clerkUser.lastName ? ` ${clerkUser.lastName}` : "");
      }
    } catch (err) {
      log("Clerk user fetch failed:", err);
    }

    // 🆕 Create user if not exists (using upsert to handle race conditions)
    if (!user) {
      user = await prisma.user.upsert({
        where: { clerkId },
        create: {
          clerkId,
          email,
          name,
          active: true,
        },
        update: {}, // If user already exists (race condition), just fetch it
      });

      req.user = user;
      return next();
    }

    // 🔁 Update ONLY if fields are missing
    const updates = {};

    if (!user.email && email) {
      updates.email = email;
    }

    if (!user.name && name) {
      updates.name = name;
    }

    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { clerkId },
        data: updates,
      });
    }

    if (!user.active) {
      return res.status(403).json({ message: "Account disabled" });
    }

    req.user = user;
    next();
  } catch (error) {
    log("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * 🔓 Optional auth (does NOT block)
 * - Attaches `req.clerkUserId` if logged in
 */
export const optionalAuth = (req, _res, next) => {
  const auth = getAuth(req);
  if (auth?.userId) {
    req.clerkUserId = auth.userId;
  }
  next();
};

/**
 * 🔑 Internal API key auth (cron/admin)
 */
export const requireApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  next();
};
