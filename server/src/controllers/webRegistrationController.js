import prisma from '../prismaClient.js';
import httpStatus from 'http-status';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

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

export const getWebRegistrations = catchAsync(async (req, res) => {
    const registrations = await prisma.webRegistration.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.status(httpStatus.OK).json(registrations);
});