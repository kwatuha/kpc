-- Refresh Purchase Order Issued templates with Kenya FY / PO lapse & re-issue fields (matches api getDefaultPurchaseOrderIssuedFields).
BEGIN;

UPDATE procurement_stage_templates
SET fields = '[{"key":"poRegistered","label":"LPO / PO registered (IFMIS / procurement register)","type":"checkbox","required":true,"weight":22},{"key":"poReferenceNumber","label":"LPO / PO reference number","type":"text","required":false,"weight":0},{"key":"poIssueDate","label":"PO issue date","type":"date","required":false,"weight":0},{"key":"kenyaFyJune30LapseAck","label":"Acknowledged: Kenya financial year - unspent / unpaid PO commitments normally lapse after 30 June; further spend requires a new PO (fresh commitment), not an extension of the old PO.","type":"checkbox","required":true,"weight":0},{"key":"supersedesLapsedPo","label":"This PO supersedes a prior PO that lapsed or was cancelled (e.g. after 30 June FY deadline)","type":"checkbox","required":false,"weight":0},{"key":"priorPoReference","label":"Prior lapsed / cancelled PO reference (when superseding)","type":"text","required":false,"weight":0},{"key":"deliveryTerms","label":"Delivery / completion schedule aligned with contract","type":"checkbox","required":true,"weight":20},{"key":"retentionAdvance","label":"Retention / advance payment conditions reflected","type":"checkbox","required":true,"weight":18},{"key":"inspectionAcceptance","label":"Inspection & acceptance criteria referenced","type":"checkbox","required":true,"weight":18},{"key":"reportingRequirements","label":"Reporting / milestone certification requirements clear","type":"checkbox","required":false,"weight":22},{"key":"notes","label":"PO remarks (re-issue reason, IFMIS cancellation, linkage to new tender if applicable)","type":"textarea","required":false,"weight":0}]'::jsonb,
    updated_at = NOW()
WHERE COALESCE(voided, false) = false
  AND LOWER(TRIM(stage)) = LOWER(TRIM('Purchase Order Issued'));

COMMIT;
