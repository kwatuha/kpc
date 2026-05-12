-- Refresh Contract Signing templates with optional project schedule fields (matches api getDefaultContractSigningFields).
-- Updates ALL active rows for this stage so existing installs pick up date/duration fields without manual Template Manager edits.
BEGIN;

UPDATE procurement_stage_templates
SET fields = '[
  {"key":"draftContractReviewed","label":"Contract draft legally reviewed","type":"checkbox","required":true,"weight":18},
  {"key":"signatoriesAuthorized","label":"Signatories hold valid delegations / resolutions","type":"checkbox","required":true,"weight":22},
  {"key":"performanceSecurity","label":"Performance bond / security clause agreed","type":"checkbox","required":true,"weight":18},
  {"key":"insuranceRequirements","label":"Insurance / liability requirements captured","type":"checkbox","required":true,"weight":14},
  {"key":"commencementDate","label":"Commencement / delivery milestones agreed","type":"checkbox","required":true,"weight":14},
  {"key":"contractProjectStartDate","label":"Project / contract start date (optional)","type":"date","required":false,"weight":0},
  {"key":"contractDurationValue","label":"Duration (optional — with unit below, end date is calculated)","type":"number","required":false,"weight":0,"min":0},
  {"key":"contractDurationUnit","label":"Duration unit","type":"select","required":false,"weight":0,"options":["","days","months"]},
  {"key":"contractProjectEndDate","label":"Project / contract end date (optional — auto-filled when start + duration are set)","type":"date","required":false,"weight":0},
  {"key":"disputeResolution","label":"Dispute resolution / governing law clause agreed","type":"checkbox","required":false,"weight":14},
  {"key":"notes","label":"Contract remarks","type":"textarea","required":false,"weight":0}
]'::jsonb,
    updated_at = NOW()
WHERE COALESCE(voided, false) = false
  AND LOWER(TRIM(stage)) = LOWER(TRIM('Contract Signing'));

COMMIT;
