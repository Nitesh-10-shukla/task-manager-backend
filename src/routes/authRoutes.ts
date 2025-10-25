import express from 'express';
import {
  loginUser,
  registerUser,
  getUserDetails,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { loginSchema, registerSchema } from '../controllers/authController';

const router = express.Router();

// Auth routes
router.post('/signup', validateRequest(registerSchema), registerUser);
router.post('/signin', validateRequest(loginSchema), loginUser);

// Password reset
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getUserDetails);

export default router;
