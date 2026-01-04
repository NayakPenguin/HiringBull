import express from 'express';
import { requireAuth, requireApiKey } from '../middlewares/auth.js';
import {
    getAllSocialPosts,
    getSocialPostById,
    bulkCreateSocialPosts,
} from '../controllers/socialPostController.js';
import validate from '../middlewares/validate.js';
import * as socialPostValidation from '../validations/socialPostValidation.js';

const router = express.Router();

// Admin routes (require API Key)
router.post('/bulk', requireApiKey, validate(socialPostValidation.bulkCreateSocialPosts), bulkCreateSocialPosts);

// Protected routes
router.get('/', requireAuth, validate(socialPostValidation.getSocialPosts), getAllSocialPosts);
router.get('/:id', requireAuth, validate(socialPostValidation.getSocialPost), getSocialPostById);

export default router;
