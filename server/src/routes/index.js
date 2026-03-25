import express, { application } from 'express';
import userRoutes from './userRoutes.js';
import jobRoutes from './jobRoutes.js';
import socialPostRoutes from './socialPostRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import companyRoutes from './companyRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import testingRoutes from './testing.js';
import webRegistrationRoutes from './webRegistrationRoutes.js';
import outreachRoutes from './outreachRoutes.js';
import authRoutes from './authRoutes.js';
import freeJobsRoutes from './freeJobsRoutes.js'; 
import applicationRoutes from './applicationRoutes.js'
import membershipRoutes from './membershipRoutes.js'

const router = express.Router();

// 🔓 Public routes
router.use('/public', testingRoutes);
router.use('/free-jobs', freeJobsRoutes);
router.use('/application', applicationRoutes);
router.use('/membership', membershipRoutes); 

// 🔐 Auth routes (Google, LinkedIn, Email OTP)
router.use('/auth', authRoutes);

// 🔒 Protected API routes (require JWT)
router.use('/users/devices', deviceRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/outreach', outreachRoutes);
router.use('/social-posts', socialPostRoutes);
router.use('/payment', paymentRoutes);
router.use('/companies', companyRoutes);
router.use('/web-registration', webRegistrationRoutes);

export default router;
