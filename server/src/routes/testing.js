/**
 * ⚠️ PUBLIC TESTING ROUTES
 * PURPOSE: Razorpay payment testing ONLY
 * SAFE TO DELETE
 */

import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../prismaClient.js";

const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,      // TEST KEY
//   key_secret: process.env.RAZORPAY_SECRET, // TEST SECRET
// });

/**
 * GET /api/public/testing
 * Health check for TESTING routes
 */

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    mode: "TESTING",
    message: "Public testing routes are active",
    timestamp: new Date().toISOString(),
  });
});

// const getMyTestOutreachRequests = async (req, res) => {
//   try {
//     const userId = "f24a52f9-be4c-4291-a8eb-fd12e5dc5573";

//     const outreaches = await prisma.outreachRequest.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         companyName: true,
//         email: true,
//         status: true,
//         createdAt: true,
//         reply: true,
//       },
//     });

//     return res.status(200).json(outreaches);
//   } catch (error) {
//     console.error('Get my outreaches error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// router.get("/outreach-testing", getMyTestOutreachRequests);

// router.get("/testing", (req, res) => {
//   res.json({
//     status: "ok",
//     mode: "TESTING",
//     message: "Public testing routes are active",
//     timestamp: new Date().toISOString(),
//   });
// });

/**
 * POST /api/public/testing/razorpay/create-order
 */
// router.post("/testing/razorpay/create-order", async (req, res) => {
//   console.log("🔥 CREATE ORDER HIT");

//   try {
//     const amount = 100 * 100;

//     console.log("👉 Creating Razorpay order");

//     const order = await razorpay.orders.create({
//       amount,
//       currency: "INR",
//       receipt: `testing_${Date.now()}`,
//     });

//     console.log("✅ Razorpay order created:", order.id);

//     console.log("👉 Writing to DB");

//     await prisma.paymentTesting.create({
//       data: {
//         orderId: order.id,
//         amount,
//         status: "CREATED",
//       },
//     });

//     console.log("✅ DB write successful");

//     res.json({
//       mode: "TESTING",
//       orderId: order.id,
//       amount: order.amount,
//       currency: "INR",
//       key: process.env.RAZORPAY_KEY_ID,
//     });

//   } catch (err) {
//     console.error("❌ CREATE ORDER ERROR:", err);
//     res.status(500).json({
//       error: err.message,
//       stack: err.stack,
//     });
//   }
// });

/**
 * POST /api/public/testing/razorpay/verify
 */
// router.post("/testing/razorpay/verify", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       await prisma.paymentTesting.update({
//         where: { orderId: razorpay_order_id },
//         data: { status: "FAILED" },
//       });

//       return res.status(400).json({
//         success: false,
//         mode: "TESTING",
//       });
//     }

//     await prisma.paymentTesting.update({
//       where: { orderId: razorpay_order_id },
//       data: {
//         paymentId: razorpay_payment_id,
//         status: "SUCCESS",
//       },
//     });

//     res.json({
//       success: true,
//       mode: "TESTING",
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message, mode: "TESTING" });
//   }
// });

export default router;
