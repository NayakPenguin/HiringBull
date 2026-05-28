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
 * /api/social-posts:
 *   get:
 *     summary: Get all social posts
 *     tags: [Social Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *       - in: query
 *         name: company
 *         schema: { type: string }
 *       - in: query
 *         name: segment
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
export const getAllSocialPosts = catchAsync(
  async (req: Request, res: Response) => {
    const { source, company, segment } = req.query;
    const { skip, take, page, limit } = getPagination(
      req.query as Record<string, string | undefined>,
    );

    // Build filter
    const where: Record<string, unknown> = {};
    if (source) {
      where.source = source;
    }
    if (company) {
      where.company = company;
    }
    if (segment) {
      where.segment = segment;
    }

    // Get total count for pagination
    const totalCount = await prisma.socialPost.count({ where });

    // Get paginated posts
    const posts = await prisma.socialPost.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: "desc" },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);

    res.status(httpStatus.OK).json({
      data: posts,
      pagination,
    });
  },
);

/**
 * @swagger
 * /api/social-posts/all:
 *   get:
 *     summary: Get all social posts (no filters)
 *     tags: [Social Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
export const getAllSocialPostsOnly = catchAsync(
  async (req: Request, res: Response) => {
    const { skip, take, page, limit } = getPagination(
      req.query as Record<string, string | undefined>,
    );

    // Get total count for pagination
    const totalCount = await prisma.socialPost.count();

    // Get paginated posts
    const posts = await prisma.socialPost.findMany({
      skip,
      take,
      orderBy: { created_at: "desc" },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);

    res.status(httpStatus.OK).json({
      data: posts,
      pagination,
    });
  },
);

/**
 * @swagger
 * /api/social-posts/{id}:
 *   get:
 *     summary: Get social post by ID
 *     tags: [Social Posts]
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
export const getSocialPostById = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const post = await prisma.socialPost.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                img_url: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Social post not found" });
      return;
    }

    res.status(httpStatus.OK).json(post);
  },
);

/**
 * @swagger
 * /api/social-posts/bulk:
 *   post:
 *     summary: Bulk create social posts (admin)
 *     tags: [Social Posts]
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
 *     responses:
 *       201:
 *         description: Created
 */
export const bulkCreateSocialPosts = catchAsync(
  async (req: Request, res: Response) => {
    const postsData = req.body;

    const count = await prisma.socialPost.createMany({
      data: postsData,
      skipDuplicates: true,
    });

    res.status(httpStatus.CREATED).json({
      message: "Bulk social post creation completed",
      count: count.count,
    });
  },
);
