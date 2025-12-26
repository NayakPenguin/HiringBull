import express from 'express';
import validate from '../middlewares/validate.js';
import * as userValidation from '../validations/userValidation.js';
import { requireAuth } from '../middlewares/auth.js';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getCurrentUser,
} from '../controllers/userController.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/me', requireAuth, getCurrentUser);
router.get('/', requireAuth, getAllUsers);
router.get('/:id', requireAuth, validate(userValidation.getUser), getUserById);
router.put('/:id', requireAuth, validate(userValidation.updateUser), updateUser);
router.delete('/:id', requireAuth, validate(userValidation.deleteUser), deleteUser);

export default router;
