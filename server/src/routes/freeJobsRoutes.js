import express from "express";
import prisma from "../prismaClient.js";
import { getAllFreeJobs } from "../controllers/jobController.js";

const router = express.Router();

router.get('/', getAllFreeJobs);

export default router;