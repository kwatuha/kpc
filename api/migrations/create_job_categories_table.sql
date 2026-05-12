-- Migration: Create job_categories table
-- Date: 2026-03-05
--
-- This script creates the job_categories table for storing job opportunity categories.
-- It is written for PostgreSQL and can be run multiple times safely.

CREATE TABLE IF NOT EXISTS job_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    voided BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_categories_name ON job_categories(name);
CREATE INDEX IF NOT EXISTS idx_job_categories_voided ON job_categories(voided);

-- Create unique constraint on name to prevent duplicates (only for non-voided records)
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_categories_unique_name ON job_categories(name) WHERE voided = false;

-- Add comment to table
COMMENT ON TABLE job_categories IS 'Stores job opportunity categories for project jobs';
