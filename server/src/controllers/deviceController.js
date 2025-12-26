import httpStatus from 'http-status';
import prisma from '../prismaClient.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Add a device token for the authenticated user
 * POST /api/users/devices
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
 * Remove a device token for the authenticated user
 * DELETE /api/users/devices/:token
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
 * Get all devices for the authenticated user
 * GET /api/users/devices
 */
export const getDevices = catchAsync(async (req, res) => {
    const devices = await prisma.device.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });

    res.status(httpStatus.OK).json(devices);
});
/**
 * Add a device token without authentication (for testing/initial registration)
 * POST /api/users/devices/public
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
