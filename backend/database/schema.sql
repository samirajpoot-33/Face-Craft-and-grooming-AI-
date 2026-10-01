

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS facecraft_db;
USE facecraft_db;

-- ============================================
-- USERS TABLE
-- Stores user registration and authentication data
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FACE_ANALYSIS TABLE
-- Stores face analysis results with image paths
-- ============================================
CREATE TABLE IF NOT EXISTS face_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL COMMENT 'Path to uploaded image',
    face_shape VARCHAR(50) NOT NULL COMMENT 'Detected face shape (Oval, Round, Square, etc.)',
    confidence_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'ML model confidence (0-100)',
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_date (analysis_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MAKEUP_TRYON TABLE
-- Stores makeup virtual try-on sessions and presets
-- ============================================
CREATE TABLE IF NOT EXISTS makeup_tryon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preset_data JSON NOT NULL COMMENT 'Makeup preset configuration (looks, LUTs, makeup settings)',
    screenshot_path VARCHAR(500) COMMENT 'Path to screenshot if saved',
    session_name VARCHAR(255) COMMENT 'Optional name for the session',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- HAIRSTYLE_TRYON / BEARD_TRYON (AI swap logs for admin)
-- ============================================
CREATE TABLE IF NOT EXISTS hairstyle_tryon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    gender VARCHAR(10) NOT NULL,
    style_id INT NOT NULL,
    hair_style VARCHAR(80) NOT NULL,
    hair_style_label VARCHAR(120) NOT NULL,
    result_image_url VARCHAR(600) NOT NULL,
    task_id VARCHAR(80) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS beard_tryon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    style_id INT NOT NULL,
    beard VARCHAR(80) NOT NULL,
    beard_label VARCHAR(120) NOT NULL,
    result_image_url VARCHAR(600) NOT NULL,
    task_id VARCHAR(80) NULL,
    source_type VARCHAR(30) NOT NULL DEFAULT 'upload',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RELATIONSHIPS EXPLANATION
-- ============================================
-- users (1) -----> (many) face_analysis
-- One user can have multiple face analysis records
-- When a user is deleted, all their face analysis records are also deleted (CASCADE)

-- users (1) -----> (many) makeup_tryon
-- One user can have multiple makeup try-on sessions
-- When a user is deleted, all their makeup try-on records are also deleted (CASCADE)

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
    link VARCHAR(500) NULL COMMENT 'Optional link to navigate',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Note: Passwords are hashed using bcrypt
-- Example password "password123" hashed: $2a$10$...
