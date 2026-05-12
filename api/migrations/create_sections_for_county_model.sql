-- =============================================================================
-- Create sections table for county directorates and seed from departments
-- =============================================================================
-- County model:
--   departments -> sectors
--   sections    -> directorates/sub-sectors
--
-- Safe to re-run.
-- =============================================================================

CREATE TABLE IF NOT EXISTS sections (
    "sectionId" SERIAL PRIMARY KEY,
    "departmentId" INTEGER,
    name VARCHAR(255) NOT NULL,
    alias TEXT,
    location TEXT,
    address TEXT,
    "contactPerson" VARCHAR(255),
    "phoneNumber" VARCHAR(255),
    email TEXT,
    remarks TEXT,
    voided BOOLEAN DEFAULT FALSE,
    "userId" INTEGER,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "voidedBy" INTEGER,
    CONSTRAINT sections_department_fk
        FOREIGN KEY ("departmentId") REFERENCES departments("departmentId")
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sections_department_id ON sections("departmentId");
CREATE INDEX IF NOT EXISTS idx_sections_voided ON sections(voided);
CREATE INDEX IF NOT EXISTS idx_sections_name ON sections(name);

COMMENT ON TABLE sections IS 'County directorates/sub-sectors under departments (sectors).';

-- Seed section rows from "Directorate - ..." departments previously inserted.
WITH directorate_rows AS (
    SELECT
        ddir."departmentId" AS source_department_id,
        ddir.name AS source_name,
        ddir.alias AS source_alias,
        ddir."ministryId",
        CASE
            WHEN ddir.alias ILIKE '%Co-operative Governance%' THEN 'Co-operative Development'
            WHEN ddir.alias ILIKE '%Growth%Co-operatives%' THEN 'Co-operative Development'
            WHEN ddir.alias ILIKE '%Local Trade Development%' THEN 'Trade Development and External Relations'
            WHEN ddir.alias ILIKE '%Administrative and Planning%' THEN 'Trade Development and External Relations'
            WHEN ddir.alias ILIKE '%Akamba Culture Promotion%' THEN 'Culture'
            WHEN ddir.alias ILIKE '%Street Lighting%' THEN 'Energy'
            WHEN ddir.alias ILIKE '%Rural Electrification%' THEN 'Energy'
            WHEN ddir.alias ILIKE '%Road Network Development%' THEN 'Roads and Transport'
            WHEN ddir.alias ILIKE '%Lands Admin%' THEN 'Lands and Physical Planning'
            WHEN ddir.alias ILIKE '%Street Addressing%' THEN 'Lands and Physical Planning'
            ELSE NULL
        END AS target_department_name
    FROM departments ddir
    WHERE COALESCE(ddir.voided, FALSE) = FALSE
      AND ddir.name ILIKE 'Directorate - %'
),
resolved_targets AS (
    SELECT
        r.*,
        dbase."departmentId" AS target_department_id
    FROM directorate_rows r
    LEFT JOIN departments dbase
        ON COALESCE(dbase.voided, FALSE) = FALSE
       AND dbase.name = r.target_department_name
),
to_insert AS (
    SELECT
        rt.target_department_id AS "departmentId",
        REPLACE(rt.source_name, 'Directorate - ', '') AS name,
        rt.source_alias AS alias,
        'Seeded from legacy directorate department row'::TEXT AS remarks
    FROM resolved_targets rt
    WHERE rt.target_department_id IS NOT NULL
)
INSERT INTO sections ("departmentId", name, alias, remarks, voided)
SELECT
    ti."departmentId",
    ti.name,
    ti.alias,
    ti.remarks,
    FALSE
FROM to_insert ti
WHERE NOT EXISTS (
    SELECT 1
    FROM sections s
    WHERE s."departmentId" = ti."departmentId"
      AND LOWER(TRIM(s.name)) = LOWER(TRIM(ti.name))
      AND COALESCE(s.voided, FALSE) = FALSE
);
