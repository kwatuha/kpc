-- Migration: Add ministry, state_department, and agency_id columns to users table
-- Date: 2026-03-05

-- Check if columns already exist before adding them
DO $$
BEGIN
    -- Add ministry column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'ministry'
    ) THEN
        ALTER TABLE users ADD COLUMN ministry VARCHAR(255);
        RAISE NOTICE 'Added ministry column to users table';
    ELSE
        RAISE NOTICE 'ministry column already exists in users table';
    END IF;

    -- Add state_department column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'state_department'
    ) THEN
        ALTER TABLE users ADD COLUMN state_department VARCHAR(255);
        RAISE NOTICE 'Added state_department column to users table';
    ELSE
        RAISE NOTICE 'state_department column already exists in users table';
    END IF;

    -- Add agency_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'agency_id'
    ) THEN
        ALTER TABLE users ADD COLUMN agency_id INTEGER;
        RAISE NOTICE 'Added agency_id column to users table';
    ELSE
        RAISE NOTICE 'agency_id column already exists in users table';
    END IF;

    -- Add foreign key constraint for agency_id if agencies table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'agencies'
    ) THEN
        -- Check if foreign key already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'users_agency_id_fkey' 
            AND table_name = 'users'
        ) THEN
            ALTER TABLE users 
            ADD CONSTRAINT users_agency_id_fkey 
            FOREIGN KEY (agency_id) REFERENCES agencies(id);
            RAISE NOTICE 'Added foreign key constraint for agency_id';
        ELSE
            RAISE NOTICE 'Foreign key constraint for agency_id already exists';
        END IF;
    END IF;
END $$;
