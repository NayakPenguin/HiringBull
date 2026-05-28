import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

export default router;
