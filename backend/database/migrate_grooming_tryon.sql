-- Hairstyle & beard try-on session logs (for admin panel)
-- Run: mysql -u root -p facecraft_db < backend/database/migrate_grooming_tryon.sql

CREATE TABLE IF NOT EXISTS hairstyle_tryon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'NULL = guest / not logged in',
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
    user_id INT NULL COMMENT 'NULL = guest / not logged in',
    style_id INT NOT NULL,
    beard VARCHAR(80) NOT NULL,
    beard_label VARCHAR(120) NOT NULL,
    result_image_url VARCHAR(600) NOT NULL,
    task_id VARCHAR(80) NULL,
    source_type VARCHAR(30) NOT NULL DEFAULT 'upload' COMMENT 'upload | hairstyle_result',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'hairstyle_tryon and beard_tryon tables ready' AS status;
