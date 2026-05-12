-- ============================================================================
-- KEMRI Strategic Plan 2023-2027 alignment
-- ----------------------------------------------------------------------------
-- Re-uses the existing CIDP-style tables (strategicplans / programs /
-- subprograms) that already model a 5-year plan with KRAs, objectives,
-- year-1..5 targets and budgets. We layer on:
--   1. A many-to-many bridge to KEMRI research projects (a study can
--      contribute to more than one strategic objective).
--   2. A many-to-many bridge to KEMRI outputs (publications, datasets,
--      policy briefs, IP) so post-study impact rolls up to the plan.
--   3. A new kemri_strategic_achievements table that lets the M&E team
--      record narrative "key achievements" against any strategic
--      objective, with optional quantitative value, evidence link,
--      and provenance (project / output that produced the achievement).
-- ----------------------------------------------------------------------------
-- The strategicplans / programs / subprograms tables are created on the fly
-- by api/routes/strategic.routes.js (ensureStrategyTables). We do NOT
-- recreate them here; we only add KEMRI-specific bridge tables and an FK
-- helper column on kemri_research_projects.
-- ============================================================================

-- -- 1. Primary strategic objective on a research project ----------------------
--   A study can contribute to many objectives, but exactly one is its
--   "primary" objective for dashboard rollup purposes. We keep the legacy
--   strategic_plan_kras / strategic_plan_objectives JSONB columns for
--   backwards-compatibility with imported sample data, but new code should
--   prefer the FK + bridge table below.
ALTER TABLE kemri_research_projects
  ADD COLUMN IF NOT EXISTS primary_objective_id BIGINT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
     WHERE constraint_name = 'kemri_research_projects_primary_objective_fkey'
       AND table_name = 'kemri_research_projects'
  ) THEN
    BEGIN
      ALTER TABLE kemri_research_projects
        ADD CONSTRAINT kemri_research_projects_primary_objective_fkey
        FOREIGN KEY (primary_objective_id) REFERENCES subprograms ("subProgramId");
    EXCEPTION WHEN undefined_table THEN
      -- subprograms not created yet (first boot before the strategic.routes
      -- ensureStrategyTables ran). The FK is added the next time this
      -- migration is replayed; the column itself still works fine.
      RAISE NOTICE 'subprograms table not yet present, skipping FK';
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_kemri_research_projects_primary_objective
  ON kemri_research_projects (primary_objective_id);

-- -- 2. Project <-> strategic objective bridge -------------------------------
CREATE TABLE IF NOT EXISTS kemri_project_strategic_links (
    id               BIGSERIAL PRIMARY KEY,
    project_id       BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
    sub_program_id   BIGINT NOT NULL,
    contribution_pct NUMERIC(5,2) NULL,   -- 0..100, how much of the project supports this objective
    notes            TEXT NULL,
    created_by       INTEGER NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    voided           INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_kemri_project_strategic_links
  ON kemri_project_strategic_links (project_id, sub_program_id)
  WHERE voided = 0;
CREATE INDEX IF NOT EXISTS idx_kemri_project_strategic_links_obj
  ON kemri_project_strategic_links (sub_program_id);

-- -- 3. Output <-> strategic objective bridge --------------------------------
CREATE TABLE IF NOT EXISTS kemri_output_strategic_links (
    id             BIGSERIAL PRIMARY KEY,
    output_id      BIGINT NOT NULL REFERENCES kemri_outputs(id) ON DELETE CASCADE,
    sub_program_id BIGINT NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    voided         INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_kemri_output_strategic_links
  ON kemri_output_strategic_links (output_id, sub_program_id)
  WHERE voided = 0;
CREATE INDEX IF NOT EXISTS idx_kemri_output_strategic_links_obj
  ON kemri_output_strategic_links (sub_program_id);

-- -- 4. Key strategic achievements -------------------------------------------
--   M&E officers (or the system, auto) record material achievements
--   tied to an objective. Examples:
--    - "Published WHO AMR paper" (achievement_type = 'publication',
--      output_id pointing at the publication)
--    - "Filed Malaria diagnostic patent" (achievement_type = 'ip',
--      output_id pointing at the patent)
--    - "Trained 24 MSc graduates" (achievement_type = 'capacity',
--      value_numeric = 24)
--    - "Hosted Africa CDC genomics summit" (achievement_type = 'event')
CREATE TABLE IF NOT EXISTS kemri_strategic_achievements (
    id                 BIGSERIAL PRIMARY KEY,
    sub_program_id     BIGINT NOT NULL,                 -- strategic objective FK
    project_id         BIGINT NULL REFERENCES kemri_research_projects(id) ON DELETE SET NULL,
    output_id          BIGINT NULL REFERENCES kemri_outputs(id) ON DELETE SET NULL,
    fy_label           VARCHAR(16) NULL,                -- e.g. 'FY2024/25'
    quarter            VARCHAR(4)  NULL,                -- 'Q1'..'Q4'
    achievement_type   VARCHAR(32) NOT NULL,            -- publication | ip | dataset | policy | capacity | event | partnership | infrastructure | milestone | other
    title              TEXT        NOT NULL,
    narrative          TEXT        NULL,
    value_numeric      NUMERIC(18,4) NULL,              -- numeric contribution (e.g. number trained)
    value_unit         VARCHAR(64) NULL,                -- e.g. 'graduates', 'KES', 'studies'
    contribution_pct   NUMERIC(5,2) NULL,               -- % of plan KPI achieved
    evidence_url       TEXT NULL,
    auto_generated     INTEGER NOT NULL DEFAULT 0,      -- 1 = derived from outputs/milestones
    achieved_on        DATE NULL,
    recorded_by        INTEGER NULL,
    voided             INTEGER NOT NULL DEFAULT 0,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_strategic_achievements_objective ON kemri_strategic_achievements (sub_program_id);
CREATE INDEX IF NOT EXISTS idx_kemri_strategic_achievements_project   ON kemri_strategic_achievements (project_id);
CREATE INDEX IF NOT EXISTS idx_kemri_strategic_achievements_fy        ON kemri_strategic_achievements (fy_label);
CREATE INDEX IF NOT EXISTS idx_kemri_strategic_achievements_type      ON kemri_strategic_achievements (achievement_type);
CREATE UNIQUE INDEX IF NOT EXISTS uq_kemri_strategic_achievements_output
  ON kemri_strategic_achievements (sub_program_id, output_id)
  WHERE voided = 0 AND output_id IS NOT NULL;

COMMENT ON TABLE kemri_strategic_achievements IS 'M&E key achievements rolled up against KEMRI Strategic Plan 2023-2027 objectives (subprograms). One row = one material accomplishment.';
COMMENT ON COLUMN kemri_strategic_achievements.sub_program_id IS 'subprograms.subProgramId — the strategic objective this achievement contributes to.';
COMMENT ON COLUMN kemri_strategic_achievements.auto_generated IS 'When 1, was auto-created by the workflow engine (e.g. high-IF publication, granted patent) and can be hidden/dedup safely.';

-- -- 5. Reference: pin the active KEMRI plan ---------------------------------
ALTER TABLE strategicplans ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE strategicplans ADD COLUMN IF NOT EXISTS theme TEXT NULL;
ALTER TABLE strategicplans ADD COLUMN IF NOT EXISTS strategic_goal TEXT NULL;
ALTER TABLE strategicplans ADD COLUMN IF NOT EXISTS core_values TEXT NULL;
