import {
  Expo,
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushReceipt,
} from "expo-server-sdk";

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

interface DeviceToken {
  token: string;
  type?: string;
}

interface NotificationResult {
  sent: number;
  errors: number;
}

interface JobData {
  id?: string;
  title: string;
  company: string;
  companyId?: string;
  segment?: string;
}

/**
 * Send notifications to a list of devices safely
 */
export const sendNotificationsToDevices = async (
  devices: DeviceToken[],
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<NotificationResult> => {
  console.log("\n================ PUSH SEND START ================");
  console.log(`Total devices received: ${devices.length}`);

  if (!devices.length) {
    console.log("No devices to notify");
    return { sent: 0, errors: 0 };
  }

  /** 1️⃣ Build messages */
  const messages: ExpoPushMessage[] = [];
  for (const device of devices) {
    if (!Expo.isExpoPushToken(device.token)) {
      console.error("❌ Invalid Expo token:", device.token);
      continue;
    }

    messages.push({
      to: device.token,
      sound: "default",
      title,
      body,
      data: {
        ...data,
        url: "/(app)/profile",
      },
    });
  }

  console.log(`Valid Expo tokens: ${messages.length}`);

  if (!messages.length) {
    console.log("No valid tokens after filtering");
    return { sent: 0, errors: 0 };
  }

  /** 2️⃣ Chunk messages (Expo max ≈ 100 per chunk) */
  const chunks = expo.chunkPushNotifications(messages);

  let sentCount = 0;
  let errorCount = 0;
  const receiptIds: string[] = [];

  /** 3️⃣ Send chunks with throttling */
  for (const [index, chunk] of chunks.entries()) {
    try {
      console.log(
        `🚀 Sending chunk ${index + 1}/${chunks.length} (size: ${chunk.length})`,
      );

      const tickets: ExpoPushTicket[] =
        await expo.sendPushNotificationsAsync(chunk);

      tickets.forEach((ticket) => {
        if (ticket.status === "ok") {
          sentCount++;
          if (ticket.id) receiptIds.push(ticket.id);
        } else {
          errorCount++;
          console.error("❌ Ticket error:", ticket.message, ticket.details);
        }
      });

      // 🔥 Safe adaptive throttle (≈300–400 notifications/sec)
      await new Promise((res) => setTimeout(res, 300));
    } catch (error) {
      console.error("🔥 Chunk send failure:", error);
      errorCount += chunk.length;
    }
  }

  /** 4️⃣ Fetch receipts (important for prod debugging) */
  if (receiptIds.length) {
    console.log("\n📬 Fetching push receipts...");
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(receiptIds);

      for (const [id, receipt] of Object.entries(receipts)) {
        if (
          (receipt as ExpoPushReceipt & { status: string }).status === "error"
        ) {
          const errorReceipt = receipt as ExpoPushReceipt & {
            message?: string;
            details?: unknown;
          };
          console.error(
            "❌ Receipt error:",
            id,
            errorReceipt.message,
            errorReceipt.details,
          );
        }
      }
    } catch (error) {
      console.error("🔥 Receipt fetch failed:", error);
    }
  }

  console.log("================ PUSH SEND END =================");
  console.log(`✅ Sent: ${sentCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log("===============================================\n");

  return { sent: sentCount, errors: errorCount };
};

/**
 * Send job notification to followers of a company
 */
export const sendJobNotificationToFollowers = async (
  companyId: string,
  jobData: JobData,
) => {
  const prisma = (await import("../prismaClient.js")).default;

  console.log("\n================ JOB PUSH START ================");
  console.log(`Company: ${jobData.company}`);
  console.log(`Job: ${jobData.title}`);
  console.log(`Segment: ${jobData.segment || "ALL"}`);

  const whereClause: Record<string, unknown> = {
    followedCompanies: { some: { id: companyId } },
    active: true,
  };

  if (jobData.segment) {
    whereClause.experience_level = jobData.segment;
  }

  const users = (await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      devices: {
        select: {
          token: true,
          type: true,
        },
      },
    },
  })) as Array<{
    id: string;
    name: string;
    email: string;
    devices: Array<{ token: string | null; type: string | null }>;
  }>;

  if (!users.length) {
    console.log("No matching users found");
    return { totalUsers: 0, sent: 0, errors: 0 };
  }

  console.log(`Total users matched: ${users.length}`);

  const allDevices: DeviceToken[] = users.flatMap((u) =>
    u.devices
      .filter(
        (d): d is { token: string; type: string | null } => d.token !== null,
      )
      .map((d) => ({ token: d.token, type: d.type ?? undefined })),
  );

  console.log(`Total devices found: ${allDevices.length}`);

  const notificationData = {
    type: "new_job",
    jobId: jobData.id,
    companyId: jobData.companyId,
    companyName: jobData.company,
  };

  const result = await sendNotificationsToDevices(
    allDevices,
    `New job from ${jobData.company}`,
    jobData.title,
    notificationData,
  );

  console.log("================ JOB PUSH END ==================");
  console.log(`Users: ${users.length}`);
  console.log(`Sent: ${result.sent}`);
  console.log(`Errors: ${result.errors}`);
  console.log("===============================================\n");

  return {
    totalUsers: users.length,
    ...result,
  };
};
