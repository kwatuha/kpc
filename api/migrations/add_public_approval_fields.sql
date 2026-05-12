-- Migration: Add Public Approval Fields
-- Description: Adds approval fields to tables for controlling public visibility
-- Date: 2025-01-27

-- Add approval fields to county_proposed_projects table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'county_proposed_projects' 
    AND COLUMN_NAME = 'approved_for_public');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `county_proposed_projects`
    ADD COLUMN `approved_for_public` TINYINT(1) DEFAULT 0 COMMENT ''Whether this project is approved for public viewing'',
    ADD COLUMN `approved_by` INT DEFAULT NULL COMMENT ''User ID who approved this for public viewing'',
    ADD COLUMN `approved_at` DATETIME DEFAULT NULL COMMENT ''Date and time when approved for public viewing'',
    ADD COLUMN `approval_notes` TEXT DEFAULT NULL COMMENT ''Notes from the approver''',
    'SELECT ''Columns already exist'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for approval fields (if they don't exist)
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'county_proposed_projects' 
    AND INDEX_NAME = 'idx_approved_for_public');

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE `county_proposed_projects` ADD INDEX `idx_approved_for_public` (`approved_for_public`)',
    'SELECT ''Index already exists'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'county_proposed_projects' 
    AND INDEX_NAME = 'idx_approved_by');

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE `county_proposed_projects` ADD INDEX `idx_approved_by` (`approved_by`)',
    'SELECT ''Index already exists'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add approval fields to citizen_proposals table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'citizen_proposals' 
    AND COLUMN_NAME = 'approved_for_public');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `citizen_proposals`
    ADD COLUMN `approved_for_public` TINYINT(1) DEFAULT 0 COMMENT ''Whether this proposal is approved for public viewing'',
    ADD COLUMN `approved_by` INT DEFAULT NULL COMMENT ''User ID who approved this for public viewing'',
    ADD COLUMN `approved_at` DATETIME DEFAULT NULL COMMENT ''Date and time when approved for public viewing'',
    ADD COLUMN `approval_notes` TEXT DEFAULT NULL COMMENT ''Notes from the approver''',
    'SELECT ''Columns already exist'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for approval fields
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'citizen_proposals' 
    AND INDEX_NAME = 'idx_approved_for_public');

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE `citizen_proposals` ADD INDEX `idx_approved_for_public` (`approved_for_public`)',
    'SELECT ''Index already exists'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'citizen_proposals' 
    AND INDEX_NAME = 'idx_approved_by');

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE `citizen_proposals` ADD INDEX `idx_approved_by` (`approved_by`)',
    'SELECT ''Index already exists'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add approval fields to project_announcements table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'project_announcements' 
    AND COLUMN_NAME = 'approved_for_public');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `project_announcements`
    ADD COLUMN `approved_for_public` TINYINT(1) DEFAULT 0 COMMENT ''Whether this announcement is approved for public viewing'',
    ADD COLUMN `approved_by` INT DEFAULT NULL COMMENT ''User ID who approved this for public viewing'',
    ADD COLUMN `approved_at` DATETIME DEFAULT NULL COMMENT ''Date and time when approved for public viewing'',
    ADD COLUMN `approval_notes` TEXT DEFAULT NULL COMMENT ''Notes from the approver''',
    'SELECT ''Columns already exist'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for approval fields
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'project_announcements' 
    AND INDEX_NAME = 'idx_approved_for_public');

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE `project_announcements` ADD INDEX `idx_approved_for_public` (`approved_for_public`)',
    'SELECT ''Index already exists'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'project_announcements' 
    AND INDEX_NAME = 'idx_approved_by');

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE `project_announcements` ADD INDEX `idx_approved_by` (`approved_by`)',
    'SELECT ''Index already exists'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

