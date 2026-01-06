import prisma from '../prismaClient.js';
import httpStatus from 'http-status';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Get all jobs with filtering and pagination
 * Query params: segment, companyId, page, limit
 */
export const getAllJobs = catchAsync(async (req, res) => {
    const { segment, companyId } = req.query;
    const { skip, take, page, limit } = getPagination(req.query);

    // Build filter
    const where = {};
    if (segment) {
        where.segment = segment;
    }
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
 * Get a single job by ID
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
 * Bulk create jobs (internal/admin use only)
 * Protected by API key middleware
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
 * Get jobs from user's followed companies
 * Query params: segment, page, limit
 */
export const getJobsFromFollowedCompanies = catchAsync(async (req, res) => {
    const { segment } = req.query;
    const { skip, take, page, limit } = getPagination(req.query);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { followedCompanies: { select: { id: true } } }
    });

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    const followedCompanyIds = user.followedCompanies.map(c => c.id);

    if (followedCompanyIds.length === 0) {
        return res.status(httpStatus.OK).json({
            data: [],
            pagination: getPaginationMeta(0, page, limit),
        });
    }

    const where = {
        companyId: { in: followedCompanyIds }
    };

    if (segment) {
        where.segment = segment;
    }

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
