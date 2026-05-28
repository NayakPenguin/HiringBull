import express from 'express';
import { requireAuth, requireApiKey } from '../middlewares/auth.js';
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

// Protected routes
router.get('/', requireAuth, validate(jobValidation.getJobs), getAllJobs);
router.get('/followed', requireAuth, validate(jobValidation.getJobsFollowed), getJobsFromFollowedCompanies);
router.get('/:id', requireAuth, validate(jobValidation.getJob), getJobById);

export default router;