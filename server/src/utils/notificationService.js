import { Expo } from 'expo-server-sdk';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export const sendNotificationsToDevices = async (devices, title, body, data = {}) => {
  if (devices.length === 0) {
    return { sent: 0, errors: 0 };
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
      data: {
        ...data,
        url: '/(app)/profile'
      }
    });
  }

  if (messages.length === 0) {
    return { sent: 0, errors: 0 };
  }

  const chunks = expo.chunkPushNotifications(messages);
  let sentCount = 0;
  let errorCount = 0;

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      ticketChunk.forEach((ticket) => {
        if (ticket.status === 'ok') {
          sentCount++;
        } else {
          errorCount++;
        }
      });
    } catch (error) {
      console.error('Error sending push notifications:', error);
      errorCount += chunk.length;
    }
  }

  return { sent: sentCount, errors: errorCount };
};

export const sendJobNotificationToFollowers = async (companyId, jobData) => {
  const prisma = (await import('../prismaClient.js')).default;

  const whereClause = {
    followedCompanies: {
      some: {
        id: companyId
      }
    },
    active: true
  };

  // Filter by experience level if job has a segment
  if (jobData.segment) {
    whereClause.experience_level = jobData.segment;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      devices: {
        select: {
          token: true
        }
      }
    }
  });

  if (users.length === 0) {
    return { totalUsers: 0, sent: 0, errors: 0 };
  }

  const allDevices = users.flatMap(user => user.devices);

  const notificationData = {
    type: 'new_job',
    jobId: jobData.id,
    companyId: jobData.companyId,
    companyName: jobData.company
  };

  const result = await sendNotificationsToDevices(
    allDevices,
    `New job from ${jobData.company}`,
    jobData.title,
    notificationData
  );

  return {
    totalUsers: users.length,
    ...result
  };
};