import express from 'express';
import validate from '../middlewares/validate.js';
import * as userValidation from '../validations/userValidation.js';
import { requireAuth } from '../middlewares/auth.js';
import {
    getAllUsers,
    getUserById,
    updateUser,
    getCurrentUser,
    updateUserById,
    deleteUserById,
} from '../controllers/userController.js';

const router = express.Router();

// Get current user's profile
router.get('/me', requireAuth, getCurrentUser);

// Update current user's profile
router.put('/me', requireAuth, validate(userValidation.updateProfile), updateUser);

// Admin/future routes (kept for future use)
router.get('/', requireAuth, getAllUsers);
router.get('/:id', requireAuth, validate(userValidation.getUser), getUserById);
router.put('/:id', requireAuth, validate(userValidation.updateUser), updateUserById);
router.delete('/:id', requireAuth, validate(userValidation.deleteUser), deleteUserById);

export default router;
