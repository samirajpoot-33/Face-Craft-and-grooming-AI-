-- Create Shares Table to track social media engagement
CREATE TABLE IF NOT EXISTS shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    platform VARCHAR(50) NOT NULL, -- 'whatsapp', 'facebook', 'twitter', 'linkedin', etc.
    resource_type VARCHAR(50) NOT NULL, -- 'face_shape', 'skin_analysis', 'makeup_look', 'general'
    resource_id INT NULL,
    share_url TEXT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
