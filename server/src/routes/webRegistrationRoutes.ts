import express from 'express';
import validate from '../middlewares/validate.js';
import { requireApiKey } from '../middlewares/auth.js';
import * as webRegistrationValidation from '../validations/webRegistrationValidation.js';
import {
    createWebRegistration,
    checkWebRegistration,
    updateWebRegistration,
    deleteWebRegistration,
    getWebRegistrations
} from '../controllers/webRegistrationController.js';

const router = express.Router();

// Public route - frontend checks email before Clerk login
router.get('/check', validate(webRegistrationValidation.checkWebRegistration), checkWebRegistration);

// Admin routes - require API key
router.post('/', requireApiKey, validate(webRegistrationValidation.createWebRegistration), createWebRegistration);
router.put('/:email', requireApiKey, validate(webRegistrationValidation.updateWebRegistration), updateWebRegistration);
router.delete('/:email', requireApiKey, validate(webRegistrationValidation.deleteWebRegistration), deleteWebRegistration);
router.get('/', requireApiKey, getWebRegistrations);

export default router;