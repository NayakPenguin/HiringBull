import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { google } from "googleapis";
import prisma from "../prismaClient.js";
import { log } from "../utils/logger.js";

/**
 * 🔒 UI → DB plan mapping (PLAN IS FIXED)
 */
const PLAN_TYPE_MAP: Record<string, string> = {
  STARTER: "ONE_MONTH",
  GROWTH: "THREE_MONTH",
  PRO: "SIX_MONTH",
};

/**
 * 🔒 Server-side price map — NEVER trust amount from client
 */
const PLAN_PRICE_MAP: Record<string, number> = {
  STARTER: 249,
  GROWTH: 599,
  PRO: 999,
};

/**
 * Allowed package names for Google Play verification
 */
const ALLOWED_PACKAGE_NAMES = ["com.hiringbull", "com.hiringbull.development"];

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

/**
 * Helper: get membership end date
 */
const getMembershipEndDate = (planType: string): Date => {
  const daysMap: Record<string, number> = {
    ONE_MONTH: 30,
    THREE_MONTH: 90,
    SIX_MONTH: 180,
  };

  const days = daysMap[planType] || 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

// Prisma transaction client type
type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * =========================
 * CREATE ORDER (NO AUTH)
 * =========================
 */
export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  log("[Payment] CREATE ORDER");
  log("[Payment] planType:", req.body?.planType);

  try {
    const { email, planType, referralCode } = req.body;

    // 1️⃣ Basic validation
    if (!email || !planType) {
      res
        .status(400)
        .json({ error: "Missing required fields (email, planType)" });
      return;
    }

    const dbPlanType = PLAN_TYPE_MAP[planType];
    if (!dbPlanType) {
      res
        .status(400)
        .json({ error: "Invalid plan type. Must be STARTER, GROWTH, or PRO" });
      return;
    }

    // 🔒 Server derives amount from planType — NEVER trust client amount
    let numericAmount = PLAN_PRICE_MAP[planType];
    if (!numericAmount) {
      res.status(400).json({ error: "Invalid plan type" });
      return;
    }

    // Apply referral discount (25% off) if referralCode provided
    const REFERRAL_DISCOUNT = 0.25;
    let referralDiscount: number | null = null;
    if (referralCode) {
      referralDiscount = Math.round(numericAmount * REFERRAL_DISCOUNT);
      numericAmount = numericAmount - referralDiscount;
    }

    // 2️⃣ Idempotency (reuse pending payment)
    const existingPayment = await prisma.payment.findFirst({
      where: {
        email,
        planType: dbPlanType as "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH",
        status: "PENDING",
      },
    });

    if (existingPayment) {
      res.json({
        orderId: existingPayment.orderId,
        amountInPaise: Math.round(existingPayment.amount * 100),
        key: process.env.RAZORPAY_KEY_ID,
      });
      return;
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
        planType: dbPlanType as "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH",
        email,
        referralCode: referralCode || null,
        referralDiscount: referralDiscount,
        referralApplied: Boolean(referralCode),
        status: "PENDING",
      },
    });

    res.json({
      orderId: order.id,
      amountInPaise: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Payment] CREATE ORDER ERROR:", message);
    res.status(500).json({ error: "Failed to create order" });
  }
};

/**
 * =========================
 * VERIFY PAYMENT (NO AUTH)
 * =========================
 */
export const verifyPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  log("[Payment] VERIFY PAYMENT");

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      log("[Payment] Missing Razorpay fields");
      res.status(400).json({ success: false });
      return;
    }

    // 1️⃣ Fetch payment from DB
    const payment = await prisma.payment.findUnique({
      where: { orderId: razorpay_order_id },
    });

    log("[Payment] Looking up order:", razorpay_order_id);
    log("[Payment] Found payment:", payment?.id);

    if (!payment) {
      log("[Payment] No payment found for orderId");
      res.status(404).json({ success: false });
      return;
    }

    // 2️⃣ Idempotency
    if (payment.status === "SUCCESS") {
      log("[Payment] Payment already marked SUCCESS (idempotent)");
      res.json({ success: true });
      return;
    }

    // 3️⃣ Signature verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body)
      .digest("hex");

    log("[Payment] Signature verification for order:", razorpay_order_id);

    if (expectedSignature !== razorpay_signature) {
      log("[Payment] SIGNATURE MISMATCH → marking payment FAILED");

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      res.status(400).json({ success: false });
      return;
    }

    log("[Payment] Signature verified");

    // 4️⃣ SUCCESS → update payment + activate membership
    await prisma.$transaction(async (tx: TxClient) => {
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

    log(
      "[Payment] Razorpay payment verified + membership activated for: " +
        payment.email,
    );
    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Payment] VERIFY PAYMENT ERROR:", message);
    res.status(500).json({ success: false });
  }
};

/**
 * =========================
 * SHARED: Activate membership
 * =========================
 */
const activateMembership = async (
  tx: TxClient,
  email: string,
  planType: string,
): Promise<void> => {
  const membershipEnd = getMembershipEndDate(planType);

  // Try to update existing PENDING application
  const updated = await tx.membershipApplication.updateMany({
    where: { email, status: "PENDING" },
    data: {
      membershipStart: new Date(),
      membershipEnd,
      status: "ACTIVE",
      planType: planType as "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH",
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
        planType: planType as "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH",
      },
      create: {
        full_name: email.split("@")[0],
        email,
        social_profile: "",
        reason: "Google Play purchase",
        membershipStart: new Date(),
        membershipEnd,
        status: "ACTIVE",
        planType: planType as "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH",
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

  log(
    `[Payment] Membership activated for ${email} (${planType}) until ${membershipEnd.toISOString()}`,
  );
};

/**
 * Google Play product ID → DB plan type mapping
 */
const GOOGLE_PLAY_PLAN_MAP: Record<string, string> = {
  hb_starter_1mo: "ONE_MONTH",
  hb_growth_3mo: "THREE_MONTH",
  hb_pro_6mo: "SIX_MONTH",
};

/**
 * Google Play product ID → price (INR)
 */
const GOOGLE_PLAY_PRICE_MAP: Record<string, number> = {
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
export const verifyGooglePlayPurchase = async (
  req: Request,
  res: Response,
): Promise<void> => {
  log("[Payment] ====== GOOGLE PLAY VERIFY ======");
  log(`[Payment] req.user: id=${req.user?.id}, email=${req.user?.email}`);
  log(`[Payment] req.body: ${JSON.stringify(req.body)}`);

  try {
    const { purchaseToken, productId, packageName } = req.body;

    // 1. Validate inputs
    log(
      `[Payment] purchaseToken present=${!!purchaseToken}, length=${purchaseToken?.length || 0}`,
    );
    log(`[Payment] productId=${productId}, packageName=${packageName}`);
    if (!purchaseToken || !productId || !packageName) {
      log(
        `[Payment] Missing fields: purchaseToken=${!!purchaseToken}, productId=${!!productId}, packageName=${!!packageName}`,
      );
      res.status(400).json({
        success: false,
        error: "Missing required fields: purchaseToken, productId, packageName",
      });
      return;
    }

    // 🔒 Validate packageName to prevent verification of purchases from fake/cloned apps
    if (!ALLOWED_PACKAGE_NAMES.includes(packageName)) {
      log(`[Payment] Rejected invalid packageName: ${packageName}`);
      res.status(400).json({ success: false, error: "Invalid package name" });
      return;
    }

    const planType = GOOGLE_PLAY_PLAN_MAP[productId];
    if (!planType) {
      res
        .status(400)
        .json({ success: false, error: `Unknown product ID: ${productId}` });
      return;
    }

    // 2. Get user email from auth token (requireAuth middleware sets req.user)
    const email = req.user?.email;
    if (!email) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    // 3. Idempotency check — already verified this purchase?
    const existingPayment = await prisma.payment.findFirst({
      where: { googlePlayToken: purchaseToken, status: "SUCCESS" },
    });
    if (existingPayment) {
      log("[Payment] Google Play purchase already verified (idempotent)");
      res.json({ success: true, message: "Already verified" });
      return;
    }

    // 4. Verify with Google Play Developer API
    const serviceAccountKeyRaw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKeyRaw) {
      log("[Payment] GOOGLE_PLAY_SERVICE_ACCOUNT_KEY is not configured");
      res.status(500).json({
        success: false,
        error: "Google Play verification not configured",
      });
      return;
    }

    let purchaseData: { purchaseState?: number; orderId?: string };
    let serviceAccountKey: { project_id?: string; client_email?: string };
    try {
      serviceAccountKey = JSON.parse(serviceAccountKeyRaw);
      log(
        `[Payment] Service account parsed: project_id=${serviceAccountKey.project_id}, client_email=${serviceAccountKey.client_email}`,
      );
    } catch (parseErr) {
      const errMsg =
        parseErr instanceof Error ? parseErr.message : "Unknown error";
      log(
        `[Payment] FAILED to parse GOOGLE_PLAY_SERVICE_ACCOUNT_KEY: ${errMsg}`,
      );
      res.status(500).json({
        success: false,
        error: "Invalid service account key configuration",
      });
      return;
    }
    const gpAuth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
    const androidPublisher = google.androidpublisher({
      version: "v3",
      auth: gpAuth,
    });

    try {
      log(
        `[Payment] Calling Google Play API: packageName=${packageName}, productId=${productId}, token length=${purchaseToken.length}`,
      );
      const result = await androidPublisher.purchases.products.get({
        packageName,
        productId,
        token: purchaseToken,
      });

      purchaseData = result.data as {
        purchaseState?: number;
        orderId?: string;
      };
      log("[Payment] Google Play API response:", JSON.stringify(purchaseData));
    } catch (apiErr) {
      const errMsg = apiErr instanceof Error ? apiErr.message : "Unknown error";
      const apiError = apiErr as {
        response?: { status?: number; data?: unknown };
      };
      log(`[Payment] Google Play API FAILED: ${errMsg}`);
      log(
        `[Payment] Google Play API error details: status=${apiError.response?.status}, data=${JSON.stringify(apiError.response?.data)}`,
      );
      res.status(400).json({
        success: false,
        error: "Failed to verify purchase with Google Play",
        detail: errMsg,
      });
      return;
    }

    // 5. Validate purchase state
    // purchaseState: 0=Purchased, 1=Canceled, 2=Pending
    if (purchaseData.purchaseState !== 0) {
      log(
        `[Payment] Purchase not in valid state: ${purchaseData.purchaseState}`,
      );
      res
        .status(400)
        .json({ success: false, error: "Purchase is not in a valid state" });
      return;
    }

    // 6. Create payment + activate membership in a transaction
    await prisma.$transaction(async (tx: TxClient) => {
      // Create payment record
      await tx.payment.create({
        data: {
          orderId: `gp_${purchaseData.orderId || Date.now()}`,
          amount: GOOGLE_PLAY_PRICE_MAP[productId] || 0,
          planType: planType as "ONE_MONTH" | "THREE_MONTH" | "SIX_MONTH",
          email,
          userId: req.user!.id,
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
      const errMsg = ackErr instanceof Error ? ackErr.message : "Unknown error";
      log("[Payment] Warning: Failed to acknowledge purchase:", errMsg);
    }

    log(
      `[Payment] Google Play purchase verified for ${email}, plan: ${planType}`,
    );
    res.json({ success: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    const errStack = err instanceof Error ? err.stack : "";
    log(`[Payment] Google Play verify UNCAUGHT error: ${errMsg}`);
    log(`[Payment] Stack: ${errStack}`);
    console.error("[Payment] Google Play verify error:", err);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", detail: errMsg });
  }
};
