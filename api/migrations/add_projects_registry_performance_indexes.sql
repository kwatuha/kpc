-- Migration: Add indexes for Registry of Projects list performance
-- Purpose: Speed up /api/projects list queries and stabilize response times.
-- Date: 2026-04-24
--
-- Primary query shape optimized:
-- - FROM projects p
-- - LEFT JOIN project_sites ON project_id
-- - LEFT JOIN project_jobs ON project_id (with voided filter)
-- - WHERE p.voided = false
-- - ORDER BY p.project_id

-- PostgreSQL indexes
CREATE INDEX IF NOT EXISTS idx_projects_voided_project_id
  ON projects (voided, project_id);

CREATE INDEX IF NOT EXISTS idx_project_sites_project_id
  ON project_sites (project_id);

CREATE INDEX IF NOT EXISTS idx_project_jobs_project_id_voided
  ON project_jobs (project_id, voided);

-- Optional MySQL equivalents (run manually on MySQL deployments):
-- CREATE INDEX idx_projects_voided_id ON projects (voided, id);
-- CREATE INDEX idx_project_sites_project_id ON project_sites (projectId);
-- CREATE INDEX idx_project_jobs_project_id_voided ON project_jobs (projectId, voided);
