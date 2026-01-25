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
        await new Promise((res) => setTimeout(res, 1000));
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
      email: true,
      name: true,
      experience_level: true,
      devices: {
        select: {
          token: true,
          type: true
        }
      }
    }
  });

  if (users.length === 0) {
    console.log('\n===========================================');
    console.log('📢 JOB NOTIFICATION - No matching users');
    console.log('===========================================');
    console.log(`Company: ${jobData.company} (ID: ${companyId})`);
    console.log(`Job: ${jobData.title}`);
    console.log(`Segment: ${jobData.segment || 'N/A'}`);
    console.log(`Reason: No active users found who follow this company with matching experience level`);
    console.log('===========================================\n');
    return { totalUsers: 0, sent: 0, errors: 0 };
  }

  console.log('\n===========================================');
  console.log('📢 JOB NOTIFICATION - Sending to followers');
  console.log('===========================================');
  console.log(`Company: ${jobData.company} (ID: ${companyId})`);
  console.log(`Job: ${jobData.title}`);
  console.log(`Segment: ${jobData.segment || 'N/A'}`);
  console.log(`Total users to notify: ${users.length}`);
  console.log('-------------------------------------------');
  console.log('USERS TO NOTIFY:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Experience Level: ${user.experience_level || 'N/A'}`);
    console.log(`   Devices: ${user.devices.length} (${user.devices.map(d => d.type || 'unknown').join(', ') || 'none'})`);
    if (user.devices.length > 0) {
      console.log(`   Device Tokens: ${user.devices.map(d => d.token.substring(0, 20) + '...').join(', ')}`);
    }
    console.log('');
  });
  console.log('===========================================\n');

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

  console.log('\n===========================================');
  console.log('📢 NOTIFICATION RESULT');
  console.log('===========================================');
  console.log(`Notifications sent: ${result.sent}`);
  console.log(`Notifications failed: ${result.errors}`);
  console.log('===========================================\n');

  return {
    totalUsers: users.length,
    ...result
  };
};