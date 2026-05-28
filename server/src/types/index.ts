import { Request, Response, NextFunction } from "express";

// ─── Express Augmentation ────────────────────────────────────────────────────
// This lets us use `req.user` and `req.rawBody` across the app without casting.

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      rawBody?: Buffer;
    }
  }
}

// ─── User payload attached by auth middleware ────────────────────────────────

export interface UserPayload {
  id: string;
  clerkId?: string | null;
  provider?: string | null;
  providerId?: string | null;
  name: string;
  email: string;
  img_url?: string | null;
  active: boolean;
  is_experienced: boolean;
  college_name?: string | null;
  cgpa?: string | null;
  company_name?: string | null;
  years_of_experience?: number | null;
  resume_link?: string | null;
  segment?: string | null;
  experience_level?: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at?: Date | null;
  promo_code?: string | null;
  promo_code_used?: string | null;
  tokens_left?: number | null;
  tokens_last_update?: Date | null;
  total_paid?: number | null;
  last_paid?: number | null;
  current_plan_start?: Date | null;
  current_plan_end?: Date | null;
  created_at: Date;
  updated_at: Date;
  expiry?: Date | null;
  isPaid: boolean;
  planExpiry?: Date | null;
}

// ─── Environment Config ──────────────────────────────────────────────────────

export interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  GOOGLE_CLIENT_ID_ANDROID?: string;
  GOOGLE_CLIENT_ID_IOS?: string;
  GOOGLE_CLIENT_ID_WEB?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  GOOGLE_PLAY_SERVICE_ACCOUNT_KEY?: string;
  SERVER_URL?: string;
  PORT?: string;
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Custom App Error ────────────────────────────────────────────────────────

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// ─── Async Handler / catchAsync type ─────────────────────────────────────────

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

export type CatchAsyncFn = (
  fn: AsyncRequestHandler,
) => (req: Request, res: Response, next: NextFunction) => void;

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Pagination Options ──────────────────────────────────────────────────────

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

// ─── Device ──────────────────────────────────────────────────────────────────

export interface DeviceInfo {
  token: string;
  type?: string;
}

// ─── JWT Payload ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email?: string | null;
  iat?: number;
  exp?: number;
}
