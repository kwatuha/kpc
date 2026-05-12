-- Migration: Add Revision Workflow for Public Content Approval
-- Description: Adds revision_requested status and revision tracking fields
-- Date: 2025-01-27

-- Add revision fields to county_proposed_projects table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'county_proposed_projects' 
    AND COLUMN_NAME = 'revision_requested');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `county_proposed_projects`
    ADD COLUMN `revision_requested` TINYINT(1) DEFAULT 0 COMMENT ''Whether revisions have been requested'',
    ADD COLUMN `revision_notes` TEXT DEFAULT NULL COMMENT ''Notes from approver about what needs to be changed'',
    ADD COLUMN `revision_requested_by` INT DEFAULT NULL COMMENT ''User ID who requested revisions'',
    ADD COLUMN `revision_requested_at` DATETIME DEFAULT NULL COMMENT ''Date and time when revisions were requested'',
    ADD COLUMN `revision_submitted_at` DATETIME DEFAULT NULL COMMENT ''Date and time when creator submitted revisions'',
    ADD INDEX `idx_revision_requested` (`revision_requested`)',
    'SELECT ''Columns already exist'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add revision fields to citizen_proposals table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'citizen_proposals' 
    AND COLUMN_NAME = 'revision_requested');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `citizen_proposals`
    ADD COLUMN `revision_requested` TINYINT(1) DEFAULT 0 COMMENT ''Whether revisions have been requested'',
    ADD COLUMN `revision_notes` TEXT DEFAULT NULL COMMENT ''Notes from approver about what needs to be changed'',
    ADD COLUMN `revision_requested_by` INT DEFAULT NULL COMMENT ''User ID who requested revisions'',
    ADD COLUMN `revision_requested_at` DATETIME DEFAULT NULL COMMENT ''Date and time when revisions were requested'',
    ADD COLUMN `revision_submitted_at` DATETIME DEFAULT NULL COMMENT ''Date and time when creator submitted revisions'',
    ADD INDEX `idx_revision_requested` (`revision_requested`)',
    'SELECT ''Columns already exist'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add revision fields to project_announcements table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'project_announcements' 
    AND COLUMN_NAME = 'revision_requested');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `project_announcements`
    ADD COLUMN `revision_requested` TINYINT(1) DEFAULT 0 COMMENT ''Whether revisions have been requested'',
    ADD COLUMN `revision_notes` TEXT DEFAULT NULL COMMENT ''Notes from approver about what needs to be changed'',
    ADD COLUMN `revision_requested_by` INT DEFAULT NULL COMMENT ''User ID who requested revisions'',
    ADD COLUMN `revision_requested_at` DATETIME DEFAULT NULL COMMENT ''Date and time when revisions were requested'',
    ADD COLUMN `revision_submitted_at` DATETIME DEFAULT NULL COMMENT ''Date and time when creator submitted revisions'',
    ADD INDEX `idx_revision_requested` (`revision_requested`)',
    'SELECT ''Columns already exist'' as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

