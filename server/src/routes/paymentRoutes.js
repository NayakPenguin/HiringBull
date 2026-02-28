import express from "express";
import {
  createOrder,
  verifyPayment,
  verifyGooglePlayPurchase,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/google-play/verify", requireAuth, verifyGooglePlayPurchase);

export default router;