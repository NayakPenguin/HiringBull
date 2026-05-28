import express, { Request, Response } from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

interface PrismaError {
  code?: string;
  message?: string;
}

/**
 * POST /api/membership
 * Create membership application (pre-payment intent)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, social_profile, reason } = req.body;

    if (!full_name || !email || !social_profile || !reason) {
      res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
      return;
    }

    const application = await prisma.membershipApplication.create({
      data: {
        full_name,
        email,
        phone: phone || null,
        social_profile,
        reason,
      },
    });

    res.status(201).json({
      status: "ok",
      data: application,
    });
  } catch (err) {
    // Unique email constraint
    const prismaError = err as PrismaError;
    if (prismaError.code === "P2002") {
      res.status(409).json({
        status: "error",
        message: "Membership application already exists for this email",
      });
      return;
    }

    console.error("❌ Create membership error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * GET /api/membership/:email
 * Fetch full membership record by email
 */
router.get("/:email", async (req: Request, res: Response) => {
  try {
    const email = req.params.email as string;

    const membership = await prisma.membershipApplication.findUnique({
      where: { email },
    });

    if (!membership) {
      res.status(404).json({
        status: "error",
        message: "Membership not found",
      });
      return;
    }

    res.json({
      status: "ok",
      data: membership,
    });
  } catch (err) {
    console.error("❌ Fetch membership error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * GET /api/membership/active/:email
 * Check if membership is currently active (true / false)
 */
router.get("/active/:email", async (req: Request, res: Response) => {
  try {
    const email = req.params.email as string;
    const now = new Date();

    const membership = await prisma.membershipApplication.findUnique({
      where: { email },
      select: {
        status: true,
        membershipStart: true,
        membershipEnd: true,
      },
    });

    if (!membership) {
      res.json({
        active: false,
        reason: "NO_MEMBERSHIP",
      });
      return;
    }

    const active =
      membership.status === "ACTIVE" &&
      membership.membershipStart !== null &&
      membership.membershipEnd !== null &&
      membership.membershipStart <= now &&
      membership.membershipEnd >= now;

    res.json({
      active,
      membershipStart: membership.membershipStart,
      membershipEnd: membership.membershipEnd,
    });
  } catch (err) {
    console.error("❌ Membership active check error:", err);
    res.status(500).json({
      active: false,
      error: "Internal server error",
    });
  }
});

export default router;
