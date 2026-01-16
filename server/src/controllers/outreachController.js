import prisma from '../prismaClient.js';

/**
 * @swagger
 * /api/outreach:
 *   post:
 *     summary: Create outreach request
 *     description: Create a new outreach request. Maximum 3 requests per month per user.
 *     tags: [Outreach]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - companyName
 *               - reason
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "recruiter@company.com"
 *               companyName:
 *                 type: string
 *                 example: "Google"
 *               reason:
 *                 type: string
 *                 description: Required field explaining why you're reaching out
 *                 example: "I'm interested in the software engineer position"
 *               jobId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               resumeLink:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/resume.pdf"
 *               message:
 *                 type: string
 *                 example: "I have 2 years of experience in full-stack development"
 *     responses:
 *       201:
 *         description: Outreach request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OutreachRequest'
 *       403:
 *         description: Forbidden - Monthly limit reached
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Monthly outreach limit reached (3 requests)"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const createOutreachRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, companyName, reason, jobId, resumeLink, message } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch token count
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { tokens_left: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2️⃣ Enforce token availability
      if (user.tokens_left <= 0) {
        return { error: 'NO_TOKENS' };
      }

      // 3️⃣ Decrement token
      await tx.user.update({
        where: { id: userId },
        data: {
          tokens_left: { decrement: 1 },
        },
      });

      // 4️⃣ Create outreach request
      const outreach = await tx.outreachRequest.create({
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

      return { outreach };
    });

    if (result?.error === 'NO_TOKENS') {
      return res.status(403).json({
        message: 'No tokens left',
      });
    }

    return res.status(201).json(result.outreach);
  } catch (error) {
    console.error('Create outreach error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/outreach/me:
 *   get:
 *     summary: Get my outreach requests
 *     description: Retrieve all outreach requests for the authenticated user
 *     tags: [Outreach]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Outreach requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OutreachRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/outreach/{id}:
 *   get:
 *     summary: Get outreach by ID
 *     description: Retrieve a specific outreach request by ID (user can only access their own)
 *     tags: [Outreach]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Outreach request UUID
 *     responses:
 *       200:
 *         description: Outreach request found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OutreachRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Outreach request not found
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /api/outreach/admin/pending:
 *   get:
 *     summary: Get pending outreach requests
 *     description: Retrieve all pending outreach requests (admin only, requires API key)
 *     tags: [Outreach]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Pending outreach requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OutreachRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /api/outreach/admin/{id}/status:
 *   patch:
 *     summary: Update outreach status
 *     description: Update the status of an outreach request (admin only, requires API key)
 *     tags: [Outreach]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Outreach request UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['APPROVED', 'REJECTED', 'SENT']
 *                 description: New status for the outreach request
 *             example:
 *               status: "APPROVED"
 *     responses:
 *       200:
 *         description: Outreach status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OutreachRequest'
 *       400:
 *         description: Bad request - Invalid status value
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       500:
 *         description: Internal server error
 */
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
