-- Migration to add unique constraint on finYearName for financialyears
-- This prevents duplicate financial year names from being created

-- First, remove any duplicate entries (keep the one with the lowest finYearId)
-- This query identifies duplicates
-- Note: Run this manually if you have duplicates to clean up first

-- Add unique constraint on finYearName
-- Note: This will fail if duplicates exist. Clean up duplicates first if needed.
ALTER TABLE financialyears 
ADD UNIQUE INDEX idx_unique_finYearName (finYearName);


