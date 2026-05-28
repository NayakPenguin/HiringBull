import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient.js";
import httpStatus from "http-status";

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

/**
 * @swagger
 * /api/web-registration:
 *   post:
 *     summary: Create web registration
 *     description: Create a new web registration (admin only, requires API key)
 *     tags: [Web Registration]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - currentPlan
 *               - planStart
 *               - planEnd
 *               - paidAmount
 *     responses:
 *       201:
 *         description: Web registration created successfully
 *       400:
 *         description: Bad request - User already registered
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const createWebRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const { email, currentPlan, planStart, planEnd, paidAmount, referralCode } =
      req.body;

    const existingRegistration = await prisma.webRegistration.findUnique({
      where: { email },
    });

    if (existingRegistration) {
      res.status(httpStatus.BAD_REQUEST).json({
        message: "User is already registered",
      });
      return;
    }

    const registration = await prisma.webRegistration.create({
      data: {
        email,
        currentPlan,
        planStart: new Date(planStart),
        planEnd: new Date(planEnd),
        paidAmount,
        referralCode,
      },
    });

    res.status(httpStatus.CREATED).json(registration);
  },
);

/**
 * @swagger
 * /api/web-registration/check:
 *   get:
 *     summary: Check web registration
 *     description: Check if an email is registered and if their plan is active (public endpoint)
 *     tags: [Web Registration]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Registration status retrieved
 */
export const checkWebRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.query as { email?: string };

    const registration = await prisma.webRegistration.findUnique({
      where: { email: email! },
    });

    if (!registration) {
      res.status(httpStatus.OK).json({
        registered: false,
        message: "User is not registered",
      });
      return;
    }

    const now = new Date();
    const isPlanActive = registration.planEnd > now;

    res.status(httpStatus.OK).json({
      registered: true,
      isPlanActive,
      registration: {
        email: registration.email,
        currentPlan: registration.currentPlan,
        planStart: registration.planStart,
        planEnd: registration.planEnd,
        paidAmount: registration.paidAmount,
        referralCode: registration.referralCode,
      },
    });
  },
);

/**
 * @swagger
 * /api/web-registration/{email}:
 *   put:
 *     summary: Update web registration
 *     description: Update an existing web registration by email (admin only, requires API key)
 *     tags: [Web Registration]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Web registration updated successfully
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       404:
 *         description: Registration not found
 */
export const updateWebRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const updateBody = req.body;

    const registration = await prisma.webRegistration.findUnique({
      where: { email },
    });

    if (!registration) {
      res.status(httpStatus.NOT_FOUND).json({
        message: "Registration not found",
      });
      return;
    }

    const data: Record<string, unknown> = { ...updateBody };
    if (updateBody.planStart) {
      data.planStart = new Date(updateBody.planStart);
    }
    if (updateBody.planEnd) {
      data.planEnd = new Date(updateBody.planEnd);
    }

    const updatedRegistration = await prisma.webRegistration.update({
      where: { email },
      data,
    });

    res.status(httpStatus.OK).json(updatedRegistration);
  },
);

/**
 * @swagger
 * /api/web-registration/{email}:
 *   delete:
 *     summary: Delete web registration
 *     description: Delete a web registration by email (admin only, requires API key)
 *     tags: [Web Registration]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       204:
 *         description: Web registration deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       404:
 *         description: Registration not found
 */
export const deleteWebRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.params.email as string;

    const registration = await prisma.webRegistration.findUnique({
      where: { email },
    });

    if (!registration) {
      res.status(httpStatus.NOT_FOUND).json({
        message: "Registration not found",
      });
      return;
    }

    await prisma.webRegistration.delete({
      where: { email },
    });

    res.status(httpStatus.NO_CONTENT).send();
  },
);

/**
 * @swagger
 * /api/web-registration:
 *   get:
 *     summary: Get all web registrations
 *     description: Retrieve all web registrations (admin only, requires API key)
 *     tags: [Web Registration]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Web registrations retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const getWebRegistrations = catchAsync(
  async (_req: Request, res: Response) => {
    const registrations = await prisma.webRegistration.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(httpStatus.OK).json(registrations);
  },
);
