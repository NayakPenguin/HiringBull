import express from 'express';

import { requireAuth, requirePayment, requireApiKey } from '../middlewares/auth.js';
import {
    getAllCompanies,
    createCompany,
    bulkCreateCompanies
} from '../controllers/companyController.js';

import validate from '../middlewares/validate.js';
import * as companyValidation from '../validations/companyValidation.js';

const router = express.Router();

// Admin routes (require API Key)
router.post('/', requireApiKey, validate(companyValidation.createCompany), createCompany);
router.post('/bulk', requireApiKey, validate(companyValidation.bulkCreateCompanies), bulkCreateCompanies);

// Protected routes (require valid subscription)
router.get('/', requireAuth, requirePayment, validate(companyValidation.getCompanies), getAllCompanies);

export default router;
