-- Flag compliance-sensitive uploads (e.g. warning letters) for follow-up in UI and reports.
-- Run: psql "$DATABASE_URL" -f api/migrations/add_project_documents_is_flagged.sql

ALTER TABLE "project_documents" ADD COLUMN IF NOT EXISTS "isFlagged" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS project_documents_is_flagged_idx
  ON "project_documents" ("projectId")
  WHERE "isFlagged" = true AND "voided" = false;
