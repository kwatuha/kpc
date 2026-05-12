-- KEMRI Form v05 — sections 5 through 11.
-- Closes the remaining gaps in coverage of kemri_tools.pdf:
--   §5  Human Resource     -> kemri_research_staff, kemri_capacity_building
--   §6  Equipment           -> kemri_research_equipment
--   §7  Financial line items-> kemri_budget_lines
--   §9  Laboratory analyses -> kemri_lab_analyses
--   §10 Operations feedback -> kemri_operations_feedback
--   §11 SWOT / lessons      -> kemri_swot_lessons
--
-- Each table is a per-project sub-resource and follows the same conventions as
-- the rest of the kemri_* schema (snake_case, INTEGER voided, TIMESTAMPTZ).

BEGIN;

-- ---------------------------------------------------------------------------
-- §5  Human Resource — staff involved in the study
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_research_staff (
  id              BIGSERIAL PRIMARY KEY,
  project_id      BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  staff_name      TEXT NOT NULL,
  role            TEXT,
  role_code       VARCHAR(32),    -- KEMRI HR role code, e.g. R-PI, R-CO, R-LAB, R-DM
  qualification   TEXT,
  fte             NUMERIC(4,2),    -- 0.00..1.00 fraction of full-time
  payroll_no      VARCHAR(64),
  start_date      DATE,
  end_date        DATE,
  funded_by       VARCHAR(32),     -- grant | kemri | partner | other
  notes           TEXT,
  voided          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_research_staff_project ON kemri_research_staff(project_id);

-- ---------------------------------------------------------------------------
-- §5  Capacity building — training events tied to a study
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_capacity_building (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  event_title         TEXT NOT NULL,
  event_type          VARCHAR(32),   -- training | workshop | conference | mentorship | degree
  start_date          DATE,
  end_date            DATE,
  location            TEXT,
  participants_count  INTEGER,
  facilitator         TEXT,
  outcome_summary     TEXT,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_capacity_building_project ON kemri_capacity_building(project_id);

-- ---------------------------------------------------------------------------
-- §6  Equipment & infrastructure register
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_research_equipment (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  item_name           TEXT NOT NULL,
  category            VARCHAR(32),   -- lab | ict | field | vehicle | infrastructure
  serial_number       VARCHAR(128),
  asset_tag           VARCHAR(128),
  acquisition_date    DATE,
  acquisition_cost    NUMERIC(18,2),
  currency            VARCHAR(8) DEFAULT 'KES',
  vendor              TEXT,
  warranty_until      DATE,
  custodian           TEXT,
  location            TEXT,
  status              VARCHAR(32) DEFAULT 'in_use',  -- in_use | maintenance | retired | lost
  notes               TEXT,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_research_equipment_project ON kemri_research_equipment(project_id);

-- ---------------------------------------------------------------------------
-- §7  Financial utilisation — line-level budget breakdown
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_budget_lines (
  id                    BIGSERIAL PRIMARY KEY,
  project_id            BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  category              VARCHAR(64) NOT NULL,
                          -- personnel | equipment | consumables | travel |
                          -- subcontract | indirect | publications | other
  description           TEXT,
  budgeted_amount       NUMERIC(18,2),
  expenditure_to_date   NUMERIC(18,2) DEFAULT 0,
  currency              VARCHAR(8) DEFAULT 'KES',
  fy_label              VARCHAR(16),    -- e.g. FY2026/27 (optional FY tag)
  voided                INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_budget_lines_project ON kemri_budget_lines(project_id);

-- ---------------------------------------------------------------------------
-- §9  Laboratory analyses register (planned vs completed per assay)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_lab_analyses (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  analysis_type       TEXT NOT NULL,     -- e.g. WGS, qPCR, ELISA, sequencing
  platform            TEXT,              -- e.g. Illumina NovaSeq, MinION, BioRad qPCR
  sample_type         TEXT,              -- e.g. whole blood, NP swab, sputum, stool
  total_planned       INTEGER,
  completed           INTEGER DEFAULT 0,
  qc_pass_rate        NUMERIC(5,2),
  unit_cost           NUMERIC(12,2),
  currency            VARCHAR(8) DEFAULT 'KES',
  comments            TEXT,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_lab_analyses_project ON kemri_lab_analyses(project_id);

-- ---------------------------------------------------------------------------
-- §10 Operations feedback — partner / community / donor / regulatory feedback
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_operations_feedback (
  id              BIGSERIAL PRIMARY KEY,
  project_id      BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  feedback_type   VARCHAR(32),           -- partner | community | donor | regulatory | internal
  source          TEXT,
  date_received   DATE,
  summary         TEXT NOT NULL,
  action_taken    TEXT,
  status          VARCHAR(16) DEFAULT 'open',  -- open | actioned | closed
  raised_by       INTEGER,
  voided          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_operations_feedback_project ON kemri_operations_feedback(project_id);

-- ---------------------------------------------------------------------------
-- §11 SWOT / lessons learned (also feeds into AI narrative report generator)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_swot_lessons (
  id              BIGSERIAL PRIMARY KEY,
  project_id      BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  category        VARCHAR(16) NOT NULL,
                      -- strength | weakness | opportunity | threat | lesson
  description     TEXT NOT NULL,
  recorded_by     INTEGER,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kemri_swot_lessons_project  ON kemri_swot_lessons(project_id);
CREATE INDEX IF NOT EXISTS idx_kemri_swot_lessons_category ON kemri_swot_lessons(category);

COMMIT;
