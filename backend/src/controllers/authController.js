/**
 * Authentication Controller
 * 
 * Handles user registration and login
 * Uses bcrypt for password hashing and JWT for token generation
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../config/database.js';
import { createNotification } from '../services/notificationService.js';
import { sendVerificationOTP, sendResetPasswordOTP } from '../services/emailService.js';

dotenv.config();

/**
 * Register a new user
 * 
 * Steps:
 * 1. Validate input (email, username, password)
 * 2. Check if user already exists
 * 3. Hash password using bcrypt
 * 4. Insert user into database
 * 5. Generate JWT token
 * 6. Return token and user info
 */
export const register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Password validation (minimum 6 characters)
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Username validation (alphanumeric and underscore, 3-20 chars)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
            });
        }

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        // bcrypt.hash(password, saltRounds) - saltRounds = 10 is a good balance
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Insert user into database
        const result = await query(
            'INSERT INTO users (username, email, password, full_name, is_verified, verification_code, verification_expires) VALUES (?, ?, ?, ?, 0, ?, ?)',
            [username, email, hashedPassword, full_name || null, otpCode, otpExpires]
        );

        const userId = result.insertId;

        // Send welcome notification to new user so they see something in the bell
        await createNotification(
            userId,
            'new_feature',
            'Welcome to FaceCraft',
            'Check out Face Analyzer and Makeup Virtual Try-On. Click the bell icon for updates.',
            '/face-analyzer'
        ).catch(err => console.error('Register welcome notification:', err.message));

        // Send OTP verification email in the background (asynchronously) to keep registration instant
        sendVerificationOTP(email, otpCode).catch(err => console.error('Background send OTP error:', err));

        // Return success response indicating verification is required
        res.status(201).json({
            success: true,
            message: 'User registered successfully. A 6-digit verification code has been sent to your email.',
            needsVerification: true,
            email: email
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

/**
 * Login user
 * 
 * Steps:
 * 1. Validate input (email/username, password)
 * 2. Find user in database
 * 3. Compare password with hashed password using bcrypt
 * 4. Generate JWT token
 * 5. Return token and user info
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email or username
        const users = await query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check if user is verified (only for local credentials)
        if ((user.provider === 'local' || !user.provider) && !user.is_verified) {
            return res.status(403).json({
                success: false,
                message: 'Your email address is not verified. Please verify your email first.',
                needsVerification: true,
                email: user.email
            });
        }

        // Compare password with hashed password
        // bcrypt.compare(plainPassword, hashedPassword) returns true/false
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Send welcome notification to regular users (non-admin) who have no notifications yet
        const isAdmin = user.role === 'admin';
        if (!isAdmin) {
            try {
                const countResult = await query(
                    'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ?',
                    [user.id]
                );
                const first = Array.isArray(countResult) ? countResult[0] : null;
                const count = first != null ? (Number(first.cnt ?? first.CNT ?? Object.values(first)[0]) || 0) : 0;
                if (count === 0) {
                    const id = await createNotification(
                        user.id,
                        'new_feature',
                        'Welcome to FaceCraft',
                        'Check out Face Analyzer and Makeup Virtual Try-On. Click the bell icon for updates.',
                        '/face-analyzer'
                    );
                    if (id) console.log('[Auth] Welcome notification created for user', user.id);
                }
            } catch (e) {
                console.error('Login welcome notification:', e.message);
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Return success response with token and complete user data
        // Include all fields from database to ensure profile picture persists
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username || user.email.split('@')[0],
                email: user.email,
                full_name: user.full_name || null,
                profile_picture: user.profile_picture || null,
                role: user.role || 'user',
                credits: user.credits || 0,
                is_premium: user.is_premium || false,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

/**
 * Get current user profile
 * Protected route - requires authentication
 */
export const getProfile = async (req, res) => {
    try {
        // req.user is set by authenticateToken middleware
        const userId = req.user.id;

        const users = await query(
            'SELECT id, username, email, full_name, profile_picture, role, credits, is_premium, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

/**
 * Verify Email OTP
 * POST /api/auth/verify-otp
 */
export const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and verification code'
            });
        }

        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        if (user.verification_code !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        const expires = new Date(user.verification_expires);
        if (expires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        await query(
            'UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires = NULL WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            token: token,
            user: {
                id: user.id,
                username: user.username || user.email.split('@')[0],
                email: user.email,
                full_name: user.full_name || null,
                profile_picture: user.profile_picture || null,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying code',
            error: error.message
        });
    }
};

/**
 * Resend Email OTP
 * POST /api/auth/resend-otp
 */
export const resendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        await query(
            'UPDATE users SET verification_code = ?, verification_expires = ? WHERE id = ?',
            [otpCode, otpExpires, user.id]
        );

        // Send OTP email in background to keep response instant
        sendVerificationOTP(email, otpCode).catch(err => console.error('Background resend OTP error:', err));

        res.status(200).json({
            success: true,
            message: 'A new verification code has been sent to your email.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending verification code',
            error: error.message
        });
    }
};

/**
 * Request Password Reset OTP
 * POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        // Security best practice: Do not disclose if email exists or not.
        // Return same message, but only send email if user exists.
        if (users.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'If the email is registered, a password reset code has been sent.'
            });
        }

        const user = users[0];

        // Do not allow password reset for OAuth provider users
        if (user.provider && user.provider !== 'local') {
            return res.status(400).json({
                success: false,
                message: `This account is linked with ${user.provider}. Please log in using social login.`
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await query(
            'UPDATE users SET reset_password_code = ?, reset_password_expires = ? WHERE id = ?',
            [otpCode, otpExpires, user.id]
        );

        // Send OTP email in background
        sendResetPasswordOTP(email, otpCode).catch(err => console.error('Background send reset OTP error:', err));

        res.status(200).json({
            success: true,
            message: 'If the email is registered, a password reset code has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing forgot password request',
            error: error.message
        });
    }
};

/**
 * Verify Reset OTP Code (without changing password yet)
 * POST /api/auth/verify-reset-code
 */
export const verifyResetCode = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and verification code'
            });
        }

        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        if (!user.reset_password_code || user.reset_password_code !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        const expires = new Date(user.reset_password_expires);
        if (expires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code verified. You can now reset your password.'
        });
    } catch (error) {
        console.error('Verify reset code error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying code',
            error: error.message
        });
    }
};

/**
 * Reset Password with OTP
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, verification code, and new password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        if (!user.reset_password_code || user.reset_password_code !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        const expires = new Date(user.reset_password_expires);
        if (expires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update password and clear reset fields
        await query(
            'UPDATE users SET password = ?, reset_password_code = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

