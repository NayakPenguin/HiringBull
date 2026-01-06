import prisma from '../prismaClient.js';
import httpStatus from 'http-status';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Get all social posts with filtering and pagination
 * Query params: source, company, segment, page, limit
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
 * Get all social posts with pagination only (no filters)
 * Query params: page, limit
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
 * Get a single social post by ID
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
 * Bulk create social posts (internal/admin use only)
 * Protected by API key middleware
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
