-- PostgreSQL: ensure project_documents exists (uploads, registry, project details).
-- Run once against your app database, e.g.:
--   psql "$DATABASE_URL" -f api/migrations/postgres_create_project_documents.sql
-- or: node api/scripts/ensureProjectDocumentsTable.js

CREATE TABLE IF NOT EXISTS "project_documents" (
  "id" integer NOT NULL,
  "projectId" integer NOT NULL,
  "milestoneId" integer NULL,
  "requestId" integer NULL,
  "documentType" varchar(50) NOT NULL,
  "documentCategory" varchar(50) NOT NULL,
  "documentPath" varchar(255) NOT NULL,
  "description" text NULL,
  "userId" integer NOT NULL,
  "isProjectCover" boolean NOT NULL DEFAULT false,
  "displayOrder" integer NULL,
  "voided" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" varchar(50) NOT NULL DEFAULT 'pending_review',
  "progressPercentage" decimal(5,2) NULL,
  "originalFileName" varchar(255) NULL,
  "approved_for_public" boolean DEFAULT false,
  "approved_by" integer NULL,
  "approved_at" timestamp NULL,
  "approval_notes" text NULL,
  "isFlagged" boolean NOT NULL DEFAULT false,
  CONSTRAINT project_documents_pkey PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS project_documents_projectid_idx ON "project_documents" ("projectId");
CREATE INDEX IF NOT EXISTS project_documents_voided_idx ON "project_documents" ("voided");
