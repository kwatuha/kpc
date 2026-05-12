-- Migration: Change startDate and endDate from datetime to date type
-- Date: 2025-01-19
-- Description: Converts startDate and endDate columns in projects table from datetime to date type
--              This prevents datetime format issues during imports and is more appropriate for project dates

-- Backup existing data (optional, for safety)
-- The data will be preserved automatically during ALTER TABLE as MySQL handles the conversion

-- Change startDate from datetime to date
ALTER TABLE projects 
MODIFY COLUMN startDate DATE NULL DEFAULT NULL;

-- Change endDate from datetime to date
ALTER TABLE projects 
MODIFY COLUMN endDate DATE NULL DEFAULT NULL;

-- Verify the changes
-- DESCRIBE projects; should show startDate and endDate as DATE type













