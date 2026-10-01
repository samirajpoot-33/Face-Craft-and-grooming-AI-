/**
 * Notification Controller
 * 
 * Handles fetching and marking notifications as read.
 */

import { query } from '../config/database.js';

/**
 * Get user's notifications (paginated)
 * GET /api/notifications?limit=20&offset=0&unreadOnly=false
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 20), 50);
        const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
        const unreadOnly = req.query.unreadOnly === 'true';

        let sql = `
            SELECT id, type, title, message, link, is_read, created_at
            FROM notifications
            WHERE user_id = ?
        `;
        const params = [userId];

        if (unreadOnly) {
            sql += ' AND is_read = 0';
        }

        sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

        const notifications = await query(sql, params);

        // Get unread count (query returns rows array; first row is the count row)
        const countRows = await query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        const countRow = Array.isArray(countRows) && countRows[0];
        const unreadCount = countRow != null ? (Number(countRow.count ?? 0) || 0) : 0;

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message,
        });
    }
};

/**
 * Get unread count only
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const rows = await query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        const row = Array.isArray(rows) && rows[0];
        const unreadCount = row != null ? (Number(row.count ?? 0) || 0) : 0;

        res.status(200).json({
            success: true,
            unreadCount,
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count',
            error: error.message,
        });
    }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const result = await query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification',
            error: error.message,
        });
    }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message,
        });
    }
};

/**
 * Delete a notification (user can only delete their own)
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const result = await query(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message,
        });
    }
};
