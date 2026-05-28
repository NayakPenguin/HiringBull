import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import prisma from "../prismaClient.js";

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

interface ClerkWebhookEvent {
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    phone_numbers?: Array<{ phone_number: string }>;
  };
  type: string;
}

/**
 * @swagger
 * /api/webhooks/clerk:
 *   post:
 *     summary: Handle Clerk webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid signature
 */
export const handleClerkWebhook = catchAsync(
  async (req: Request, res: Response) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send("Server configuration error");
      return;
    }

    // Get the headers
    const svix_id = req.headers["svix-id"] as string | undefined;
    const svix_timestamp = req.headers["svix-timestamp"] as string | undefined;
    const svix_signature = req.headers["svix-signature"] as string | undefined;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      res
        .status(httpStatus.BAD_REQUEST)
        .send("Error occured -- no svix headers");
      return;
    }

    // Get the body
    const payload = req.body;
    const body = req.rawBody ? req.rawBody.toString() : JSON.stringify(payload);

    // Dynamic import of svix (optional dependency)
    let wh: {
      verify: (body: string, headers: Record<string, string>) => unknown;
    };
    try {
      const svix = await import("svix");
      wh = new svix.Webhook(WEBHOOK_SECRET);
    } catch {
      console.error(
        "svix package not installed - cannot verify webhook signatures",
      );
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send("Webhook verification unavailable");
      return;
    }

    let evt: ClerkWebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Error verifying webhook:", errMsg);
      res.status(httpStatus.BAD_REQUEST).json({ Error: errMsg });
      return;
    }

    const { id: clerkId } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook received: ${eventType} for user ${clerkId}`);

    if (eventType === "user.created" || eventType === "user.updated") {
      const { email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

      if (email) {
        // Upsert user into database
        await prisma.user.upsert({
          where: { clerkId },
          update: {
            name,
            email,
            img_url: image_url,
          },
          create: {
            clerkId,
            name,
            email,
            img_url: image_url,
          },
        });

        console.log(
          `User ${clerkId} ${eventType === "user.created" ? "created" : "updated"} in database`,
        );
      }
    }

    if (eventType === "user.deleted") {
      try {
        await prisma.user.delete({
          where: { clerkId },
        });
        console.log(`User ${clerkId} deleted from database`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`Error deleting user ${clerkId}:`, errMsg);
        // Ignore if user already deleted
      }
    }

    res.status(httpStatus.OK).json({ success: true });
  },
);
