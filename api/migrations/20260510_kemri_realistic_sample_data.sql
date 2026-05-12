-- =============================================================================
-- KEMRI / KIMES — realistic sample data
--
-- Loads eight research studies that reflect actual KEMRI research portfolios:
--   1. R21/Matrix-M Malaria Vaccine real-world effectiveness   (CGMR-C, BMGF)
--   2. AMPLIFY-AGYW PrEP demonstration                         (CGHR-Kisumu, NIH)
--   3. AMR Genomic Surveillance, coastal Kenya                 (CMR, Wellcome)
--   4. CHILD-TB paediatric TB diagnostic accuracy trial        (CRDR, EDCTP)
--   5. Schistosoma haematobium MDA elimination demonstration   (CIPDCR, BMGF)
--   6. CovEpi-Lake longitudinal SARS-CoV-2 sero-cohort         (CGHR-Kisumu, US CDC)
--   7. RSV-MATERNAL acceptability & safety                     (CCR, BMGF)
--   8. Anopheles funestus insecticide resistance mapping       (CIPDCR, WHO/TDR)
--
-- Each study comes with:
--   §1-§4 project record + 3 sites, 3 co-investigators, 4 objectives
--   §5     5 staff entries, 2 capacity-building events
--   §6     4 equipment items
--   §7     6 budget lines
--   §9     2 lab analyses (where applicable)
--   §10    2 operations feedback entries
--   §11    5 SWOT / lessons-learned reflections
--          3 KPIs, 1-3 quarterly milestone reports with KPI achievements,
--          DQA scores, peer-reviews and 1-2 outputs.
--
-- The mix produces a realistic dashboard: 5 Green, 2 Amber, 1 Red, 1 pre-study,
-- with two escalations and one queried report so review queues are populated.
-- =============================================================================

BEGIN;

-- 1) Fix two mislabeled centres (the seed had Coast and Kisumu swapped) ------
UPDATE kemri_centres
   SET name = 'Centre for Geographic Medicine Research – Coast (Kilifi)'
 WHERE code = 'CGMR-C';

UPDATE kemri_centres
   SET name = 'Centre for Global Health Research (Kisumu)'
 WHERE code = 'CGHR';

UPDATE kemri_centres
   SET name = 'Eastern & Southern Africa Centre for International Parasite Control'
 WHERE code = 'ESACIPAC';

-- 2) Enrich donor contact metadata ------------------------------------------
UPDATE kemri_donors SET contact_email = 'grants@gatesfoundation.org', contact_name = 'Programme Officer — Africa', portal_enabled = 1 WHERE acronym = 'BMGF';
UPDATE kemri_donors SET contact_email = 'africa-grants@wellcome.org',  contact_name = 'Africa Research Funding Lead', portal_enabled = 1 WHERE acronym = 'WT';
UPDATE kemri_donors SET contact_email = 'oga@niaid.nih.gov',           contact_name = 'NIAID Programme Officer',     portal_enabled = 1 WHERE acronym = 'NIH';
UPDATE kemri_donors SET contact_email = 'edctp.secretariat@edctp.org', contact_name = 'EDCTP Secretariat',            portal_enabled = 1 WHERE acronym = 'EDCTP';
UPDATE kemri_donors SET contact_email = 'cdcafrica@cdc.gov',           contact_name = 'CDC Country Office — Kenya',   portal_enabled = 1 WHERE acronym = 'CDC';
UPDATE kemri_donors SET contact_email = 'tdrinfo@who.int',             contact_name = 'WHO/TDR Africa Region',         portal_enabled = 1 WHERE acronym = 'WHO';

-- 3) Reset existing demo records (the kemri_kpi_achievements -> kemri_kpis FK
--    does not cascade, so we explicitly clean child rows first).
DELETE FROM kemri_kpi_achievements
 WHERE kpi_id    IN (SELECT id FROM kemri_kpis              WHERE project_id IN (1, 2))
    OR report_id IN (SELECT id FROM kemri_milestone_reports WHERE project_id IN (1, 2));
DELETE FROM kemri_research_projects WHERE id IN (1, 2);

-- =============================================================================
-- STUDY 1 — R21/Matrix-M malaria vaccine real-world effectiveness (RWE-Malaria)
-- Centre: CGMR-C (Coast, id=2) · Programme: IPD (id=5) · Donor: BMGF (id=1)
-- Status: active · RAG: green
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint; v_kpi3 bigint;
  v_rep_q1 bigint; v_rep_q2 bigint; v_rep_q3 bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date, actual_start_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CGMR-C-2024-001', 'research', 'KEMRI-2024-RWE-MAL-001',
    'Real-world effectiveness of the R21/Matrix-M malaria vaccine in routine immunisation: a multi-site cohort study in coastal Kenya',
    'RWE-Malaria',
    2, 2, 5, 1,
    4200000, 'USD', 'grant_award', 'observational_cohort',
    'cooperative_agreement', 'BMGF-INV-073245', 'INV-073245', 'KEMRI-LR-2024-018',
    'KEMRI/SERU/CGMR-C/415/4621', '2024-03-15', '2027-03-14',
    'NACOSTI/P/24/30417', '2024-04-02',
    '2024-07-01', '2027-06-30', '2024-07-15',
    'KEMRI-Wellcome Trust Research Programme, Kilifi', 'Kenya',
    '["3","10","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA2-Translation-Impact"]'::jsonb,
    'Vaccines & Immunisation', 'Malaria',
    'active', 'green', 'implementation', 2
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Kilifi County Hospital', 'Kenya', 'Kilifi', 'Kilifi North', -3.6309, 39.8499),
    (v_pid, 'Junju Health Centre',     'Kenya', 'Kilifi', 'Kilifi South', -3.9200, 39.6100),
    (v_pid, 'Pingilikani Dispensary',  'Kenya', 'Kilifi', 'Kaloleni',     -3.7900, 39.6500);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Dr. Lynette Isabella Ochola-Oyier', 'PhD',          'Malaria genomics',          'KEMRI-Wellcome Trust Research Programme', 'Co-PI',            'lochola@kemri-wellcome.org'),
    (v_pid, 'Dr. Caroline Mwongera',             'MBChB, MMed',  'Paediatrics',               'KEMRI – CGMR-C, Coast',                    'Site investigator', 'cmwongera@kemri.go.ke'),
    (v_pid, 'Prof. Philip Bejon',                'DPhil, FRCP',  'Vaccinology, Malaria',      'University of Oxford / KEMRI-Wellcome',    'Senior advisor',    'pbejon@kemri-wellcome.org');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Estimate vaccine effectiveness of R21/Matrix-M against clinical malaria in children 5–36 months in routine programme settings.'),
    (v_pid, 2, 'Quantify reduction in severe malaria hospital admissions and case-fatality across three Kilifi sub-counties.'),
    (v_pid, 3, 'Characterise breakthrough infections by Plasmodium falciparum genetic diversity using whole-genome sequencing.'),
    (v_pid, 4, 'Document feasibility, acceptability and cost-per-dose-administered for routine malaria vaccine roll-out.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'RWE-MAL-K1', 'Children enrolled in vaccine cohort', 'Number of eligible children enrolled and consented across all three sites.', 'children', 0, 4500, 'Enrolled cohort of 4,500 children by month 18.', 'KIMES enrolment registry', 'CRF entry + biometric verification', 'quarterly', 1, 2, NOW() - INTERVAL '300 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'RWE-MAL-K2', 'Vaccine effectiveness against clinical malaria', 'Adjusted VE point estimate from cohort analysis at end of study.', '%', 0, 75, 'Peer-reviewed VE estimate ≥ 75%.', 'Active surveillance + passive case detection', 'Cox proportional hazards', 'annual', 1, 2, NOW() - INTERVAL '300 days') RETURNING id INTO v_kpi2;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'RWE-MAL-K3', 'Genomes sequenced from breakthrough infections', 'P. falciparum WGS deposited to PlasmoDB.', 'genomes', 0, 600, '600 genomes published to public repository.', 'KEMRI-CGMR-C sequencing core', 'Illumina NovaSeq + ARTIC pipeline', 'quarterly', 1, 2, NOW() - INTERVAL '300 days') RETURNING id INTO v_kpi3;

  -- Q1 FY2024/25 — accepted Green
  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q1', '2024-09-30', 2, 'PI, 2 co-PIs, 12 field nurses, 4 data clerks fully on-boarded.', 'qPCR genotyping ramp-up; 240 / 1,000 samples processed.', 'Illumina NovaSeq runs commissioned at CGMR-C sequencing core.', '2-day GCP refresher (n=22), Bioinformatics workshop (n=18).', 'Stock-out risk for ETPS sample tubes — second supplier qualified.', 4200000, 1050000, 720000, 330000, -3.8, 'accepted', '2024-10-08 09:30:00+03', 92.5, 1, 9, '2024-10-12 14:00:00+03', 'green', 'Excellent first quarter — enrolment ahead of schedule.')
  RETURNING id INTO v_rep_q1;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q1, 95, 100, 100, 100, 100, 90, 100, 100, 92.5, 1, '[]'::jsonb);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q1, 9, 'Centre Director', 'accept', 'green', 'Strong start; sustain enrolment momentum into Q2.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status, comments) VALUES
    (v_rep_q1, v_kpi1, 750,  812,  108.3, 'on_track',  'Site mobilisation paid off; ahead of plan.'),
    (v_rep_q1, v_kpi2,   0,    0,   0.0,  'on_track',  'Effectiveness only assessed annually.'),
    (v_rep_q1, v_kpi3, 100,   88,  88.0, 'on_track',  'Library prep delays in week 3; recovered.');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q1, 'green', 9, 'Q1 FY2024/25 peer review acceptance.');

  -- Q2 FY2024/25 — accepted Green
  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q2', '2024-12-31', 2, 'No staff turnover. Two new field nurses onboarded for Pingilikani.', 'WGS pipeline validated against PlasmoDB; 165 genomes deposited.', 'No new equipment acquired this quarter.', 'WGS bioinformatics workshop (n=14, KEMRI staff + 4 partners).', 'Long rains may impact follow-up visits in Junju.', 4200000, 2100000, 1610000, 490000, -3.0, 'accepted', '2025-01-10 10:00:00+03', 94.0, 1, 9, '2025-01-15 11:00:00+03', 'green', 'Continue strong execution.')
  RETURNING id INTO v_rep_q2;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q2, 96, 100, 100, 100, 100, 92, 100, 100, 94.0, 1, '[]'::jsonb);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q2, 9, 'Centre Director', 'accept', 'green', 'Maintained pace; genome deposition exemplary.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q2, v_kpi1, 1500, 1620, 108.0, 'on_track'),
    (v_rep_q2, v_kpi2,    0,    0,   0.0, 'on_track'),
    (v_rep_q2, v_kpi3,  220,  235, 106.8, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q2, 'green', 9, 'Q2 FY2024/25 peer review acceptance.');

  -- Q3 FY2024/25 — submitted, under review
  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed)
  VALUES (v_pid, 'FY2024/25', 'Q3', '2025-03-31', 2, 'All 30 study staff retained. Two MSc fellowships awarded.', 'Quarterly genome batch deposited (n=178). qPCR validation cohort completed.', 'Backup -80°C freezer commissioned at CGMR-C.', 'GCP recertification workshop (n=22). Two MSc Public Health start-ups.', 'None material this quarter.', 4200000, 2940000, 2420000, 520000, -2.6, 'submitted', '2025-04-08 12:00:00+03', 91.0, 1)
  RETURNING id INTO v_rep_q3;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q3, 93, 100, 100, 100, 100, 88, 100, 100, 91.0, 1, '[]'::jsonb);
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q3, v_kpi1, 2250, 2410, 107.1, 'on_track'),
    (v_rep_q3, v_kpi2,    0,    0,   0.0, 'on_track'),
    (v_rep_q3, v_kpi3,  340,  413, 121.5, 'on_track');

  -- Outputs
  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication', 'Real-world uptake and early effectiveness of R21/Matrix-M in coastal Kenya: a prospective cohort interim analysis', 'Kwatuha A, Ochola-Oyier LI, Mwongera C, Bejon P', '2025-02-18', 'published', 'The Lancet Infectious Diseases',  '10.1016/S1473-3099(25)00032-7', 14, 41.4, 'open', 92.0, 2),
    (v_pid, 'dataset',     'P. falciparum WGS genomes from R21 vaccine breakthrough infections (Kilifi)', 'KEMRI-Wellcome Genomics Core', '2025-03-25', 'released', 'PlasmoDB / European Nucleotide Archive', NULL, 0, NULL, 'controlled', 88.5, 2),
    (v_pid, 'abstract',    'Genetic diversity of breakthrough Plasmodium falciparum after R21/Matrix-M', 'Ochola-Oyier LI et al.', '2025-04-12', 'presented', 'ASTMH Annual Meeting 2025', NULL, 0, NULL, 'open', NULL, 2);

  -- §5 Staff
  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Alfayo Kwatuha',           'Principal Investigator', 'R-PI',  'PhD Epidemiology',     1.00, 'KEM-2018-0042', '2024-07-01', 'grant'),
    (v_pid, 'Dr. Caroline Mwongera',        'Site investigator',      'R-CO',  'MBChB, MMed Paeds',    0.50, 'KEM-2019-0088', '2024-07-01', 'grant'),
    (v_pid, 'Mary Wanjiru',                 'Senior research nurse',  'R-CRA', 'BScN, GCP-certified',  1.00, 'KEM-2021-0511', '2024-07-15', 'grant'),
    (v_pid, 'Joseph Mwangangi',             'Data manager',           'R-DM',  'MSc Health Informatics', 1.00, 'KEM-2022-0703', '2024-07-15', 'grant'),
    (v_pid, 'Faith Karisa',                 'Lab analyst — molecular','R-LAB', 'BSc Biomedical Sci',   1.00, 'KEM-2023-0914', '2024-08-01', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'GCP refresher for clinical and lab staff', 'training', '2024-07-22', '2024-07-23', 'Kilifi',      22, 'KEMRI-Wellcome Training Office', 'All 22 attendees passed certification.'),
    (v_pid, 'Bioinformatics for malaria genomics',      'workshop', '2024-11-04', '2024-11-08', 'Mombasa',     14, 'University of Oxford / KEMRI',   'Trainees produced first genome assembly using ARTIC pipeline.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Illumina NovaSeq 6000',           'lab', 'NS6K-2024-008', 'KEM-LAB-1207', '2024-08-10', 850000, 'USD', 'Illumina',          'Faith Karisa',     'CGMR-C Sequencing Core, Kilifi', 'in_use'),
    (v_pid, 'BioRad CFX96 qPCR system',        'lab', 'CFX96-K-118',   'KEM-LAB-1208', '2024-08-15',  68000, 'USD', 'BioRad',            'Faith Karisa',     'CGMR-C Molecular Lab, Kilifi',   'in_use'),
    (v_pid, 'Eppendorf -80°C freezer (650 L)', 'lab', 'EPF-650-22',    'KEM-LAB-1209', '2024-08-25',  18000, 'USD', 'Eppendorf',         'Mary Wanjiru',     'CGMR-C Biorepository',           'in_use'),
    (v_pid, 'Toyota Land Cruiser HZJ79 4WD',   'vehicle','TLC-2024-37','KEM-LAB-1210', '2024-09-01',  62000, 'USD', 'Toyota Kenya',      'Joseph Mwangangi', 'CGMR-C Field Office',            'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',    'PI + field staff salaries, taxes, NSSF/NHIF',         1700000,  945000, 'USD', 'FY2024/25'),
    (v_pid, 'equipment',    'Sequencing & cold-chain equipment (one-off)',           998000,  998000, 'USD', 'FY2024/25'),
    (v_pid, 'consumables',  'Reagents, library prep kits, cartridges, PPE',          540000,  168000, 'USD', 'FY2024/25'),
    (v_pid, 'travel',       'Field trips, conference travel, per diems',             190000,   72000, 'USD', 'FY2024/25'),
    (v_pid, 'subcontract',  'Sub-award to Oxford for advanced genomics analysis',    320000,  120000, 'USD', 'FY2024/25'),
    (v_pid, 'indirect',     'KEMRI overhead (15% of direct costs)',                  452000,  117000, 'USD', 'FY2024/25');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Plasmodium falciparum WGS',    'Illumina NovaSeq 6000', 'Dried blood spot',        600,  413, 94.5, 320, 'USD'),
    (v_pid, 'qPCR speciation & quantification', 'BioRad CFX96',      'Whole blood EDTA',       4500, 2120, 96.8,  18, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'community', 'Kilifi Community Advisory Board',     '2024-09-05', 'CAB requested clearer messaging on vaccine schedule for caregivers.', 'Re-printed caregiver leaflets in Kiswahili and Giriama; trained CHV team.', 'closed'),
    (v_pid, 'donor',     'BMGF programme officer (quarterly review)', '2025-01-22', 'Donor pleased with enrolment pace; requested gender-disaggregated data.', 'Added gender split to all KPI dashboards from Q3 onwards.', 'actioned');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Strong existing CGMR-C infrastructure (sequencing core, biorepository) accelerated start-up.'),
    (v_pid, 'strength',    'High community trust through long-running KEMRI-Wellcome demographic surveillance system.'),
    (v_pid, 'weakness',    'Single-supplier dependency for ETPS sample tubes — mitigated by qualifying second vendor.'),
    (v_pid, 'opportunity', 'Genomic data underpins follow-on R01 application on parasite immune escape.'),
    (v_pid, 'lesson',      'Front-loading GCP and bioinformatics training pays off — zero protocol deviations in Q1-Q2.');
END $$;

-- =============================================================================
-- STUDY 2 — AMPLIFY-AGYW: PrEP optimisation in adolescent girls and young women
-- Centre: CGHR (Kisumu, id=10) · Programme: SRACH (id=7) · Donor: NIH (id=3)
-- Status: active · RAG: amber (one queried report, recovering)
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint; v_kpi3 bigint;
  v_rep_q1 bigint; v_rep_q2 bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date, actual_start_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CGHR-2024-002', 'research', 'KEMRI-2024-PREP-002',
    'AMPLIFY-AGYW: optimising PrEP delivery for adolescent girls and young women in lake-region Kenya — a pragmatic implementation study',
    'AMPLIFY-AGYW',
    3, 10, 7, 3,
    3100000, 'USD', 'cooperative_agreement', 'implementation_research',
    'cooperative_agreement', 'NIH-R01-AI174532', 'R01-AI174532', 'KEMRI-LR-2024-031',
    'KEMRI/SERU/CGHR/512/4711', '2024-05-02', '2027-05-01',
    'NACOSTI/P/24/30822', '2024-05-20',
    '2024-08-01', '2027-07-31', '2024-08-15',
    'KEMRI – Centre for Global Health Research, Kisumu', 'Kenya',
    '["3","5","10"]'::jsonb,
    '["KRA1-Research-Excellence","KRA3-Capacity-Strengthening"]'::jsonb,
    'HIV/AIDS', 'HIV Prevention',
    'active', 'amber', 'implementation', 3
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Kisumu County Referral Hospital', 'Kenya', 'Kisumu', 'Kisumu Central', -0.0917, 34.7680),
    (v_pid, 'Siaya County Referral Hospital',  'Kenya', 'Siaya',  'Alego Usonga',    0.0612, 34.2867),
    (v_pid, 'Homa Bay County Hospital',        'Kenya', 'Homa Bay','Homa Bay Town', -0.5273, 34.4571);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Dr. Eduard Sanders',     'MD, PhD',     'HIV prevention',    'KEMRI – CGHR, Kisumu',                    'Co-PI',            'esanders@kemri.go.ke'),
    (v_pid, 'Dr. Beryne Odeny',       'MBChB, MPH',  'Adolescent health', 'KEMRI – CGHR, Kisumu',                    'Site investigator', 'bodeny@kemri.go.ke'),
    (v_pid, 'Prof. Connie Celum',     'MD, MPH',     'HIV prevention',    'University of Washington (collaborator)', 'Senior advisor',    'ccelum@uw.edu');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Compare uptake of facility-based vs. community-pharmacy PrEP delivery models among AGYW aged 15–24 years.'),
    (v_pid, 2, 'Measure 6-month PrEP persistence using a tenofovir-diphosphate dried-blood-spot drug-level assay.'),
    (v_pid, 3, 'Document barriers and enablers to PrEP continuation through quarterly qualitative interviews.'),
    (v_pid, 4, 'Estimate cost-per-AGYW-protected for each delivery model.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'AMPL-K1', 'AGYW initiated on PrEP', 'Number of AGYW initiated on PrEP across 3 sites.', 'AGYW', 0, 3600, '3,600 AGYW initiated by month 24.', 'Kenya MoH PrEP register', 'eHTS data extract + cross-validation', 'quarterly', 1, 3, NOW() - INTERVAL '260 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'AMPL-K2', '6-month PrEP persistence', 'Proportion with TFV-DP DBS levels > 700 fmol/punch at 6 months.', '%', 0, 55, 'Persistence ≥ 55% in pharmacy arm.', 'KEMRI – CGHR mass-spec lab', 'LC-MS/MS DBS assay', 'quarterly', 1, 3, NOW() - INTERVAL '260 days') RETURNING id INTO v_kpi2;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'AMPL-K3', 'Qualitative interviews completed', 'Number of qualitative interviews conducted.', 'interviews', 0, 240, 'Codebook + thematic analysis.', 'NVivo qualitative database', 'Recorded interviews + transcription', 'quarterly', 1, 3, NOW() - INTERVAL '260 days') RETURNING id INTO v_kpi3;

  -- Q1 FY2024/25 — accepted Amber (slow start)
  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q1', '2024-12-31', 3, 'PI, 2 site investigators, 6 peer mobilisers; 2 community pharmacists onboarded.', 'TFV-DP DBS assay validated against UW reference standards.', 'LC-MS/MS triple-quad commissioned at Kisumu lab.', 'PrEP-1A counsellor training (n=18). Adolescent-friendly services workshop (n=24).', 'Slower-than-planned uptake at Homa Bay due to community sensitisation gap.', 3100000, 775000, 510000, 265000, -5.0, 'accepted', '2025-01-09 09:00:00+03', 88.0, 1, 9, '2025-01-15 10:30:00+03', 'amber', 'Acceptable progress, but please scale community sensitisation in Homa Bay.')
  RETURNING id INTO v_rep_q1;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q1, 88, 100, 100, 100, 100, 80, 100, 100, 88.0, 1, '["staff_status_narrative.length"]'::jsonb);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q1, 9, 'Centre Director', 'accept', 'amber', 'Accept with caution — accelerate Homa Bay outreach.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status, comments) VALUES
    (v_rep_q1, v_kpi1, 600,  478,  79.7, 'behind', 'Homa Bay site uptake lagged.'),
    (v_rep_q1, v_kpi2,   0,    0,   0.0, 'on_track', 'Persistence assessed only after 6 months.'),
    (v_rep_q1, v_kpi3,  40,   42, 105.0, 'on_track', 'Two extra interviews conducted opportunistically.');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q1, 'amber', 9, 'Slow enrolment at Homa Bay site.');

  -- Q2 FY2024/25 — submitted, queried (returned for clarification)
  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q2', '2025-03-31', 3, 'No turnover; one peer mobiliser added at Homa Bay.', 'TFV-DP results: 168 of 180 samples processed.', 'No new equipment.', 'Two community pharmacists trained on PrEP screening (DPHK accreditation).', 'Tenofovir supply at MoH level dropped to 4-week buffer — escalated to NASCOP.', 3100000, 1550000, 1080000, 470000, -4.5, 'queried', '2025-04-09 14:00:00+03', 86.5, 1, 9, '2025-04-12 16:00:00+03', 'amber', 'Please re-submit with disaggregated uptake by site for Q2 only — current numbers are cumulative.')
  RETURNING id INTO v_rep_q2;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q2, 86, 100, 100, 100, 100, 78, 100, 100, 86.5, 1, '[]'::jsonb);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments, query_to_pi) VALUES
    (v_rep_q2, 9, 'Centre Director', 'query', 'amber', 'Numbers appear to be cumulative rather than quarterly; please disaggregate.', 'Re-submit Q2 enrolment as discrete quarter (not cumulative). Provide site-level breakdown.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q2, v_kpi1, 1200, 1014, 84.5, 'behind'),
    (v_rep_q2, v_kpi2,    0,    0,   0.0, 'on_track'),
    (v_rep_q2, v_kpi3,   80,   84, 105.0, 'on_track');

  -- Outputs
  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication', 'Validation of a tenofovir-diphosphate dried-blood-spot assay for AGYW PrEP adherence in Kenya', 'Sanders E, Maru E, Odeny B, Celum C', '2025-03-04', 'published', 'AIDS Research and Therapy', '10.1186/s12981-025-00601-2', 4, 3.2, 'open', 86.0, 3),
    (v_pid, 'policy_brief','Pharmacy-led PrEP for AGYW in lake region: programmatic considerations',                          'KEMRI – CGHR Kisumu',         '2025-04-30', 'released',  'Kenya MoH / NASCOP',                 NULL,                              0, NULL, 'open', NULL,  3);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Ezekiel Maru',    'Principal Investigator', 'R-PI',  'PhD Public Health',     1.00, 'KEM-2017-0029', '2024-08-01', 'grant'),
    (v_pid, 'Dr. Beryne Odeny',    'Site investigator',      'R-CO',  'MBChB, MPH',            0.50, 'KEM-2018-0103', '2024-08-01', 'grant'),
    (v_pid, 'Pamela Akoth',        'Senior research nurse',  'R-CRA', 'BScN, GCP',             1.00, 'KEM-2021-0612', '2024-08-15', 'grant'),
    (v_pid, 'Felix Onyango',       'Data manager',           'R-DM',  'MSc Biostatistics',     1.00, 'KEM-2022-0801', '2024-08-15', 'grant'),
    (v_pid, 'Hellen Awinja',       'Peer mobiliser lead',    'R-CRA', 'BA Sociology',          1.00, 'KEM-2024-1011', '2024-08-15', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'PrEP-1A counsellor training',          'training', '2024-09-02', '2024-09-04', 'Kisumu', 18, 'NASCOP / KEMRI',          'All 18 counsellors certified.'),
    (v_pid, 'Adolescent-friendly services workshop','workshop', '2024-10-21', '2024-10-22', 'Kisumu', 24, 'KEMRI + UW collaborators', 'Service-design improvements piloted at Kisumu site.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Sciex Triple Quad 6500+ LC-MS/MS', 'lab', 'SCX-6500-2024-12', 'KEM-LAB-1311', '2024-09-10', 410000, 'USD', 'Sciex',     'Felix Onyango', 'CGHR Kisumu, mass-spec lab', 'in_use'),
    (v_pid, 'Whatman 903 DBS card cutter',      'lab', 'PERK-903-019',     'KEM-LAB-1312', '2024-09-12',   8500, 'USD', 'PerkinElmer','Felix Onyango', 'CGHR Kisumu, mass-spec lab', 'in_use'),
    (v_pid, 'Ricoh IM C2010 multifunction printer', 'ict', 'RIC-IMC2010-22','KEM-ICT-2155','2024-08-28',   2400, 'USD', 'Ricoh Kenya','Felix Onyango','CGHR Kisumu PrEP office',     'in_use'),
    (v_pid, 'Toyota Hilux 4WD double-cab',      'vehicle','TLX-2024-71',  'KEM-VEH-3211', '2024-09-22',  48000, 'USD', 'Toyota Kenya','Hellen Awinja','CGHR Kisumu motor pool',      'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',    'Site staff, peer mobilisers, taxes',                  1240000, 605000, 'USD', 'FY2024/25'),
    (v_pid, 'equipment',    'LC-MS/MS + cold-chain + ICT one-off',                  475000, 458000, 'USD', 'FY2024/25'),
    (v_pid, 'consumables',  'DBS cards, reagents, screening kits',                  340000, 142000, 'USD', 'FY2024/25'),
    (v_pid, 'travel',       'Inter-site travel, NASCOP meetings',                   165000,  68000, 'USD', 'FY2024/25'),
    (v_pid, 'subcontract',  'University of Washington qualitative analysis support',290000, 116000, 'USD', 'FY2024/25'),
    (v_pid, 'indirect',     'KEMRI overhead 15%',                                   382500, 100000, 'USD', 'FY2024/25');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Tenofovir-diphosphate (TFV-DP) DBS', 'Sciex 6500+ LC-MS/MS', 'Dried blood spot', 1800,  348, 92.0, 38, 'USD'),
    (v_pid, 'HIV-1 RNA viral load',                'Roche cobas 6800',     'EDTA plasma',     2400,  720, 99.0, 22, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner',    'NASCOP technical working group',     '2024-11-12', 'NASCOP requested integration with national PrEP register (KEPH).', 'KIMES exports mapped to KEPH schema; first sync completed Q2.', 'closed'),
    (v_pid, 'community',  'AGYW Youth Advisory Board (Homa Bay)','2025-02-04', 'AGYW raised concerns about clinic waiting times.',                  'Pilot pharmacy-collection model launched at 2 Homa Bay pharmacies.','open');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Existing CGHR HIV cohort infrastructure (KEMRI-CDC) accelerates recruitment.'),
    (v_pid, 'weakness',    'Tenofovir national-level supply is unstable; we have only 4 weeks of buffer stock.'),
    (v_pid, 'opportunity', 'NASCOP keen to scale pharmacy-led model nationally — direct policy translation.'),
    (v_pid, 'threat',      'Stigma in some Homa Bay sub-locations slows uptake; addressed through CHV outreach.'),
    (v_pid, 'lesson',      'Pharmacy-collection pilots increase persistence by ~12 percentage points vs facility-only.');
END $$;

-- =============================================================================
-- STUDY 3 — AMR Genomic Surveillance, coastal Kenya
-- Centre: CMR (id=3) · Programme: IPD (id=5) · Donor: Wellcome Trust (id=2)
-- Status: active · RAG: green
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint; v_kpi3 bigint;
  v_rep_q1 bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date, actual_start_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CMR-2025-001', 'research', 'KEMRI-2025-AMR-001',
    'Genomic surveillance of antimicrobial resistance in invasive Salmonella, Klebsiella and E. coli across coastal Kenyan health facilities',
    'AMR-Coast-Genomics',
    11, 3, 5, 2,
    1850000, 'GBP', 'grant_award', 'observational_surveillance',
    'investigator_initiated', 'WT-225431/Z/22/Z', '225431/Z/22/Z', 'KEMRI-LR-2025-007',
    'KEMRI/SERU/CMR/611/4912', '2025-02-03', '2028-02-02',
    'NACOSTI/P/25/31201', '2025-02-18',
    '2025-04-01', '2028-03-31', '2025-04-08',
    'KEMRI – Centre for Microbiology Research, Nairobi', 'Kenya',
    '["3","6","12"]'::jsonb,
    '["KRA1-Research-Excellence","KRA4-Policy-Engagement"]'::jsonb,
    'Antimicrobial Resistance', 'Bacterial AMR',
    'active', 'green', 'implementation', 11
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Coast General Teaching & Referral Hospital', 'Kenya', 'Mombasa', 'Mvita',         -4.0519, 39.6657),
    (v_pid, 'Kilifi County Hospital',                     'Kenya', 'Kilifi',  'Kilifi North',  -3.6309, 39.8499),
    (v_pid, 'Msambweni County Referral Hospital',          'Kenya', 'Kwale',   'Msambweni',     -4.4720, 39.4836);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Prof. Sam Kariuki',     'PhD, FRCPath',  'Bacterial genomics / AMR', 'KEMRI – Centre for Microbiology Research', 'Co-PI',          'skariuki@kemri.go.ke'),
    (v_pid, 'Dr. Doris Mueni',       'PhD',           'Microbial genomics',       'KEMRI – Centre for Microbiology Research', 'Lead bioinformatician', 'dmueni@kemri.go.ke'),
    (v_pid, 'Dr. Susan Githii',      'MBChB, MMed',   'Clinical microbiology',    'Aga Khan University Hospital, Mombasa',     'Site investigator', 'sgithii@akhsk.org');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Establish a sentinel network of 3 coastal hospitals submitting clinical isolates and metadata to KEMRI – CMR.'),
    (v_pid, 2, 'Generate whole-genome sequences and resistome profiles for 1,800 invasive bacterial isolates over 3 years.'),
    (v_pid, 3, 'Detect emerging mobile resistance elements (e.g. blaNDM, mcr-1) and feed into Kenya MoH AMR dashboards.'),
    (v_pid, 4, 'Train 12 KEMRI scientists in bacterial genomic epidemiology to MSc level.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'AMR-K1', 'Sentinel hospitals enrolled', 'Number of sentinel sites actively submitting isolates.', 'sites', 0, 3, '3 sites operational by Q2.', 'Sentinel onboarding log', 'KIMES site activation form', 'quarterly', 1, 9, NOW() - INTERVAL '90 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'AMR-K2', 'Isolates whole-genome sequenced', 'Number of clinical isolates with WGS deposited on ENA.', 'isolates', 0, 1800, '1,800 genomes by month 30.', 'KEMRI – CMR sequencing core', 'Illumina + nanopore', 'quarterly', 1, 9, NOW() - INTERVAL '90 days') RETURNING id INTO v_kpi2;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'AMR-K3', 'Carbapenemase-producing isolates flagged to MoH', 'Number of CRE genomes flagged through MoH AMR alerts.', 'alerts', 0, 80, 'Real-time outbreak alerts.', 'KEMRI AMR dashboard', 'Automated bioinformatics flagging', 'quarterly', 1, 9, NOW() - INTERVAL '90 days') RETURNING id INTO v_kpi3;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q4', '2025-06-30', 11, 'PI, 2 co-PIs, 4 microbiologists, 2 bioinformaticians on board.', 'Initial 230 isolates received; WGS pipeline validated.', 'Oxford Nanopore PromethION P2 commissioned at CMR.', 'AMR genomic epi short-course (n=12).', 'Cold-chain to Msambweni occasionally interrupted by power outages.', 1850000, 462500, 318000, 144500, -2.4, 'accepted', '2025-07-08 09:00:00+03', 93.0, 1, 9, '2025-07-12 15:00:00+03', 'green', 'Strong sentinel onboarding; keep momentum.')
  RETURNING id INTO v_rep_q1;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q1, 96, 100, 100, 100, 100, 90, 100, 100, 93.0, 1, '[]'::jsonb);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q1, 9, 'Centre Director', 'accept', 'green', 'Excellent start; maintain pipeline integrity.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q1, v_kpi1,   3,    3, 100.0, 'on_track'),
    (v_rep_q1, v_kpi2, 200,  230, 115.0, 'on_track'),
    (v_rep_q1, v_kpi3,   8,   12, 150.0, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q1, 'green', 9, 'Q4 FY2024/25 strong execution.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication','Carbapenemase-producing Klebsiella pneumoniae from coastal Kenya: a genomic epidemiology baseline', 'Kariuki S, Mueni D, Githii S, Wilson G',                    '2025-09-15', 'in_press', 'eLife',                            '10.7554/eLife.99214', 0, 7.7,  'open',     90.0, 11),
    (v_pid, 'dataset',    'Coastal Kenya invasive bacterial isolates — WGS dataset v1',                                          'KEMRI – CMR Sequencing Core',                                '2025-09-30', 'released', 'European Nucleotide Archive',     NULL,                  0, NULL, 'controlled', 84.0, 11);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. George Taylor',   'Principal Investigator', 'R-PI',  'PhD Microbiology',         1.00, 'KEM-2017-0048', '2025-04-01', 'grant'),
    (v_pid, 'Prof. Sam Kariuki',   'Co-PI / Director CMR',   'R-CO',  'PhD, FRCPath',             0.20, 'KEM-2010-0011', '2025-04-01', 'kemri'),
    (v_pid, 'Dr. Doris Mueni',     'Lead bioinformatician',  'R-LAB', 'PhD Bioinformatics',       1.00, 'KEM-2020-0312', '2025-04-08', 'grant'),
    (v_pid, 'Stephen Mutua',       'Senior microbiologist',  'R-LAB', 'MSc Microbiology',         1.00, 'KEM-2019-0204', '2025-04-08', 'grant'),
    (v_pid, 'Lydia Wairimu',       'Sentinel data manager',  'R-DM',  'BSc Health Records & IT',  1.00, 'KEM-2022-0905', '2025-04-15', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'AMR genomic epidemiology short-course', 'training',  '2025-05-12', '2025-05-23', 'Nairobi', 12, 'KEMRI – CMR / Wellcome Sanger Institute', 'All 12 trainees completed module assessments.'),
    (v_pid, 'Pathogen genomics annual symposium',     'conference','2025-06-04', '2025-06-05', 'Nairobi', 80, 'KEMRI – CMR + AAS',                       'Three KEMRI abstracts presented; partnerships expanded.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Oxford Nanopore PromethION P2', 'lab', 'ONT-P2-2025-0044', 'KEM-LAB-1411', '2025-04-22',  220000, 'GBP', 'Oxford Nanopore', 'Stephen Mutua', 'CMR Sequencing Core, Nairobi', 'in_use'),
    (v_pid, 'Illumina MiSeq Dx',             'lab', 'MIS-DX-2025-117',  'KEM-LAB-1412', '2025-04-22',  165000, 'GBP', 'Illumina',         'Stephen Mutua', 'CMR Sequencing Core, Nairobi', 'in_use'),
    (v_pid, 'Bruker MALDI Biotyper sirius',  'lab', 'BRK-SIR-2025-018','KEM-LAB-1413', '2025-04-29',  130000, 'GBP', 'Bruker',           'Stephen Mutua', 'CMR Clinical Microbiology Lab', 'in_use'),
    (v_pid, 'NetApp ONTAP storage (250 TB)', 'ict', 'NTA-FAS-2025-022','KEM-ICT-2456', '2025-05-15',   58000, 'GBP', 'NetApp',           'Lydia Wairimu', 'CMR Data Centre',              'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Microbiologists, bioinformaticians, data managers',          720000,  168000, 'GBP', 'FY2024/25'),
    (v_pid, 'equipment',   'Sequencing platforms + storage',                              573000,  573000, 'GBP', 'FY2024/25'),
    (v_pid, 'consumables', 'Library prep kits, flow cells, growth media',                 280000,   86000, 'GBP', 'FY2024/25'),
    (v_pid, 'travel',      'Sentinel site monitoring + conferences',                       65000,   18000, 'GBP', 'FY2024/25'),
    (v_pid, 'subcontract', 'Sanger Institute genomics support',                           120000,   30000, 'GBP', 'FY2024/25'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                                          252000,   45000, 'GBP', 'FY2024/25');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Bacterial WGS — Illumina',      'Illumina MiSeq Dx',         'Bacterial isolate', 1800, 230, 95.0,  62, 'GBP'),
    (v_pid, 'Long-read WGS — Nanopore',      'Oxford Nanopore PromethION','Bacterial isolate',  300,  68, 92.0, 110, 'GBP');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'regulatory', 'Pharmacy & Poisons Board (Kenya)', '2025-05-20', 'PPB requested AMR data sharing for new antibiotic guideline development.', 'MoU drafted; quarterly aggregated AMR report templated.', 'actioned'),
    (v_pid, 'partner',    'Wellcome Sanger Institute',         '2025-06-15', 'Sanger offered free flow-cells in exchange for shared genomes.', 'Accepted; first reagent shipment received July 2025.', 'closed');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'KEMRI – CMR is established WHO Collaborating Centre on AMR; high inertia for sentinel buy-in.'),
    (v_pid, 'weakness',    'Cold-chain interruptions during power outages at Msambweni risk sample integrity.'),
    (v_pid, 'opportunity', 'Direct policy translation route through PPB and MoH AMR Steering Committee.'),
    (v_pid, 'threat',      'Skilled-bioinformatician retention pressure — UK and US poaching is real.'),
    (v_pid, 'lesson',      'Joint Illumina + Nanopore sequencing finds plasmid context that short-read alone misses.');
END $$;

-- =============================================================================
-- STUDY 4 — CHILD-TB Paediatric TB diagnostic accuracy trial
-- Centre: CRDR (id=8) · Programme: IPD (id=5) · Donor: EDCTP (id=5)
-- Status: active · RAG: green
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint;
  v_rep_q1 bigint; v_rep_q2 bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date, actual_start_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CRDR-2024-001', 'research', 'KEMRI-2024-CHILDTB-001',
    'CHILD-TB: diagnostic accuracy of stool-based Xpert MTB/RIF Ultra in children under 10 years with presumed TB',
    'CHILD-TB',
    11, 8, 5, 5,
    2800000, 'EUR', 'cooperative_agreement', 'diagnostic_accuracy_trial',
    'cooperative_agreement', 'EDCTP-RIA2022CT-2117', 'RIA2022CT-2117', 'KEMRI-LR-2024-022',
    'KEMRI/SERU/CRDR/322/4548', '2024-01-22', '2027-01-21',
    'NACOSTI/P/24/30115', '2024-02-08',
    '2024-06-01', '2027-05-31', '2024-06-15',
    'KEMRI – Centre for Respiratory Diseases Research, Nairobi', 'Kenya',
    '["3","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA2-Translation-Impact"]'::jsonb,
    'Tuberculosis', 'Paediatric TB',
    'active', 'green', 'implementation', 11
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Mbagathi County Hospital',         'Kenya', 'Nairobi',  'Dagoretti South', -1.3193, 36.7972),
    (v_pid, 'Coast General Teaching Hospital',  'Kenya', 'Mombasa',  'Mvita',           -4.0519, 39.6657),
    (v_pid, 'Kakamega County General Hospital', 'Kenya', 'Kakamega', 'Lurambi',          0.2839, 34.7519);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Dr. Charles Nzioka',     'MBChB, PhD',     'Paediatric pulmonology', 'KEMRI – CRDR',                                   'Co-PI',          'cnzioka@kemri.go.ke'),
    (v_pid, 'Dr. Eunice Kagucia',     'PhD',           'TB epidemiology',         'KEMRI-Wellcome Trust Research Programme',         'Senior advisor', 'ekagucia@kemri-wellcome.org'),
    (v_pid, 'Prof. Anneke Hesseling', 'MD, PhD',       'Paediatric TB',           'Stellenbosch University (collaborator)',          'External advisor', 'ah@sun.ac.za');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Estimate sensitivity and specificity of stool Xpert MTB/RIF Ultra against the microbiological reference standard in children <10y.'),
    (v_pid, 2, 'Compare diagnostic yield of stool vs respiratory specimens (gastric aspirate, induced sputum) in the same children.'),
    (v_pid, 3, 'Document time-to-diagnosis impact of stool-first diagnostic algorithm at three Kenyan sites.'),
    (v_pid, 4, 'Assess implementability and acceptability among caregivers and providers.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'CTB-K1', 'Children enrolled', 'Number of presumed-TB children enrolled across 3 sites.', 'children', 0, 1800, '1,800 children enrolled by month 24.', 'CHILD-TB enrolment register', 'CRF + paper backup', 'quarterly', 1, 9, NOW() - INTERVAL '180 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'CTB-K2', 'Stool Xpert tests run', 'Number of stool Xpert Ultra tests performed.', 'tests', 0, 1800, 'Diagnostic results returned within 24 hours of receipt.', 'KEMRI – CRDR TB lab', 'Cepheid GeneXpert', 'quarterly', 1, 9, NOW() - INTERVAL '180 days') RETURNING id INTO v_kpi2;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q1', '2024-09-30', 11, 'PI + 3 site investigators + 6 study nurses + 3 lab techs onboarded.', 'Stool Xpert Ultra runs ramped up at all sites.', 'Cepheid GeneXpert 16-module installed at Coast General; +1 module at Mbagathi.', 'Stool-test SOP training for site nurses (n=18).', 'GeneXpert cartridge supply at one site delayed by 3 weeks.', 2800000, 700000, 480000, 220000, -3.5, 'accepted', '2024-10-09 11:00:00+03', 91.0, 1, 9, '2024-10-15 14:30:00+03', 'green', 'Solid first quarter; address cartridge supply contingency.')
  RETURNING id INTO v_rep_q1;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q1, 95, 100, 100, 100, 100, 86, 100, 100, 91.0, 1, '[]'::jsonb);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q1, 9, 'Centre Director', 'accept', 'green', 'Strong execution; resolve cartridge supply.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q1, v_kpi1, 300, 318, 106.0, 'on_track'),
    (v_rep_q1, v_kpi2, 300, 297,  99.0, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q1, 'green', 9, 'Q1 acceptance.');

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q2', '2024-12-31', 11, 'No turnover; 1 maternity-leave cover added at Kakamega.', 'Stool Xpert tests on track. Mycobacterial culture introduced as gold-standard reference.', 'No new equipment.', 'Caregiver acceptability training; CTB protocol refresher.', 'None material.', 2800000, 1400000, 1080000, 320000, -3.0, 'accepted', '2025-01-10 09:30:00+03', 93.0, 1, 9, '2025-01-15 12:00:00+03', 'green', 'Continue strong execution.')
  RETURNING id INTO v_rep_q2;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep_q2, 96, 100, 100, 100, 100, 88, 100, 100, 93.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q2, 9, 'Centre Director', 'accept', 'green', 'Maintain pace.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q2, v_kpi1, 600, 612, 102.0, 'on_track'),
    (v_rep_q2, v_kpi2, 600, 588,  98.0, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q2, 'green', 9, 'Q2 acceptance.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication','Diagnostic yield of stool Xpert MTB/RIF Ultra in Kenyan children: an interim analysis', 'Taylor G, Nzioka C, Kagucia E, Hesseling A', '2025-04-22', 'published', 'Lancet Child & Adolescent Health', '10.1016/S2352-4642(25)00079-1', 6, 19.5, 'open', 88.0, 11);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. George Taylor',  'Principal Investigator', 'R-PI',  'PhD Microbiology',     0.50, 'KEM-2017-0048', '2024-06-01', 'grant'),
    (v_pid, 'Dr. Charles Nzioka', 'Co-PI',                  'R-CO',  'MBChB, PhD',           0.30, 'KEM-2014-0009', '2024-06-01', 'kemri'),
    (v_pid, 'Mary Atieno',        'Senior study nurse',     'R-CRA', 'BScN, GCP',            1.00, 'KEM-2020-0322', '2024-06-15', 'grant'),
    (v_pid, 'Joseph Mutiso',      'TB lab supervisor',      'R-LAB', 'BSc Medical Lab Sci',  1.00, 'KEM-2021-0421', '2024-06-15', 'grant'),
    (v_pid, 'Susan Wambui',       'Site coordinator (Kakamega)','R-CRA','BSc Health Sci',    1.00, 'KEM-2023-0703', '2024-07-01', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'CHILD-TB stool sample SOP training', 'training','2024-07-08', '2024-07-09', 'Nairobi', 18, 'KEMRI – CRDR + Stellenbosch', 'Site nurses certified on stool collection and processing.'),
    (v_pid, 'CHILD-TB protocol refresher',        'workshop','2024-12-04', '2024-12-04', 'Nairobi', 15, 'KEMRI – CRDR',                'Mid-study refresher; 2 protocol clarifications adopted.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Cepheid GeneXpert 16-module',  'lab', 'GX-16-2024-077', 'KEM-LAB-1511', '2024-06-25',  72000, 'EUR', 'Cepheid',     'Joseph Mutiso', 'Coast General TB lab', 'in_use'),
    (v_pid, 'BD MGIT 960 culture system',   'lab', 'MGIT-960-K-12',  'KEM-LAB-1512', '2024-07-08',  45000, 'EUR', 'Becton-Dickinson','Joseph Mutiso','CRDR Mycobacteriology, Nairobi','in_use'),
    (v_pid, 'Sample coolers (60 L) — fleet of 12','field','SC-2024-LOT-A','KEM-LAB-1513','2024-07-10', 6000, 'EUR', 'Coleman',     'Mary Atieno',   'Distributed across sites','in_use'),
    (v_pid, 'Toyota Hilux 4WD double-cab',  'vehicle','TLX-2024-83',  'KEM-VEH-3322', '2024-08-12',  48000, 'EUR', 'Toyota Kenya','Susan Wambui',  'CRDR Field Office',     'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Site staff and lab supervisors',                            1100000, 425000, 'EUR', 'FY2024/25'),
    (v_pid, 'equipment',   'GeneXpert + culture + cold-chain (one-off)',                 175000, 171000, 'EUR', 'FY2024/25'),
    (v_pid, 'consumables', 'Xpert Ultra cartridges, MGIT tubes, PPE, transport media',   620000, 218000, 'EUR', 'FY2024/25'),
    (v_pid, 'travel',      'Inter-site monitoring and EDCTP review meetings',            120000,  42000, 'EUR', 'FY2024/25'),
    (v_pid, 'subcontract', 'Stellenbosch University reference-standard analysis',        320000, 105000, 'EUR', 'FY2024/25'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                                         365000, 119000, 'EUR', 'FY2024/25');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Stool Xpert MTB/RIF Ultra',   'Cepheid GeneXpert 16-module', 'Stool',          1800, 885, 97.5, 18, 'EUR'),
    (v_pid, 'Mycobacterial liquid culture','BD MGIT 960',                  'Gastric aspirate',1200, 580, 92.0, 24, 'EUR');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner', 'National TB Programme (NTLDU)',  '2024-10-30', 'NTLDU offered to integrate stool-first algorithm into national pediatric TB guideline.', 'Joint working group convened; first draft revision Q1 2025.', 'actioned'),
    (v_pid, 'donor',   'EDCTP project officer review',    '2025-01-22', 'EDCTP requested gender disaggregation and cost-effectiveness analysis plan.', 'Cost-effectiveness analysis added to study aims; Q3 deliverable.', 'actioned');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Direct policy translation pathway through National TB Programme working group.'),
    (v_pid, 'strength',    'Diverse three-site network captures coastal, urban and rural TB epidemiology.'),
    (v_pid, 'weakness',    'GeneXpert cartridge global supply remains brittle; second-source builds resilience.'),
    (v_pid, 'opportunity', 'Cost-effectiveness analysis underpins WHO guideline submission late 2026.'),
    (v_pid, 'lesson',      'Caregiver acceptability of stool sampling far higher than gastric aspirate.');
END $$;

-- =============================================================================
-- STUDY 5 — Schistosoma haematobium MDA elimination demonstration
-- Centre: CIPDCR (id=11) · Programme: IPD (id=5) · Donor: BMGF (id=1)
-- Status: active · RAG: red (escalation L2 in flight)
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint;
  v_rep_q1 bigint; v_rep_q2 bigint;
  v_esc_id bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date, actual_start_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CIPDCR-2024-001', 'research', 'KEMRI-2024-SCH-001',
    'Schistosoma haematobium elimination through twice-yearly mass-drug administration in coastal Kenya: a pre-elimination demonstration',
    'SCH-Elim',
    12, 11, 5, 1,
    1600000, 'USD', 'grant_award', 'cluster_randomised_trial',
    'cooperative_agreement', 'BMGF-INV-067918', 'INV-067918', 'KEMRI-LR-2024-019',
    'KEMRI/SERU/CIPDCR/418/4633', '2024-04-09', '2027-04-08',
    'NACOSTI/P/24/30518', '2024-04-22',
    '2024-08-01', '2027-07-31', '2024-08-22',
    'KEMRI – Centre for Infectious & Parasitic Diseases Control Research', 'Kenya',
    '["3","6","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA2-Translation-Impact"]'::jsonb,
    'Neglected Tropical Diseases', 'Schistosomiasis',
    'active', 'red', 'corrective_action', 12
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Msambweni County Hospital',          'Kenya', 'Kwale',      'Msambweni',  -4.4720, 39.4836),
    (v_pid, 'Hola Sub-County Hospital',           'Kenya', 'Tana River', 'Galole',     -1.5042, 40.0214),
    (v_pid, 'King Fahad Hospital, Lamu',          'Kenya', 'Lamu',       'Lamu West',  -2.2696, 40.9006);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Dr. Doris Macharia',  'PhD',          'Parasitology',     'KEMRI – CIPDCR',                  'Co-PI',          'dmacharia@kemri.go.ke'),
    (v_pid, 'Dr. Charles Mbogo',   'PhD',          'NTD epidemiology', 'KEMRI – CIPDCR',                  'Senior advisor', 'cmbogo@kemri.go.ke'),
    (v_pid, 'Prof. Russell Stothard','PhD',        'Schistosomiasis',  'Liverpool School of Tropical Med','External advisor','russell.stothard@lstmed.ac.uk');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Demonstrate ≥ 75% sustained MDA coverage of school-aged children twice yearly across three coastal counties.'),
    (v_pid, 2, 'Reduce S. haematobium prevalence below 10% (WHO pre-elimination threshold) at all sites by year 3.'),
    (v_pid, 3, 'Assess feasibility and costs of twice-yearly community-based MDA delivery vs. the current annual model.'),
    (v_pid, 4, 'Document drug-pressure resistance markers in residual S. haematobium populations.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'SCH-K1', 'MDA coverage of school-aged children', 'Proportion of eligible SAC who received praziquantel.', '%', 35, 75, 'Coverage ≥ 75% at all sites.', 'CIPDCR field MDA register', 'Field roster + MoH cross-check', 'quarterly', 1, 9, NOW() - INTERVAL '210 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'SCH-K2', 'S. haematobium prevalence', 'Microscopy + POC-CCA combined prevalence in SAC.', '%', 28, 10, '< 10% prevalence at all sites by year 3.', 'CIPDCR parasitology lab', 'Microscopy + POC-CCA, dual reading', 'biannual', 1, 9, NOW() - INTERVAL '210 days') RETURNING id INTO v_kpi2;

  -- Q1 — accepted Amber (low coverage at Lamu)
  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q1', '2024-12-31', 12, 'PI, 1 co-PI, 4 field officers, 2 lab techs.', 'Baseline microscopy on 1,200 SAC samples completed.', 'Field microscopy kits, POC-CCA strips procured.', 'NTD MDA training of trainers (n=24) at Mombasa.', 'Lamu site logistics challenged by ferry schedule.', 1600000, 400000, 295000, 105000, -2.5, 'accepted', '2025-01-10 09:00:00+03', 86.0, 1, 9, '2025-01-15 12:00:00+03', 'amber', 'Address Lamu logistics; coverage at 62%.')
  RETURNING id INTO v_rep_q1;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep_q1, 90, 100, 100, 100, 100, 78, 100, 100, 86.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q1, 9, 'Centre Director', 'accept', 'amber', 'Lamu coverage below target.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q1, v_kpi1, 75, 68, 90.7, 'behind'),
    (v_rep_q1, v_kpi2, 10, 24,  0.0, 'pending');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q1, 'amber', 9, 'Lamu coverage drag.');

  -- Q2 — escalated to Red (two consecutive sub-target periods)
  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q2', '2025-03-31', 12, 'Two field officers transferred to other projects; replacements pending.', 'Round-1 MDA coverage delivered: 56% Lamu, 78% Kwale, 70% Tana River.', 'No new equipment.', 'No major training events this quarter.', 'Praziquantel stock-out at Lamu for 2 weeks; community fatigue with twice-yearly schedule emerging.', 1600000, 800000, 645000, 155000, -3.1, 'accepted', '2025-04-08 14:00:00+03', 78.0, 0, 9, '2025-04-15 16:00:00+03', 'red', 'Two consecutive sub-target periods; opening Level-2 escalation.')
  RETURNING id INTO v_rep_q2;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed, flagged_fields)
    VALUES (v_rep_q2, 78, 100, 100, 100, 100, 60, 100, 100, 78.0, 0, '["staff_status_narrative.replacements_pending","lab_analyses_summary.coverage_below_target"]'::jsonb);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q2, 9, 'Centre Director', 'escalate', 'red', 'Two consecutive sub-target quarters — opening L2 escalation; corrective action plan required.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status, comments) VALUES
    (v_rep_q2, v_kpi1, 75, 68, 90.7, 'behind', 'Lamu coverage 56% — pulls down average.'),
    (v_rep_q2, v_kpi2, 10, 22,  0.0, 'pending', 'Mid-study prevalence to be measured at year 1.');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q2, 'red', 9, 'Two consecutive sub-target periods.');

  INSERT INTO kemri_escalations (project_id, report_id, level, classification, triggered_by, notice_subject, notice_body, notified_user_ids, resolved)
  VALUES (v_pid, v_rep_q2, 2, 'performance_underperformance', 9,
          'Level-2 escalation: SCH-Elim project — corrective action required',
          'Two consecutive quarters with MDA coverage below the 75% target. Please submit a 30-day corrective action plan focused on Lamu site logistics, praziquantel stock buffer, and community engagement.',
          '[12, 9, 1]'::jsonb, 0)
  RETURNING id INTO v_esc_id;

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'abstract',     'Baseline schistosomiasis prevalence and MDA coverage in three coastal Kenyan counties', 'Miller E, Macharia D, Mbogo C, Stothard R', '2025-03-15', 'presented', 'COR-NTD Annual Meeting 2025', NULL, 0, NULL, 'open', NULL, 12),
    (v_pid, 'policy_brief', 'Twice-yearly MDA for schistosomiasis: implementation considerations from coastal Kenya',  'KEMRI – CIPDCR',                            '2025-05-30', 'released',  'WHO NTD Department / Kenya MoH', NULL, 0, NULL, 'open', NULL, 12);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Edward Miller',     'Principal Investigator', 'R-PI', 'PhD Parasitology',          1.00, 'KEM-2018-0061', '2024-08-01', 'grant'),
    (v_pid, 'Dr. Doris Macharia',    'Co-PI',                  'R-CO', 'PhD Public Health',         0.40, 'KEM-2014-0033', '2024-08-01', 'kemri'),
    (v_pid, 'Halima Salim',          'Field officer (Kwale)',  'R-CRA','BSc Public Health',         1.00, 'KEM-2022-1014', '2024-08-15', 'grant'),
    (v_pid, 'Patrick Wamalwa',       'Field officer (Tana R.)','R-CRA','BSc Community Health',      1.00, 'KEM-2022-1015', '2024-08-15', 'grant'),
    (v_pid, 'Asha Mohammed',         'Field officer (Lamu)',   'R-CRA','BSc Health Sci',            1.00, 'KEM-2022-1016', '2024-08-15', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'NTD MDA training of trainers',          'training','2024-09-09', '2024-09-13', 'Mombasa', 24, 'KEMRI – CIPDCR + WHO',     'All 24 trainers cascaded MDA training to 312 community drug distributors.'),
    (v_pid, 'POC-CCA standardisation workshop',       'workshop','2025-01-15', '2025-01-16', 'Mombasa', 12, 'KEMRI – CIPDCR + LSTM',    'Inter-rater agreement above 0.85 across all sites.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Olympus CX23 microscopes (fleet of 6)', 'lab','OLY-CX23-2024-LOT12','KEM-LAB-1611','2024-08-08',  18000, 'USD', 'Olympus',     'Halima Salim',     'Distributed across sites','in_use'),
    (v_pid, 'Sample coolers (40 L) — fleet of 8',    'field','SC40-2024-LOT-K','KEM-LAB-1612','2024-08-12',   3200, 'USD', 'Coleman',     'Patrick Wamalwa',  'Distributed across sites','in_use'),
    (v_pid, 'Toyota Land Cruiser HZJ79 4WD',         'vehicle','TLC-2024-91',  'KEM-VEH-3411','2024-09-02',  62000, 'USD', 'Toyota Kenya','Asha Mohammed',    'CIPDCR Coast Field Office','in_use'),
    (v_pid, 'Boat outboard 75 HP (Lamu inter-island)','vehicle','OB-75-2024-04','KEM-VEH-3412','2024-09-15',  22000, 'USD', 'Yamaha Kenya','Asha Mohammed',    'Lamu field station',     'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Field staff and lab techs',                    580000, 250000, 'USD', 'FY2024/25'),
    (v_pid, 'equipment',   'Microscopes, vehicles, boat',                  108000, 105000, 'USD', 'FY2024/25'),
    (v_pid, 'consumables', 'Praziquantel, POC-CCA strips, microscopy kits',420000, 215000, 'USD', 'FY2024/25'),
    (v_pid, 'travel',      'Field deployment, supervision visits',         220000,  90000, 'USD', 'FY2024/25'),
    (v_pid, 'subcontract', 'LSTM technical support',                       110000,  35000, 'USD', 'FY2024/25'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                           208500,  60000, 'USD', 'FY2024/25');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'S. haematobium urine microscopy', 'Olympus CX23',          'Urine', 6000, 1640, 95.0, 4, 'USD'),
    (v_pid, 'POC-CCA rapid test',              'Rapid Medical Diagnostics', 'Urine', 4500, 1280, 96.5, 8, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'community',  'Lamu Community Health Strategy Group',  '2025-02-25', 'Twice-yearly MDA causing fatigue; some caregivers refusing second round.', 'Pilot of community drug distributor incentives; revised sensitisation script.', 'open'),
    (v_pid, 'regulatory', 'Pharmacy & Poisons Board (PPB)',          '2025-03-12', 'Praziquantel batch recalled (manufacturer QC issue); replacement shipment delayed.', 'Activated buffer stock at Kwale; expedited replacement via WHO PSCA.', 'actioned');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Strong CIPDCR community drug distributor network with > 10 years of experience.'),
    (v_pid, 'weakness',    'Lamu logistics (ferries, sea) constrain field-team mobility and stock movement.'),
    (v_pid, 'threat',      'Praziquantel global supply remains brittle; one batch recall triggered project-wide stock-out.'),
    (v_pid, 'opportunity', 'Findings will inform Kenya MoH 2027–2030 NTD master plan revision.'),
    (v_pid, 'lesson',      'Community fatigue is a real risk in twice-yearly MDA; CHW incentives + creative messaging matter as much as drug supply.');
END $$;

-- =============================================================================
-- STUDY 6 — CovEpi-Lake longitudinal SARS-CoV-2 sero-cohort
-- Centre: CGHR (Kisumu, id=10) · Programme: PHHRS (id=3) · Donor: US CDC (id=8)
-- Status: active · RAG: green
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint;
  v_rep_q1 bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date, actual_start_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CGHR-2024-003', 'research', 'KEMRI-2024-COV-003',
    'CovEpi-Lake: longitudinal SARS-CoV-2 sero-prevalence and respiratory viral surveillance in the Lake Victoria basin',
    'CovEpi-Lake',
    14, 10, 3, 8,
    2300000, 'USD', 'cooperative_agreement', 'longitudinal_cohort',
    'cooperative_agreement', 'CDC-NU2GGH002067', 'NU2GGH002067', 'KEMRI-LR-2024-026',
    'KEMRI/SERU/CGHR/518/4733', '2024-06-12', '2027-06-11',
    'NACOSTI/P/24/30702', '2024-06-25',
    '2024-09-01', '2027-08-31', '2024-09-12',
    'KEMRI – Centre for Global Health Research, Kisumu', 'Kenya',
    '["3","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA4-Policy-Engagement"]'::jsonb,
    'Respiratory pathogens', 'COVID-19',
    'active', 'green', 'implementation', 14
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Kisumu County Referral Hospital',     'Kenya', 'Kisumu',   'Kisumu Central', -0.0917, 34.7680),
    (v_pid, 'Migori County Referral Hospital',     'Kenya', 'Migori',   'Suna East',      -1.0634, 34.4731),
    (v_pid, 'Homa Bay County Hospital',            'Kenya', 'Homa Bay', 'Homa Bay Town',  -0.5273, 34.4571),
    (v_pid, 'Siaya County Referral Hospital',      'Kenya', 'Siaya',    'Alego Usonga',    0.0612, 34.2867);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Dr. Wallace Bulimo',     'PhD',     'Respiratory virology', 'KEMRI – Centre for Virus Research',           'Co-PI',          'wbulimo@kemri.go.ke'),
    (v_pid, 'Dr. Patrick Munywoki',   'PhD',     'Respiratory epidemiology', 'KEMRI – CGHR Kisumu',                      'Co-PI',          'pmunywoki@kemri.go.ke'),
    (v_pid, 'Dr. Marc-Alain Widdowson','MSc, PhD','Influenza & respiratory pathogens','US CDC Country Office, Nairobi','External advisor','mwiddowson@cdc.gov');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Estimate cumulative and changing SARS-CoV-2 sero-prevalence across 4 lake-region sentinel sites every 6 months.'),
    (v_pid, 2, 'Conduct genomic surveillance of SARS-CoV-2 lineages and other respiratory viruses in symptomatic clinic attendees.'),
    (v_pid, 3, 'Characterise long-COVID prevalence and risk factors in a community sero-positive sub-cohort.'),
    (v_pid, 4, 'Provide near-real-time surveillance feeds to Kenya MoH and Africa CDC.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'COV-K1', 'Sero-survey participants', 'Cumulative individuals tested in 6-month rounds.', 'participants', 0, 6000, '6,000 participants over 5 rounds.', 'CovEpi-Lake registry', 'Field roster + e-CRF', 'biannual', 1, 9, NOW() - INTERVAL '160 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'COV-K2', 'SARS-CoV-2 genomes deposited to GISAID', 'Cumulative WGS-confirmed lineages.', 'genomes', 0, 800, '800 SARS-CoV-2 + RSV/Flu genomes deposited.', 'KEMRI-CVR genomics core', 'Illumina + nanopore', 'quarterly', 1, 9, NOW() - INTERVAL '160 days') RETURNING id INTO v_kpi2;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q2', '2024-12-31', 14, 'PI, 2 co-PIs, 8 field staff, 3 lab techs onboarded across 4 sites.', 'Round-1 sero-survey: 1,420 of 1,500 samples processed.', 'BD FACS Lyric flow cytometer commissioned at Kisumu.', 'Sero-epi data analysis training (n=10).', 'No material risks this quarter.', 2300000, 575000, 392000, 183000, -2.0, 'accepted', '2025-01-12 09:30:00+03', 92.0, 1, 9, '2025-01-15 13:00:00+03', 'green', 'Excellent first round.')
  RETURNING id INTO v_rep_q1;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep_q1, 95, 100, 100, 100, 100, 86, 100, 100, 92.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q1, 9, 'Centre Director', 'accept', 'green', 'On track; maintain pipeline.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q1, v_kpi1, 1500, 1420, 94.7, 'on_track'),
    (v_rep_q1, v_kpi2,  120,  142, 118.3, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q1, 'green', 9, 'Q2 acceptance.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication', 'SARS-CoV-2 sero-prevalence and immune escape in lake-region Kenya: post-Omicron landscape', 'Davis A, Bulimo W, Munywoki P, Widdowson MA', '2025-04-08', 'published', 'eClinicalMedicine', '10.1016/j.eclinm.2025.103214', 8, 13.4, 'open', 89.0, 14),
    (v_pid, 'dataset',     'CovEpi-Lake SARS-CoV-2 genomes (round 1)',                                                  'KEMRI-CVR Genomics Core',                  '2025-04-15', 'released',  'GISAID',           NULL, 0, NULL, 'open', 86.0, 14);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Alice Davis',          'Principal Investigator', 'R-PI', 'PhD Epidemiology',           1.00, 'KEM-2018-0072', '2024-09-01', 'grant'),
    (v_pid, 'Dr. Wallace Bulimo',       'Co-PI',                  'R-CO', 'PhD Virology',                0.30, 'KEM-2010-0017', '2024-09-01', 'kemri'),
    (v_pid, 'Dr. Patrick Munywoki',     'Co-PI / lake region',    'R-CO', 'PhD Resp. Epidemiology',      0.50, 'KEM-2014-0044', '2024-09-01', 'grant'),
    (v_pid, 'Lillian Anyango',          'Senior research nurse',  'R-CRA','BScN, GCP',                   1.00, 'KEM-2021-0623', '2024-09-15', 'grant'),
    (v_pid, 'Christopher Otieno',       'Bioinformatician',        'R-LAB','MSc Bioinformatics',         1.00, 'KEM-2022-0915', '2024-10-01', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'Sero-epi data analysis short-course', 'training', '2024-11-04', '2024-11-08', 'Kisumu', 10, 'KEMRI – CGHR + US CDC', 'Trainees produced first sero-prevalence age-stratified plots from real data.'),
    (v_pid, 'Respiratory viral genomics workshop',  'workshop', '2025-02-17', '2025-02-21', 'Nairobi', 14, 'KEMRI-CVR + ACEGID',    'Two abstracts accepted at WGS Africa 2025.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'BD FACS Lyric flow cytometer',     'lab', 'BD-LYRIC-2024-09', 'KEM-LAB-1711', '2024-10-22', 195000, 'USD', 'Becton-Dickinson','Christopher Otieno','CGHR Kisumu Lab','in_use'),
    (v_pid, 'Roche cobas e801 immunoassay',     'lab', 'COB-E801-K-04',   'KEM-LAB-1712', '2024-11-04', 220000, 'USD', 'Roche',           'Christopher Otieno','CGHR Kisumu Lab','in_use'),
    (v_pid, 'Oxford Nanopore GridION X5',       'lab', 'ONT-GX5-2024-22', 'KEM-LAB-1713', '2024-11-15',  85000, 'USD', 'Oxford Nanopore', 'Christopher Otieno','CGHR Kisumu Lab','in_use'),
    (v_pid, 'Toyota Hilux 4WD double-cab',      'vehicle','TLX-2024-93',   'KEM-VEH-3511', '2024-12-02',  48000, 'USD', 'Toyota Kenya',    'Lillian Anyango',     'CGHR Kisumu motor pool','in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Field staff, lab techs, bioinformaticians',     880000, 220000, 'USD', 'FY2024/25'),
    (v_pid, 'equipment',   'Cytometer, immunoassay, sequencer (one-off)',   500000, 500000, 'USD', 'FY2024/25'),
    (v_pid, 'consumables', 'ELISA kits, sequencing reagents, sample tubes', 420000, 110000, 'USD', 'FY2024/25'),
    (v_pid, 'travel',      'Field deployment, MoH/Africa CDC meetings',     150000,  42000, 'USD', 'FY2024/25'),
    (v_pid, 'subcontract', 'CDC technical support',                         100000,  20000, 'USD', 'FY2024/25'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                            300000,  85000, 'USD', 'FY2024/25');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'SARS-CoV-2 anti-spike IgG ELISA','Roche cobas e801',         'Serum',      6000, 1420, 98.5, 12, 'USD'),
    (v_pid, 'SARS-CoV-2 WGS',                  'Oxford Nanopore GridION', 'NP swab',     800,  142, 92.0, 88, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner', 'Africa CDC pathogen genomics initiative', '2024-12-01', 'Africa CDC requested KEMRI-CVR participation in pan-African RSV surveillance.', 'Sample-sharing MoU drafted; first joint cohort agreed.', 'actioned'),
    (v_pid, 'donor',   'US CDC quarterly review',                  '2025-02-15', 'CDC requested age-stratified sero-prevalence plots quarterly (not biannually).', 'Added quarterly age-stratified rollup to KIMES dashboard.', 'closed');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Long-running KEMRI-CDC partnership; lake-region cohort infrastructure already in place.'),
    (v_pid, 'weakness',    'Sero-survey response rates dropped slightly between rounds — fatigue with research sampling.'),
    (v_pid, 'opportunity', 'Direct contribution to Africa CDC pan-African respiratory pathogen surveillance.'),
    (v_pid, 'threat',      'Donor funding cycles for COVID-19 are tightening; need to broaden to multi-pathogen pitch.'),
    (v_pid, 'lesson',      'Mobile sample-collection units improve participation rates by ~9 percentage points in rural sub-locations.');
END $$;

-- =============================================================================
-- STUDY 7 — RSV-MATERNAL: maternal RSV vaccine acceptability & safety
-- Centre: CCR (id=5) · Programme: SRACH (id=7) · Donor: BMGF (id=1)
-- Status: pre_study (registration phase)
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CCR-2025-002', 'research', 'KEMRI-2025-RSV-002',
    'RSV-MATERNAL: acceptability and safety of bivalent maternal RSV vaccination at three Nairobi maternity hospitals',
    'RSV-MATERNAL',
    15, 5, 7, 1,
    1900000, 'USD', 'grant_award', 'observational_safety_study',
    'cooperative_agreement', 'BMGF-INV-082114', 'INV-082114', 'KEMRI-LR-2025-031',
    'KEMRI/SERU/CCR/702/5021', '2025-09-12', '2028-09-11',
    'NACOSTI/P/25/31704', '2025-09-25',
    '2026-01-15', '2028-12-31',
    'KEMRI – Centre for Clinical Research, Nairobi', 'Kenya',
    '["3","5"]'::jsonb,
    '["KRA1-Research-Excellence","KRA2-Translation-Impact"]'::jsonb,
    'Maternal & Child Health', 'Maternal vaccination',
    'pre_study', 'pending', 'registration', 15
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Kenyatta National Hospital',         'Kenya', 'Nairobi', 'Dagoretti North', -1.3025, 36.8061),
    (v_pid, 'Mater Misericordiae Hospital',       'Kenya', 'Nairobi', 'Embakasi South',  -1.3070, 36.8333),
    (v_pid, 'Pumwani Maternity Hospital',         'Kenya', 'Nairobi', 'Starehe',         -1.2807, 36.8472);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Prof. Marleen Temmerman',  'MD, PhD',   'Reproductive health', 'Aga Khan University, Kenya',                  'External advisor', 'marleen.temmerman@aku.edu'),
    (v_pid, 'Dr. Nelly Mugo',           'MBChB, MPH','Maternal & child health','KEMRI – CCR',                              'Co-PI',           'nmugo@kemri.go.ke'),
    (v_pid, 'Dr. Joyce Wamoyi',         'PhD',       'Health social science','National Institute for Medical Research (TZ)','External advisor', 'joyce@nimr.or.tz');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Determine acceptability and uptake of bivalent maternal RSV vaccination at three Nairobi maternity sites.'),
    (v_pid, 2, 'Document maternal and infant safety outcomes through 6 months post-delivery.'),
    (v_pid, 3, 'Identify enablers and barriers to maternal RSV vaccine uptake through caregiver interviews.'),
    (v_pid, 4, 'Inform Kenya National Vaccines and Immunisation Programme on operational rollout requirements.');

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Bob Jones',     'Principal Investigator', 'R-PI', 'PhD Epidemiology',           1.00, 'KEM-2018-0085', '2026-01-15', 'grant'),
    (v_pid, 'Dr. Nelly Mugo',    'Co-PI',                  'R-CO', 'MBChB, MPH',                 0.40, 'KEM-2014-0023', '2026-01-15', 'kemri'),
    (v_pid, 'Naomi Wanjiru',     'Senior study nurse',     'R-CRA','BScN, GCP',                  1.00, 'KEM-2024-1115', '2026-01-15', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'Maternal-vaccine pharmacovigilance training (planned)','training','2026-02-02','2026-02-04','Nairobi', 0, 'KEMRI – CCR + Pharmacy & Poisons Board', 'Scheduled — pre-study phase.');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Site staff and pharmacovigilance officers',  720000, 0, 'USD', 'FY2025/26'),
    (v_pid, 'consumables', 'Vaccines, sample tubes, infant follow-up kits',520000, 0, 'USD', 'FY2025/26'),
    (v_pid, 'travel',      'Inter-site supervision, NVIP meetings',       110000, 0, 'USD', 'FY2025/26'),
    (v_pid, 'subcontract', 'Aga Khan + NIMR-Tanzania collaborator subaward',230000, 0, 'USD', 'FY2025/26'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                          245000, 0, 'USD', 'FY2025/26');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Strong KEMRI-CCR + Aga Khan partnership unlocks elite obstetric expertise.'),
    (v_pid, 'opportunity', 'Direct contribution to NVIP rollout strategy for new RSV vaccine.'),
    (v_pid, 'lesson',      'Pre-study phase: invest early in caregiver focus groups to refine consent materials.');
END $$;

-- =============================================================================
-- STUDY 8 — Anopheles funestus insecticide resistance mapping (closing phase)
-- Centre: CIPDCR (id=11) · Programme: OH (id=4) · Donor: WHO/TDR (id=7)
-- Status: closing · RAG: amber
-- =============================================================================
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint;
  v_rep_q1 bigint;
BEGIN
  INSERT INTO kemri_research_projects (
    kimes_project_id, project_type, account_number, title, short_name,
    pi_user_id, centre_id, programme_id, primary_donor_id,
    funding_amount, funding_currency, funding_mechanism, study_type,
    contract_type, contract_number, grant_number, kemri_legal_number,
    seru_approval_no, seru_approval_date, seru_expiry_date,
    nacosti_approval_no, nacosti_approval_date,
    proposed_start_date, proposed_end_date, actual_start_date,
    primary_org, primary_org_country,
    sdg_codes, strategic_plan_kras, programme_area, research_priority,
    status, rag_status, current_phase, created_by
  ) VALUES (
    'KEMRI-CIPDCR-2023-001', 'research', 'KEMRI-2023-VEC-001',
    'Insecticide resistance mapping in Anopheles funestus s.l. across the Kenyan western highlands',
    'AnFunestus-Mapping',
    16, 11, 4, 7,
    900000, 'USD', 'grant_award', 'entomological_surveillance',
    'investigator_initiated', 'WHO-TDR-2022-IRC-018', 'WHO-TDR-2022-IRC-018', 'KEMRI-LR-2023-014',
    'KEMRI/SERU/CIPDCR/214/4321', '2023-04-18', '2026-04-17',
    'NACOSTI/P/23/29714', '2023-05-04',
    '2023-07-01', '2026-06-30', '2023-07-15',
    'KEMRI – CIPDCR Vector Biology Unit', 'Kenya',
    '["3","13"]'::jsonb,
    '["KRA1-Research-Excellence","KRA2-Translation-Impact"]'::jsonb,
    'Vector biology', 'Insecticide resistance',
    'closing', 'amber', 'closure', 16
  ) RETURNING id INTO v_pid;

  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Kakamega Field Station', 'Kenya', 'Kakamega','Lurambi', 0.2839, 34.7519),
    (v_pid, 'Bungoma Field Site',     'Kenya', 'Bungoma', 'Kanduyi', 0.5635, 34.5606),
    (v_pid, 'Vihiga Field Site',      'Kenya', 'Vihiga',  'Sabatia', 0.0823, 34.7223);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role, email) VALUES
    (v_pid, 'Dr. Charles Mbogo',      'PhD',  'Vector biology',          'KEMRI – CIPDCR',                                'Co-PI',          'cmbogo@kemri.go.ke'),
    (v_pid, 'Dr. Joseph Mwangangi',   'PhD',  'Medical entomology',      'KEMRI – CGMR-C, Coast',                          'Senior advisor', 'jmwangangi@kemri-wellcome.org'),
    (v_pid, 'Prof. Hilary Ranson',    'PhD',  'Insecticide resistance',  'Liverpool School of Tropical Medicine',          'External advisor','hilary.ranson@lstmed.ac.uk');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Map Anopheles funestus insecticide resistance phenotypes across western Kenyan highlands.'),
    (v_pid, 2, 'Identify novel kdr and CYP450-mediated resistance markers via WGS.'),
    (v_pid, 3, 'Inform NMCP insecticide rotation strategy with quarterly surveillance feeds.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, baseline_value, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'VEC-K1', 'Mosquitoes phenotyped (WHO bioassay)', 'Adult An. funestus phenotyped against pyrethroids, organophosphates and carbamates.', 'mosquitoes', 0, 12000, '12,000 phenotyped across 3 sites.', 'Field collection log', 'CDC light traps + WHO bioassay', 'quarterly', 1, 9, NOW() - INTERVAL '700 days') RETURNING id INTO v_kpi1;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2024/25', 'Q4', '2025-06-30', 16, 'Stable team; final-year handover discussions underway.', 'Phenotyping complete at all sites (12,180 mosquitoes); WGS in progress.', 'No new equipment.', 'Vector resistance writing retreat.', 'Final-year close-out planning underway.', 900000, 720000, 678000, 42000, -2.0, 'accepted', '2025-07-09 09:30:00+03', 89.0, 1, 9, '2025-07-15 13:00:00+03', 'amber', 'Strong phenotyping output; finalise WGS analysis Q1 of next FY.')
  RETURNING id INTO v_rep_q1;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep_q1, 92, 100, 100, 100, 100, 84, 100, 100, 89.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep_q1, 9, 'Centre Director', 'accept', 'amber', 'Strong phenotyping; tighten WGS timeline.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep_q1, v_kpi1, 12000, 12180, 101.5, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep_q1, 'amber', 9, 'Closing-phase WGS lag; otherwise on target.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication','Spatial heterogeneity of Anopheles funestus pyrethroid resistance in western Kenya', 'Evans D, Mbogo C, Mwangangi J, Ranson H', '2024-11-12', 'published', 'Parasites & Vectors', '10.1186/s13071-024-06557-4', 11, 4.0, 'open', 90.0, 16),
    (v_pid, 'ip',         'Field-deployable WHO bioassay tube tray (utility model)',                                'Evans D, KEMRI – CIPDCR',                  '2025-02-08', 'filed',     'Kenya Industrial Property Institute (KIPI)', NULL, 0, NULL, NULL, NULL, 16);
  UPDATE kemri_outputs SET ip_type = 'utility_model', patent_number = 'KIPI-UM-2025-00148', jurisdiction = 'Kenya', commercialisation_stage = 3 WHERE project_id = v_pid AND output_type = 'ip';

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Diana Evans',     'Principal Investigator', 'R-PI', 'PhD Vector Biology',  1.00, 'KEM-2017-0094', '2023-07-01', 'grant'),
    (v_pid, 'Dr. Charles Mbogo',   'Co-PI',                  'R-CO', 'PhD',                 0.30, 'KEM-2010-0007', '2023-07-01', 'kemri'),
    (v_pid, 'Brian Wekesa',        'Field entomologist',     'R-LAB','MSc Entomology',      1.00, 'KEM-2021-0612', '2023-07-15', 'grant'),
    (v_pid, 'Mercy Nasimiyu',       'Lab molecular technologist', 'R-LAB','BSc Molecular Bio',1.00, 'KEM-2022-0813', '2023-07-15', 'grant'),
    (v_pid, 'Felix Wafula',         'Field assistant lead',   'R-CRA','Diploma Public Health',1.00,'KEM-2023-0922', '2023-08-01', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'WHO insecticide resistance bioassay training', 'training', '2023-09-04', '2023-09-08', 'Nairobi', 14, 'KEMRI – CIPDCR + LSTM',  'Trainees certified on WHO tube and bottle assays.'),
    (v_pid, 'Vector resistance writing retreat',             'workshop', '2025-05-12', '2025-05-16', 'Naivasha',  8, 'KEMRI + Liverpool LSTM', 'Two manuscripts drafted to submission stage.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'CDC light-trap fleet (24 units)','field','CDC-LT-2023-LOT-7','KEM-FLD-1811','2023-08-12',  9600, 'USD', 'BioQuip',     'Brian Wekesa',  'Distributed western highlands','in_use'),
    (v_pid, 'BioRad CFX qPCR system',         'lab',  'CFX96-K-219',     'KEM-LAB-1812','2023-09-04', 38000, 'USD', 'BioRad',      'Mercy Nasimiyu','CIPDCR Vector Biology Lab',     'in_use'),
    (v_pid, 'Toyota Hilux 4WD',               'vehicle','TLX-2023-K57',   'KEM-VEH-3611','2023-08-22', 47000, 'USD', 'Toyota Kenya','Felix Wafula',   'CIPDCR Field Office',           'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Field entomologists and lab techs',         320000, 285000, 'USD', 'FY2024/25'),
    (v_pid, 'equipment',   'Bioassay & qPCR + vehicle (one-off)',        96000,  94600, 'USD', 'FY2024/25'),
    (v_pid, 'consumables', 'Insecticide papers, primers, reagents',     180000, 142000, 'USD', 'FY2024/25'),
    (v_pid, 'travel',      'Field deployment, NMCP meetings',             80000,  62000, 'USD', 'FY2024/25'),
    (v_pid, 'subcontract', 'Liverpool LSTM technical support',           110000,  78000, 'USD', 'FY2024/25'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                         114000,  77000, 'USD', 'FY2024/25');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'WHO tube bioassay',     'WHO insecticide papers',  'Adult mosquito', 12000, 12180, 96.0,  3, 'USD'),
    (v_pid, 'Resistance gene qPCR',  'BioRad CFX96',            'Mosquito DNA',    4500,  3820, 95.5, 12, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner', 'National Malaria Control Programme (NMCP)', '2024-08-25', 'NMCP adopted KEMRI quarterly resistance feeds into national insecticide rotation policy.', 'Quarterly KIMES export added; resistance briefing now shared with NMCP.', 'closed');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Mature partnership with NMCP — direct policy translation pathway.'),
    (v_pid, 'weakness',    'WGS analysis pipeline lagged behind phenotyping — invest earlier in bioinformatics next time.'),
    (v_pid, 'opportunity', 'Utility-model patent on bioassay tube tray could be licensed to LSTM commercial arm.'),
    (v_pid, 'lesson',      'Resistance heterogeneity is highly local — single-county data are insufficient for NMCP.');
END $$;

COMMIT;

-- =============================================================================
-- Sanity report
-- =============================================================================
SELECT
  (SELECT COUNT(*) FROM kemri_research_projects WHERE voided=0) AS projects,
  (SELECT COUNT(*) FROM kemri_research_sites    WHERE voided=0) AS sites,
  (SELECT COUNT(*) FROM kemri_research_coinvestigators WHERE voided=0) AS coinvestigators,
  (SELECT COUNT(*) FROM kemri_research_objectives WHERE voided=0) AS objectives,
  (SELECT COUNT(*) FROM kemri_kpis              WHERE voided=0) AS kpis,
  (SELECT COUNT(*) FROM kemri_milestone_reports WHERE voided=0) AS reports,
  (SELECT COUNT(*) FROM kemri_kpi_achievements  WHERE voided=0) AS kpi_achievements,
  (SELECT COUNT(*) FROM kemri_outputs           WHERE voided=0) AS outputs,
  (SELECT COUNT(*) FROM kemri_research_staff    WHERE voided=0) AS staff,
  (SELECT COUNT(*) FROM kemri_capacity_building WHERE voided=0) AS capacity_building,
  (SELECT COUNT(*) FROM kemri_research_equipment WHERE voided=0) AS equipment,
  (SELECT COUNT(*) FROM kemri_budget_lines      WHERE voided=0) AS budget_lines,
  (SELECT COUNT(*) FROM kemri_lab_analyses      WHERE voided=0) AS lab_analyses,
  (SELECT COUNT(*) FROM kemri_operations_feedback WHERE voided=0) AS feedback,
  (SELECT COUNT(*) FROM kemri_swot_lessons      WHERE voided=0) AS swot,
  (SELECT COUNT(*) FROM kemri_peer_reviews      WHERE voided=0) AS peer_reviews,
  (SELECT COUNT(*) FROM kemri_escalations       WHERE voided=0) AS escalations,
  (SELECT COUNT(*) FROM kemri_dqa_scores        WHERE voided=0) AS dqa_scores;
