import express from "express";
import {
  createOrder,
  verifyPayment,
  verifyGooglePlayPurchase,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import * as paymentValidation from "../validations/paymentValidation.js";

const router = express.Router();

router.post("/create-order", validate(paymentValidation.createOrder), createOrder);
router.post("/verify", validate(paymentValidation.verifyPayment), verifyPayment);
router.post("/google-play/verify", requireAuth, validate(paymentValidation.verifyGooglePlayPurchase), verifyGooglePlayPurchase);

export default router;