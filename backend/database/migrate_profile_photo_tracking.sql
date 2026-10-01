-- ============================================
-- FaceCraft - Profile Photo Tracking for Reminders
-- ============================================

USE facecraft_db;

-- Add column to track when profile picture was last updated
-- (MySQL 8.0.12+ supports IF NOT EXISTS; otherwise use fix-profile-photo-tracking.js)
ALTER TABLE users 
ADD COLUMN profile_picture_updated_at TIMESTAMP NULL 
COMMENT 'When user last updated profile photo - for reminder logic';

-- Backfill: set existing profile pictures to now (so we don't remind users who just set one)
UPDATE users 
SET profile_picture_updated_at = updated_at 
WHERE profile_picture IS NOT NULL AND profile_picture != '' 
  AND profile_picture_updated_at IS NULL;
