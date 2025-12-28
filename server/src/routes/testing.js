import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import prisma from "../prismaClient.js";
import { Expo } from 'expo-server-sdk';

const router = express.Router();

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

router.get("/testing", (req, res) => {
  res.send("Testing API endpoint is working!");
});

router.get("/auth-test", requireAuth, (req, res) => {
  res.status(200).json({
    message: "Kabeer Auth testing working",
    userId: req.auth().userId,
  });
});

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

router.post("/send-notification", async (req, res) => {
  try {
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

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
        data: data || {},
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
