import prisma from '../prismaClient.js';
import httpStatus from 'http-status';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     description: Retrieve jobs with filtering and pagination. Auto-filters by user's experience level if segment not provided.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *           enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS']
 *         description: Filter by experience segment (if not provided, uses user's level)
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by company ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Job'
 *                       - type: object
 *                         properties:
 *                           companyRel:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               logo:
 *                                 type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Onboarding required
 */
export const getAllJobs = catchAsync(async (req, res) => {
    const { segment, companyId } = req.query;
    const { skip, take, page, limit } = getPagination(req.query);

    // Get user's experience level
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { experience_level: true }
    });

    // Require onboarding completion
    if (!user || !user.experience_level) {
        return res.status(403).json({
            code: 'ONBOARDING_REQUIRED',
            message: 'Please complete your profile to access jobs'
        });
    }

    // Build filter - auto-filter by user's experience level
    const where = {
        segment: segment || user.experience_level  // Use query param if provided, else user's level
    };

    if (companyId) {
        where.companyId = companyId;
    }

    // Get total count for pagination
    const totalCount = await prisma.job.count({ where });

    // Get paginated jobs
    const jobs = await prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
            companyRel: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);

    res.status(httpStatus.OK).json({
        data: jobs,
        pagination,
    });
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     description: Retrieve a specific job by its UUID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job UUID
 *     responses:
 *       200:
 *         description: Job found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Job'
 *                 - type: object
 *                   properties:
 *                     companyRel:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         logo:
 *                           type: string
 *                         description:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
export const getJobById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            companyRel: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    description: true,
                },
            },
        },
    });

    if (!job) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Job not found' });
    }

    res.status(httpStatus.OK).json(job);
});

/**
 * @swagger
 * /api/jobs/bulk:
 *   post:
 *     summary: Bulk create jobs
 *     description: Create multiple jobs at once (admin only, requires API key). Sends notifications to company followers.
 *     tags: [Jobs]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - title
 *                 - companyId
 *                 - segment
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Software Engineer Intern"
 *                 companyId:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 segment:
 *                   type: string
 *                   enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS']
 *                   example: "INTERNSHIP"
 *                 careerpage_link:
 *                   type: string
 *                   format: uri
 *                   example: "https://company.com/careers/job-123"
 *                 created_by:
 *                   type: string
 *                   example: "admin"
 *             example:
 *               - title: "Software Engineer Intern"
 *                 companyId: "550e8400-e29b-41d4-a716-446655440000"
 *                 segment: "INTERNSHIP"
 *                 careerpage_link: "https://company.com/careers/job-123"
 *               - title: "Frontend Developer"
 *                 companyId: "550e8400-e29b-41d4-a716-446655440001"
 *                 segment: "ONE_TO_THREE_YEARS"
 *     responses:
 *       201:
 *         description: Jobs created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: integer
 *                   description: Number of successfully created jobs
 *                 failed:
 *                   type: integer
 *                   description: Number of failed job creations
 *                 errors:
 *                   type: array
 *                   description: Array of errors (if any)
 *                   items:
 *                     type: object
 *                     properties:
 *                       job:
 *                         type: object
 *                       reason:
 *                         type: string
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       400:
 *         description: Bad request
 */
export const bulkCreateJobs = catchAsync(async (req, res) => {
    const jobsData = req.body;
    const validJobs = [];
    const errors = [];

    // Extract unique company IDs
    const uniqueCompanyIds = [...new Set(jobsData.map(job => job.companyId))];

    // Fetch all companies in one query
    const companies = await prisma.company.findMany({
        where: { id: { in: uniqueCompanyIds } },
        select: { id: true, name: true }
    });

    // Create a map for quick lookup
    const companyMap = Object.fromEntries(companies.map(c => [c.id, c.name]));

    // Validate each job and enrich with company name
    for (const job of jobsData) {
        const companyName = companyMap[job.companyId];

        if (!companyName) {
            errors.push({
                job: { title: job.title, companyId: job.companyId },
                reason: `Company not found with ID: ${job.companyId}`
            });
            continue;
        }

        validJobs.push({
            ...job,
            company: companyName
        });
    }

    let createdCount = 0;

    // Create valid jobs
    if (validJobs.length > 0) {
        const result = await prisma.job.createMany({
            data: validJobs,
            skipDuplicates: true,
        });
        createdCount = result.count;

        // Send notifications for each valid job
        const { sendJobNotificationToFollowers } = await import('../utils/notificationService.js');

        for (const job of validJobs) {
            try {
                const createdJob = await prisma.job.findFirst({
                    where: {
                        title: job.title,
                        company: job.company,
                        companyId: job.companyId
                    },
                    orderBy: { created_at: 'desc' }
                });

                if (createdJob) {
                    await sendJobNotificationToFollowers(job.companyId, createdJob);
                }
            } catch (error) {
                console.error(`Failed to send notifications for job ${job.title}:`, error.message);
            }
        }
    }

    res.status(httpStatus.CREATED).json({
        message: 'Bulk job creation completed',
        success: createdCount,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
    });
});

/**
 * @swagger
 * /api/jobs/followed:
 *   get:
 *     summary: Get jobs from followed companies
 *     description: Retrieve jobs from companies the user follows, filtered by user's experience level
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Job'
 *                       - type: object
 *                         properties:
 *                           companyRel:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               logo:
 *                                 type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Onboarding required
 *       404:
 *         description: User not found
 */
export const getJobsFromFollowedCompanies = catchAsync(async (req, res) => {
    const { skip, take, page, limit } = getPagination(req.query);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            followedCompanies: { select: { id: true } },
            experience_level: true
        }
    });

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    // Require onboarding completion
    if (!user.experience_level) {
        return res.status(403).json({
            code: 'ONBOARDING_REQUIRED',
            message: 'Please complete your profile to access jobs'
        });
    }

    const followedCompanyIds = user.followedCompanies.map(c => c.id);

    if (followedCompanyIds.length === 0) {
        return res.status(httpStatus.OK).json({
            data: [],
            pagination: getPaginationMeta(0, page, limit),
        });
    }

    // Strict filtering: only followed companies + user's experience level
    const where = {
        companyId: { in: followedCompanyIds },
        segment: user.experience_level
    };

    const totalCount = await prisma.job.count({ where });

    const jobs = await prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
            companyRel: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);

    res.status(httpStatus.OK).json({
        data: jobs,
        pagination,
    });
});
