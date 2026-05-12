-- =============================================================================
-- KEMRI / KIMES — sample data-collection submissions
-- =============================================================================
-- Replaces the single leftover "Road Project Review" sample (a Machakos-era
-- inspection_checklist) with seven realistic, fully-filled KEMRI submissions
-- linked to actual research studies. Each submission demonstrates one of the
-- KIMES checklist categories (PI visit, MEL DQA, SERU compliance, AE/protocol
-- deviation, lab QC, training evaluation, community engagement) so reviewers
-- can see how the templates apply to a study or project.
--
-- Project IDs reference kemri_research_projects.id (the DataCollectionToolsPage
-- now loads its project picker from /kemri/projects).
--
-- Safe to re-run: each INSERT is guarded by NOT EXISTS on (template_id, title).
-- =============================================================================

BEGIN;

-- 1) Void the legacy Machakos "Road Project Review" sample so the Monitoring
--    visits tab no longer surfaces non-KEMRI content. Defensive: only void rows
--    that match the original sample shape.
UPDATE data_collection_submissions
SET voided = true,
    updated_at = NOW()
WHERE voided = false
  AND template_id = 1
  AND title = 'Road Project Review';

-- -----------------------------------------------------------------------------
-- 2) Seed seven realistic, filled-out KEMRI submissions
-- -----------------------------------------------------------------------------

-- ---- Submission #1: PI Quarterly Site Visit -------------------------------
-- Study: KEMRI-CGMR-C-2024-001 (R21/Matrix-M malaria vaccine — Kilifi)
INSERT INTO data_collection_submissions
  (template_id, project_id, visit_date, title, answers, created_by, created_at, updated_at, voided)
SELECT
  14,
  3,
  DATE '2026-04-22',
  'Q3 FY2025/26 PI site visit — Kilifi County Hospital arm',
  $${
    "site_name": "Kilifi — Kilifi County Hospital & Pingilikani sub-county facility",
    "persons_met": "Dr. Wanjiku Mwangi (Site Clinician), Sr. Joyce Karisa (Study Nurse Coordinator), Patrick Nyamai (Data Manager), Hellen Mwakio (Counsellor), Karisa Mwambegu (Community Health Promoter)",
    "visit_purpose": "Routine monitoring",
    "site_accessible": true,
    "study_signage": true,
    "biosafety": true,
    "issues_observed": "Cold-chain backup generator failed during a 4-hour KPLC outage on 12-Apr; vaccines moved to the back-up portable cold-box within 18 minutes. Temperature logger confirmed no excursion outside 2–8 °C. Procurement of a secondary generator is overdue.",
    "protocol_followed": true,
    "source_docs_current": true,
    "edc_functional": true,
    "missing_records_pct": 3,
    "data_issues": "12 of 384 REDCap entries had a blank caregiver-consent timestamp this month; resolved on the spot by re-pulling from the paper ICF register.",
    "staff_present": true,
    "training_current": true,
    "supervision_log": true,
    "staff_concerns": "Counsellor caseload exceeds 28/day on community-vaccination days. Team requested an additional locum once a week to protect counselling quality.",
    "consent_log": "Yes — all consents on file",
    "ae_log": true,
    "seru_posted": true,
    "equipment_status": true,
    "reagent_stock": true,
    "stockouts": "None in the past 30 days. Next R21 shipment ETA 2026-05-02.",
    "actions_agreed": "1) Procure secondary generator before next short-rains cycle (target 2026-05-15). 2) Recruit a locum counsellor for Tue/Wed community days. 3) Site coordinator to share end-of-month enrolment dashboard by every 5th. 4) PI to escalate generator procurement to CGMR-C ops manager.",
    "next_visit_target": "2026-07-24",
    "overall_assessment": "Green — on-track"
  }$$::jsonb,
  2, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', false
WHERE NOT EXISTS (
  SELECT 1 FROM data_collection_submissions
  WHERE template_id = 14 AND title = 'Q3 FY2025/26 PI site visit — Kilifi County Hospital arm' AND voided = false
);

-- ---- Submission #2: MEL Data Quality Audit -------------------------------
-- Study: KEMRI-CGHR-2024-002 (AMPLIFY-AGYW PrEP — lake-region Kenya)
INSERT INTO data_collection_submissions
  (template_id, project_id, visit_date, title, answers, created_by, created_at, updated_at, voided)
SELECT
  16,
  4,
  DATE '2026-04-15',
  'Q3 FY2025/26 routine MEL audit — Kisumu cluster (5 facilities)',
  $${
    "audit_type": "Routine quarterly audit",
    "sample_size": 240,
    "sampling_method": "Stratified by site",
    "completeness": true,
    "numeric_range": true,
    "gps_validity": true,
    "financial_arith": true,
    "date_logic": true,
    "cross_field": true,
    "seru_validity": true,
    "no_duplicates": false,
    "failed_records_count": 18,
    "pass_rate_pct": 93,
    "key_findings": "Root cause of the 8 % failure rate is duplicate registration of AGYW who change facility within the same county — 14 of the 18 failures came from 4 girls re-registering at a sister site after relocation. Recommend implementing the national-ID hash dedupe rule already on the KIMES roadmap. Two failures were transcription errors on PrEP refill dates (manual ledger → REDCap); one was a financial-arithmetic mismatch traced to a delayed reversal entry.",
    "verdict": "Pass with minor corrective actions"
  }$$::jsonb,
  2, NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days', false
WHERE NOT EXISTS (
  SELECT 1 FROM data_collection_submissions
  WHERE template_id = 16 AND title = 'Q3 FY2025/26 routine MEL audit — Kisumu cluster (5 facilities)' AND voided = false
);

-- ---- Submission #3: SERU / Ethics Compliance ------------------------------
-- Study: KEMRI-CMR-2025-001 (Genomic surveillance of AMR — coastal Kenya)
INSERT INTO data_collection_submissions
  (template_id, project_id, visit_date, title, answers, created_by, created_at, updated_at, voided)
SELECT
  17,
  5,
  DATE '2026-04-03',
  'Annual SERU compliance review — Coastal AMR genomic surveillance',
  $${
    "seru_number": "KEMRI-SERU/CMR/0743/2024",
    "seru_expiry": "2026-09-30",
    "days_to_expiry": 180,
    "nacosti_valid": true,
    "amendments_filed": "Amendment v3 (2026-02-11): added 2 new sentinel facilities in Lamu and Tana River. Amendment v4 (2026-03-20): clarified WGS data-sharing pathway with PHE-UK and EMBL-EBI. Both approved by SERU within 28 days.",
    "icf_version": "ICF v2.4 (2026-02-15)",
    "icf_local_lang": true,
    "consent_log_kept": true,
    "minors_assent": "Not applicable — adults only",
    "deidentified": true,
    "encrypted_storage": true,
    "dsa_signed": true,
    "kdpa_alignment": true,
    "ae_log_current": true,
    "sae_72hr": true,
    "verdict": "Compliant — no findings",
    "remarks": "SERU expires in 6 months; PI must lodge the renewal application by 2026-06-30 per the CMR SOP. The WGS de-identification pipeline now removes the last 3 octets of patient ID and rounds collection date to the nearest week before external sharing — meets KDPA-2019 anonymisation thresholds."
  }$$::jsonb,
  2, NOW() - INTERVAL '39 days', NOW() - INTERVAL '39 days', false
WHERE NOT EXISTS (
  SELECT 1 FROM data_collection_submissions
  WHERE template_id = 17 AND title = 'Annual SERU compliance review — Coastal AMR genomic surveillance' AND voided = false
);

-- ---- Submission #4: Adverse Event / Protocol Deviation --------------------
-- Study: KEMRI-CRDR-2024-001 (CHILD-TB stool-based Xpert)
INSERT INTO data_collection_submissions
  (template_id, project_id, visit_date, title, answers, created_by, created_at, updated_at, voided)
SELECT
  18,
  6,
  DATE '2026-03-28',
  'Minor protocol deviation — under-age enrolment, Site 03 Homa Bay',
  $${
    "event_type": "Protocol deviation (non-AE)",
    "event_date": "2026-03-22",
    "discovery_date": "2026-03-25",
    "site": "Site 03 — Homa Bay County Referral Hospital",
    "reporter": "Sr. Lilian Otieno, Site Study Coordinator",
    "narrative": "On 22-Mar, child enrolled as case #HB-027 was recorded as 11 years 4 months old based on caregiver verbal age. Subsequent verification using the under-five clinic register and the MoH child-welfare card confirmed actual age 10 years 11 months — outside the protocol's <10 years inclusion criterion by 1 month. Documentation deficiency rather than a safety issue. Stool sample had already been analysed by Xpert MTB/RIF Ultra (negative result).",
    "severity": "Minor — non-safety related",
    "expectedness": "Not applicable — non-AE",
    "relatedness": "Not applicable — non-AE",
    "participant_status": "Continues on study",
    "intervention": "No change",
    "treatment_given": "N/A — no clinical impact; child not exposed to investigational intervention. Standard care continued per the national paediatric TB algorithm.",
    "reported_to_pi": true,
    "reported_to_seru": true,
    "reported_to_sponsor": true,
    "follow_up_plan": "1) Mandatory age verification against the MoH child-welfare card before enrolment, effective immediately. 2) CAPA: re-train the Homa Bay enrolment team on the age-verification SOP (target 2026-04-04). 3) SERU notified via the protocol-deviation form on 2026-03-26 (within 72 h of discovery). 4) Case #HB-027 result retained in the dataset but flagged with a sensitivity-analysis indicator. 5) Internal monitoring visit triggered for 2026-05."
  }$$::jsonb,
  2, NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', false
WHERE NOT EXISTS (
  SELECT 1 FROM data_collection_submissions
  WHERE template_id = 18 AND title = 'Minor protocol deviation — under-age enrolment, Site 03 Homa Bay' AND voided = false
);

-- ---- Submission #5: Laboratory QC ----------------------------------------
-- Study: KEMRI-CVR-2025-001 (KIRSS — influenza / respiratory pathogen surveillance)
INSERT INTO data_collection_submissions
  (template_id, project_id, visit_date, title, answers, created_by, created_at, updated_at, voided)
SELECT
  19,
  12,
  DATE '2026-04-08',
  'Q3 FY2025/26 laboratory QC review — CVR Influenza / RSV Reference Lab',
  $${
    "lab_name": "KEMRI Centre for Virus Research — Influenza & Respiratory Pathogen Reference Laboratory, Nairobi",
    "iso15189": true,
    "accred_body": "KENAS (Lab no. KENAS/M-0083) — last surveillance audit 2025-11; next due 2026-11.",
    "scope": "Respiratory virus multiplex RT-PCR (Influenza A subtyping H1/H3, Influenza B Yam/Vic, RSV A/B, SARS-CoV-2 N1/N2). Sanger sequencing of the haemagglutinin gene for genetic drift surveillance. Nanopore whole-genome sequencing for SARS-CoV-2 and Influenza H1N1/H3N2.",
    "reception_sop": true,
    "chain_custody": true,
    "storage_temps": true,
    "rejection_rate": 2.1,
    "calibration": true,
    "internal_qc": true,
    "eqa_participation": true,
    "eqa_z_score": "WHO NIC EQA panel 2026-Q1: 28/28 panel members called correctly (100 %). Z-score within ±1 SD on all targets. RCPAQAP SARS-CoV-2 sequencing panel: pass.",
    "results_validated": true,
    "lims_capture": true,
    "tat_compliance": 96,
    "deviations": "One deviation: RT-PCR run on 2026-03-19 produced an inconclusive NTC; rerun next day with fresh master-mix passed. Root cause: master-mix freeze-thaw cycles >5. CAPA: aliquot master-mix into single-use vials on receipt — implemented 2026-03-22. One delayed result (TAT 38 h vs 24 h target) due to courier delay from Mombasa sentinel site — escalated to logistics.",
    "capa_initiated": true,
    "next_review": "2026-07-10"
  }$$::jsonb,
  2, NOW() - INTERVAL '34 days', NOW() - INTERVAL '34 days', false
WHERE NOT EXISTS (
  SELECT 1 FROM data_collection_submissions
  WHERE template_id = 19 AND title = 'Q3 FY2025/26 laboratory QC review — CVR Influenza / RSV Reference Lab' AND voided = false
);

-- ---- Submission #6: Training & Capacity-Building Evaluation --------------
-- Study: KEMRI-CGHR-2026-001 (Kenya Malaria Indicator Survey 2026)
INSERT INTO data_collection_submissions
  (template_id, project_id, visit_date, title, answers, created_by, created_at, updated_at, voided)
SELECT
  21,
  11,
  DATE '2026-02-19',
  'KMIS-2026 field-worker certification training — Eldoret cohort, post-training evaluation',
  $${
    "training_title": "Kenya Malaria Indicator Survey 2026 — Field-Worker GCP, RDT & EDC Training (Cohort 4 of 7)",
    "dates": "2026-02-10 to 2026-02-19",
    "venue": "Eldoret — Sirikwa Hotel and University of Eldoret Field Annex (hybrid)",
    "facilitators": "Dr. James Chebii (CGMR-W lead trainer), Sr. Mercy Akinyi (MoH NMCP), Dr. Mary Wamae (KEMRI CGHR), 3 master-trainer assistants from previous KMIS rounds.",
    "training_modes": ["In-person classroom", "Field practical", "Self-paced e-learning"],
    "relevance": 5,
    "trainer": 5,
    "materials": 4,
    "facilities": 4,
    "pre_test": 58,
    "post_test": 89,
    "competencies": "Confident in: RDT performance to MoH SOP, malaria microscopy spot reading, household roster enumeration, ODK-X form troubleshooting offline, GBV-sensitive interviewing, GCP documentation, and child anaemia screening with HemoCue.",
    "will_apply": true,
    "barriers": "Network coverage in target arid clusters (Turkana, Marsabit) — concern about ODK-X sync delays. Limited Kiswahili materials for the household-roster module.",
    "support_needed": "Solar power-banks for tablets in arid clusters; supportive supervision visit within the first 2 weeks of field deployment; Kiswahili-translated household-roster aide-mémoire card.",
    "general_comments": "Excellent training; the side-by-side RDT troubleshooting practical with Sr. Mercy was the most valuable session. Suggest adding a 30-minute community-relations role-play before fieldwork."
  }$$::jsonb,
  2, NOW() - INTERVAL '82 days', NOW() - INTERVAL '82 days', false
WHERE NOT EXISTS (
  SELECT 1 FROM data_collection_submissions
  WHERE template_id = 21 AND title = 'KMIS-2026 field-worker certification training — Eldoret cohort, post-training evaluation' AND voided = false
);

-- ---- Submission #7: Community / Stakeholder Engagement Feedback -----------
-- Study: KEMRI-CIPDCR-2024-001 (Schistosoma haematobium MDA — coastal Kenya)
INSERT INTO data_collection_submissions
  (template_id, project_id, visit_date, title, answers, created_by, created_at, updated_at, voided)
SELECT
  22,
  7,
  DATE '2026-04-11',
  'Community sensitization meeting — Kinango sub-county (MDA Round 1 launch)',
  $${
    "event_type": "Community sensitization meeting",
    "event_date": "2026-04-09",
    "venue": "Kinango sub-county HQ social hall, Kwale County",
    "attendance_count": 84,
    "audience": ["Community leaders", "Religious leaders", "Caregivers/parents", "Health workers"],
    "top_issues": "1) Concerns about the taste of praziquantel and reports of nausea in previous MDA rounds. 2) Confusion about which age groups are eligible (5–15 vs school-aged only). 3) Distrust traceable to a 2017 social-media rumour linking deworming to infertility, still circulating among young men.",
    "suggestions": "Use known local leaders (sub-county chief and madrasa heads) as front-line communicators; include side-effect demystification skits in Mijikenda and Kidigo; pair MDA day with a mango-juice / breakfast distribution at primary schools to reduce nausea on empty stomachs.",
    "concerns": "Some men in the meeting raised concerns about safety in school-aged girls and the persistent infertility myth. Two religious leaders asked for written reassurance that praziquantel does not interact with locally used herbal antimalarials.",
    "trust_score": 3,
    "actions_taken": "1) Engaged the Kinango Chief and Sheikh Athman to record short audio messages in Kidigo and Kiduruma for boda-boda broadcast. 2) Agreed to introduce a breakfast-first protocol at all primary-school MDA days. 3) Set up a community hotline (07XX-XXX-XXX) for side-effect reporting routed to the county M&E team. 4) Commissioned a 1-page Q&A leaflet (Kiswahili + Mijikenda) co-signed by the County Director of Health.",
    "channels": ["Community radio", "WhatsApp groups", "Religious institutions", "Posters at health facilities"],
    "next_engagement": "2026-05-08"
  }$$::jsonb,
  2, NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days', false
WHERE NOT EXISTS (
  SELECT 1 FROM data_collection_submissions
  WHERE template_id = 22 AND title = 'Community sensitization meeting — Kinango sub-county (MDA Round 1 launch)' AND voided = false
);

COMMIT;
