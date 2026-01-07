import httpStatus from 'http-status';
import prisma from '../prismaClient.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * @swagger
 * /api/users/devices:
 *   post:
 *     summary: Add device for authenticated user
 *     description: Register a device token for push notifications
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Device push notification token
 *                 example: "ExponentPushToken[xxx]"
 *               type:
 *                 type: string
 *                 description: Device platform/type
 *                 example: "ios"
 *             example:
 *               token: "ExponentPushToken[xxx]"
 *               type: "ios"
 *     responses:
 *       200:
 *         description: Device registered/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       401:
 *         description: Unauthorized
 */
export const addDevice = catchAsync(async (req, res) => {
    const { token, type } = req.body;
    const userId = req.user.id;

    const existingDevice = await prisma.device.findUnique({
        where: { token },
    });

    if (existingDevice && existingDevice.userId === userId) {
        return res.status(httpStatus.OK).json(existingDevice);
    }

    const device = await prisma.device.upsert({
        where: { token },
        update: { userId, type },
        create: { token, type, userId },
    });

    res.status(httpStatus.OK).json(device);
});

/**
 * @swagger
 * /api/users/devices/{token}:
 *   delete:
 *     summary: Remove device
 *     description: Remove a device token for the authenticated user
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Device token
 *     responses:
 *       204:
 *         description: Device removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot remove another user's device
 *       404:
 *         description: Device not found
 */
export const removeDevice = catchAsync(async (req, res) => {
    const { token } = req.params;
    const userId = req.user.id;

    const device = await prisma.device.findUnique({
        where: { token },
    });

    if (!device) {
        const error = new Error('Device not found');
        error.statusCode = httpStatus.NOT_FOUND;
        throw error;
    }

    if (device.userId !== userId) {
        const error = new Error('Unauthorized to remove this device');
        error.statusCode = httpStatus.FORBIDDEN;
        throw error;
    }

    await prisma.device.delete({
        where: { token },
    });

    res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @swagger
 * /api/users/devices:
 *   get:
 *     summary: Get user devices
 *     description: Get all registered devices for the authenticated user
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Device'
 *       401:
 *         description: Unauthorized
 */
export const getDevices = catchAsync(async (req, res) => {
    const devices = await prisma.device.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });

    res.status(httpStatus.OK).json(devices);
});
/**
 * @swagger
 * /api/users/devices/public:
 *   post:
 *     summary: Add device publicly
 *     description: Register a device token without authentication (for testing/initial registration)
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Device push notification token
 *                 example: "ExponentPushToken[xxx]"
 *               type:
 *                 type: string
 *                 description: Device platform/type
 *                 example: "android"
 *               clerkId:
 *                 type: string
 *                 description: Clerk user ID (optional, to link device to user)
 *                 example: "user_abc123"
 *             example:
 *               token: "ExponentPushToken[xxx]"
 *               type: "android"
 *               clerkId: "user_abc123"
 *     responses:
 *       200:
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 */
export const addDevicePublic = catchAsync(async (req, res) => {
    const { token, type, clerkId } = req.body;

    let userId = null;
    if (clerkId) {
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });
        if (user) {
            userId = user.id;
        }
    }

    const existingDevice = await prisma.device.findUnique({
        where: { token },
    });

    if (existingDevice) {
        if (userId && existingDevice.userId === userId) {
            return res.status(httpStatus.OK).json(existingDevice);
        }

        const device = await prisma.device.update({
            where: { token },
            data: {
                userId: userId || existingDevice.userId,
                type: type || existingDevice.type
            },
        });
        return res.status(httpStatus.OK).json(device);
    }

    const device = await prisma.device.create({
        data: {
            token,
            type,
            userId,
        },
    });

    res.status(httpStatus.CREATED).json(device);
});
