/**
 * User Routes
 * 
 * User profile management endpoints
 */

import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { uploadProfile } from '../middleware/uploadProfile.js';
import {
    getUserProfile,
    updateProfile,
    updateProfilePicture,
    getUserAnalyses
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', getUserProfile);

/**
 * PUT /api/user/profile
 * Update user profile (name, username)
 */
router.put('/profile', updateProfile);

/**
 * POST /api/user/profile-picture
 * Upload/Update profile picture
 * Handles multer errors before reaching controller
 */
router.post('/profile-picture', (req, res, next) => {
    uploadProfile.single('profile_picture')(req, res, (err) => {
        if (err) {
            // Handle multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({
                        success: false,
                        message: 'File too large. Maximum size is 2MB.'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'File upload error: ' + err.message
                });
            }
            // Handle other errors (e.g., file type validation)
            return res.status(400).json({
                success: false,
                message: err.message || 'Invalid file. Please upload a valid image (JPEG, PNG, GIF, or WebP).'
            });
        }
        next();
    });
}, updateProfilePicture);

/**
 * GET /api/user/analyses
 * Get user's face analysis history
 */
router.get('/analyses', getUserAnalyses);

export default router;
