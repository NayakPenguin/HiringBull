import prisma from '../prismaClient.js';
import httpStatus from 'http-status';

const catchAsync = (fn) => (req, res, next) => {
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               currentPlan:
 *                 type: string
 *                 enum: ['ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH']
 *                 example: "ONE_MONTH"
 *               planStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *               planEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-02-01T00:00:00Z"
 *               paidAmount:
 *                 type: number
 *                 format: float
 *                 example: 99.99
 *               referralCode:
 *                 type: string
 *                 example: "REF123"
 *             example:
 *               email: "user@example.com"
 *               currentPlan: "ONE_MONTH"
 *               planStart: "2024-01-01T00:00:00Z"
 *               planEnd: "2024-02-01T00:00:00Z"
 *               paidAmount: 99.99
 *               referralCode: "REF123"
 *     responses:
 *       201:
 *         description: Web registration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebRegistration'
 *       400:
 *         description: Bad request - User already registered
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const createWebRegistration = catchAsync(async (req, res) => {
    const { email, currentPlan, planStart, planEnd, paidAmount, referralCode } = req.body;

    const existingRegistration = await prisma.webRegistration.findUnique({
        where: { email }
    });

    if (existingRegistration) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'User is already registered'
        });
    }

    const registration = await prisma.webRegistration.create({
        data: {
            email,
            currentPlan,
            planStart: new Date(planStart),
            planEnd: new Date(planEnd),
            paidAmount,
            referralCode
        }
    });

    res.status(httpStatus.CREATED).json(registration);
});

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
 *         description: Email to check registration status
 *     responses:
 *       200:
 *         description: Registration status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     registered:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: "User is not registered"
 *                 - type: object
 *                   properties:
 *                     registered:
 *                       type: boolean
 *                       example: true
 *                     isPlanActive:
 *                       type: boolean
 *                       example: true
 *                     registration:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           format: email
 *                         currentPlan:
 *                           type: string
 *                           enum: ['ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH']
 *                         planStart:
 *                           type: string
 *                           format: date-time
 *                         planEnd:
 *                           type: string
 *                           format: date-time
 *                         paidAmount:
 *                           type: number
 *                           format: float
 *                         referralCode:
 *                           type: string
 */
export const checkWebRegistration = catchAsync(async (req, res) => {
    const { email } = req.query;

    const registration = await prisma.webRegistration.findUnique({
        where: { email }
    });

    if (!registration) {
        return res.status(httpStatus.OK).json({
            registered: false,
            message: 'User is not registered'
        });
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
            referralCode: registration.referralCode
        }
    });
});

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
 *         description: User email
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPlan:
 *                 type: string
 *                 enum: ['ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH']
 *                 example: "THREE_MONTH"
 *               planStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *               planEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-04-01T00:00:00Z"
 *               paidAmount:
 *                 type: number
 *                 format: float
 *                 example: 199.99
 *               referralCode:
 *                 type: string
 *                 example: "NEWREF456"
 *             example:
 *               planEnd: "2024-04-01T00:00:00Z"
 *               paidAmount: 199.99
 *     responses:
 *       200:
 *         description: Web registration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebRegistration'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       404:
 *         description: Registration not found
 */
export const updateWebRegistration = catchAsync(async (req, res) => {
    const { email } = req.params;
    const updateBody = req.body;

    const registration = await prisma.webRegistration.findUnique({
        where: { email }
    });

    if (!registration) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Registration not found'
        });
    }

    const data = { ...updateBody };
    if (updateBody.planStart) {
        data.planStart = new Date(updateBody.planStart);
    }
    if (updateBody.planEnd) {
        data.planEnd = new Date(updateBody.planEnd);
    }

    const updatedRegistration = await prisma.webRegistration.update({
        where: { email },
        data
    });

    res.status(httpStatus.OK).json(updatedRegistration);
});

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
 *         description: User email
 *     responses:
 *       204:
 *         description: Web registration deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       404:
 *         description: Registration not found
 */
export const deleteWebRegistration = catchAsync(async (req, res) => {
    const { email } = req.params;

    const registration = await prisma.webRegistration.findUnique({
        where: { email }
    });

    if (!registration) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Registration not found'
        });
    }

    await prisma.webRegistration.delete({
        where: { email }
    });

    res.status(httpStatus.NO_CONTENT).send();
});

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebRegistration'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const getWebRegistrations = catchAsync(async (req, res) => {
    const registrations = await prisma.webRegistration.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.status(httpStatus.OK).json(registrations);
});