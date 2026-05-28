import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { handleClerkWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Clerk webhooks need the raw body for Svix signature verification
router.post(
  "/clerk",
  bodyParser.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf;
    },
  }),
  handleClerkWebhook,
);

export default router;
