import { prisma } from '../config/prisma.js';
 
export const createOutreachRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, companyName, reason, jobId, resumeLink, message } = req.body;

        // 1. Enforce monthly limit (max 3)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyCount = await prisma.outreachRequest.count({
            where: {
                userId,
                createdAt: { gte: startOfMonth },
            },
        });

        if (monthlyCount >= 3) {
            return res.status(403).json({
                message: 'Monthly outreach limit reached (3 requests)',
            });
        }

        // 2. Create outreach request
        const outreach = await prisma.outreachRequest.create({
            data: {
                userId,
                email,
                companyName,
                reason,
                jobId,
                resumeLink,
                message,
            },
        });

        return res.status(201).json(outreach);
    } catch (error) {
        console.error('Create outreach error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyOutreachRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const outreaches = await prisma.outreachRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json(outreaches);
    } catch (error) {
        console.error('Get my outreaches error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOutreachById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const outreach = await prisma.outreachRequest.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!outreach) {
            return res.status(404).json({ message: 'Outreach request not found' });
        }

        return res.status(200).json(outreach);
    } catch (error) {
        console.error('Get outreach error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const getPendingOutreachRequests = async (req, res) => {
    try {
        const pending = await prisma.outreachRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
        });

        return res.status(200).json(pending);
    } catch (error) {
        console.error('Get pending outreaches error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateOutreachStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['APPROVED', 'REJECTED', 'SENT'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const updateData = {
            status,
            reviewedAt: new Date(),
        };

        if (status === 'SENT') {
            updateData.sentAt = new Date();
        }

        const outreach = await prisma.outreachRequest.update({
            where: { id },
            data: updateData,
        });

        return res.status(200).json(outreach);
    } catch (error) {
        console.error('Update outreach status error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
