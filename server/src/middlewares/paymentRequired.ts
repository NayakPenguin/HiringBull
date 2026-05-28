import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import prisma from "../prismaClient.js";

export const paymentRequired = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // requireAuth must run before this middleware (sets req.user)
  const userId = req.user?.id;

  if (!userId) {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Authentication required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: "User not found" });
    return;
  }

  if (user.isPaid) {
    // user.isPaid is true, check expiry if needed
    if (user.planExpiry && new Date() > user.planExpiry) {
      res
        .status(httpStatus.PAYMENT_REQUIRED)
        .json({ message: "Plan expired. Please pay again." });
      return;
    }
    next();
    return;
  }

  res
    .status(httpStatus.PAYMENT_REQUIRED)
    .json({ message: "Payment required to access this resource" });
};
