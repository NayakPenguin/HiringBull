import express from "express";
import { analyzeResume } from "../controllers/aiController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

/**
 * POST /api/ai/analyze
 * Body: { resume: string, jobDescription?: string, mode: "match" | "review" }
 * Returns: AI analysis with streaming-style chunked response
 */
router.post("/analyze", requireAuth, analyzeResume);

export default router;
