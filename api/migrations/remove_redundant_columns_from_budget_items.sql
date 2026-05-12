-- Migration: Remove redundant columns from budget_items
-- Purpose: Remove departmentId, wardId, subcountyId, projectName, amount, and status since these are tracked in projects
-- Date: 2026-02-02
-- 
-- Rationale:
-- - projects already has departmentId, projectName, costOfProject, and status
-- - Projects are linked to wards/subcounties through junction tables (project_wards, project_subcounties)
-- - Budget items are now always linked to projects via projectId
-- - Amount comes from projects.costOfProject
-- - Status comes from projects.status
-- - This eliminates redundancy and unnecessary joins
-- - Single source of truth for project data

-- Step 1: Verify that all budget items have projectId (should be true after recent changes)
-- Run this query first to check:
-- SELECT COUNT(*) as items_without_project FROM budget_items WHERE projectId IS NULL AND voided = 0;

-- Step 2: Remove foreign key constraints if they exist (MySQL will handle this automatically)
-- Note: We're removing the columns, so any foreign keys will be dropped automatically

-- Step 3: Drop foreign key constraints on columns we're removing
-- Note: Must drop foreign keys before dropping indexes or columns
-- MySQL doesn't support IF EXISTS for DROP FOREIGN KEY, so we check first
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND constraint_name = 'fk_budget_items_department'
    AND constraint_type = 'FOREIGN KEY') > 0,
    'ALTER TABLE budget_items DROP FOREIGN KEY fk_budget_items_department',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Drop indexes on columns we're removing (if they exist)
-- Note: MySQL doesn't support DROP INDEX IF EXISTS, so we'll try to drop them
-- If they don't exist, the error will be ignored
SET @sql = 'ALTER TABLE budget_items DROP INDEX idx_departmentId';
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND index_name = 'idx_departmentId') > 0, @sql, 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'ALTER TABLE budget_items DROP INDEX idx_wardId';
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND index_name = 'idx_wardId') > 0, @sql, 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'ALTER TABLE budget_items DROP INDEX idx_subcountyId';
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND index_name = 'idx_subcountyId') > 0, @sql, 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Remove the columns
-- Note: MySQL doesn't support DROP COLUMN IF EXISTS, so we check first
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND column_name = 'departmentId') > 0,
    'ALTER TABLE budget_items DROP COLUMN departmentId',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND column_name = 'wardId') > 0,
    'ALTER TABLE budget_items DROP COLUMN wardId',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND column_name = 'subcountyId') > 0,
    'ALTER TABLE budget_items DROP COLUMN subcountyId',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 6: Remove projectName column (redundant - get from projects via projectId)
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND column_name = 'projectName') > 0,
    'ALTER TABLE budget_items DROP COLUMN projectName',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 7: Remove amount column (redundant - get from projects.costOfProject via projectId)
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND column_name = 'amount') > 0,
    'ALTER TABLE budget_items DROP COLUMN amount',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 8: Remove status column (redundant - get from projects.status via projectId)
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = DATABASE() 
    AND table_name = 'budget_items' 
    AND column_name = 'status') > 0,
    'ALTER TABLE budget_items DROP COLUMN status',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
