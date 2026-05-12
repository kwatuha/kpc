-- KEMRI / KIMES (Integrated Monitoring & Evaluation System) schema.
-- Source: KEMRI_Concept.pdf (KIMES v5.0 design) + kemri_tools.pdf (Form v05).
--
-- Naming convention: snake_case columns, IF NOT EXISTS, soft delete via
-- `voided INTEGER NOT NULL DEFAULT 0`, TIMESTAMPTZ timestamps. The API layer
-- camelCases when needed for the React frontend.
--
-- All KEMRI-specific tables are prefixed `kemri_` to keep them isolated from
-- legacy Machakos county tables that we are reusing or deprecating.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Reference data: centres, programmes, donors
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_centres (
  id            BIGSERIAL PRIMARY KEY,
  code          VARCHAR(32) NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  director_user_id INTEGER,
  region        TEXT,
  city          TEXT,
  county        TEXT,
  voided        INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kemri_programmes (
  id            BIGSERIAL PRIMARY KEY,
  code          VARCHAR(32) NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  voided        INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kemri_donors (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  acronym         VARCHAR(64),
  donor_type      TEXT,                 -- bilateral, multilateral, foundation, govt, private
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  country         TEXT,
  portal_enabled  INTEGER NOT NULL DEFAULT 0,
  notes           TEXT,
  voided          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 2. Research projects ("studies") -- KEMRI Form sections 1, 2, 3, 4
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_research_projects (
  id                       BIGSERIAL PRIMARY KEY,
  -- KIMES-generated unique project ID (e.g. KEMRI-CGMR-C-2025-001)
  kimes_project_id         VARCHAR(64) NOT NULL UNIQUE,
  -- Section 1: Grant Information
  project_type             VARCHAR(32),  -- external | local | collaborative
  account_number           VARCHAR(64),
  title                    TEXT NOT NULL,
  short_name               VARCHAR(255),
  pi_user_id               INTEGER,                -- FK to users (PI)
  pi_payroll_no            VARCHAR(64),
  centre_id                BIGINT REFERENCES kemri_centres(id),
  programme_id             BIGINT REFERENCES kemri_programmes(id),
  primary_donor_id         BIGINT REFERENCES kemri_donors(id),
  funding_amount           NUMERIC(18,2),
  funding_currency         VARCHAR(8) DEFAULT 'KES',
  funding_mechanism        VARCHAR(32),  -- solicited | unsolicited
  study_type               VARCHAR(64),  -- basic, clinical, translational, epidemiological, etc.
  contract_type            VARCHAR(64),  -- standard, program, cooperative, clinical_trial, mou, consortium
  contract_number          VARCHAR(128),
  grant_number             VARCHAR(128),
  kemri_legal_number       VARCHAR(128),
  -- Section 2: Compliance
  seru_approval_no         VARCHAR(128),
  seru_approval_date       DATE,
  seru_expiry_date         DATE,
  nacosti_approval_no      VARCHAR(128),
  nacosti_approval_date    DATE,
  proposed_start_date      DATE,
  proposed_end_date        DATE,
  actual_start_date        DATE,
  -- Section 3: Implementation
  primary_org              TEXT,
  primary_org_country      TEXT,
  -- Section 4: Strategic Alignment (JSON arrays of selected codes)
  sdg_codes                JSONB,
  vision2030_codes         JSONB,
  national_health_policy   JSONB,
  strategic_plan_kras      JSONB,
  strategic_plan_objectives JSONB,
  programme_area           VARCHAR(128),
  research_priority        TEXT,
  -- Lifecycle / KIMES status
  status                   VARCHAR(32) NOT NULL DEFAULT 'pre_study',
                              -- pre_study | active | post_study | closed | terminated
  rag_status               VARCHAR(8),  -- green | amber | red | pending
  current_phase            VARCHAR(32) DEFAULT 'registration',
  -- Audit + soft delete
  created_by               INTEGER,
  voided                   INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_research_projects_pi
  ON kemri_research_projects(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_kemri_research_projects_centre
  ON kemri_research_projects(centre_id);
CREATE INDEX IF NOT EXISTS idx_kemri_research_projects_status
  ON kemri_research_projects(status);

-- Co-investigators (Section 3, item 23)
CREATE TABLE IF NOT EXISTS kemri_research_coinvestigators (
  id              BIGSERIAL PRIMARY KEY,
  project_id      BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  qualification   TEXT,
  specialty       TEXT,
  institution     TEXT,
  role            TEXT,
  email           TEXT,
  voided          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Implementation sites with GPS (Section 3, item 22 + step 9 GIS)
CREATE TABLE IF NOT EXISTS kemri_research_sites (
  id              BIGSERIAL PRIMARY KEY,
  project_id      BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  site_name       TEXT NOT NULL,
  country         TEXT,
  county          TEXT,
  sub_county      TEXT,
  ward            TEXT,
  latitude        NUMERIC(10,7),
  longitude       NUMERIC(10,7),
  voided          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Project-specific objectives (up to 5; Section 3, item 24)
CREATE TABLE IF NOT EXISTS kemri_research_objectives (
  id              BIGSERIAL PRIMARY KEY,
  project_id      BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  ordinal         INTEGER NOT NULL,
  description     TEXT NOT NULL,
  voided          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 3. KPIs and milestone plan (Step 2: KPI & Milestone Plan Definition)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_kpis (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  indicator_code      VARCHAR(64),
  indicator_name      TEXT NOT NULL,
  description         TEXT,
  unit_of_measure     TEXT,
  baseline_value      NUMERIC(18,4),
  target_value        NUMERIC(18,4),
  expected_output     TEXT,
  data_source         TEXT,
  collection_method   TEXT,
  reporting_frequency VARCHAR(32) DEFAULT 'quarterly',
  is_smart            INTEGER NOT NULL DEFAULT 1,
  approved_by         INTEGER,
  approved_at         TIMESTAMPTZ,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_kpis_project
  ON kemri_kpis(project_id);

-- ---------------------------------------------------------------------------
-- 4. Quarterly milestone reports (Step 3) and KPI achievement rows
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_milestone_reports (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  fy_label            VARCHAR(16) NOT NULL,    -- e.g. "FY2024/25"
  quarter             VARCHAR(4)  NOT NULL,    -- "Q1" | "Q2" | "Q3" | "Q4"
  reporting_period_end DATE,
  pi_user_id          INTEGER,
  -- Free-text narratives
  staff_status_narrative      TEXT,
  lab_analyses_summary        TEXT,
  equipment_acquired_summary  TEXT,
  capacity_building_summary   TEXT,
  emerging_risks              TEXT,
  -- Financials snapshot (Section 7 of KEMRI form)
  budget_total                NUMERIC(18,2),
  funds_received              NUMERIC(18,2),
  expenditure_to_date         NUMERIC(18,2),
  balance                     NUMERIC(18,2),
  budget_variance_pct         NUMERIC(7,2),
  -- Status / DQA / Review
  status                      VARCHAR(32) NOT NULL DEFAULT 'draft',
                                  -- draft | submitted | dqa_returned | under_review |
                                  -- approved | queried | escalated
  submitted_at                TIMESTAMPTZ,
  dqa_score                   NUMERIC(5,2),
  dqa_passed                  INTEGER,
  reviewed_by                 INTEGER,
  reviewed_at                 TIMESTAMPTZ,
  rag_status                  VARCHAR(8),
  reviewer_comments           TEXT,
  voided                      INTEGER NOT NULL DEFAULT 0,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_kemri_milestone_report_period
    UNIQUE (project_id, fy_label, quarter)
);

CREATE INDEX IF NOT EXISTS idx_kemri_milestone_reports_project
  ON kemri_milestone_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_kemri_milestone_reports_status
  ON kemri_milestone_reports(status);

CREATE TABLE IF NOT EXISTS kemri_kpi_achievements (
  id                  BIGSERIAL PRIMARY KEY,
  report_id           BIGINT NOT NULL REFERENCES kemri_milestone_reports(id) ON DELETE CASCADE,
  kpi_id              BIGINT NOT NULL REFERENCES kemri_kpis(id),
  target_value        NUMERIC(18,4),
  actual_value        NUMERIC(18,4),
  achievement_pct     NUMERIC(7,2),
  status              VARCHAR(16),   -- on_track | behind | ahead | at_risk | not_started
  comments            TEXT,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_kpi_ach_report
  ON kemri_kpi_achievements(report_id);

-- ---------------------------------------------------------------------------
-- 5. DQA scores (Step 4: 8 automated validation checks)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_dqa_scores (
  id                       BIGSERIAL PRIMARY KEY,
  report_id                BIGINT NOT NULL REFERENCES kemri_milestone_reports(id) ON DELETE CASCADE,
  -- 8 checks per spec; 0..100 each
  completeness_score       NUMERIC(5,2),
  numeric_range_score      NUMERIC(5,2),
  gps_validation_score     NUMERIC(5,2),
  financial_arithmetic_score NUMERIC(5,2),
  date_logic_score         NUMERIC(5,2),
  cross_field_score        NUMERIC(5,2),
  seru_expiry_score        NUMERIC(5,2),
  duplicate_check_score    NUMERIC(5,2),
  overall_score            NUMERIC(5,2),
  passed                   INTEGER NOT NULL DEFAULT 0,    -- 1 if overall >= 85
  flagged_fields           JSONB,                          -- [{field, issue, severity}]
  ran_at                   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided                   INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_dqa_scores_report
  ON kemri_dqa_scores(report_id);

-- ---------------------------------------------------------------------------
-- 6. Peer reviews + RAG history (Step 5)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_peer_reviews (
  id                  BIGSERIAL PRIMARY KEY,
  report_id           BIGINT NOT NULL REFERENCES kemri_milestone_reports(id) ON DELETE CASCADE,
  reviewer_user_id    INTEGER NOT NULL,
  reviewer_role       VARCHAR(64),   -- centre_director | senior_scientist
  decision            VARCHAR(16) NOT NULL, -- accept | query | escalate
  rag_status          VARCHAR(8),    -- green | amber | red
  comments            TEXT,
  query_to_pi         TEXT,
  reviewed_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_peer_reviews_report
  ON kemri_peer_reviews(report_id);

CREATE TABLE IF NOT EXISTS kemri_rag_history (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  report_id           BIGINT REFERENCES kemri_milestone_reports(id) ON DELETE SET NULL,
  rag_status          VARCHAR(8) NOT NULL,
  recorded_by         INTEGER,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason              TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_rag_history_project
  ON kemri_rag_history(project_id);

-- ---------------------------------------------------------------------------
-- 7. Escalations (Step 6 + Section 7 non-conformity ladder)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_escalations (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  report_id           BIGINT REFERENCES kemri_milestone_reports(id) ON DELETE SET NULL,
  level               INTEGER NOT NULL,   -- 1..4
  classification      VARCHAR(64),        -- minor | moderate | significant | severe | institutional
  triggered_by        INTEGER,
  triggered_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notice_subject      TEXT,
  notice_body         TEXT,
  notified_user_ids   JSONB,
  resolved            INTEGER NOT NULL DEFAULT 0,
  resolved_at         TIMESTAMPTZ,
  resolution_notes    TEXT,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_escalations_project
  ON kemri_escalations(project_id);
CREATE INDEX IF NOT EXISTS idx_kemri_escalations_level
  ON kemri_escalations(level);

-- ---------------------------------------------------------------------------
-- 8. Post-Study Output Registry (Steps 11-15)
-- ---------------------------------------------------------------------------

-- Generic output table covers all 5 output types via `output_type`. Type-
-- specific fields are kept in `metadata JSONB` to keep the schema small.
CREATE TABLE IF NOT EXISTS kemri_outputs (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  output_type         VARCHAR(32) NOT NULL,
                          -- abstract | publication | dataset | policy_brief | ip_patent
  title               TEXT NOT NULL,
  authors             TEXT,
  date_recorded       DATE,
  status              VARCHAR(32),
                          -- For pubs: submitted | accepted | published
                          -- For abstracts: submitted | accepted | presented
                          -- For datasets: deposited | embargoed | open
                          -- For IP: filed | granted | licensed | expired
  -- Publication / abstract / policy specific
  venue               TEXT,    -- journal name, conference, policy issuer
  doi                 VARCHAR(255),
  pubmed_id           VARCHAR(64),
  url                 TEXT,
  citation_count      INTEGER DEFAULT 0,
  impact_factor       NUMERIC(6,3),
  -- Datasets specific
  repository          TEXT,
  access_level        VARCHAR(32),         -- open | restricted | controlled
  embargo_until       DATE,
  fair_score          NUMERIC(5,2),
  -- IP / patents specific
  ip_type             VARCHAR(64),
  patent_number       VARCHAR(128),
  jurisdiction        TEXT,
  commercialisation_stage INTEGER,   -- 1..10 per KEMRI framework
  patent_expiry_date  DATE,
  revenue_generated   NUMERIC(18,2),
  -- Policy / uptake specific
  policy_audience     TEXT,
  uptake_score        NUMERIC(4,1),         -- 1..10
  -- Catch-all
  metadata            JSONB,
  reported_by         INTEGER,
  verified_by         INTEGER,
  verified_at         TIMESTAMPTZ,
  voided              INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_outputs_project
  ON kemri_outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_kemri_outputs_type
  ON kemri_outputs(output_type);

-- ---------------------------------------------------------------------------
-- 9. Donor concurrent reports (Step 8) and donor portal access
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kemri_donor_reports (
  id                   BIGSERIAL PRIMARY KEY,
  project_id           BIGINT NOT NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  donor_id             BIGINT NOT NULL REFERENCES kemri_donors(id),
  report_id            BIGINT REFERENCES kemri_milestone_reports(id) ON DELETE SET NULL,
  report_kind          VARCHAR(32),
                          -- quarterly | semi_annual | annual | final
  donor_template_name  TEXT,
  generated_at         TIMESTAMPTZ,
  submitted_to_donor_at TIMESTAMPTZ,
  delivery_status      VARCHAR(32) DEFAULT 'queued',
  notes                TEXT,
  voided               INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kemri_donor_reports_project
  ON kemri_donor_reports(project_id);

-- ---------------------------------------------------------------------------
-- 10. Seed reference data (small, idempotent)
-- ---------------------------------------------------------------------------

INSERT INTO kemri_centres (code, name, region, county) VALUES
  ('HQ',       'KEMRI Headquarters',                                 'Nairobi', 'Nairobi'),
  ('CGMR-C',   'Centre for Global Health Research (Kisumu)',         'Nyanza',  'Kisumu'),
  ('CMR',      'Centre for Microbiology Research',                   'Nairobi', 'Nairobi'),
  ('CVR',      'Centre for Virus Research',                          'Nairobi', 'Nairobi'),
  ('CCR',      'Centre for Clinical Research',                       'Nairobi', 'Nairobi'),
  ('CPHR',     'Centre for Public Health Research',                  'Nairobi', 'Nairobi'),
  ('CTMDR',    'Centre for Traditional Medicine & Drug Research',    'Nairobi', 'Nairobi'),
  ('CRDR',     'Centre for Respiratory Diseases Research',           'Nairobi', 'Nairobi'),
  ('CBRD',     'Centre for Biotechnology Research & Development',    'Nairobi', 'Nairobi'),
  ('CGHR',     'Centre for Geographic Medicine Research (Coast)',    'Coast',   'Kilifi'),
  ('CIPDCR',   'Centre for Infectious & Parasitic Diseases Control', 'Nairobi', 'Nairobi'),
  ('ESACIPAC', 'Eastern & Southern Africa Centre for Indigenous Knowledge', 'Nairobi', 'Nairobi')
ON CONFLICT (code) DO NOTHING;

INSERT INTO kemri_programmes (code, name, description) VALUES
  ('NCD',     'Non-Communicable Disease',         'Cardiovascular, cancer, diabetes, mental health'),
  ('NAPREDA', 'Natural Products & Drug Development', 'Indigenous medicine, drug discovery'),
  ('PHHRS',   'Public Health & Health Research Systems', 'Health systems, policy, epidemiology'),
  ('OH',      'One Health',                       'Human-animal-environment interface'),
  ('IPD',     'Infectious & Parasitic Diseases',  'HIV, TB, malaria, neglected tropical diseases'),
  ('BIOTECH', 'Biotechnology',                    'Genomics, molecular biology, biotech innovation'),
  ('SRACH',   'Sexual Reproduction & Adolescent Health', 'SRH, adolescent health, family planning')
ON CONFLICT (code) DO NOTHING;

INSERT INTO kemri_donors (name, acronym, donor_type, country, portal_enabled) VALUES
  ('Bill & Melinda Gates Foundation',                'BMGF',  'foundation',   'USA',           1),
  ('Wellcome Trust',                                 'WT',    'foundation',   'UK',            1),
  ('US National Institutes of Health',               'NIH',   'bilateral',    'USA',           1),
  ('UK Foreign, Commonwealth & Development Office',  'FCDO',  'bilateral',    'UK',            1),
  ('European & Developing Countries Clinical Trials Partnership', 'EDCTP', 'multilateral', 'EU', 1),
  ('Global Fund to Fight AIDS, TB and Malaria',      'GFATM', 'multilateral', 'Switzerland',   1),
  ('World Health Organization',                      'WHO',   'multilateral', 'Switzerland',   1),
  ('US Centers for Disease Control and Prevention',  'CDC',   'bilateral',    'USA',           1),
  ('Government of Kenya - Exchequer',                'GOK',   'govt',         'Kenya',         0),
  ('KEMRI Internal Research Grant',                  'IRG',   'govt',         'Kenya',         0)
ON CONFLICT DO NOTHING;

COMMIT;
