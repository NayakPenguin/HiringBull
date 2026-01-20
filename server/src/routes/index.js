import express from 'express';
import userRoutes from './userRoutes.js';
import jobRoutes from './jobRoutes.js';
import socialPostRoutes from './socialPostRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import companyRoutes from './companyRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import testingRoutes from './testing.js';
import webRegistrationRoutes from './webRegistrationRoutes.js';
import outreachRoutes from './outreachRoutes.js';
import authTestRoutes from './authTest.js'; // ✅ ADD

const router = express.Router();

// 🔓 Public routes
// router.use('/public', testingRoutes);
router.use('/webhooks', webhookRoutes);

// 🔐 Auth test route (Clerk only)
router.use('/auth', authTestRoutes); // ✅ NEW

// 🔒 Normal API routes (unchanged)
router.use('/users/devices', deviceRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/outreach', outreachRoutes);
router.use('/social-posts', socialPostRoutes);
router.use('/payment', paymentRoutes);
router.use('/companies', companyRoutes);
router.use('/web-registration', webRegistrationRoutes);

export default router;
