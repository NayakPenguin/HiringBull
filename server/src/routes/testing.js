import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import prisma from "../prismaClient.js";
import { Expo } from 'expo-server-sdk';

const router = express.Router();

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

/**
 * @swagger
 * /api/public/testing:
 *   get:
 *     summary: Test API endpoint
 *     description: Simple endpoint to verify API is working
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: API is working
 *         content:
 *           text/plain:
 *             example: "Testing API endpoint is working!"
 */
router.get("/testing", (req, res) => {
  res.send("Testing API endpoint is working!");
});

/**
 * @swagger
 * /api/public/auth-test:
 *   get:
 *     summary: Test authentication
 *     description: Verify authentication is working and get authenticated user ID
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *             example:
 *               message: "Kabeer Auth testing working"
 *               userId: "user_abc123"
 *       401:
 *         description: Unauthorized
 */
router.get("/auth-test", requireAuth, (req, res) => {
  res.status(200).json({
    message: "Kabeer Auth testing working",
    userId: req.auth().userId,
  });
});

/**
 * @swagger
 * /api/public/all-devices:
 *   get:
 *     summary: Get all devices
 *     description: Retrieve all registered devices with user information (admin/testing)
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Devices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Device'
 *                   - type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           clerkId:
 *                             type: string
 *                           email:
 *                             type: string
 *                           name:
 *                             type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/all-devices", async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            email: true,
            name: true
          }
        }
      }
    });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching devices", error: error.message });
  }
});

/**
 * @swagger
 * /api/public/send-notification:
 *   post:
 *     summary: Send push notification to all devices
 *     description: Send a push notification to all registered devices
 *     tags: [Testing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Job Alert"
 *               body:
 *                 type: string
 *                 example: "Check out latest job postings!"
 *               data:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                     example: "/(app)/profile"
 *             example:
 *               title: "New Job Alert"
 *               body: "Check out latest job postings!"
 *               data:
 *                 url: "/(app)/profile"
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tickets:
 *                   type: array
 *                   description: Successful tickets
 *                   items:
 *                     type: object
 *                 errors:
 *                   type: array
 *                   description: Failed tickets
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request - Missing fields or invalid tokens
 *       500:
 *         description: Internal server error
 */
router.post("/send-notification", async (req, res) => {
  try {
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    // Ensure data is a plain object (not string, array, or null)
    const notificationData = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};

    const devices = await prisma.device.findMany({
      select: { token: true }
    });

    if (devices.length === 0) {
      return res.status(200).json({ message: "No devices to send notifications to" });
    }

    const messages = [];
    for (const device of devices) {
      if (!Expo.isExpoPushToken(device.token)) {
        console.error(`Push token ${device.token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: device.token,
        sound: 'default',
        title,
        body,
        data: notificationData,
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({ message: "No valid push tokens found" });
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notifications:', error);
      }
    }

    res.status(200).json({
      message: `Notifications sent to ${tickets.length} devices`,
      tickets: tickets.filter(ticket => ticket.status === 'ok'),
      errors: tickets.filter(ticket => ticket.status === 'error')
    });
  } catch (error) {
    console.error('Error in send-notification endpoint:', error);
    res.status(500).json({ message: "Error sending notifications", error: error.message });
  }
});

export default router;
