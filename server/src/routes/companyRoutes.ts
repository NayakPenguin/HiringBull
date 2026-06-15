import express from 'express';

import { requireAuth, requireApiKey } from '../middlewares/auth.js';
import {
    getAllCompanies,
    createCompany,
    bulkCreateCompanies,
    updateCompany,
    bulkUpdateCompanies,
    deleteCompanies
} from '../controllers/companyController.js';

import validate from '../middlewares/validate.js';
import * as companyValidation from '../validations/companyValidation.js';

const router = express.Router();

// Admin routes (require API Key)
router.post('/bulk', requireApiKey, validate(companyValidation.bulkCreateCompanies), bulkCreateCompanies);
router.post('/',  validate(companyValidation.createCompany), createCompany);
router.put('/bulk', requireApiKey, validate(companyValidation.bulkUpdateCompanies), bulkUpdateCompanies);
router.put('/:id', requireApiKey, validate(companyValidation.updateCompany), updateCompany);

// router.get('/', requireAuth, validate(companyValidation.getCompanies), getAllCompanies);
router.get('/', validate(companyValidation.getCompanies), getAllCompanies);
router.delete('/:id',validate(companyValidation.deleteCompanies),deleteCompanies)
export default router;
