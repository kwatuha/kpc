-- Migration: Create sectors table
-- Date: 2026-03-05
--
-- This script creates the sectors table for storing government sectors.
-- It is written for PostgreSQL and can be run multiple times safely.

CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    voided BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sectors_name ON sectors(name);
CREATE INDEX IF NOT EXISTS idx_sectors_voided ON sectors(voided);

-- Create unique constraint on name to prevent duplicates (only for non-voided records)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sectors_unique_name ON sectors(name) WHERE voided = false;

-- Add comment to table
COMMENT ON TABLE sectors IS 'Stores government sectors for project categorization';
