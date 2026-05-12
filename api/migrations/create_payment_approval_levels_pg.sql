-- Payment approval ladder (separate from generic approval_workflow_* tables).
-- Safe to run on empty DBs: creates table only if missing.
-- Column names are quoted camelCase to match api/routes/approvalLevelsRoutes.js and legacy dumps.

CREATE TABLE IF NOT EXISTS payment_approval_levels (
    "levelId" SERIAL PRIMARY KEY,
    "levelName" VARCHAR(255) NOT NULL,
    "roleId" INTEGER NOT NULL,
    "approvalOrder" INTEGER NOT NULL,
    "workflowId" INTEGER DEFAULT NULL
);

COMMENT ON TABLE payment_approval_levels IS 'Multi-stage payment approval ordering; UI: /approval-levels-management';
