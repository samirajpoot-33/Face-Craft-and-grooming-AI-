/**
 * Admin Controller
 * 
 * Handles admin-specific operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../config/database.js';

dotenv.config();

/**
 * Admin Login
 * Admin uses special password to login
 */
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find admin user
        const users = await query(
            'SELECT * FROM users WHERE email = ? AND role = ?',
            [email, 'admin']
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const admin = users[0];

        // Check password against the stored bcrypt hash in the database
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username, 
                email: admin.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            token: token,
            user: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                full_name: admin.full_name,
                profile_picture: admin.profile_picture,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in as admin',
            error: error.message
        });
    }
};

/**
 * Get all users (Admin only)
 * Returns only regular users, excluding admin accounts
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await query(
            `SELECT id, username, email, full_name, profile_picture, role, credits, is_premium, created_at 
             FROM users 
             WHERE role != 'admin' OR role IS NULL
             ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/**
 * Get user statistics (Admin only)
 */
export const getUserStats = async (req, res) => {
    try {
        const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');
        const [totalAdmins] = await query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        const [totalAnalyses] = await query('SELECT COUNT(*) as count FROM face_analysis');
        const [totalMakeupTryOns] = await query('SELECT COUNT(*) as count FROM makeup_tryon');
        let totalHairstyleTryOns = 0;
        let totalBeardTryOns = 0;
        try {
            const [h] = await query('SELECT COUNT(*) as count FROM hairstyle_tryon');
            const [b] = await query('SELECT COUNT(*) as count FROM beard_tryon');
            totalHairstyleTryOns = h.count;
            totalBeardTryOns = b.count;
        } catch (_) { /* tables may not exist yet */ }
        const [recentUsers] = await query(
            `SELECT COUNT(*) as count FROM users 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
        );

        res.status(200).json({
            success: true,
            stats: {
                totalUsers: totalUsers.count,
                totalAdmins: totalAdmins.count,
                totalAnalyses: totalAnalyses.count,
                totalMakeupTryOns: totalMakeupTryOns.count,
                totalHairstyleTryOns,
                totalBeardTryOns,
                recentUsers: recentUsers.count
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

/**
 * Get chatbot conversations (Admin only)
 */
export const getChatbotConversations = async (req, res) => {
    try {
        const { userId, limit, offset } = req.query;
        
        // Ensure limit and offset are valid integers with proper defaults
        // Handle cases where they might be undefined, empty string, or invalid
        let limitNum = 100; // Default
        let offsetNum = 0; // Default
        
        if (limit !== undefined && limit !== null && limit !== '') {
            const parsedLimit = parseInt(limit, 10);
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                limitNum = parsedLimit;
            }
        }
        
        if (offset !== undefined && offset !== null && offset !== '') {
            const parsedOffset = parseInt(offset, 10);
            if (!isNaN(parsedOffset) && parsedOffset >= 0) {
                offsetNum = parsedOffset;
            }
        }
        
        // Final safety check - ensure we have valid integers
        limitNum = Number.isInteger(limitNum) && limitNum > 0 ? limitNum : 100;
        offsetNum = Number.isInteger(offsetNum) && offsetNum >= 0 ? offsetNum : 0;
        
        let conversations;
        let count;
        
        if (userId) {
            // Get conversations for specific user
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
            }
            
            // MySQL doesn't support placeholders for LIMIT/OFFSET, so we use string interpolation
            // Values are validated above to prevent SQL injection
            conversations = await query(
                `SELECT c.id, c.user_id, c.message, c.response, c.conversation_id, c.created_at,
                        u.username, u.email, u.full_name
                 FROM chatbot_conversations c
                 LEFT JOIN users u ON c.user_id = u.id
                 WHERE c.user_id = ?
                 ORDER BY c.created_at DESC
                 LIMIT ${limitNum} OFFSET ${offsetNum}`,
                [userIdNum]
            );
            
            const countResult = await query(
                'SELECT COUNT(*) as count FROM chatbot_conversations WHERE user_id = ?',
                [userIdNum]
            );
            count = countResult[0] || { count: 0 };
        } else {
            // Get all conversations
            // MySQL doesn't support placeholders for LIMIT/OFFSET, so we use string interpolation
            // Values are validated above to prevent SQL injection
            conversations = await query(
                `SELECT c.id, c.user_id, c.message, c.response, c.conversation_id, c.created_at,
                        u.username, u.email, u.full_name
                 FROM chatbot_conversations c
                 LEFT JOIN users u ON c.user_id = u.id
                 ORDER BY c.created_at DESC
                 LIMIT ${limitNum} OFFSET ${offsetNum}`
            );
            
            const countResult = await query('SELECT COUNT(*) as count FROM chatbot_conversations');
            count = countResult[0] || { count: 0 };
        }

        // Debug logging
        console.log('📊 Chatbot conversations query result:');
        console.log('  - Conversations found:', conversations?.length || 0);
        console.log('  - Total count:', count?.count || 0);
        console.log('  - Sample conversation:', conversations?.[0] || 'none');
        console.log('  - Full conversations array:', JSON.stringify(conversations, null, 2));

        res.status(200).json({
            success: true,
            count: count.count || 0,
            data: conversations || []
        });
    } catch (error) {
        console.error('Get chatbot conversations error:', error);
        
        // Check if table doesn't exist
        if (error.message?.includes("doesn't exist") || error.message?.includes("Unknown table")) {
            return res.status(404).json({
                success: false,
                message: 'Chatbot conversations table does not exist. Please run the database migration: backend/database/add_chatbot_conversations_table.sql',
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching chatbot conversations',
            error: error.message
        });
    }
};

/**
 * Delete chatbot conversation (Admin only)
 * Admin can delete any conversation
 */
export const deleteChatbotConversation = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🗑️ Admin deleting chatbot conversation:', id);

        // Check if conversation exists
        const conversations = await query(
            'SELECT id FROM chatbot_conversations WHERE id = ?',
            [id]
        );

        if (conversations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Chatbot conversation not found'
            });
        }

        // Delete conversation (admin can delete any conversation)
        await query(
            'DELETE FROM chatbot_conversations WHERE id = ?',
            [id]
        );

        console.log('✅ Admin deleted chatbot conversation:', id);

        res.status(200).json({
            success: true,
            message: 'Chatbot conversation deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete chatbot conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting chatbot conversation',
            error: error.message
        });
    }
};

/**
 * Get chatbot statistics (Admin only)
 */
export const getChatbotStats = async (req, res) => {
    try {
        const [totalConversations] = await query('SELECT COUNT(*) as count FROM chatbot_conversations');
        const [totalUsers] = await query('SELECT COUNT(DISTINCT user_id) as count FROM chatbot_conversations WHERE user_id IS NOT NULL');
        const [recentConversations] = await query(
            `SELECT COUNT(*) as count FROM chatbot_conversations 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
        );

        res.status(200).json({
            success: true,
            stats: {
                totalConversations: totalConversations.count,
                totalUsers: totalUsers.count,
                recentConversations: recentConversations.count
            }
        });
    } catch (error) {
        console.error('Get chatbot stats error:', error);
        
        // Check if table doesn't exist
        if (error.message?.includes("doesn't exist") || error.message?.includes("Unknown table")) {
            return res.status(404).json({
                success: false,
                message: 'Chatbot conversations table does not exist. Please run the database migration.',
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching chatbot statistics',
            error: error.message
        });
    }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await query('DELETE FROM users WHERE id = ?', [userId]);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

/**
 * Get all makeup try-on sessions (Admin only)
 */
export const getAllMakeupTryOns = async (req, res) => {
    try {
        // Ensure limit and offset are proper integers
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
        const offset = Math.max(0, parseInt(req.query.offset) || 0);

        console.log('📊 Admin fetching makeup try-on sessions:', { limit, offset, limitType: typeof limit, offsetType: typeof offset });

        // Check if table exists first
        try {
            await query('SELECT 1 FROM makeup_tryon LIMIT 1');
        } catch (tableError) {
            if (tableError.message && (tableError.message.includes("doesn't exist") || tableError.message.includes("Unknown table"))) {
                console.error('❌ makeup_tryon table does not exist!');
                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
                    message: 'Table does not exist. Please run the migration script.',
                    help: 'Run the SQL from backend/database/migrate_makeup_tryon.sql'
                });
            }
            throw tableError;
        }

        // Query with proper integer parameters for LIMIT/OFFSET
        // Note: MySQL doesn't support placeholders for LIMIT/OFFSET in some versions,
        // so we use template literals after validating the values are safe integers
        const limitValue = Number.isInteger(limit) ? limit : 50;
        const offsetValue = Number.isInteger(offset) ? offset : 0;
        
        const sessions = await query(
            `SELECT mt.id, mt.user_id, mt.preset_data, mt.session_name, mt.screenshot_path, 
                    mt.created_at, mt.updated_at,
                    u.username, u.email, u.full_name
             FROM makeup_tryon mt
             LEFT JOIN users u ON mt.user_id = u.id
             ORDER BY mt.created_at DESC 
             LIMIT ${limitValue} OFFSET ${offsetValue}`,
            [] // Empty params array since we're using template literals for LIMIT/OFFSET
        );

        console.log(`📊 Found ${sessions.length} makeup try-on sessions in database`);

        // Parse JSON preset_data
        const parsedSessions = sessions.map(session => {
            try {
                return {
                    id: session.id,
                    userId: session.user_id,
                    username: session.username,
                    email: session.email,
                    fullName: session.full_name,
                    sessionName: session.session_name,
                    presetData: typeof session.preset_data === 'string' 
                        ? JSON.parse(session.preset_data) 
                        : session.preset_data,
                    screenshotPath: session.screenshot_path,
                    createdAt: session.created_at,
                    updatedAt: session.updated_at
                };
            } catch (parseError) {
                console.error('Error parsing session preset_data:', parseError);
                return {
                    id: session.id,
                    userId: session.user_id,
                    username: session.username,
                    email: session.email,
                    fullName: session.full_name,
                    sessionName: session.session_name,
                    presetData: {},
                    screenshotPath: session.screenshot_path,
                    createdAt: session.created_at,
                    updatedAt: session.updated_at
                };
            }
        });

        console.log('✅ Returning makeup try-on sessions to admin:', parsedSessions.length);

        res.status(200).json({
            success: true,
            data: parsedSessions,
            count: parsedSessions.length
        });
    } catch (error) {
        console.error('❌ Get all makeup try-ons error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlState: error.sqlState,
            errno: error.errno
        });
        
        // Check if it's a table doesn't exist error
        if (error.message && (error.message.includes("doesn't exist") || error.message.includes("Unknown table"))) {
            return res.status(200).json({
                success: true,
                data: [],
                count: 0,
                message: 'Table does not exist. Please run the migration script.',
                help: 'Run the SQL from backend/database/migrate_makeup_tryon.sql'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching makeup try-on sessions',
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { 
                details: error.message,
                code: error.code,
                sqlState: error.sqlState
            })
        });
    }
};

/**
 * Delete makeup try-on session (Admin only)
 * Admin can delete any session
 */
export const deleteMakeupTryOn = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🗑️ Admin deleting makeup try-on session:', id);

        // Check if session exists
        const sessions = await query(
            'SELECT id, user_id FROM makeup_tryon WHERE id = ?',
            [id]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makeup try-on session not found'
            });
        }

        // Delete session (admin can delete any session)
        await query(
            'DELETE FROM makeup_tryon WHERE id = ?',
            [id]
        );

        console.log('✅ Admin deleted makeup try-on session:', id);

        res.status(200).json({
            success: true,
            message: 'Makeup try-on session deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete makeup try-on error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting makeup try-on session',
            error: error.message
        });
    }
};

/**
 * Get all face analysis records (Admin only)
 */
export const getAllFaceAnalyses = async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
        const offset = Math.max(0, parseInt(req.query.offset) || 0);
        const limitValue = Number.isInteger(limit) ? limit : 50;
        const offsetValue = Number.isInteger(offset) ? offset : 0;

        const analyses = await query(
            `SELECT fa.id, fa.user_id, fa.image_path, fa.face_shape, fa.confidence_score, fa.analysis_date,
                    u.username, u.email, u.full_name
             FROM face_analysis fa
             LEFT JOIN users u ON fa.user_id = u.id
             ORDER BY fa.analysis_date DESC
             LIMIT ${limitValue} OFFSET ${offsetValue}`,
            []
        );

        res.status(200).json({
            success: true,
            data: analyses,
            count: analyses.length
        });
    } catch (error) {
        console.error('Get all face analyses error:', error);
        if (error.message?.includes("doesn't exist") || error.message?.includes("Unknown table")) {
            return res.status(200).json({
                success: true,
                data: [],
                count: 0,
                message: 'Face analysis table does not exist.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching face analyses',
            error: error.message
        });
    }
};

/**
 * Delete face analysis record (Admin only)
 */
export const deleteFaceAnalysis = async (req, res) => {
    try {
        const { id } = req.params;

        const rows = await query('SELECT id FROM face_analysis WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Face analysis record not found'
            });
        }

        await query('DELETE FROM face_analysis WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Face analysis deleted successfully'
        });
    } catch (error) {
        console.error('Delete face analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting face analysis',
            error: error.message
        });
    }
};

/**
 * Get makeup try-on statistics (Admin only)
 */
export const getMakeupTryOnStats = async (req, res) => {
    try {
        const [totalSessions] = await query('SELECT COUNT(*) as count FROM makeup_tryon');
        const [recentSessions] = await query(
            `SELECT COUNT(*) as count FROM makeup_tryon 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
        );
        const [uniqueUsers] = await query(
            'SELECT COUNT(DISTINCT user_id) as count FROM makeup_tryon'
        );

        res.status(200).json({
            success: true,
            stats: {
                totalSessions: totalSessions.count,
                recentSessions: recentSessions.count,
                uniqueUsers: uniqueUsers.count
            }
        });
    } catch (error) {
        console.error('Get makeup try-on stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching makeup try-on statistics',
            error: error.message
        });
    }
};

/**
 * Send notification to a specific user (Admin only)
 * POST /api/admin/notifications/send
 * Body: { userId, title, message, type?, link? }
 */
export const sendNotificationToUser = async (req, res) => {
    try {
        const { userId, title, message, type = 'new_feature', link = null } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, title and message are required'
            });
        }

        const userRows = await query('SELECT id, username, email FROM users WHERE id = ?', [userId]);
        if (!userRows?.length) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await query(
            `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
            [userId, type, title, message, link ?? null]
        );

        const row = userRows[0];
        const username = row.username || row.email || `User #${userId}`;
        console.log(`[Admin] Notification sent to user ${userId} (${username})`);
        res.status(200).json({
            success: true,
            message: `Notification sent to ${username}`,
            username
        });
    } catch (error) {
        console.error('Send notification to user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending notification',
            error: error.message
        });
    }
};

/**
 * Broadcast notification to all users (Admin only)
 * POST /api/admin/notifications/broadcast
 * Body: { title, message, type?, link? }
 */
export const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type = 'new_feature', link = null } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        let users = [];
        try {
            users = await query(
                "SELECT id FROM users WHERE (role IS NULL OR role != 'admin')"
            );
        } catch (queryErr) {
            if (queryErr.message && (queryErr.message.includes('Unknown column') || queryErr.message.includes('role'))) {
                // Fallback: role column may not exist - get all users
                users = await query("SELECT id FROM users");
            } else {
                throw queryErr;
            }
        }

        const userIds = Array.isArray(users) ? users : [];
        let inserted = 0;
        for (const row of userIds) {
            const uid = row.id ?? row.ID;
            if (uid == null) continue;
            await query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [uid, type, title, message, link ?? null]
            );
            inserted++;
        }

        console.log(`[Broadcast] Sent to ${inserted} user(s)`);
        res.status(200).json({
            success: true,
            message: inserted > 0
                ? `Notification sent to ${inserted} user(s)`
                : 'No regular users to notify. Notifications will appear when users open the app.',
            count: inserted
        });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error broadcasting notification',
            error: error.message
        });
    }
};

/**
 * Get all manual payments (Admin only)
 * GET /api/admin/manual-payments
 */
export const getManualPayments = async (req, res) => {
    try {
        const payments = await query(
            `SELECT mp.id, mp.user_id, mp.plan_id, mp.tx_id, mp.status, mp.created_at,
                    u.username, u.email
             FROM manual_payments mp
             LEFT JOIN users u ON mp.user_id = u.id
             ORDER BY mp.created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Get manual payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching manual payments',
            error: error.message
        });
    }
};

/**
 * Approve a manual payment (Admin only)
 * POST /api/admin/manual-payments/:id/approve
 */
export const approveManualPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payments = await query('SELECT * FROM manual_payments WHERE id = ? AND status = "pending"', [id]);
        if (payments.length === 0) {
            return res.status(404).json({ success: false, message: 'Pending payment not found' });
        }

        const payment = payments[0];
        const userId = payment.user_id;

        // Update status
        await query('UPDATE manual_payments SET status = "approved" WHERE id = ?', [id]);

        if (payment.plan_id === 'pro') {
            await query('UPDATE users SET credits = credits + 50 WHERE id = ?', [userId]);
            await query(
                'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, 50, ?, ?)',
                [userId, 'purchase', `Purchased 50 credits via manual Binance Pay. TxID: ${payment.tx_id}`]
            );
            await query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [userId, 'new_feature', 'Credits Added!', 'Your Binance payment was approved. You received 50 credits!', '/dashboard']
            );
        } else if (payment.plan_id === 'premium') {
            await query('UPDATE users SET is_premium = TRUE WHERE id = ?', [userId]);
            await query(
                'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, 0, ?, ?)',
                [userId, 'purchase', `Upgraded to Premium via manual Binance Pay. TxID: ${payment.tx_id}`]
            );
            await query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [userId, 'new_feature', 'Premium Unlocked!', 'Your Binance payment was approved. Welcome to Premium!', '/dashboard']
            );
        }

        res.status(200).json({ success: true, message: 'Payment approved successfully.' });
    } catch (error) {
        console.error('Approve manual payment error:', error);
        res.status(500).json({ success: false, message: 'Error approving payment', error: error.message });
    }
};

/**
 * Reject a manual payment (Admin only)
 * POST /api/admin/manual-payments/:id/reject
 */
export const rejectManualPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payments = await query('SELECT * FROM manual_payments WHERE id = ? AND status = "pending"', [id]);
        if (payments.length === 0) {
            return res.status(404).json({ success: false, message: 'Pending payment not found' });
        }

        const payment = payments[0];

        // Update status
        await query('UPDATE manual_payments SET status = "rejected" WHERE id = ?', [id]);

        await query(
            `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
            [payment.user_id, 'alert', 'Payment Rejected', `Your payment with TxID ${payment.tx_id} could not be verified.`, '/pricing']
        );

        res.status(200).json({ success: true, message: 'Payment rejected.' });
    } catch (error) {
        console.error('Reject manual payment error:', error);
        res.status(500).json({ success: false, message: 'Error rejecting payment', error: error.message });
    }
};

/**
 * Gift credits to all active users (Admin only)
 * POST /api/admin/users/gift-credits
 * Body: { amount, description? }
 */
export const giftCreditsToAll = async (req, res) => {
    try {
        const { amount, description = 'Bonus credits from Administrator' } = req.body;
        const creditAmount = parseInt(amount, 10);

        if (isNaN(creditAmount) || creditAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid positive credit amount'
            });
        }

        // Get all regular users
        let users = [];
        try {
            users = await query(
                "SELECT id FROM users WHERE (role IS NULL OR role != 'admin')"
            );
        } catch (queryErr) {
            if (queryErr.message && (queryErr.message.includes('Unknown column') || queryErr.message.includes('role'))) {
                users = await query("SELECT id FROM users");
            } else {
                throw queryErr;
            }
        }

        const userIds = Array.isArray(users) ? users : [];
        if (userIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No regular users found to gift credits to.',
                count: 0
            });
        }

        // 1. Bulk update user credits
        await query(
            `UPDATE users SET credits = credits + ? WHERE role != 'admin' OR role IS NULL`,
            [creditAmount]
        );

        // 2. Insert transactions and notifications for each user
        for (const row of userIds) {
            const uid = row.id ?? row.ID;
            if (uid == null) continue;

            // Log transaction
            await query(
                `INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)`,
                [uid, creditAmount, 'bonus', description]
            );

            // Send notification
            await query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [uid, 'new_feature', 'Credits Received!', `Administrator gifted you ${creditAmount} credits!`, '/dashboard']
            );
        }

        res.status(200).json({
            success: true,
            message: `Successfully gifted ${creditAmount} credits to ${userIds.length} user(s).`,
            count: userIds.length
        });
    } catch (error) {
        console.error('Gift credits to all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error gifting credits to users',
            error: error.message
        });
    }
};

/**
 * Update a specific user's credits (Admin only)
 * POST /api/admin/users/:id/credits
 * Body: { amount, action } where action is 'set', 'add', or 'subtract'
 */
export const updateUserCredits = async (req, res) => {
    try {
        const userId = req.params.id;
        const { amount, action = 'set', description = 'Credits updated by Administrator' } = req.body;
        const creditAmount = parseInt(amount, 10);

        if (isNaN(creditAmount) || creditAmount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid non-negative credit amount'
            });
        }

        // Verify user exists
        const userRows = await query('SELECT id, credits, username FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userRows[0];
        let newCredits = user.credits;
        let diff = 0;

        if (action === 'set') {
            newCredits = creditAmount;
            diff = newCredits - user.credits;
        } else if (action === 'add') {
            newCredits = user.credits + creditAmount;
            diff = creditAmount;
        } else if (action === 'subtract') {
            newCredits = Math.max(0, user.credits - creditAmount);
            diff = newCredits - user.credits;
        }

        // Update database
        await query('UPDATE users SET credits = ? WHERE id = ?', [newCredits, userId]);

        // Insert transaction if there is a change
        if (diff !== 0) {
            const transType = diff > 0 ? 'bonus' : 'usage';
            await query(
                'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
                [userId, diff, transType, description]
            );

            // Send notification
            const title = diff > 0 ? 'Credits Added!' : 'Credits Deducted!';
            const msg = diff > 0 
                ? `Administrator added ${diff} credits to your account. Total: ${newCredits}`
                : `Administrator deducted ${Math.abs(diff)} credits from your account. Total: ${newCredits}`;
            
            await query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [userId, diff > 0 ? 'new_feature' : 'alert', title, msg, '/dashboard']
            );
        }

        res.status(200).json({
            success: true,
            message: `User credits updated successfully. New total: ${newCredits}`,
            newCredits
        });
    } catch (error) {
        console.error('Update user credits error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user credits',
            error: error.message
        });
    }
};

/**
 * Update a specific user's premium status (Admin only)
 * POST /api/admin/users/:id/premium
 * Body: { isPremium }
 */
export const updateUserPremium = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isPremium } = req.body;

        if (isPremium === undefined) {
            return res.status(400).json({
                success: false,
                message: 'isPremium (boolean) is required in request body'
            });
        }

        const isPremiumBool = !!isPremium;

        // Verify user exists
        const userRows = await query('SELECT id, is_premium, username, email FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userRows[0];

        // Update database
        await query('UPDATE users SET is_premium = ? WHERE id = ?', [isPremiumBool ? 1 : 0, userId]);

        // Insert transaction & send notification if there is a change
        if (!!user.is_premium !== isPremiumBool) {
            await query(
                'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, 0, ?, ?)',
                [userId, 'purchase', isPremiumBool ? 'Upgraded to Premium by Administrator' : 'Premium membership cancelled by Administrator']
            );

            // Send notification
            const title = isPremiumBool ? 'Premium Unlocked!' : 'Membership Updated';
            const msg = isPremiumBool 
                ? 'Administrator upgraded your account to Premium membership! Welcome to unlimited access!'
                : 'Administrator changed your status to a Free plan.';
            
            await query(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [userId, 'new_feature', title, msg, '/dashboard']
            );
        }

        res.status(200).json({
            success: true,
            message: `User premium status updated to ${isPremiumBool ? 'Premium' : 'Free'}.`,
            is_premium: isPremiumBool
        });
    } catch (error) {
        console.error('Update user premium error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user premium status',
            error: error.message
        });
    }
};

/**
 * Make all users free (cancel all premium memberships) (Admin only)
 * POST /api/admin/users/make-all-free
 */
export const makeAllUsersFree = async (req, res) => {
    try {
        await query("UPDATE users SET is_premium = FALSE WHERE role != 'admin' OR role IS NULL");
        res.status(200).json({
            success: true,
            message: 'All premium memberships have been successfully revoked. All users are now on the Free plan.'
        });
    } catch (error) {
        console.error('Make all users free error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting premium status for all users',
            error: error.message
        });
    }
};

/**
 * Update password for a specific user (Admin only)
 * POST /api/admin/users/:id/change-password
 */
export const updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.trim().length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Verify user exists and is not an admin
        const userRows = await query('SELECT id, username, role FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userRows[0];
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify admin passwords through this endpoint'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update database
        await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

        // Send a notification to the user
        await query(
            `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
            [id, 'security', 'Password Changed', 'An administrator has updated your login password. If you did not request this, please contact support.', '/dashboard']
        );

        res.status(200).json({
            success: true,
            message: `Password for user "${user.username}" has been successfully updated.`
        });
    } catch (error) {
        console.error('Update user password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user password',
            error: error.message
        });
    }
};


