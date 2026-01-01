import express from 'express';
import { requireAuth, requirePayment, requireApiKey } from '../middlewares/auth.js';
import {
    getAllJobs,
    getJobById,
    bulkCreateJobs,
    getJobsFromFollowedCompanies,
} from '../controllers/jobController.js';
import validate from '../middlewares/validate.js';
import * as jobValidation from '../validations/jobValidation.js';

const router = express.Router();

// Admin routes (require API Key)
router.post('/bulk', requireApiKey, validate(jobValidation.bulkCreateJobs), bulkCreateJobs);

// Protected routes (require valid subscription)
router.get('/', requireAuth, requirePayment, validate(jobValidation.getJobs), getAllJobs);
router.get('/followed', requireAuth, requirePayment, validate(jobValidation.getJobsFollowed), getJobsFromFollowedCompanies);
router.get('/:id', requireAuth, requirePayment, validate(jobValidation.getJob), getJobById);

export default router;
