-- Migration: Add budgetId column to projects table
-- Purpose: Track which budget created/imported a project
-- Date: 2026-02-02

-- Add budgetId column (optional/nullable) to projects
ALTER TABLE projects 
ADD COLUMN budgetId INT NULL AFTER finYearId,
ADD INDEX idx_budgetId (budgetId);

-- Add foreign key constraint (optional, can be removed if you prefer not to enforce referential integrity)
-- ALTER TABLE projects 
-- ADD CONSTRAINT fk_projects_budget 
-- FOREIGN KEY (budgetId) REFERENCES budgets(budgetId) 
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- Note: Foreign key constraint is commented out to allow flexibility
-- You can uncomment it if you want to enforce referential integrity
