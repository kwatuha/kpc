-- Migration: Add Feedback Moderation System
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

-- Add moderation fields to public_feedback table
ALTER TABLE public_feedback 
ADD COLUMN moderation_status ENUM('pending', 'approved', 'rejected', 'flagged') DEFAULT 'pending',
ADD COLUMN moderation_reason ENUM(
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
ADD COLUMN custom_reason TEXT DEFAULT NULL,
ADD COLUMN moderator_notes TEXT DEFAULT NULL,
ADD COLUMN moderated_by INT DEFAULT NULL,
ADD COLUMN moderated_at DATETIME DEFAULT NULL;

-- Add indexes for moderation fields
ALTER TABLE public_feedback 
ADD INDEX idx_moderation_status (moderation_status),
ADD INDEX idx_moderated_by (moderated_by),
ADD INDEX idx_moderated_at (moderated_at);

-- Add foreign key constraint for moderated_by
ALTER TABLE public_feedback 
ADD CONSTRAINT IF NOT EXISTS fk_public_feedback_moderated_by 
FOREIGN KEY (moderated_by) REFERENCES users(userId) ON DELETE SET NULL;

-- Add moderation fields to projectfeedback table (for internal project feedback)
ALTER TABLE projectfeedback 
ADD COLUMN moderation_status ENUM('pending', 'approved', 'rejected', 'flagged') DEFAULT 'pending',
ADD COLUMN moderation_reason ENUM(
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
ADD COLUMN custom_reason TEXT DEFAULT NULL,
ADD COLUMN moderator_notes TEXT DEFAULT NULL,
ADD COLUMN moderated_by INT DEFAULT NULL,
ADD COLUMN moderated_at DATETIME DEFAULT NULL;

-- Add indexes for moderation fields in projectfeedback
ALTER TABLE projectfeedback 
ADD INDEX idx_moderation_status (moderation_status),
ADD INDEX idx_moderated_by (moderated_by),
ADD INDEX idx_moderated_at (moderated_at);

-- Add foreign key constraint for moderated_by in projectfeedback
ALTER TABLE projectfeedback 
ADD CONSTRAINT IF NOT EXISTS fk_project_feedback_moderated_by 
FOREIGN KEY (moderated_by) REFERENCES users(userId) ON DELETE SET NULL;

-- Create view for approved public feedback (for public display)
CREATE OR REPLACE VIEW approved_public_feedback AS
SELECT 
    f.*,
    p.projectName as project_name,
    u.name as moderator_name
FROM public_feedback f
LEFT JOIN projects p ON f.project_id = p.id
LEFT JOIN users u ON f.moderated_by = u.id
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
    u.name as moderator_name,
    'public_feedback' as feedback_type
FROM public_feedback f
LEFT JOIN projects p ON f.project_id = p.id
LEFT JOIN users u ON f.moderated_by = u.id
WHERE f.moderation_status = 'pending'

UNION ALL

SELECT 
    pf.feedbackId as id,
    pf.createdBy as name,
    NULL as email,
    'Project Feedback' as subject,
    pf.feedbackMessage as message,
    pf.projectId as project_id,
    CASE 
        WHEN pf.voided = 1 THEN 'archived'
        ELSE 'active'
    END as status,
    pf.moderation_status,
    pf.moderation_reason,
    pf.custom_reason,
    pf.moderator_notes,
    pf.createdAt as created_at,
    pf.updatedAt as updated_at,
    p.projectName as project_name,
    u.name as moderator_name,
    'project_feedback' as feedback_type
FROM projectfeedback pf
LEFT JOIN projects p ON pf.projectId = p.id
LEFT JOIN users u ON pf.moderated_by = u.id
WHERE pf.moderation_status = 'pending'
ORDER BY created_at DESC;

-- Insert default moderation settings (optional)
INSERT IGNORE INTO feedback_moderation_settings (
    setting_name,
    setting_value,
    description,
    created_at
) VALUES 
('auto_approve_threshold', '0.8', 'Confidence threshold for auto-approval (0-1)', NOW()),
('require_moderation', 'true', 'Whether all feedback requires manual moderation', NOW()),
('moderation_timeout_hours', '24', 'Hours before feedback is auto-approved if not moderated', NOW()),
('spam_keywords', 'spam,scam,fake', 'Comma-separated keywords to flag as spam', NOW()),
('inappropriate_keywords', 'hate,abuse,violence', 'Comma-separated keywords to flag as inappropriate', NOW());

-- Create feedback_moderation_settings table for configuration
CREATE TABLE IF NOT EXISTS feedback_moderation_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
