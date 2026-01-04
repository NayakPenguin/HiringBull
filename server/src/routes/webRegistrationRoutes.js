import express from 'express';
import validate from '../middlewares/validate.js';
import * as webRegistrationValidation from '../validations/webRegistrationValidation.js';
import {
    createWebRegistration,
    checkWebRegistration,
    updateWebRegistration,
    deleteWebRegistration,
    getWebRegistrations
} from '../controllers/webRegistrationController.js';

const router = express.Router();

router.post('/', validate(webRegistrationValidation.createWebRegistration), createWebRegistration);
router.get('/check', validate(webRegistrationValidation.checkWebRegistration), checkWebRegistration);
router.put('/:email', validate(webRegistrationValidation.updateWebRegistration), updateWebRegistration);
router.delete('/:email', validate(webRegistrationValidation.deleteWebRegistration), deleteWebRegistration);
router.get('/', getWebRegistrations);

export default router;