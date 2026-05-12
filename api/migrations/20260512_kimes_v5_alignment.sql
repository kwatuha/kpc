-- ===========================================================================
-- KIMES v5.0 alignment migration
--
-- Aligns the KEMRI Integrated Monitoring & Evaluation System database with
-- the additional design decisions captured in KEMRI_KIMES_v5_Final_Complete.pdf:
--
--   1. Donor non-conformity letter (template DG-NCF-001) is gated by an
--      Internal Review Board recommendation, DG approval, and Legal Counsel
--      clearance BEFORE transmission to the donor (§7.3.1). We add three
--      timestamped recommend/approve/clear gates plus the actual transmission
--      timestamp/recipient on `kemri_escalations`.
--
--   2. Conference abstracts (§3, Step 11) require a presentation-type
--      taxonomy: oral | poster | keynote | webinar | symposium. We add a
--      first-class `presentation_type` column on `kemri_outputs`.
--
--   3. FAIR datasets (§3, Step 13) require a four-component breakdown
--      (Findable / Accessible / Interoperable / Reusable), each scored 0–25,
--      summing to `fair_score`. We add `fair_findable / fair_accessible /
--      fair_interoperable / fair_reusable` columns on `kemri_outputs`.
--
--   4. Patent expiry alerts (§3, Step 15 / §11.2 Year N+4–7) require a
--      12-month-ahead notification to PI + Innovation Unit. We add
--      `patent_expiry_alert_at` so the workflow engine can dedupe alerts.
--
--   5. High-impact publication alerts (§3, Step 12) trigger when
--      `impact_factor > 5`. We add `high_impact_alert_at` so we only notify
--      Communications + DG Office once per output.
--
--   6. Workflow runs log gets two new counters used by the upgraded engine:
--      `patent_alerts_sent` and `high_impact_alerts_sent`.
--
--   7. Escalation classification comment widened to 5 levels (institutional)
--      so future readers don't have to cross-reference the workflow engine.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Internal Review Board / DG / Legal donor-letter gates
-- ---------------------------------------------------------------------------

ALTER TABLE kemri_escalations
  ADD COLUMN IF NOT EXISTS irb_decision         VARCHAR(32),                -- 'recommend_notify' | 'recommend_hold' | 'pending'
  ADD COLUMN IF NOT EXISTS irb_decision_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS irb_decision_by      INTEGER,
  ADD COLUMN IF NOT EXISTS irb_notes            TEXT,
  ADD COLUMN IF NOT EXISTS dg_approved_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dg_approved_by       INTEGER,
  ADD COLUMN IF NOT EXISTS dg_notes             TEXT,
  ADD COLUMN IF NOT EXISTS legal_cleared_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_cleared_by     INTEGER,
  ADD COLUMN IF NOT EXISTS legal_notes          TEXT,
  ADD COLUMN IF NOT EXISTS donor_letter_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS donor_letter_sent_by INTEGER,
  ADD COLUMN IF NOT EXISTS donor_recipient      TEXT;                       -- e.g. donor name / contact email

CREATE INDEX IF NOT EXISTS idx_kemri_escalations_irb_decision
  ON kemri_escalations(irb_decision);

COMMENT ON COLUMN kemri_escalations.level IS
  'Non-conformity level: 1 minor | 2 moderate | 3 significant | 4 severe | 5 institutional (centre-wide)';

-- ---------------------------------------------------------------------------
-- 2. Conference presentation taxonomy
-- ---------------------------------------------------------------------------

ALTER TABLE kemri_outputs
  ADD COLUMN IF NOT EXISTS presentation_type VARCHAR(32);                   -- oral | poster | keynote | webinar | symposium | other

COMMENT ON COLUMN kemri_outputs.presentation_type IS
  'For output_type = abstract: oral | poster | keynote | webinar | symposium | other (KIMES v5 §3 Step 11).';

-- ---------------------------------------------------------------------------
-- 3. FAIR component scores (each 0..25; fair_score is the rolled-up sum)
-- ---------------------------------------------------------------------------

ALTER TABLE kemri_outputs
  ADD COLUMN IF NOT EXISTS fair_findable      NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS fair_accessible    NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS fair_interoperable NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS fair_reusable      NUMERIC(4,1);

COMMENT ON COLUMN kemri_outputs.fair_findable      IS 'FAIR — Findable (0..25). Sums into fair_score.';
COMMENT ON COLUMN kemri_outputs.fair_accessible    IS 'FAIR — Accessible (0..25). Sums into fair_score.';
COMMENT ON COLUMN kemri_outputs.fair_interoperable IS 'FAIR — Interoperable (0..25). Sums into fair_score.';
COMMENT ON COLUMN kemri_outputs.fair_reusable      IS 'FAIR — Reusable (0..25). Sums into fair_score.';

-- ---------------------------------------------------------------------------
-- 4 & 5. Workflow-engine dedupe stamps for patent expiry / high-IF alerts
-- ---------------------------------------------------------------------------

ALTER TABLE kemri_outputs
  ADD COLUMN IF NOT EXISTS patent_expiry_alert_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS high_impact_alert_at   TIMESTAMPTZ;

COMMENT ON COLUMN kemri_outputs.patent_expiry_alert_at IS
  'Timestamp at which the workflow engine raised the T-12-month patent expiry alert. Used for dedupe.';
COMMENT ON COLUMN kemri_outputs.high_impact_alert_at IS
  'Timestamp at which the workflow engine raised the impact-factor > 5 alert to Comms + DG. Used for dedupe.';

-- ---------------------------------------------------------------------------
-- 6. Workflow runs: new counters
-- ---------------------------------------------------------------------------

ALTER TABLE kemri_workflow_runs
  ADD COLUMN IF NOT EXISTS patent_alerts_sent       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS high_impact_alerts_sent  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS l5_escalations_opened    INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN kemri_workflow_runs.patent_alerts_sent      IS 'IP patent expiry alerts (T-12 months) raised on this tick.';
COMMENT ON COLUMN kemri_workflow_runs.high_impact_alerts_sent IS 'IF>5 publication alerts raised on this tick.';
COMMENT ON COLUMN kemri_workflow_runs.l5_escalations_opened   IS 'Level-5 institutional non-conformity escalations opened (centre-wide patterns).';

-- ---------------------------------------------------------------------------
-- 7. Roll forward any existing rows where impact_factor is high but never
--    alerted, so the audit trail stays clean (no automatic alert is sent
--    retroactively — the workflow engine will pick these up on its next tick).
-- ---------------------------------------------------------------------------
-- (No data change required; we just stamp the dedupe columns as NULL above.)

-- Done.
