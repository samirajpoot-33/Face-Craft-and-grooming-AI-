-- ============================================
-- FaceCraft - Notifications Table Migration
-- Run this to add the notifications module
-- ============================================

USE facecraft_db;

-- ============================================
-- NOTIFICATIONS TABLE
-- Stores in-app notifications for users
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'hairstyle_recommendation, skin_tip, new_feature, security_alert, profile_photo_reminder, weekly_progress, beard_reminder, hairstyle_maintenance, face_analysis_complete',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500) NULL COMMENT 'Optional link to navigate (e.g. /face-analyzer, /dashboard)',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
