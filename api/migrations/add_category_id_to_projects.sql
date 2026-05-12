-- Migration: Add category_id column to projects table
-- This adds a foreign key reference to the categories table

-- For PostgreSQL
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category_id INTEGER;

-- Add foreign key constraint (optional, but recommended)
-- ALTER TABLE projects 
-- ADD CONSTRAINT fk_projects_category 
-- FOREIGN KEY (category_id) REFERENCES categories("categoryId") 
-- ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);

-- For MySQL (if needed)
-- ALTER TABLE projects 
-- ADD COLUMN categoryId INT NULL,
-- ADD INDEX idx_projects_categoryId (categoryId);
