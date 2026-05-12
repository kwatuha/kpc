-- Migration: Add phone_number column to users table
-- Date: 2026-03-05
--
-- This script is written for PostgreSQL. It safely adds the column only if it
-- does not already exist, so it can be run multiple times without errors.

DO $$
BEGIN
    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE users ADD COLUMN phone_number VARCHAR(50);
        RAISE NOTICE 'Added phone_number column to users table';
    ELSE
        RAISE NOTICE 'phone_number column already exists in users table';
    END IF;
END $$;

