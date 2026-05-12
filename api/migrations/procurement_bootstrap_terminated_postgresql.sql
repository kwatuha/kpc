-- Idempotent: Procurement Terminated terminal stage + closure template.
-- Matches api/routes/procurementRoutes.js STAGE_PROCUREMENT_TERMINATED & getDefaultProcurementTerminatedFields().
-- Safe to run multiple times on PostgreSQL.

BEGIN;

INSERT INTO procurement_stages (label, sort_order, active, voided, created_at, updated_at)
SELECT 'Procurement Terminated', 100, TRUE, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stages
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(label)) = LOWER(TRIM('Procurement Terminated'))
);

UPDATE procurement_stages
SET sort_order = 100, updated_at = NOW()
WHERE COALESCE(voided, false) = false
  AND LOWER(TRIM(label)) = LOWER(TRIM('Procurement Terminated'));

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT
  'Procurement Terminated',
  'Procurement closure (no award)',
  'generic',
  '[{"key":"closureReasonCategory","label":"Closure category","type":"select","required":true,"weight":0,"options":["","No qualified bidders","Budget withdrawn","Policy / legal stop","Other"]},{"key":"closureReason","label":"Details (reference PPDA / county approvals where applicable)","type":"textarea","required":true,"weight":0},{"key":"closureEffectiveDate","label":"Effective date","type":"date","required":false,"weight":0},{"key":"authorityReference","label":"Approval / minute reference","type":"text","required":false,"weight":0}]'::jsonb,
  TRUE,
  FALSE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Procurement Terminated'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('Procurement closure (no award)'))
);

COMMIT;
