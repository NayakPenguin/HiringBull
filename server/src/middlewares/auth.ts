import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient.js";
import { log } from "../utils/logger.js";
import type { JwtPayload } from "../types/index.js";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Sign a JWT for a user (365-day expiry)
 * Includes email so the client can identify the user without an API call
 */
export const signToken = (userId: string, email?: string | null): string => {
  return jwt.sign({ sub: userId, email: email || null }, JWT_SECRET, {
    expiresIn: "365d",
  });
};

/**
 * Verify and decode a JWT
 * Returns the payload or null if invalid
 */
const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Extract Bearer token from Authorization header
 */
const extractToken = (req: Request): string | null => {
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
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      log(`[Auth] No token in request: ${req.method} ${req.originalUrl}`);
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = verifyToken(token);
    if (!payload?.sub) {
      log(`[Auth] Invalid/expired token: ${req.method} ${req.originalUrl}`);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      log(`[Auth] User not found for sub=${payload.sub}`);
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (!user.active) {
      log(`[Auth] Disabled account: userId=${user.id}`);
      res.status(403).json({ message: "Account disabled" });
      return;
    }

    log(
      `[Auth] Authenticated: userId=${user.id} → ${req.method} ${req.originalUrl}`,
    );
    req.user = user;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log(`[Auth] Middleware error:`, message);
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * 🔓 Optional auth (does NOT block)
 * - Attaches `req.user` if a valid token is present, otherwise continues
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
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
export const requireApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    res.status(401).json({ message: "Invalid API key" });
    return;
  }

  next();
};
