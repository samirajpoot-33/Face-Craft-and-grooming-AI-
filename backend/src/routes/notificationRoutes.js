/**
 * Notification Routes
 * 
 * All routes require authentication (regular users only, not admin)
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/notifications
 * Get user's notifications (paginated)
 * Query: limit, offset, unreadOnly
 */
router.get('/', getNotifications);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', getUnreadCount);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', markAllAsRead);

/**
 * PUT /api/notifications/:id/read
 * Mark single notification as read
 */
router.put('/:id/read', markAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete a notification (user's own only)
 */
router.delete('/:id', deleteNotification);

export default router;
