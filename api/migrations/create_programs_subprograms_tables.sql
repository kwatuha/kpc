-- Create programs and subprograms tables for PostgreSQL
-- This script creates the table structure needed before migrating data

-- Programs table
-- Note: SERIAL allows manual ID insertion during migration
-- After migration, reset the sequence: SELECT setval('programs_programId_seq', COALESCE((SELECT MAX("programId") FROM programs), 1), true);
CREATE TABLE IF NOT EXISTS programs (
    "programId" SERIAL PRIMARY KEY,
    programme VARCHAR(255) NOT NULL,
    remarks TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    voided BOOLEAN DEFAULT false,
    "voidedBy" INTEGER,
    cidpid INTEGER,
    "departmentId" INTEGER,
    "sectionId" INTEGER,
    "needsPriorities" TEXT,
    strategies TEXT,
    objectives TEXT,
    outcomes TEXT
);

-- Subprograms table
-- Note: SERIAL allows manual ID insertion during migration
-- After migration, reset the sequence: SELECT setval('subprograms_subProgramId_seq', COALESCE((SELECT MAX("subProgramId") FROM subprograms), 1), true);
CREATE TABLE IF NOT EXISTS subprograms (
    "subProgramId" SERIAL PRIMARY KEY,
    "programId" INTEGER NOT NULL,
    subProgramme VARCHAR(255) NOT NULL,
    "keyOutcome" TEXT,
    kpi TEXT,
    baseline TEXT,
    "yr1Targets" TEXT,
    "yr2Targets" TEXT,
    "yr3Targets" TEXT,
    "yr4Targets" TEXT,
    "yr5Targets" TEXT,
    "yr1Budget" DECIMAL(15, 2),
    "yr2Budget" DECIMAL(15, 2),
    "yr3Budget" DECIMAL(15, 2),
    "yr4Budget" DECIMAL(15, 2),
    "yr5Budget" DECIMAL(15, 2),
    "totalBudget" DECIMAL(15, 2),
    remarks TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    voided BOOLEAN DEFAULT false,
    "voidedBy" INTEGER,
    CONSTRAINT fk_subprograms_program FOREIGN KEY ("programId") REFERENCES programs("programId") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_programs_voided ON programs(voided);
CREATE INDEX IF NOT EXISTS idx_programs_programme ON programs(programme);
CREATE INDEX IF NOT EXISTS idx_subprograms_programId ON subprograms("programId");
CREATE INDEX IF NOT EXISTS idx_subprograms_voided ON subprograms(voided);
CREATE INDEX IF NOT EXISTS idx_subprograms_subProgramme ON subprograms(subProgramme);

-- Add comments for documentation
COMMENT ON TABLE programs IS 'Programs table - main programs';
COMMENT ON TABLE subprograms IS 'Subprograms table - sub-programs belonging to programs';
COMMENT ON COLUMN programs."programId" IS 'Primary key - program ID';
COMMENT ON COLUMN subprograms."subProgramId" IS 'Primary key - subprogram ID';
COMMENT ON COLUMN subprograms."programId" IS 'Foreign key to programs table';

-- After migrating data, run these to reset sequences:
-- SELECT setval('programs_programId_seq', COALESCE((SELECT MAX("programId") FROM programs), 1), true);
-- SELECT setval('subprograms_subProgramId_seq', COALESCE((SELECT MAX("subProgramId") FROM subprograms), 1), true);
