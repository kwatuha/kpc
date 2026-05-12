-- Seed default procurement stage templates (idempotent). Run against PostgreSQL after procurement_stage_templates exists.
-- Matches api/routes/procurementRoutes.js getProcurementStageTemplateSeeds().
BEGIN;

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT 'Needs Identification', 'Strategic need & feasibility', 'generic', '[{"key":"needProblemEvidence","label":"Need / problem statement documented (baseline, gap, or service demand)","type":"checkbox","required":true,"weight":18},{"key":"alignmentStrategicPlans","label":"Alignment with ADP / CIDP, sector programme & county development priorities","type":"checkbox","required":true,"weight":18},{"key":"scopeObjectivesOutputs","label":"Scope, objectives & expected outputs/deliverables defined (incl. exclusions)","type":"checkbox","required":true,"weight":18},{"key":"beneficiariesAccountability","label":"Beneficiaries / user unit & accountable department / ward identified","type":"checkbox","required":true,"weight":14},{"key":"siteLocationReadiness","label":"Location / site or logistics constraints known (land, access, utilities)","type":"checkbox","required":true,"weight":12},{"key":"indicativeCostFunding","label":"Indicative cost class, budget head & funding source contour (vote / donor / partner)","type":"checkbox","required":true,"weight":16},{"key":"timelineMilestones","label":"Implementation timeline & critical milestones / dependencies outlined","type":"checkbox","required":true,"weight":12},{"key":"procurementMethodPPDA","label":"Likely PPDA procurement method & threshold class pre-identified","type":"checkbox","required":true,"weight":14},{"key":"stakeholderEngagement","label":"Relevant stakeholders engaged; technical owner / sponsor recorded","type":"checkbox","required":true,"weight":12},{"key":"risksAlternatives","label":"Material risks, mitigations & alternatives (in-house, lease, PPP) considered","type":"checkbox","required":false,"weight":10},{"key":"esgGenderSafetyScreen","label":"Preliminary environmental, social, gender & safety impacts screened","type":"checkbox","required":false,"weight":10},{"key":"notes","label":"Needs identification notes & references","type":"textarea","required":false,"weight":0}]'::jsonb, true, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Needs Identification'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('Strategic need & feasibility'))
);

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT 'Requisition Approved', 'Requisition & budget gate', 'generic', '[{"key":"formalRequisition","label":"Formal requisition / AIE reference captured","type":"checkbox","required":true,"weight":22},{"key":"budgetCommitted","label":"Budget committed / votebook availability confirmed","type":"checkbox","required":true,"weight":26},{"key":"delegatedApproval","label":"Approval within delegated procurement authority","type":"checkbox","required":true,"weight":18},{"key":"specificationsAttached","label":"Technical specifications / TOR attached","type":"checkbox","required":true,"weight":18},{"key":"ppdaThreshold","label":"Estimated value vs PPDA threshold verified","type":"checkbox","required":true,"weight":16},{"key":"notes","label":"Approval remarks","type":"textarea","required":false,"weight":0}]'::jsonb, true, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Requisition Approved'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('Requisition & budget gate'))
);

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT 'Tender Published', 'Tender launch & notice compliance', 'generic', '[{"key":"invitationApproved","label":"Invitation for tenders / RFP approved for publication","type":"checkbox","required":true,"weight":22},{"key":"openingClosingDates","label":"Opening & closing dates valid (calendar days)","type":"checkbox","required":true,"weight":22},{"key":"advertisementMedium","label":"Advertisement placed (portal / press) per PPDA rules","type":"checkbox","required":true,"weight":20},{"key":"bidSecurityCorrect","label":"Bid security / tender fee requirements stated correctly","type":"checkbox","required":true,"weight":18},{"key":"clarificationsProcess","label":"Clarification / site visit process communicated","type":"checkbox","required":false,"weight":18},{"key":"notes","label":"Publication notes","type":"textarea","required":false,"weight":0}]'::jsonb, true, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Tender Published'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('Tender launch & notice compliance'))
);

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT 'Bid Evaluation', 'Bidder Suitability Checklist', 'bidder', '[{"key":"companyProfile","label":"Company profile submitted","type":"checkbox","required":true,"weight":10},{"key":"taxCompliance","label":"Valid tax compliance certificate","type":"checkbox","required":true,"weight":15},{"key":"businessPermit","label":"Valid business permit","type":"checkbox","required":true,"weight":10},{"key":"similarWorks","label":"Similar works experience","type":"checkbox","required":true,"weight":15},{"key":"technicalCapacity","label":"Technical capacity adequate","type":"checkbox","required":true,"weight":15},{"key":"financialCapacity","label":"Financial capacity adequate","type":"checkbox","required":true,"weight":15},{"key":"bidPriceScore","label":"Bid price score (0-20)","type":"number","min":0,"max":20,"required":false,"weight":20},{"key":"reviewNotes","label":"Reviewer notes","type":"textarea","required":false,"weight":0}]'::jsonb, true, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Bid Evaluation'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('Bidder Suitability Checklist'))
);

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT 'Award Decision', 'Award & compliance checklist', 'bidder', '[{"key":"evaluationReportFinal","label":"Technical & financial evaluation report finalized","type":"checkbox","required":true,"weight":22},{"key":"standstillObserved","label":"Standstill / aggrieved period observed where applicable","type":"checkbox","required":true,"weight":22},{"key":"awardWithinBudget","label":"Recommended award within approved budget envelope","type":"checkbox","required":true,"weight":20},{"key":"conflictInterestChecked","label":"Conflict of interest / ethics declaration reviewed","type":"checkbox","required":true,"weight":16},{"key":"awardLetterReady","label":"Notification of award / regret letters prepared","type":"checkbox","required":true,"weight":20},{"key":"notes","label":"Award decision notes","type":"textarea","required":false,"weight":0}]'::jsonb, true, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Award Decision'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('Award & compliance checklist'))
);

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT 'Contract Signing', 'Contract execution readiness', 'bidder', '[{"key":"draftContractReviewed","label":"Contract draft legally reviewed","type":"checkbox","required":true,"weight":18},{"key":"signatoriesAuthorized","label":"Signatories hold valid delegations / resolutions","type":"checkbox","required":true,"weight":22},{"key":"performanceSecurity","label":"Performance bond / security clause agreed","type":"checkbox","required":true,"weight":18},{"key":"insuranceRequirements","label":"Insurance / liability requirements captured","type":"checkbox","required":true,"weight":14},{"key":"commencementDate","label":"Commencement / delivery milestones agreed","type":"checkbox","required":true,"weight":14},{"key":"contractProjectStartDate","label":"Project / contract start date (optional)","type":"date","required":false,"weight":0},{"key":"contractDurationValue","label":"Duration (optional — with unit below, end date is calculated)","type":"number","required":false,"weight":0,"min":0},{"key":"contractDurationUnit","label":"Duration unit","type":"select","required":false,"weight":0,"options":["","days","months"]},{"key":"contractProjectEndDate","label":"Project / contract end date (optional — auto-filled when start + duration are set)","type":"date","required":false,"weight":0},{"key":"disputeResolution","label":"Dispute resolution / governing law clause agreed","type":"checkbox","required":false,"weight":14},{"key":"notes","label":"Contract remarks","type":"textarea","required":false,"weight":0}]'::jsonb, true, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Contract Signing'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('Contract execution readiness'))
);

INSERT INTO procurement_stage_templates (stage, name, subject_type, fields, active, voided, created_at, updated_at)
SELECT 'Purchase Order Issued', 'LPO / commitment register', 'bidder', '[{"key":"poRegistered","label":"LPO / PO registered (IFMIS / procurement register)","type":"checkbox","required":true,"weight":22},{"key":"poReferenceNumber","label":"LPO / PO reference number","type":"text","required":false,"weight":0},{"key":"poIssueDate","label":"PO issue date","type":"date","required":false,"weight":0},{"key":"kenyaFyJune30LapseAck","label":"Acknowledged: Kenya financial year - unspent / unpaid PO commitments normally lapse after 30 June; further spend requires a new PO (fresh commitment), not an extension of the old PO.","type":"checkbox","required":true,"weight":0},{"key":"supersedesLapsedPo","label":"This PO supersedes a prior PO that lapsed or was cancelled (e.g. after 30 June FY deadline)","type":"checkbox","required":false,"weight":0},{"key":"priorPoReference","label":"Prior lapsed / cancelled PO reference (when superseding)","type":"text","required":false,"weight":0},{"key":"deliveryTerms","label":"Delivery / completion schedule aligned with contract","type":"checkbox","required":true,"weight":20},{"key":"retentionAdvance","label":"Retention / advance payment conditions reflected","type":"checkbox","required":true,"weight":18},{"key":"inspectionAcceptance","label":"Inspection & acceptance criteria referenced","type":"checkbox","required":true,"weight":18},{"key":"reportingRequirements","label":"Reporting / milestone certification requirements clear","type":"checkbox","required":false,"weight":22},{"key":"notes","label":"PO remarks (re-issue reason, IFMIS cancellation, linkage to new tender if applicable)","type":"textarea","required":false,"weight":0}]'::jsonb, true, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM procurement_stage_templates
  WHERE COALESCE(voided, false) = false
    AND LOWER(TRIM(stage)) = LOWER(TRIM('Purchase Order Issued'))
    AND LOWER(TRIM(name)) = LOWER(TRIM('LPO / commitment register'))
);

COMMIT;
