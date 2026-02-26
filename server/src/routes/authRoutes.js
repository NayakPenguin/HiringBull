import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  googleLogin,
  linkedinLogin,
  sendOtp,
  verifyOtp,
  refreshToken,
} from "../controllers/authController.js";

const router = express.Router();

// Public auth endpoints (no JWT required)
router.post("/google", googleLogin);
router.post("/linkedin", linkedinLogin);
router.post("/email/send-otp", sendOtp);
router.post("/email/verify-otp", verifyOtp);

// Protected (requires existing valid JWT)
router.post("/refresh", requireAuth, refreshToken);

export default router;
