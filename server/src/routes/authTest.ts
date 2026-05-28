import express, { Request, Response } from "express";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

/**
 * 🔐 Clerk Authentication Test
 * GET /api/auth/test
 */
router.get("/test", requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    message: "Clerk authentication working ✅",
    user: {
      id: req.user!.id,
      clerkId: req.user!.clerkId,
      email: req.user!.email,
      name: req.user!.name,
    },
  });
});

export default router;
