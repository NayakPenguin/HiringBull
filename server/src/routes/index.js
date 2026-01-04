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

const router = express.Router();

router.use('/users/devices', deviceRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/outreach', userRoutes);
router.use('/social-posts', socialPostRoutes);
router.use('/payment', paymentRoutes);
router.use('/companies', companyRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/web-registration', webRegistrationRoutes);
router.use('/public', testingRoutes);

export default router;
