-- ============================================
-- CREDITS & PREMIUM MEMBERSHIP MIGRATION
-- ============================================

-- Add credits and premium status to users table
ALTER TABLE users 
ADD COLUMN credits INT DEFAULT 5 AFTER full_name,
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE AFTER credits;

-- Create transactions table to track credit usage/purchases
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount INT NOT NULL COMMENT 'Positive for purchase, negative for usage',
    type ENUM('purchase', 'usage', 'bonus', 'refund') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
