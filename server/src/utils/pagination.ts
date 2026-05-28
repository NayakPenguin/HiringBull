/**
 * Pagination utility for Prisma queries
 */

interface PaginationQuery {
  page?: string;
  limit?: string;
  [key: string]: unknown;
}

interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Extract pagination params from request query
 */
export const getPagination = (
  query: PaginationQuery,
  options: PaginationOptions = {},
): PaginationResult => {
  const { defaultLimit = 20, maxLimit = 100 } = options;

  let page = parseInt(query.page as string, 10) || 1;
  let limit = parseInt(query.limit as string, 10) || defaultLimit;

  // Ensure valid values
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), maxLimit);

  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
};

/**
 * Create pagination metadata for response
 */
export const getPaginationMeta = (
  totalCount: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
