/**
 * Notification Service
 *
 * Helper to create notifications for users.
 * Used by face analysis, profile updates, makeup try-on, etc.
 */

import { query } from '../config/database.js';

/**
 * Create a notification for a user
 *
 * @param {number} userId - User ID
 * @param {string} type - Notification type (face_analysis_complete, hairstyle_recommendation, skin_tip, new_feature, security_alert, profile_photo_reminder, weekly_progress, beard_reminder, hairstyle_maintenance)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string|null} link - Optional link (e.g. /face-analyzer, /dashboard)
 * @returns {Promise<number|null>} Insert ID or null on error
 */
export async function createNotification(userId, type, title, message, link = null) {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, link]
    );
    return result?.insertId ?? null;
  } catch (err) {
    console.error('createNotification error:', err.message);
    return null;
  }
}
