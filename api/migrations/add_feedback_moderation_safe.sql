-- Migration: Add Feedback Moderation System (Simplified)
-- Description: Creates moderation table and updates public_feedback table for content moderation
-- Date: 2025-01-27

-- Create feedback_moderation table
CREATE TABLE IF NOT EXISTS feedback_moderation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id INT NOT NULL,
    feedback_type ENUM('public_feedback', 'project_feedback') NOT NULL DEFAULT 'public_feedback',
    moderation_status ENUM('pending', 'approved', 'rejected', 'flagged') NOT NULL DEFAULT 'pending',
    moderation_reason ENUM(
        'inappropriate_content',
        'spam',
        'off_topic',
        'personal_attack',
        'false_information',
        'duplicate',
        'incomplete',
        'language_violation',
        'other'
    ) DEFAULT NULL,
    custom_reason TEXT DEFAULT NULL,
    moderator_notes TEXT DEFAULT NULL,
    moderated_by INT DEFAULT NULL,
    moderated_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_feedback_id (feedback_id),
    INDEX idx_moderation_status (moderation_status),
    INDEX idx_moderated_by (moderated_by),
    INDEX idx_moderated_at (moderated_at),
    INDEX idx_feedback_type (feedback_type),
    
    -- Foreign key constraints
    FOREIGN KEY (moderated_by) REFERENCES users(userId) ON DELETE SET NULL,
    
    -- Ensure one moderation record per feedback
    UNIQUE KEY unique_feedback_moderation (feedback_id, feedback_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create feedback_moderation_settings table for configuration
CREATE TABLE IF NOT EXISTS feedback_moderation_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add moderation fields to public_feedback table (with error handling)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND COLUMN_NAME = 'moderation_status') = 0,
    'ALTER TABLE public_feedback ADD COLUMN moderation_status ENUM(''pending'', ''approved'', ''rejected'', ''flagged'') DEFAULT ''pending''',
    'SELECT ''Column moderation_status already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND COLUMN_NAME = 'moderation_reason') = 0,
    'ALTER TABLE public_feedback ADD COLUMN moderation_reason ENUM(''inappropriate_content'', ''spam'', ''off_topic'', ''personal_attack'', ''false_information'', ''duplicate'', ''incomplete'', ''language_violation'', ''other'') DEFAULT NULL',
    'SELECT ''Column moderation_reason already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND COLUMN_NAME = 'custom_reason') = 0,
    'ALTER TABLE public_feedback ADD COLUMN custom_reason TEXT DEFAULT NULL',
    'SELECT ''Column custom_reason already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND COLUMN_NAME = 'moderator_notes') = 0,
    'ALTER TABLE public_feedback ADD COLUMN moderator_notes TEXT DEFAULT NULL',
    'SELECT ''Column moderator_notes already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND COLUMN_NAME = 'moderated_by') = 0,
    'ALTER TABLE public_feedback ADD COLUMN moderated_by INT DEFAULT NULL',
    'SELECT ''Column moderated_by already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND COLUMN_NAME = 'moderated_at') = 0,
    'ALTER TABLE public_feedback ADD COLUMN moderated_at DATETIME DEFAULT NULL',
    'SELECT ''Column moderated_at already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for moderation fields (with error handling)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND INDEX_NAME = 'idx_moderation_status') = 0,
    'ALTER TABLE public_feedback ADD INDEX idx_moderation_status (moderation_status)',
    'SELECT ''Index idx_moderation_status already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND INDEX_NAME = 'idx_moderated_by') = 0,
    'ALTER TABLE public_feedback ADD INDEX idx_moderated_by (moderated_by)',
    'SELECT ''Index idx_moderated_by already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND INDEX_NAME = 'idx_moderated_at') = 0,
    'ALTER TABLE public_feedback ADD INDEX idx_moderated_at (moderated_at)',
    'SELECT ''Index idx_moderated_at already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for moderated_by (with error handling)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = 'imbesdb' 
     AND TABLE_NAME = 'public_feedback' 
     AND CONSTRAINT_NAME = 'fk_public_feedback_moderated_by') = 0,
    'ALTER TABLE public_feedback ADD CONSTRAINT fk_public_feedback_moderated_by FOREIGN KEY (moderated_by) REFERENCES users(userId) ON DELETE SET NULL',
    'SELECT ''Foreign key fk_public_feedback_moderated_by already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create view for approved public feedback (for public display)
CREATE OR REPLACE VIEW approved_public_feedback AS
SELECT 
    f.*,
    p.projectName as project_name,
    u.firstName as moderator_first_name,
    u.lastName as moderator_last_name
FROM public_feedback f
LEFT JOIN projects p ON f.project_id = p.id
LEFT JOIN users u ON f.moderated_by = u.userId
WHERE f.moderation_status = 'approved'
ORDER BY f.created_at DESC;

-- Create view for moderation queue (pending moderation)
CREATE OR REPLACE VIEW moderation_queue AS
SELECT 
    f.id,
    f.name,
    f.email,
    f.subject,
    f.message,
    f.project_id,
    f.status,
    f.moderation_status,
    f.moderation_reason,
    f.custom_reason,
    f.moderator_notes,
    f.created_at,
    f.updated_at,
    p.projectName as project_name,
    CONCAT(u.firstName, ' ', u.lastName) as moderator_name,
    'public_feedback' as feedback_type
FROM public_feedback f
LEFT JOIN projects p ON f.project_id = p.id
LEFT JOIN users u ON f.moderated_by = u.userId
WHERE f.moderation_status = 'pending'
ORDER BY f.created_at DESC;

-- Insert default moderation settings
INSERT IGNORE INTO feedback_moderation_settings (setting_name, setting_value, description) VALUES 
('auto_approve_threshold', '0.8', 'Confidence threshold for auto-approval (0-1)'),
('require_moderation', 'true', 'Whether all feedback requires manual moderation'),
('moderation_timeout_hours', '24', 'Hours before feedback is auto-approved if not moderated'),
('spam_keywords', 'spam,scam,fake', 'Comma-separated keywords to flag as spam'),
('inappropriate_keywords', 'hate,abuse,violence', 'Comma-separated keywords to flag as inappropriate');





















