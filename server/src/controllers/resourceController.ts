import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import prisma from "../prismaClient.js";
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
 * GET /api/resources
 * List curated learning resources with filters, search & bookmark flag.
 */
export const listResources = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { category, type, difficulty, search, bookmarkedOnly } = req.query;
  const { skip, take, page, limit } = getPagination(
    req.query as Record<string, string | undefined>,
  );

  const where: Record<string, unknown> = { is_active: true };
  if (category) where.category = category;
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (search && (search as string).trim().length > 0) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { has: (search as string).toLowerCase() } },
    ];
  }

  if (bookmarkedOnly && userId) {
    where.bookmarks = { some: { userId } };
  }

  const [totalCount, resources] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      skip,
      take,
      orderBy: [{ is_curated: "desc" }, { created_at: "desc" }],
      include: userId
        ? {
            bookmarks: {
              where: { userId },
              select: { id: true },
            },
          }
        : undefined,
    }),
  ]);

  const data = resources.map(
    (r: Record<string, unknown> & { bookmarks?: { id: string }[] }) => {
      const record = r as typeof r & { bookmarks?: { id: string }[] };
      return {
        ...record,
        isBookmarked: userId ? (record.bookmarks?.length ?? 0) > 0 : false,
        bookmarks: undefined,
      };
    },
  );

  res.status(httpStatus.OK).json({
    data,
    pagination: getPaginationMeta(totalCount, page, limit),
  });
});

/**
 * GET /api/resources/categories
 * Returns category counts so the UI can build tabs/filter chips with real numbers.
 */
export const getCategoryCounts = catchAsync(
  async (_req: Request, res: Response) => {
    const counts = await prisma.resource.groupBy({
      by: ["category"],
      where: { is_active: true },
      _count: { _all: true },
    });

    const total = await prisma.resource.count({ where: { is_active: true } });

    res.status(httpStatus.OK).json({
      data: {
        total,
        byCategory: counts.map(
          (c: { category: string; _count: { _all: number } }) => ({
            category: c.category,
            count: c._count._all,
          }),
        ),
      },
    });
  },
);

/**
 * GET /api/resources/:id
 * Get a single resource & increment its view counter.
 */
export const getResourceById = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.id;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: userId
        ? { bookmarks: { where: { userId }, select: { id: true } } }
        : undefined,
    });

    if (!resource || !resource.is_active) {
      res.status(httpStatus.NOT_FOUND).json({ message: "Resource not found" });
      return;
    }

    // fire-and-forget view counter; never blocks the response
    prisma.resource
      .update({ where: { id }, data: { view_count: { increment: 1 } } })
      .catch(() => {});

    const record = resource as typeof resource & {
      bookmarks?: { id: string }[];
    };

    res.status(httpStatus.OK).json({
      data: {
        ...record,
        isBookmarked: userId ? (record.bookmarks?.length ?? 0) > 0 : false,
        bookmarks: undefined,
      },
    });
  },
);

/**
 * POST /api/resources/:id/bookmark
 * Toggle bookmark for current user.
 */
export const toggleBookmark = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource || !resource.is_active) {
      res.status(httpStatus.NOT_FOUND).json({ message: "Resource not found" });
      return;
    }

    const existing = await prisma.resourceBookmark.findUnique({
      where: { userId_resourceId: { userId, resourceId: id } },
    });

    if (existing) {
      await prisma.resourceBookmark.delete({ where: { id: existing.id } });
      res.status(httpStatus.OK).json({ data: { isBookmarked: false } });
      return;
    }

    await prisma.resourceBookmark.create({ data: { userId, resourceId: id } });
    res.status(httpStatus.CREATED).json({ data: { isBookmarked: true } });
  },
);

/**
 * POST /api/resources/bulk  (admin / api-key only)
 * Bulk upsert of curated resources by URL.
 */
export const bulkCreateResources = catchAsync(
  async (req: Request, res: Response) => {
    const items = req.body as Array<{
      title: string;
      description: string;
      url: string;
      category: string;
      type: string;
      author?: string | null;
      source?: string | null;
      thumbnail?: string | null;
      tags?: string[];
      is_free?: boolean;
      is_curated?: boolean;
      language?: string;
      difficulty?: string | null;
      estimated_min?: number | null;
    }>;

    const results = await Promise.all(
      items.map((item) =>
        prisma.resource.upsert({
          where: { url: item.url },
          update: {
            title: item.title,
            description: item.description,
            category: item.category as never,
            type: item.type as never,
            author: item.author ?? null,
            source: item.source ?? null,
            thumbnail: item.thumbnail ?? null,
            tags: item.tags ?? [],
            is_free: item.is_free ?? true,
            is_curated: item.is_curated ?? true,
            language: item.language ?? "en",
            difficulty: item.difficulty ?? null,
            estimated_min: item.estimated_min ?? null,
            is_active: true,
          },
          create: {
            title: item.title,
            description: item.description,
            url: item.url,
            category: item.category as never,
            type: item.type as never,
            author: item.author ?? null,
            source: item.source ?? null,
            thumbnail: item.thumbnail ?? null,
            tags: item.tags ?? [],
            is_free: item.is_free ?? true,
            is_curated: item.is_curated ?? true,
            language: item.language ?? "en",
            difficulty: item.difficulty ?? null,
            estimated_min: item.estimated_min ?? null,
          },
        }),
      ),
    );

    res.status(httpStatus.OK).json({
      data: { count: results.length },
    });
  },
);
