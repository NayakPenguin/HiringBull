import prisma from '../prismaClient.js';
import httpStatus from 'http-status';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * @swagger
 * /api/social-posts:
 *   get:
 *     summary: Get all social posts
 *     description: Retrieve social posts with filtering and pagination
 *     tags: [Social Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source/platform
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company name
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *           enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS']
 *         description: Filter by experience segment
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
 *         description: Social posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SocialPost'
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
 */
export const getAllSocialPosts = catchAsync(async (req, res) => {
    const { source, company, segment } = req.query;
    const { skip, take, page, limit } = getPagination(req.query);

    // Build filter
    const where = {};
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
        orderBy: { created_at: 'desc' },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);

    res.status(httpStatus.OK).json({
        data: posts,
        pagination,
    });
});

/**
 * @swagger
 * /api/social-posts/all:
 *   get:
 *     summary: Get all social posts (no filters)
 *     description: Retrieve all social posts with pagination, no filtering applied
 *     tags: [Social Posts]
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
 *         description: Social posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SocialPost'
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
 */
export const getAllSocialPostsOnly = catchAsync(async (req, res) => {
    const { skip, take, page, limit } = getPagination(req.query);

    // Get total count for pagination
    const totalCount = await prisma.socialPost.count();

    // Get paginated posts
    const posts = await prisma.socialPost.findMany({
        skip,
        take,
        orderBy: { created_at: 'desc' },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);

    res.status(httpStatus.OK).json({
        data: posts,
        pagination,
    });
});

/**
 * @swagger
 * /api/social-posts/{id}:
 *   get:
 *     summary: Get social post by ID
 *     description: Retrieve a specific social post by its UUID with comments
 *     tags: [Social Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Social post UUID
 *     responses:
 *       200:
 *         description: Social post found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SocialPost'
 *                 - type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               img_url:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Social post not found
 */
export const getSocialPostById = catchAsync(async (req, res) => {
    const { id } = req.params;
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
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!post) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Social post not found' });
    }

    res.status(httpStatus.OK).json(post);
});

/**
 * @swagger
 * /api/social-posts/bulk:
 *   post:
 *     summary: Bulk create social posts
 *     description: Create multiple social posts at once (admin only, requires API key)
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
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Career Tips 2024"
 *                 content:
 *                   type: string
 *                   example: "Here are some amazing career tips..."
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/image.jpg"
 *                 videoUrl:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/video.mp4"
 *                 companyId:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 segment:
 *                   type: string
 *                   enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS']
 *                   example: "INTERNSHIP"
 *                 platform:
 *                   type: string
 *                   example: "LinkedIn"
 *                 link:
 *                   type: string
 *                   format: uri
 *                   example: "https://linkedin.com/post/123"
 *                 likesCount:
 *                   type: integer
 *                   example: 100
 *                 commentsCount:
 *                   type: integer
 *                   example: 25
 *             example:
 *               - title: "Career Tips 2024"
 *                 content: "Here are some amazing career tips..."
 *                 companyId: "550e8400-e29b-41d4-a716-446655440000"
 *                 segment: "INTERNSHIP"
 *                 platform: "LinkedIn"
 *                 link: "https://linkedin.com/post/123"
 *                 likesCount: 100
 *                 commentsCount: 25
 *     responses:
 *       201:
 *         description: Social posts created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                   description: Number of created posts
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const bulkCreateSocialPosts = catchAsync(async (req, res) => {
    const postsData = req.body;

    const count = await prisma.socialPost.createMany({
        data: postsData,
        skipDuplicates: true,
    });

    res.status(httpStatus.CREATED).json({
        message: 'Bulk social post creation completed',
        count: count.count,
    });
});
