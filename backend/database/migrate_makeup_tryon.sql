-- Migration script to add makeup_tryon table
-- Run this SQL script in your database if the table doesn't exist

USE facecraft_db;

-- Create makeup_tryon table if it doesn't exist
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

-- Verify table was created
SELECT 'makeup_tryon table created successfully!' AS status;
