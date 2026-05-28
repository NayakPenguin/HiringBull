import express, { Request, Response } from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Application route is running",
    timestamp: new Date().toISOString(),
  });
});

interface PrismaError {
  code?: string;
  message?: string;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, social_profile, reason, why_membership } = req.body;

    // ✅ Minimal required fields
    if (!full_name || !email || !social_profile || !reason) {
      res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
      return;
    }

    const application = await prisma.application.create({
      data: {
        full_name,
        email,
        phone: phone || null,
        social_profile,
        why_membership: why_membership || reason,
        reason,
        status: "PENDING",
      },
    });

    res.status(201).json({
      status: "ok",
      message: "Application submitted successfully",
      data: application,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // ✅ Unique email constraint
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      res.status(409).json({
        status: "error",
        message: "An application with this email already exists",
      });
      return;
    }

    console.error("❌ Application create error:", error);

    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

export default router;
