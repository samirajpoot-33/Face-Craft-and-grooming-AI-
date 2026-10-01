/**
 * User Controller
 * 
 * Handles user profile management
 */

import { query } from '../config/database.js';
import path from 'path';

/**
 * Get user profile
 */
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await query(
            `SELECT id, username, email, full_name, profile_picture, role, credits, is_premium, created_at 
             FROM users WHERE id = ?`,
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
 * Update user profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, username } = req.body;

        const updates = [];
        const values = [];

        if (full_name !== undefined) {
            updates.push('full_name = ?');
            values.push(full_name);
        }

        if (username !== undefined) {
            // Check if username is already taken
            const existing = await query(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [username, userId]
            );
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }
            updates.push('username = ?');
            values.push(username);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(userId);

        await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Get updated user with all fields
        const users = await query(
            `SELECT id, username, email, full_name, profile_picture, role, credits, is_premium, created_at 
             FROM users WHERE id = ?`,
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
            message: 'Profile updated successfully',
            user: users[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

/**
 * Upload/Update profile picture
 */
export const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const userId = req.user.id;
        const imagePath = req.file.path;
        
        // Convert absolute path to relative path for serving
        // e.g., "C:\...\src\uploads\profiles\profile-xxx.jpg" -> "uploads/profiles/profile-xxx.jpg"
        const pathParts = imagePath.split(path.sep);
        const uploadsIndex = pathParts.findIndex(part => part === 'uploads');
        const relativePath = uploadsIndex !== -1 
            ? pathParts.slice(uploadsIndex).join('/')
            : imagePath.replace(/^.*[\\\/]uploads[\\\/]/, 'uploads/');

        // Update user profile picture and tracking timestamp for reminders
        await query(
            'UPDATE users SET profile_picture = ?, profile_picture_updated_at = NOW() WHERE id = ?',
            [relativePath, userId]
        );

        // Get updated user with all fields
        const users = await query(
            `SELECT id, username, email, full_name, profile_picture, role, credits, is_premium, created_at 
             FROM users WHERE id = ?`,
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
            message: 'Profile picture updated successfully',
            user: users[0]
        });
    } catch (error) {
        console.error('Update profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile picture',
            error: error.message
        });
    }
};

/**
 * Get user's analysis history
 */
export const getUserAnalyses = async (req, res) => {
    try {
        const userId = req.user.id;

        const analyses = await query(
            `SELECT id, image_path, face_shape, confidence_score, analysis_date 
             FROM face_analysis 
             WHERE user_id = ? 
             ORDER BY analysis_date DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            count: analyses.length,
            data: analyses
        });
    } catch (error) {
        console.error('Get analyses error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analyses',
            error: error.message
        });
    }
};
