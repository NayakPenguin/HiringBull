import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign a JWT for a user (365-day expiry)
 */
export const signToken = (userId) => {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "365d" });
};

/**
 * Verify and decode a JWT
 * Returns the payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

/**
 * Extract Bearer token from Authorization header
 */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
};

/**
 * 🔐 Require authenticated user
 * - Validates JWT from Authorization header
 * - Looks up user by id (from JWT sub claim)
 * - Attaches `req.user` (full Prisma User record)
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    if (!payload?.sub) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.active) {
      return res.status(403).json({ message: "Account disabled" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * 🔓 Optional auth (does NOT block)
 * - Attaches `req.user` if a valid token is present, otherwise continues
 */
export const optionalAuth = async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload?.sub) {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (user) req.user = user;
    }
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
