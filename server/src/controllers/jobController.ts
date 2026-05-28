import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient.js";
import httpStatus from "http-status";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

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
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with filtering and pagination
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: segment
 *         schema: { type: string, enum: [INTERNSHIP, FRESHER_OR_LESS_THAN_1_YEAR, ONE_TO_THREE_YEARS] }
 *       - in: query
 *         name: companyId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Onboarding required
 */
export const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const { segment, companyId } = req.query;
  const { skip, take, page, limit } = getPagination(
    req.query as Record<string, string | undefined>,
  );

  // Get user's experience level
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { experience_level: true },
  });

  // Require onboarding completion
  if (!user || !user.experience_level) {
    res.status(403).json({
      code: "ONBOARDING_REQUIRED",
      message: "Please complete your profile to access jobs",
    });
    return;
  }

  // Build filter - auto-filter by user's experience level
  const where: Record<string, unknown> = {
    segment: segment || user.experience_level, // Use query param if provided, else user's level
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
    orderBy: { created_at: "desc" },
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

export const getAllFreeJobs = catchAsync(
  async (req: Request, res: Response) => {
    const { skip, take, page, limit } = getPagination(
      req.query as Record<string, string | undefined>,
    );

    // Total jobs count
    const totalCount = await prisma.job.count();

    // Fetch all jobs (no filters)
    const jobs = await prisma.job.findMany({
      skip,
      take,
      orderBy: { created_at: "desc" },
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
  },
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
export const getJobById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
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
    res.status(httpStatus.NOT_FOUND).json({ message: "Job not found" });
    return;
  }

  res.status(httpStatus.OK).json(job);
});

/**
 * @swagger
 * /api/jobs/bulk:
 *   post:
 *     summary: Bulk create jobs (admin only)
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
 *               required: [title, companyId, segment]
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
export const bulkCreateJobs = catchAsync(
  async (req: Request, res: Response) => {
    const jobsData = req.body as Array<{
      title: string;
      companyId: string;
      segment: string;
      careerpage_link?: string;
      created_by?: string;
      tags?: string[];
      company?: string;
    }>;
    const validJobs: Array<(typeof jobsData)[number] & { company: string }> =
      [];
    const errors: Array<{
      job: { title: string; companyId: string };
      reason: string;
    }> = [];

    // Extract unique company IDs
    const uniqueCompanyIds = [...new Set(jobsData.map((job) => job.companyId))];

    // Fetch all companies in one query
    const companies = await prisma.company.findMany({
      where: { id: { in: uniqueCompanyIds } },
      select: { id: true, name: true },
    });

    // Create a map for quick lookup
    const companyMap = Object.fromEntries(
      companies.map((c: { id: string; name: string }) => [c.id, c.name]),
    );

    // Validate each job and enrich with company name
    for (const job of jobsData) {
      const companyName = companyMap[job.companyId];

      if (!companyName) {
        errors.push({
          job: { title: job.title, companyId: job.companyId },
          reason: `Company not found with ID: ${job.companyId}`,
        });
        continue;
      }

      validJobs.push({
        ...job,
        company: companyName,
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
      const { sendJobNotificationToFollowers } =
        await import("../utils/notificationService.js");

      for (const job of validJobs) {
        try {
          const createdJob = await prisma.job.findFirst({
            where: {
              title: job.title,
              company: job.company,
              companyId: job.companyId,
            },
            orderBy: { created_at: "desc" },
          });

          if (createdJob) {
            await sendJobNotificationToFollowers(job.companyId, {
              ...createdJob,
              companyId: createdJob.companyId ?? undefined,
              segment: createdJob.segment ?? undefined,
            });
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `Failed to send notifications for job ${job.title}:`,
            message,
          );
        }
      }
    }

    res.status(httpStatus.CREATED).json({
      message: "Bulk job creation completed",
      success: createdCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  },
);

/**
 * @swagger
 * /api/jobs/followed:
 *   get:
 *     summary: Get jobs from followed companies
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Onboarding required
 */
export const getJobsFromFollowedCompanies = catchAsync(
  async (req: Request, res: Response) => {
    const { skip, take, page, limit } = getPagination(
      req.query as Record<string, string | undefined>,
    );

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        followedCompanies: { select: { id: true } },
        experience_level: true,
      },
    });

    if (!user) {
      res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Require onboarding completion
    if (!user.experience_level) {
      res.status(403).json({
        code: "ONBOARDING_REQUIRED",
        message: "Please complete your profile to access jobs",
      });
      return;
    }

    const followedCompanyIds = user.followedCompanies.map(
      (c: { id: string }) => c.id,
    );

    if (followedCompanyIds.length === 0) {
      res.status(httpStatus.OK).json({
        data: [],
        pagination: getPaginationMeta(0, page, limit),
      });
      return;
    }

    // Strict filtering: only followed companies + user's experience level
    const where = {
      companyId: { in: followedCompanyIds },
      segment: user.experience_level,
    };

    const totalCount = await prisma.job.count({ where });

    const jobs = await prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: "desc" },
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
  },
);
