-- Generic approval workflow (PostgreSQL).
-- Tables are also created at runtime by api/services/approvalWorkflowEngine.js when the API starts.
-- Run this file manually if you prefer DDL outside the app boot path.

CREATE TABLE IF NOT EXISTS approval_workflow_definitions (
  definition_id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT 'default',
  version INT NOT NULL DEFAULT 1,
  name TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_awf_def UNIQUE (entity_type, code, version)
);

CREATE TABLE IF NOT EXISTS approval_workflow_steps (
  definition_step_id BIGSERIAL PRIMARY KEY,
  definition_id BIGINT NOT NULL REFERENCES approval_workflow_definitions(definition_id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_name TEXT,
  role_id BIGINT,
  sla_hours INT,
  escalation_role_id BIGINT,
  CONSTRAINT uq_awf_step UNIQUE (definition_id, step_order)
);

CREATE TABLE IF NOT EXISTS approval_requests (
  request_id BIGSERIAL PRIMARY KEY,
  definition_id BIGINT NOT NULL REFERENCES approval_workflow_definitions(definition_id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_step_order INT NOT NULL DEFAULT 1,
  submitted_by BIGINT,
  payload_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_approval_one_pending_entity
ON approval_requests (entity_type, entity_id)
WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS approval_step_instances (
  instance_id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES approval_requests(request_id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_name TEXT,
  role_id BIGINT,
  sla_hours INT,
  escalation_role_id BIGINT,
  status TEXT NOT NULL DEFAULT 'waiting',
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed_by BIGINT,
  comment TEXT,
  CONSTRAINT uq_awf_inst UNIQUE (request_id, step_order)
);

CREATE TABLE IF NOT EXISTS approval_actions (
  action_id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES approval_requests(request_id) ON DELETE CASCADE,
  step_instance_id BIGINT REFERENCES approval_step_instances(instance_id) ON DELETE SET NULL,
  actor_user_id BIGINT,
  action_type TEXT NOT NULL,
  comment TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
