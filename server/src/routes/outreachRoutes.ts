import express from 'express';
import { requireAuth, requireApiKey } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import * as outreachValidation from '../validations/outreachValidation.js';
import {
    createOutreachRequest,
    getMyOutreachRequests,
    getOutreachById,
    getPendingOutreachRequests,
    updateOutreachStatus,
} from '../controllers/outreachController.js';

const router = express.Router();

// Create outreach request (max 3/month enforced in controller)
router.post( '/', requireAuth, validate(outreachValidation.createOutreach), createOutreachRequest );

// Get logged-in user's outreach requests
router.get( '/me', requireAuth, getMyOutreachRequests );

// Get single outreach request by id
router.get( '/:id', requireAuth, validate(outreachValidation.getOutreachById), getOutreachById );

// Get all pending outreach requests
router.get( '/admin/pending', requireApiKey, getPendingOutreachRequests );

// Approve / Reject / Mark Sent
router.patch( '/admin/:id/status', requireApiKey, validate(outreachValidation.updateOutreachStatus), updateOutreachStatus );

export default router;
