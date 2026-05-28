import express from 'express';

import {
    bulkCreateResources,
    getCategoryCounts,
    getResourceById,
    listResources,
    toggleBookmark,
} from '../controllers/resourceController.js';
import { requireApiKey, requireAuth } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import * as resourceValidation from '../validations/resourceValidation.js';

const router = express.Router();

// Admin / seeding (API key)
router.post(
    '/bulk',
    requireApiKey,
    validate(resourceValidation.bulkCreateResources),
    bulkCreateResources
);

// Authenticated user endpoints
router.get(
    '/',
    requireAuth,
    validate(resourceValidation.listResources),
    listResources
);

router.get('/categories', requireAuth, getCategoryCounts);

router.get(
    '/:id',
    requireAuth,
    validate(resourceValidation.resourceIdParam),
    getResourceById
);

router.post(
    '/:id/bookmark',
    requireAuth,
    validate(resourceValidation.resourceIdParam),
    toggleBookmark
);

export default router;
