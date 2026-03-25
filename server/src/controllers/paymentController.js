import Razorpay from "razorpay";
import crypto from "crypto";
import { google } from "googleapis";
import prisma from "../prismaClient.js";
import { log } from "../utils/logger.js";

/**
 * 🔒 UI → DB plan mapping (PLAN IS FIXED)
 */
const PLAN_TYPE_MAP = {
  STARTER: "ONE_MONTH",
  GROWTH: "THREE_MONTH",
  PRO: "SIX_MONTH",
};

/**
 * 🔒 Server-side price map — NEVER trust amount from client
 */
const PLAN_PRICE_MAP = {
  STARTER: 249,
  GROWTH: 599,
  PRO: 999,
};

/**
 * Allowed package names for Google Play verification
 */
const ALLOWED_PACKAGE_NAMES = ["com.hiringbull", "com.hiringbull.development"];

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * Helper: get membership end date
 */
const getMembershipEndDate = (planType) => {
  const daysMap = {
    ONE_MONTH: 30,
    THREE_MONTH: 90,
    SIX_MONTH: 180,
  };

  const days = daysMap[planType];
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

/**
 * =========================
 * CREATE ORDER (NO AUTH)
 * =========================
 */
export const createOrder = async (req, res) => {
  log("[Payment] CREATE ORDER");
  log("[Payment] planType:", req.body?.planType);

  try {
    const { email, planType, referralCode } = req.body;

    // 1️⃣ Basic validation
    if (!email || !planType) {
      return res.status(400).json({ error: "Missing required fields (email, planType)" });
    }

    const dbPlanType = PLAN_TYPE_MAP[planType];
    if (!dbPlanType) {
      return res.status(400).json({ error: "Invalid plan type. Must be STARTER, GROWTH, or PRO" });
    }

    // 🔒 Server derives amount from planType — NEVER trust client amount
    let numericAmount = PLAN_PRICE_MAP[planType];
    if (!numericAmount) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Apply referral discount (25% off) if referralCode provided
    const REFERRAL_DISCOUNT = 0.25;
    let referralDiscount = null;
    if (referralCode) {
      referralDiscount = Math.round(numericAmount * REFERRAL_DISCOUNT);
      numericAmount = numericAmount - referralDiscount;
    }

    // 2️⃣ Idempotency (reuse pending payment)
    const existingPayment = await prisma.payment.findFirst({
      where: {
        email,
        planType: dbPlanType,
        status: "PENDING",
      },
    });

    if (existingPayment) {
      return res.json({
        orderId: existingPayment.orderId,
        amountInPaise: Math.round(existingPayment.amount * 100),
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    // 3️⃣ Create Razorpay order
    const amountInPaise = Math.round(numericAmount * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `hb_${Date.now()}`,
    });

    // 4️⃣ Save payment (PENDING)
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: numericAmount,
        planType: dbPlanType,
        email,
        referralCode: referralCode || null,
        referralDiscount: referralDiscount,
        referralApplied: Boolean(referralCode),
        status: "PENDING",
      },
    });

    return res.json({
      orderId: order.id,
      amountInPaise: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[Payment] CREATE ORDER ERROR:", err.message);
    return res.status(500).json({ error: "Failed to create order" });
  }
};

/**
 * =========================
 * VERIFY PAYMENT (NO AUTH)
 * =========================
 */
export const verifyPayment = async (req, res) => {
  log("[Payment] VERIFY PAYMENT");

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      log("[Payment] Missing Razorpay fields");
      return res.status(400).json({ success: false });
    }

    // 1️⃣ Fetch payment from DB
    const payment = await prisma.payment.findUnique({
      where: { orderId: razorpay_order_id },
    });

    log("[Payment] Looking up order:", razorpay_order_id);
    log("[Payment] Found payment:", payment?.id);

    if (!payment) {
      log("[Payment] No payment found for orderId");
      return res.status(404).json({ success: false });
    }

    // 2️⃣ Idempotency
    if (payment.status === "SUCCESS") {
      log("[Payment] Payment already marked SUCCESS (idempotent)");
      return res.json({ success: true });
    }

    // 3️⃣ Signature verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    log("[Payment] Signature verification for order:", razorpay_order_id);

    if (expectedSignature !== razorpay_signature) {
      log("[Payment] SIGNATURE MISMATCH → marking payment FAILED");

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      return res.status(400).json({ success: false });
    }

    log("[Payment] Signature verified");

    // 4️⃣ SUCCESS → update payment + activate membership
    await prisma.$transaction(async (tx) => {
      log("[Payment] Updating payment → SUCCESS");

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: "SUCCESS",
        },
      });

      log("[Payment] Activating membership for:", payment.email);

      // Activate membership (updates both MembershipApplication AND User)
      await activateMembership(tx, payment.email, payment.planType);
    });

    log("[Payment] Razorpay payment verified + membership activated for: " + payment.email);
    return res.json({ success: true });
  } catch (err) {
    console.error("[Payment] VERIFY PAYMENT ERROR:", err.message);
    return res.status(500).json({ success: false });
  }
};

/**
 * =========================
 * SHARED: Activate membership
 * =========================
 */
const activateMembership = async (tx, email, planType) => {
  const membershipEnd = getMembershipEndDate(planType);

  // Try to update existing PENDING application
  const updated = await tx.membershipApplication.updateMany({
    where: { email, status: "PENDING" },
    data: {
      membershipStart: new Date(),
      membershipEnd,
      status: "ACTIVE",
      planType,
    },
  });

  // If no pending application, create a new ACTIVE one
  if (updated.count === 0) {
    await tx.membershipApplication.upsert({
      where: { email },
      update: {
        membershipStart: new Date(),
        membershipEnd,
        status: "ACTIVE",
        planType,
      },
      create: {
        full_name: email.split("@")[0],
        email,
        social_profile: "",
        reason: "Google Play purchase",
        membershipStart: new Date(),
        membershipEnd,
        status: "ACTIVE",
        planType,
      },
    });
  }

  // Also update user's plan fields
  await tx.user.updateMany({
    where: { email },
    data: {
      isPaid: true,
      planExpiry: membershipEnd,
      current_plan_start: new Date(),
      current_plan_end: membershipEnd,
    },
  });

  log(`[Payment] Membership activated for ${email} (${planType}) until ${membershipEnd.toISOString()}`);
};

/**
 * Google Play product ID → DB plan type mapping
 */
const GOOGLE_PLAY_PLAN_MAP = {
  hb_starter_1mo: "ONE_MONTH",
  hb_growth_3mo: "THREE_MONTH",
  hb_pro_6mo: "SIX_MONTH",
};

/**
 * Google Play product ID → price (INR)
 */
const GOOGLE_PLAY_PRICE_MAP = {
  hb_starter_1mo: 249,
  hb_growth_3mo: 599,
  hb_pro_6mo: 999,
};

/**
 * =========================
 * VERIFY GOOGLE PLAY PURCHASE
 * =========================
 *
 * @swagger
 * /api/payment/google-play/verify:
 *   post:
 *     summary: Verify a Google Play in-app purchase
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [purchaseToken, productId, packageName]
 *             properties:
 *               purchaseToken:
 *                 type: string
 *               productId:
 *                 type: string
 *                 enum: [hb_starter_1mo, hb_growth_3mo, hb_pro_6mo]
 *               packageName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase verified and membership activated
 *       400:
 *         description: Invalid request or purchase not valid
 *       500:
 *         description: Server error
 */
export const verifyGooglePlayPurchase = async (req, res) => {
  log("[Payment] Google Play verify hit");

  try {
    const { purchaseToken, productId, packageName } = req.body;

    // 1. Validate inputs
    if (!purchaseToken || !productId || !packageName) {
      return res.status(400).json({ success: false, error: "Missing required fields: purchaseToken, productId, packageName" });
    }

    // 🔒 Validate packageName to prevent verification of purchases from fake/cloned apps
    if (!ALLOWED_PACKAGE_NAMES.includes(packageName)) {
      log(`[Payment] Rejected invalid packageName: ${packageName}`);
      return res.status(400).json({ success: false, error: "Invalid package name" });
    }

    const planType = GOOGLE_PLAY_PLAN_MAP[productId];
    if (!planType) {
      return res.status(400).json({ success: false, error: `Unknown product ID: ${productId}` });
    }

    // 2. Get user email from auth token (requireAuth middleware sets req.user)
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    // 3. Idempotency check — already verified this purchase?
    const existingPayment = await prisma.payment.findFirst({
      where: { googlePlayToken: purchaseToken, status: "SUCCESS" },
    });
    if (existingPayment) {
      log("[Payment] Google Play purchase already verified (idempotent)");
      return res.json({ success: true, message: "Already verified" });
    }

    // 4. Verify with Google Play Developer API
    const serviceAccountKeyRaw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKeyRaw) {
      log("[Payment] GOOGLE_PLAY_SERVICE_ACCOUNT_KEY is not configured");
      return res.status(500).json({ success: false, error: "Google Play verification not configured" });
    }

    let purchaseData;
    const serviceAccountKey = JSON.parse(serviceAccountKeyRaw);
    const gpAuth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
    const androidPublisher = google.androidpublisher({ version: "v3", auth: gpAuth });

    try {

      const result = await androidPublisher.purchases.products.get({
        packageName,
        productId,
        token: purchaseToken,
      });

      purchaseData = result.data;
      log("[Payment] Google Play API response:", JSON.stringify(purchaseData));
    } catch (apiErr) {
      log("[Payment] Google Play API error:", apiErr.message);
      return res.status(400).json({ success: false, error: "Failed to verify purchase with Google Play" });
    }

    // 5. Validate purchase state
    // purchaseState: 0=Purchased, 1=Canceled, 2=Pending
    if (purchaseData.purchaseState !== 0) {
      log(`[Payment] Purchase not in valid state: ${purchaseData.purchaseState}`);
      return res.status(400).json({ success: false, error: "Purchase is not in a valid state" });
    }

    // 6. Create payment + activate membership in a transaction
    await prisma.$transaction(async (tx) => {
      // Create payment record
      await tx.payment.create({
        data: {
          orderId: `gp_${purchaseData.orderId || Date.now()}`,
          amount: GOOGLE_PLAY_PRICE_MAP[productId] || 0,
          planType,
          email,
          userId: req.user.id,
          source: "google_play",
          googlePlayToken: purchaseToken,
          googlePlayOrderId: purchaseData.orderId || null,
          status: "SUCCESS",
        },
      });

      // Activate membership
      await activateMembership(tx, email, planType);
    });

    // 7. Acknowledge the purchase (reuse same auth + publisher)
    try {
      await androidPublisher.purchases.products.acknowledge({
        packageName,
        productId,
        token: purchaseToken,
      });
      log("[Payment] Google Play purchase acknowledged");
    } catch (ackErr) {
      // Non-fatal — purchase is still verified, just log
      log("[Payment] Warning: Failed to acknowledge purchase:", ackErr.message);
    }

    log(`[Payment] Google Play purchase verified for ${email}, plan: ${planType}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("[Payment] Google Play verify error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

