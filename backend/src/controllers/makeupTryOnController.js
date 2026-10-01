/**
 * Makeup Try-On Controller
 * 
 * Handles makeup virtual try-on operations
 */

import { query } from '../config/database.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Save makeup try-on session
 * Protected route - requires authentication
 */
export const saveMakeupTryOn = async (req, res) => {
    try {
        const userId = req.user.id;
        const { presetData, sessionName } = req.body;

        // Validation
        if (!presetData) {
            return res.status(400).json({
                success: false,
                message: 'Preset data is required'
            });
        }

        // Validate JSON structure
        let parsedPresetData;
        try {
            parsedPresetData = typeof presetData === 'string' 
                ? JSON.parse(presetData) 
                : presetData;
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid preset data format'
            });
        }

        // Check if table exists first
        try {
            await query('SELECT 1 FROM makeup_tryon LIMIT 1');
        } catch (tableError) {
            if (tableError.message && tableError.message.includes("doesn't exist")) {
                console.error('❌ makeup_tryon table does not exist!');
                return res.status(500).json({
                    success: false,
                    message: 'Database table not found. Please run the migration: CREATE TABLE makeup_tryon...',
                    error: 'Table makeup_tryon does not exist',
                    help: 'Run the SQL from backend/database/migrate_makeup_tryon.sql'
                });
            }
        }

        // Save to database
        console.log('💾 Saving makeup try-on session:', {
            userId,
            sessionName,
            featuresCount: Object.keys(parsedPresetData).length
        });

        const result = await query(
            `INSERT INTO makeup_tryon (user_id, preset_data, session_name) 
             VALUES (?, ?, ?)`,
            [
                userId,
                JSON.stringify(parsedPresetData),
                sessionName || `Makeup Session ${new Date().toLocaleDateString()}`
            ]
        );

        console.log('✅ Makeup try-on session saved successfully:', result.insertId);

        // Notification: Makeup look saved confirmation
        await createNotification(
            userId,
            'hairstyle_recommendation',
            'Makeup look saved!',
            'Your new look has been saved. View it in your dashboard.',
            '/dashboard'
        );

        res.status(201).json({
            success: true,
            message: 'Makeup try-on session saved successfully',
            data: {
                id: result.insertId,
                sessionName: sessionName || `Makeup Session ${new Date().toLocaleDateString()}`,
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Save makeup try-on error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlState: error.sqlState
        });
        res.status(500).json({
            success: false,
            message: 'Error saving makeup try-on session',
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { 
                details: error.message,
                code: error.code 
            })
        });
    }
};

/**
 * Get user's makeup try-on history
 * Protected route - returns all sessions for the authenticated user
 */
export const getUserMakeupTryOns = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const sessions = await query(
            `SELECT id, preset_data, session_name, screenshot_path, created_at, updated_at
             FROM makeup_tryon 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        // Parse JSON preset_data
        const parsedSessions = sessions.map(session => ({
            ...session,
            presetData: typeof session.preset_data === 'string' 
                ? JSON.parse(session.preset_data) 
                : session.preset_data
        }));

        res.status(200).json({
            success: true,
            data: parsedSessions,
            count: parsedSessions.length
        });
    } catch (error) {
        console.error('Get user makeup try-ons error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching makeup try-on sessions',
            error: error.message
        });
    }
};

/**
 * Get single makeup try-on session by ID
 * Protected route - user can only access their own sessions
 */
export const getMakeupTryOnById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const sessions = await query(
            `SELECT id, preset_data, session_name, screenshot_path, created_at, updated_at
             FROM makeup_tryon 
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makeup try-on session not found'
            });
        }

        const session = sessions[0];
        session.presetData = typeof session.preset_data === 'string' 
            ? JSON.parse(session.preset_data) 
            : session.preset_data;

        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Get makeup try-on by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching makeup try-on session',
            error: error.message
        });
    }
};

/**
 * Delete makeup try-on session
 * Protected route - user can only delete their own sessions
 */
export const deleteMakeupTryOn = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check if session exists and belongs to user
        const sessions = await query(
            'SELECT id FROM makeup_tryon WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makeup try-on session not found'
            });
        }

        // Delete session
        await query(
            'DELETE FROM makeup_tryon WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Makeup try-on session deleted successfully'
        });
    } catch (error) {
        console.error('Delete makeup try-on error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting makeup try-on session',
            error: error.message
        });
    }
};
