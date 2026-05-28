import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import prisma from "../prismaClient.js";

interface AppError extends Error {
  statusCode?: number;
}

const catchAsync =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<void | Response>,
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };

export const addDevice = catchAsync(async (req: Request, res: Response) => {
  const { deviceId, token, type } = req.body;
  const userId = req.user!.id;

  if (!deviceId) {
    const error: AppError = new Error("deviceId is required");
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  // Remove all existing devices for this user
  await prisma.device.deleteMany({
    where: { userId },
  });

  // Create new device
  const device = await prisma.device.create({
    data: {
      deviceId,
      token: token ?? null,
      type,
      userId,
    },
  });

  res.status(httpStatus.CREATED).json(device);
});

export const updateDevice = catchAsync(async (req: Request, res: Response) => {
  const { deviceId, token, type } = req.body;
  const userId = req.user!.id;

  if (!deviceId) {
    const error: AppError = new Error("deviceId is required");
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const device = await prisma.device.findUnique({
    where: {
      userId_deviceId: {
        userId,
        deviceId,
      },
    },
  });

  if (!device) {
    const error: AppError = new Error("Device not registered");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const updatedDevice = await prisma.device.update({
    where: {
      userId_deviceId: {
        userId,
        deviceId,
      },
    },
    data: {
      token: token ?? device.token,
      type: type ?? device.type,
    },
  });

  res.status(httpStatus.OK).json(updatedDevice);
});

/**
 * @swagger
 * /api/users/devices/{token}:
 *   delete:
 *     summary: Remove device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Success
 *       403:
 *         description: Forbidden
 */
export const removeDevice = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await prisma.device.deleteMany({
    where: { userId },
  });

  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @swagger
 * /api/users/devices:
 *   get:
 *     summary: Get user devices
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
export const getDevices = catchAsync(async (req: Request, res: Response) => {
  const devices = await prisma.device.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });

  res.status(httpStatus.OK).json(devices);
});

/**
 * @swagger
 * /api/users/devices/public:
 *   post:
 *     summary: Add device publicly (testing)
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 *       201:
 *         description: Created
 */
export const addDevicePublic = catchAsync(
  async (req: Request, res: Response) => {
    const { token, type, clerkId } = req.body;

    let userId: string | null = null;
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });
      if (user) {
        userId = user.id;
      }
    }

    const existingDevice = await prisma.device.findFirst({
      where: { token },
    });

    if (existingDevice) {
      if (userId && existingDevice.userId === userId) {
        res.status(httpStatus.OK).json(existingDevice);
        return;
      }

      const device = await prisma.device.update({
        where: { id: existingDevice.id },
        data: {
          userId: userId || existingDevice.userId,
          type: type || existingDevice.type,
        },
      });
      res.status(httpStatus.OK).json(device);
      return;
    }

    if (!userId) {
      const error: AppError = new Error(
        "Cannot create device without a valid user",
      );
      error.statusCode = httpStatus.BAD_REQUEST;
      throw error;
    }

    const device = await prisma.device.create({
      data: {
        deviceId: token,
        token,
        type,
        userId,
      },
    });

    res.status(httpStatus.CREATED).json(device);
  },
);
