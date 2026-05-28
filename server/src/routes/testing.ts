/**
 * ⚠️ PUBLIC TESTING ROUTES
 * PURPOSE: Razorpay payment testing ONLY
 * SAFE TO DELETE
 */

import express, { Request, Response } from "express";
import { Expo } from "expo-server-sdk";

const router = express.Router();

/**
 * GET /api/public/testing
 * Health check for TESTING routes
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    mode: "TESTING",
    message: "Public testing routes are active",
    timestamp: new Date().toISOString(),
  });
});

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

router.post("/debug/push", async (req: Request, res: Response) => {
  const { token } = req.body;

  console.log("\n================ DEBUG PUSH =================");
  console.log("Token received:", token);
  console.log("============================================");

  if (!token || !Expo.isExpoPushToken(token)) {
    console.error("❌ Invalid Expo push token");
    res.status(400).json({ error: "Invalid Expo push token" });
    return;
  }

  const message = {
    to: token,
    sound: "default" as const,
    title: "Hello world!",
    body: "HiringBull is now live 🚀",
    data: { test: true },
  };

  try {
    console.log("🚀 Sending push...");
    const tickets = await expo.sendPushNotificationsAsync([message]);

    console.log("\n🎫 TICKETS");
    console.log(JSON.stringify(tickets, null, 2));

    const receiptIds = tickets
      .filter((t) => t.status === "ok" && t.id)
      .map((t) => (t as { id: string }).id);

    if (receiptIds.length > 0) {
      console.log("\n⏳ Waiting for receipts...");
      await new Promise((r) => setTimeout(r, 2000));

      const receipts = await expo.getPushNotificationReceiptsAsync(receiptIds);

      console.log("\n📬 RECEIPTS");
      console.log(JSON.stringify(receipts, null, 2));
    } else {
      console.warn("⚠️ No receipt IDs returned");
    }

    res.json({
      success: true,
      tickets,
    });
  } catch (err) {
    console.error("🔥 PUSH ERROR");
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
