/**
 * Authentication Routes
 * 
 * Defines all authentication-related endpoints
 */

import express from 'express';
import { register, login, getProfile, verifyEmailOTP, resendEmailOTP, requestPasswordReset, resetPassword, verifyResetCode } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { username, email, password, full_name (optional) }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * POST /api/auth/verify-otp
 * Verify email OTP code
 * Body: { email, otp }
 */
router.post('/verify-otp', verifyEmailOTP);

/**
 * POST /api/auth/resend-otp
 * Resend OTP code
 * Body: { email }
 */
router.post('/resend-otp', resendEmailOTP);

/**
 * POST /api/auth/forgot-password
 * Send password reset OTP
 * Body: { email }
 */
router.post('/forgot-password', requestPasswordReset);

/**
 * POST /api/auth/verify-reset-code
 * Verify reset code OTP
 * Body: { email, otp }
 */
router.post('/verify-reset-code', verifyResetCode);

/**
 * POST /api/auth/reset-password
 * Reset password using OTP
 * Body: { email, otp, password }
 */
router.post('/reset-password', resetPassword);

/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 * Headers: Authorization: Bearer <token>
 */
router.get('/profile', authenticateToken, getProfile);

export default router;
