import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

interface HttpError extends Error {
  statusCode?: number;
  status?: number;
}

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  res
    .status(httpStatus.NOT_FOUND)
    .json({ code: httpStatus.NOT_FOUND, message: "Not Found" });
};

export const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(err);
  const statusCode =
    err.statusCode ||
    err.status ||
    (httpStatus.INTERNAL_SERVER_ERROR as number);
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
