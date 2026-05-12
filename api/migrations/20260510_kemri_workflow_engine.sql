-- ----------------------------------------------------------------------------
-- KEMRI / KIMES — workflow engine schema
--
-- Adds:
--   1. kemri_notifications  — in-app + emailable inbox messages, one row per
--      delivery.  Used for D-30 / D-14 / D-7 reminders, escalation notices,
--      SERU expiry alerts, peer-review queries, etc.
--   2. Extensions to kemri_escalations:
--        deadline           DATE      -- the milestone reporting_period_end + 15
--        days_late          INTEGER   -- recomputed by the engine each tick
--        auto_generated     INTEGER   -- 0 = manual (CD escalate), 1 = engine
--        last_check_at      TIMESTAMP -- when the engine last upgraded this row
--        donor_letter_at    TIMESTAMP -- when DG-NCF-001 was rendered/sent
--        donor_letter_body  TEXT      -- rendered letter (DG-NCF-001 6 sections)
--   3. kemri_workflow_runs   — append-only log of each engine tick
--      (so an admin can see when the daily sweep last ran and what it did).
--
-- Idempotent.
-- ----------------------------------------------------------------------------

-- 1.  Notifications inbox -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL,
  -- short stable kind; UI uses it for icon / colour
  kind        VARCHAR(32) NOT NULL,
  level       INTEGER     NULL,
  project_id  BIGINT      NULL REFERENCES kemri_research_projects(id) ON DELETE CASCADE,
  report_id   BIGINT      NULL REFERENCES kemri_milestone_reports(id) ON DELETE SET NULL,
  escalation_id BIGINT    NULL REFERENCES kemri_escalations(id)       ON DELETE SET NULL,
  subject     TEXT        NOT NULL,
  body        TEXT        NULL,
  link        TEXT        NULL,
  -- de-dup token so the engine can be re-run without spamming the same alert
  dedupe_key  VARCHAR(128) NULL,
  read_at     TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided      INTEGER     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_kemri_notifications_user_unread
  ON kemri_notifications (user_id, read_at)
  WHERE voided = 0;

CREATE INDEX IF NOT EXISTS idx_kemri_notifications_kind
  ON kemri_notifications (kind)
  WHERE voided = 0;

CREATE UNIQUE INDEX IF NOT EXISTS uq_kemri_notifications_dedupe
  ON kemri_notifications (user_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL AND voided = 0;

-- 2.  Escalation extensions ---------------------------------------------------
ALTER TABLE kemri_escalations
  ADD COLUMN IF NOT EXISTS deadline          DATE        NULL,
  ADD COLUMN IF NOT EXISTS days_late         INTEGER     NULL,
  ADD COLUMN IF NOT EXISTS auto_generated    INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_check_at     TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS donor_letter_at   TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS donor_letter_body TEXT        NULL;

-- one open auto-escalation per (project, report) pair so re-running the engine
-- upgrades a row instead of cloning it.
CREATE UNIQUE INDEX IF NOT EXISTS uq_kemri_escalations_open_auto
  ON kemri_escalations (project_id, COALESCE(report_id, 0))
  WHERE auto_generated = 1 AND resolved = 0 AND voided = 0;

-- 3.  Engine run log ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS kemri_workflow_runs (
  id              BIGSERIAL PRIMARY KEY,
  ran_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ran_by          INTEGER     NULL,         -- NULL = scheduler; user id = manual
  reminders_sent  INTEGER     NOT NULL DEFAULT 0,
  escalations_opened INTEGER  NOT NULL DEFAULT 0,
  escalations_upgraded INTEGER NOT NULL DEFAULT 0,
  seru_alerts_sent INTEGER    NOT NULL DEFAULT 0,
  details         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  voided          INTEGER     NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_kemri_workflow_runs_ran_at
  ON kemri_workflow_runs (ran_at DESC) WHERE voided = 0;
