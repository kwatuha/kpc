-- =============================================================================
-- Ministries table + departments.ministryId (PostgreSQL / remote-safe)
-- =============================================================================
-- Prerequisites: `departments` table must already exist.
--
-- Run on the remote database (example):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/migrations/create_ministries_and_link_departments.sql
--
-- Safe to re-run: uses IF NOT EXISTS / guards so a second run is mostly no-op.
-- =============================================================================

CREATE TABLE IF NOT EXISTS ministries (
    "ministryId" SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    alias TEXT,
    voided BOOLEAN NOT NULL DEFAULT FALSE,
    "userId" INTEGER,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voidedBy" INTEGER,
    CONSTRAINT ministries_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_ministries_voided ON ministries(voided) WHERE voided = FALSE;

-- Add nullable column first (re-run safe). FK is attached in the block below so
-- a column added manually without a constraint can still get the FK on re-run.
ALTER TABLE departments
    ADD COLUMN IF NOT EXISTS "ministryId" INTEGER;

DO $$
DECLARE
    fk_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class rel ON rel.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = rel.relnamespace
        JOIN pg_class frel ON frel.oid = c.confrelid
        WHERE n.nspname = current_schema()
          AND rel.relname = 'departments'
          AND frel.relname = 'ministries'
          AND c.contype = 'f'
    ) INTO fk_exists;

    IF NOT fk_exists THEN
        ALTER TABLE departments
            ADD CONSTRAINT departments_ministryid_fkey
            FOREIGN KEY ("ministryId") REFERENCES ministries("ministryId") ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_departments_ministry_id ON departments("ministryId");

COMMENT ON TABLE ministries IS 'Kenya ministries (cabinet); departments rows are state departments under a ministry.';
COMMENT ON COLUMN departments."ministryId" IS 'Parent ministry for this state department (metadata).';
