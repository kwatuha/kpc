-- =============================================================================
-- KEMRI / KIMES — five national surveillance studies designed to populate the
-- GIS dashboard with realistic country-wide distribution.
--
-- Adds ~109 research sites across 35+ counties spanning all 8 Kenyan regions:
--
--   9.  KMIS-2026   Kenya Malaria Indicator Survey               (CGHR  · GFATM)
--   10. KIRSS       Influenza & Respiratory Sentinel Surveillance (CVR   · US CDC)
--   11. NTPS-2026   National TB Prevalence Survey                (CRDR  · WHO/BMGF)
--   12. SBE-Kenya   Snakebite Envenomation Surveillance          (CIPDCR· Wellcome)
--   13. AMU-PPS     Hospital Antimicrobial Use Point-Prevalence  (CMR   · FCDO)
--
-- Each study is given full §1-§4 metadata, sites with real Kenya GPS,
-- co-investigators, objectives, KPIs, one accepted milestone report, an
-- output, staff, capacity-building, equipment, budget lines, lab analyses,
-- feedback and SWOT.  Site density is the headline value for these studies —
-- they exist to make the national heatmap, marker cluster, and per-county
-- drill-down dashboards meaningful.
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 9. KMIS-2026 — Kenya Malaria Indicator Survey
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint; v_kpi3 bigint;
  v_rep bigint;
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
    'KEMRI-CGHR-2026-001', 'research', 'KEMRI-2026-KMIS-001',
    'Kenya Malaria Indicator Survey 2026 (KMIS-2026): cluster-randomised household survey of malaria parasitaemia, ITN coverage, and care-seeking behaviour',
    'KMIS-2026',
    13, 10, 5, 6,
    5500000, 'USD', 'cooperative_agreement', 'household_cluster_survey',
    'cooperative_agreement', 'GFATM-KEN-MAL-2026', 'KEN-MAL-2026', 'KEMRI-LR-2026-002',
    'KEMRI/SERU/CGHR/801/5104', '2026-01-08', '2029-01-07',
    'NACOSTI/P/26/32011', '2026-01-22',
    '2026-03-01', '2027-12-31', '2026-03-15',
    'KEMRI – Centre for Global Health Research (Kisumu)', 'Kenya',
    '["3","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA4-Policy-Engagement"]'::jsonb,
    'Malaria', 'Malaria surveillance',
    'active', 'green', 'implementation', 13
  ) RETURNING id INTO v_pid;

  -- 19 malaria-endemic counties (lake + western + coast + lower eastern + arid hot-zones)
  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Kisumu County KMIS cluster',     'Kenya', 'Kisumu',        'Kisumu Central',  -0.0917, 34.7680),
    (v_pid, 'Siaya County KMIS cluster',      'Kenya', 'Siaya',         'Alego Usonga',     0.0612, 34.2867),
    (v_pid, 'Homa Bay County KMIS cluster',   'Kenya', 'Homa Bay',      'Homa Bay Town',   -0.5273, 34.4571),
    (v_pid, 'Migori County KMIS cluster',     'Kenya', 'Migori',        'Suna East',       -1.0634, 34.4731),
    (v_pid, 'Kakamega County KMIS cluster',   'Kenya', 'Kakamega',      'Lurambi',          0.2839, 34.7519),
    (v_pid, 'Vihiga County KMIS cluster',     'Kenya', 'Vihiga',        'Sabatia',          0.0823, 34.7223),
    (v_pid, 'Bungoma County KMIS cluster',    'Kenya', 'Bungoma',       'Kanduyi',          0.5635, 34.5606),
    (v_pid, 'Busia County KMIS cluster',      'Kenya', 'Busia',         'Matayos',          0.4347, 34.2422),
    (v_pid, 'Kilifi County KMIS cluster',     'Kenya', 'Kilifi',        'Kilifi North',    -3.5106, 39.9093),
    (v_pid, 'Kwale County KMIS cluster',      'Kenya', 'Kwale',         'Msambweni',       -4.4720, 39.4836),
    (v_pid, 'Mombasa County KMIS cluster',    'Kenya', 'Mombasa',       'Mvita',           -4.0435, 39.6682),
    (v_pid, 'Lamu County KMIS cluster',       'Kenya', 'Lamu',          'Lamu West',       -2.2696, 40.9006),
    (v_pid, 'Tana River KMIS cluster',        'Kenya', 'Tana River',    'Galole',          -1.5042, 40.0214),
    (v_pid, 'Taita-Taveta KMIS cluster',      'Kenya', 'Taita-Taveta',  'Voi',             -3.3960, 38.5618),
    (v_pid, 'Kitui County KMIS cluster',      'Kenya', 'Kitui',         'Kitui Central',   -1.3675, 38.0107),
    (v_pid, 'Makueni County KMIS cluster',    'Kenya', 'Makueni',       'Wote',            -1.7831, 37.6244),
    (v_pid, 'Machakos County KMIS cluster',   'Kenya', 'Machakos',      'Machakos Town',   -1.5177, 37.2634),
    (v_pid, 'Garissa County KMIS cluster',    'Kenya', 'Garissa',       'Garissa Township',-0.4536, 39.6406),
    (v_pid, 'Wajir County KMIS cluster',      'Kenya', 'Wajir',         'Wajir East',       1.7471, 40.0573);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role) VALUES
    (v_pid, 'Dr. Bernhards Ogutu',  'PhD',     'Malaria epidemiology', 'KEMRI – CGHR Kisumu',                'Co-PI'),
    (v_pid, 'Dr. Simon Kariuki',    'PhD',     'Malaria parasitology', 'KEMRI – CGHR Kisumu',                'Co-PI'),
    (v_pid, 'Dr. Andrew Wamari',    'MSc',     'M&E specialist',       'NMCP (Ministry of Health)',          'Programme partner');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Estimate national, regional and county-level malaria parasitaemia prevalence in children 6–59 months.'),
    (v_pid, 2, 'Measure ITN ownership, access, and use across all malaria-endemic counties.'),
    (v_pid, 3, 'Document care-seeking behaviour and timely access to ACT for febrile illness.'),
    (v_pid, 4, 'Inform NMCP rolling 5-year strategic plan and Global Fund concept note.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'KMIS-K1', 'Households surveyed', 'Households recruited across all clusters.', 'households', 14250, '14,250 households surveyed.', 'KMIS-2026 e-CRF', 'CAPI tablets + REDCap', 'quarterly', 1, 9, NOW() - INTERVAL '90 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'KMIS-K2', 'Children blood-tested for malaria', 'Children 6–59 months tested via RDT + microscopy.', 'children', 7500, '7,500 children tested.', 'KMIS-2026 lab register', 'RDT + microscopy + dried blood spot', 'quarterly', 1, 9, NOW() - INTERVAL '90 days') RETURNING id INTO v_kpi2;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'KMIS-K3', 'County-level prevalence reports', 'County reports delivered to NMCP.', 'reports', 19, '19 county briefs and one national synthesis.', 'KMIS-2026 publications register', 'PDF + KIMES dashboard export', 'biannual', 1, 9, NOW() - INTERVAL '90 days') RETURNING id INTO v_kpi3;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2025/26', 'Q3', '2026-03-31', 13, 'PI + 4 regional supervisors + 60 enumerators onboarded.', 'RDT + microscopy QC validated against KEMRI – CGHR reference lab.', 'CAPI tablets and tablet-charging kits deployed to all 19 counties.', 'Enumerator GCP and CAPI training in 4 regional hubs (n=78).', 'Long rains may delay clusters in Tana River and Lamu.', 5500000, 1500000, 920000, 580000, -2.0, 'accepted', '2026-04-08 09:00:00+03', 93.0, 1, 9, '2026-04-12 14:00:00+03', 'green', 'Strong start across all regions; maintain momentum.')
  RETURNING id INTO v_rep;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep, 96, 100, 100, 100, 100, 88, 100, 100, 93.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep, 9, 'Centre Director', 'accept', 'green', 'Cluster activation pace excellent.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep, v_kpi1, 1900, 2105, 110.8, 'on_track'),
    (v_rep, v_kpi2,  950, 1042, 109.7, 'on_track'),
    (v_rep, v_kpi3,    0,    0,   0.0, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep, 'green', 9, 'Q3 FY2025/26 acceptance.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'policy_brief', 'KMIS-2026 first-quarter policy brief: county-level malaria intelligence for the 2026/27 NMCP plan', 'Wilson G, Ogutu B, Kariuki S', '2026-04-15', 'released', 'Kenya MoH / NMCP', NULL, 0, NULL, 'open', NULL, 13);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. George Wilson',     'Principal Investigator', 'R-PI',  'PhD Public Health',     1.00, 'KEM-2018-0072', '2026-03-01', 'grant'),
    (v_pid, 'Dr. Bernhards Ogutu',   'Co-PI',                  'R-CO',  'PhD Malaria',           0.40, 'KEM-2010-0021', '2026-03-01', 'kemri'),
    (v_pid, 'Mary Mutua',            'Field operations lead',  'R-CRA', 'MSc M&E',               1.00, 'KEM-2024-1311', '2026-03-15', 'grant'),
    (v_pid, 'Caleb Otieno',          'Senior data manager',    'R-DM',  'MSc Biostatistics',     1.00, 'KEM-2024-1312', '2026-03-15', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'KMIS enumerator GCP + CAPI training', 'training','2026-03-02','2026-03-13','Kisumu, Mombasa, Eldoret, Garissa', 78, 'KEMRI-CGHR + NMCP', 'Four regional cohorts certified.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Lenovo M10 CAPI tablets (fleet of 80)','ict','LEN-M10-2026-LOT1','KEM-ICT-2611','2026-02-22', 24000, 'USD', 'Lenovo Kenya', 'Caleb Otieno', 'Distributed across all sites','in_use'),
    (v_pid, 'Olympus CX23 microscopes (fleet of 20)','lab','OLY-CX23-2026-LOT2','KEM-LAB-2612','2026-02-25', 60000, 'USD', 'Olympus',     'Caleb Otieno', 'Distributed across all sites','in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Field enumerators, supervisors, lab techs',  2400000, 410000, 'USD', 'FY2025/26'),
    (v_pid, 'equipment',   'CAPI tablets, microscopes, RDT supplies',     420000, 412000, 'USD', 'FY2025/26'),
    (v_pid, 'consumables', 'RDTs, microscopy kits, lancets, transport',   980000, 220000, 'USD', 'FY2025/26'),
    (v_pid, 'travel',      'Inter-county travel, NMCP review meetings',   620000, 145000, 'USD', 'FY2025/26'),
    (v_pid, 'subcontract', 'NMCP & county-MoH partner subawards',         400000,  85000, 'USD', 'FY2025/26'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                          680000,  78000, 'USD', 'FY2025/26');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Malaria RDT (SD-Bioline)',     'SD-Bioline P.f/Pan',      'Whole blood', 7500, 1042, 99.0, 1.20, 'USD'),
    (v_pid, 'Microscopy parasite density',  'Olympus CX23',            'Thick + thin smear', 7500, 980, 96.0, 2.50, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner', 'NMCP technical working group', '2026-03-25', 'NMCP requested rapid county-level interim release for Global Fund concept note.', 'County briefs prioritised; first three released April 2026.', 'actioned');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'KEMRI-CGHR has 20+ years of malaria surveillance methodology — instant credibility.'),
    (v_pid, 'opportunity', 'Direct policy use by NMCP rolling strategic plan and Global Fund concept note.'),
    (v_pid, 'lesson',      'Regional CAPI training hubs cut training time by 40% vs single-venue model.');
END $$;

-- ----------------------------------------------------------------------------
-- 10. KIRSS — Influenza & Respiratory Pathogen Sentinel Surveillance
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint;
  v_rep bigint;
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
    'KEMRI-CVR-2025-001', 'research', 'KEMRI-2025-KIRSS-001',
    'Kenya Influenza and Respiratory Pathogen Sentinel Surveillance (KIRSS): genomic and epidemiologic surveillance across 12 sentinel hospitals',
    'KIRSS',
    4, 4, 5, 8,
    2800000, 'USD', 'cooperative_agreement', 'sentinel_surveillance',
    'cooperative_agreement', 'CDC-NU2GGH002071', 'NU2GGH002071', 'KEMRI-LR-2025-022',
    'KEMRI/SERU/CVR/602/4861', '2025-04-04', '2028-04-03',
    'NACOSTI/P/25/31511', '2025-04-22',
    '2025-07-01', '2028-06-30', '2025-07-22',
    'KEMRI – Centre for Virus Research, Nairobi', 'Kenya',
    '["3","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA4-Policy-Engagement"]'::jsonb,
    'Respiratory pathogens', 'Influenza & RSV',
    'active', 'green', 'implementation', 4
  ) RETURNING id INTO v_pid;

  -- 12 sentinel hospitals — one per region, with two in Nairobi (busiest catchment)
  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Kenyatta National Hospital',           'Kenya', 'Nairobi',     'Dagoretti North', -1.3025, 36.8061),
    (v_pid, 'Mbagathi County Hospital',             'Kenya', 'Nairobi',     'Dagoretti South', -1.3193, 36.7972),
    (v_pid, 'Coast General Teaching Hospital',      'Kenya', 'Mombasa',     'Mvita',           -4.0519, 39.6657),
    (v_pid, 'Kilifi County Hospital',               'Kenya', 'Kilifi',      'Kilifi North',    -3.6309, 39.8499),
    (v_pid, 'Garissa County Referral Hospital',     'Kenya', 'Garissa',     'Garissa Township',-0.4536, 39.6406),
    (v_pid, 'Moi Teaching & Referral Hospital',     'Kenya', 'Uasin Gishu', 'Eldoret East',     0.5143, 35.2698),
    (v_pid, 'Nakuru County Referral Hospital',      'Kenya', 'Nakuru',      'Nakuru Town East',-0.3031, 36.0800),
    (v_pid, 'Kakamega County General Hospital',     'Kenya', 'Kakamega',    'Lurambi',          0.2839, 34.7519),
    (v_pid, 'Kisumu County Referral Hospital',      'Kenya', 'Kisumu',      'Kisumu Central',  -0.0917, 34.7680),
    (v_pid, 'Nyeri County Referral Hospital',       'Kenya', 'Nyeri',       'Nyeri Town',      -0.4170, 36.9479),
    (v_pid, 'Embu Level 5 Hospital',                'Kenya', 'Embu',        'Manyatta',        -0.5311, 37.4500),
    (v_pid, 'Meru Level 5 Hospital',                'Kenya', 'Meru',        'Imenti North',     0.0463, 37.6559);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role) VALUES
    (v_pid, 'Dr. Wallace Bulimo',     'PhD',     'Respiratory virology', 'KEMRI – CVR',                          'Co-PI'),
    (v_pid, 'Dr. Caroline Mirieri',   'MBChB, MMed','Pulmonology',       'Moi Teaching & Referral Hospital',     'Site investigator'),
    (v_pid, 'Dr. Marc-Alain Widdowson','PhD',    'Influenza',            'US CDC Country Office, Nairobi',       'External advisor');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Maintain year-round influenza-like illness and severe acute respiratory illness surveillance across 12 sentinel hospitals.'),
    (v_pid, 2, 'Generate weekly genomic surveillance feeds (Influenza A/B, RSV, SARS-CoV-2) into MoH disease intelligence dashboards.'),
    (v_pid, 3, 'Quantify burden of respiratory hospitalisation by age and region.'),
    (v_pid, 4, 'Train 24 hospital lab and clinical staff in respiratory pathogen surveillance.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'KIRSS-K1', 'Sentinel sites operational', 'Active sentinel hospitals submitting weekly data.', 'sites', 12, '12 sentinel sites permanently active.', 'KIRSS surveillance dashboard', 'Hospital sentinel weekly e-CRF', 'quarterly', 1, 9, NOW() - INTERVAL '120 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'KIRSS-K2', 'Genomes deposited (Influenza/RSV)', 'WGS-confirmed pathogen lineages deposited to GISAID.', 'genomes', 1500, '1,500 genomes by end of year 2.', 'KEMRI – CVR genomics core', 'Illumina + nanopore', 'quarterly', 1, 9, NOW() - INTERVAL '120 days') RETURNING id INTO v_kpi2;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2025/26', 'Q2', '2025-12-31', 4, '12 site teams onboarded; 1 site (Nyeri) onboarded with 6-week delay.', 'Year-1 specimens: 4,210 NP swabs; 1,420 sequenced.', 'Illumina MiSeq Dx commissioned at Kisumu spoke node.', 'Sentinel surveillance refresher (n=24).', 'No material risks.', 2800000, 700000, 488000, 212000, -2.4, 'accepted', '2026-01-09 09:30:00+03', 92.0, 1, 9, '2026-01-15 11:00:00+03', 'green', 'Sentinel network performing well.')
  RETURNING id INTO v_rep;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep, 95, 100, 100, 100, 100, 86, 100, 100, 92.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep, 9, 'Centre Director', 'accept', 'green', 'Excellent national reach.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep, v_kpi1,   12,   12, 100.0, 'on_track'),
    (v_rep, v_kpi2,  300,  342, 114.0, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep, 'green', 9, 'Q2 acceptance.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication','Genomic landscape of Influenza A and RSV in Kenyan sentinel hospitals, 2025–2026', 'Bulimo W, Teser T, Mirieri C, Widdowson MA', '2026-03-22', 'in_press', 'eBioMedicine', '10.1016/j.ebiom.2026.105901', 0, 11.1, 'open', 88.0, 4),
    (v_pid, 'dataset',    'KIRSS sentinel pathogen genomes (year-1)', 'KEMRI – CVR Genomics Core', '2026-04-02', 'released', 'GISAID', NULL, 0, NULL, 'open', 86.0, 4);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Testing Teser',     'Principal Investigator', 'R-PI', 'PhD Virology',           1.00, 'KEM-2017-0099', '2025-07-01', 'grant'),
    (v_pid, 'Dr. Wallace Bulimo',    'Co-PI / CVR Director',   'R-CO', 'PhD Virology',           0.30, 'KEM-2010-0017', '2025-07-01', 'kemri'),
    (v_pid, 'Naomi Auma',            'Senior data manager',    'R-DM', 'MSc Health Informatics', 1.00, 'KEM-2023-0911', '2025-07-15', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'Sentinel surveillance refresher (Yr-1)', 'training','2025-09-15','2025-09-19','Nairobi', 24, 'KEMRI – CVR + US CDC', 'All 24 hospital staff certified.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Illumina MiSeq Dx (Kisumu spoke)', 'lab', 'MIS-DX-2025-K-12', 'KEM-LAB-2711', '2025-08-22', 165000, 'USD', 'Illumina',         'Naomi Auma', 'CGHR Kisumu Lab',   'in_use'),
    (v_pid, 'Cepheid GeneXpert 16-module',      'lab', 'GX-16-2025-K-44',  'KEM-LAB-2712', '2025-09-04',  72000, 'USD', 'Cepheid',          'Naomi Auma', 'CVR Nairobi Lab',   'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Site staff and lab techs',                  1180000, 220000, 'USD', 'FY2025/26'),
    (v_pid, 'equipment',   'Sequencing + GeneXpert (one-off)',           260000, 247000, 'USD', 'FY2025/26'),
    (v_pid, 'consumables', 'Sequencing reagents, swabs, transport',      540000, 102000, 'USD', 'FY2025/26'),
    (v_pid, 'travel',      'Inter-site monitoring + ACDC meetings',      130000,  35000, 'USD', 'FY2025/26'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                         420000,  60000, 'USD', 'FY2025/26');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Multiplex respiratory PCR',     'Cepheid Xpert Xpress', 'NP swab', 6000, 1610, 98.5,  18, 'USD'),
    (v_pid, 'Influenza/RSV WGS',             'Illumina MiSeq Dx',    'NP swab', 1500,  342, 92.0,  88, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner', 'Africa CDC pathogen genomics initiative', '2026-01-20', 'ACDC requested KEMRI participation in pan-African respiratory pathogen genomics network.', 'MoU signed; first joint cohort agreed for 2026.', 'closed');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'CVR has 20+ years of national virology surveillance — strong MoH trust.'),
    (v_pid, 'opportunity', 'Direct contribution to Africa CDC pan-African respiratory genomics initiative.'),
    (v_pid, 'lesson',      'Regional spoke labs (e.g. CGHR Kisumu) are essential for week-1 turnaround during outbreaks.');
END $$;

-- ----------------------------------------------------------------------------
-- 11. NTPS-2026 — National TB Prevalence Survey 2026
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint; v_kpi2 bigint;
  v_rep bigint;
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
    'KEMRI-CRDR-2026-001', 'research', 'KEMRI-2026-NTPS-001',
    'National Tuberculosis Prevalence Survey 2026 (NTPS-2026): cluster-randomised population-based survey of TB prevalence, care-seeking, and resistance',
    'NTPS-2026',
    9, 8, 5, 7,
    7200000, 'USD', 'cooperative_agreement', 'population_prevalence_survey',
    'cooperative_agreement', 'WHO-GTB-NTPS-026', 'NTPS-2026', 'KEMRI-LR-2026-008',
    'KEMRI/SERU/CRDR/811/5132', '2026-02-09', '2029-02-08',
    'NACOSTI/P/26/32115', '2026-02-25',
    '2026-04-15', '2028-04-14', '2026-05-01',
    'KEMRI – Centre for Respiratory Diseases Research', 'Kenya',
    '["3","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA4-Policy-Engagement"]'::jsonb,
    'Tuberculosis', 'TB epidemiology',
    'active', 'amber', 'implementation', 9
  ) RETURNING id INTO v_pid;

  -- 25 stratified random cluster sites covering all 8 regions
  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    -- Coast
    (v_pid, 'NTPS Mombasa cluster',       'Kenya', 'Mombasa',       'Nyali',           -4.0220, 39.6900),
    (v_pid, 'NTPS Kwale cluster',         'Kenya', 'Kwale',         'Lunga Lunga',     -4.5650, 39.1400),
    (v_pid, 'NTPS Kilifi cluster',        'Kenya', 'Kilifi',        'Bamba',           -3.4730, 39.4470),
    -- North-Eastern
    (v_pid, 'NTPS Garissa cluster',       'Kenya', 'Garissa',       'Dadaab',           0.0626, 40.3056),
    (v_pid, 'NTPS Wajir cluster',         'Kenya', 'Wajir',         'Habaswein',        1.0214, 39.5021),
    -- Eastern
    (v_pid, 'NTPS Embu cluster',          'Kenya', 'Embu',          'Manyatta',        -0.5311, 37.4500),
    (v_pid, 'NTPS Tharaka-Nithi cluster', 'Kenya', 'Tharaka-Nithi', 'Chuka',           -0.3377, 37.6483),
    (v_pid, 'NTPS Kitui cluster',         'Kenya', 'Kitui',         'Mwingi Central',  -0.9352, 38.0521),
    (v_pid, 'NTPS Makueni cluster',       'Kenya', 'Makueni',       'Wote',            -1.7831, 37.6244),
    (v_pid, 'NTPS Marsabit cluster',      'Kenya', 'Marsabit',      'Saku',             2.3284, 37.9899),
    -- Central
    (v_pid, 'NTPS Murang''a cluster',     'Kenya', 'Murang''a',     'Kandara',         -0.7167, 37.1500),
    (v_pid, 'NTPS Kirinyaga cluster',     'Kenya', 'Kirinyaga',     'Kerugoya',        -0.4983, 37.2803),
    (v_pid, 'NTPS Nyandarua cluster',     'Kenya', 'Nyandarua',     'Olkalou',         -0.2866, 36.4068),
    (v_pid, 'NTPS Nyeri cluster',         'Kenya', 'Nyeri',         'Nyeri Town',      -0.4170, 36.9479),
    -- Rift
    (v_pid, 'NTPS Kajiado cluster',       'Kenya', 'Kajiado',       'Loitokitok',      -2.7660, 37.5260),
    (v_pid, 'NTPS Narok cluster',         'Kenya', 'Narok',         'Kilgoris',        -1.0125, 34.8800),
    (v_pid, 'NTPS Bomet cluster',         'Kenya', 'Bomet',         'Bomet Central',   -0.7811, 35.3411),
    (v_pid, 'NTPS Nakuru cluster',        'Kenya', 'Nakuru',        'Naivasha',        -0.7172, 36.4316),
    (v_pid, 'NTPS Turkana cluster',       'Kenya', 'Turkana',       'Lodwar',           3.1192, 35.5973),
    (v_pid, 'NTPS West Pokot cluster',    'Kenya', 'West Pokot',    'Kapenguria',       1.2418, 35.1126),
    (v_pid, 'NTPS Trans Nzoia cluster',   'Kenya', 'Trans Nzoia',   'Kitale',           1.0157, 35.0062),
    -- Western & Nyanza
    (v_pid, 'NTPS Bungoma cluster',       'Kenya', 'Bungoma',       'Bumula',           0.5635, 34.5606),
    (v_pid, 'NTPS Kisii cluster',         'Kenya', 'Kisii',         'Kisii Central',   -0.6817, 34.7791),
    (v_pid, 'NTPS Nyamira cluster',       'Kenya', 'Nyamira',       'Nyamira North',   -0.5635, 34.9358),
    -- Nairobi
    (v_pid, 'NTPS Embakasi cluster',      'Kenya', 'Nairobi',       'Embakasi East',   -1.3215, 36.9072);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role) VALUES
    (v_pid, 'Dr. Joseph Sitienei',  'MBChB, MMed', 'TB programme management', 'Ministry of Health (NTLDU)', 'Programme partner'),
    (v_pid, 'Dr. Pamela Mukami',    'PhD',         'TB epidemiology',         'KEMRI – CRDR',                'Co-PI'),
    (v_pid, 'Prof. Frank Cobelens', 'MD, PhD',     'TB epidemiology',         'KIT Royal Tropical Institute','External advisor');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Estimate national and regional adult TB prevalence (≥15 years) using symptom and CXR screening + bacteriological confirmation.'),
    (v_pid, 2, 'Quantify drug-resistant TB (RR-TB / MDR-TB) prevalence in detected cases.'),
    (v_pid, 3, 'Document care-seeking behaviour and time-to-treatment among detected TB cases.'),
    (v_pid, 4, 'Inform NTLDU 2027–2031 TB strategic plan and Global Fund concept note.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'NTPS-K1', 'Adults screened',  'Adults ≥15y completing symptom + CXR screening.', 'adults', 70000, '70,000 adults screened.', 'NTPS-2026 e-CRF', 'Mobile CXR vans + tablets', 'quarterly', 1, 9, NOW() - INTERVAL '60 days') RETURNING id INTO v_kpi1;
  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'NTPS-K2', 'Sputum specimens cultured', 'Specimens with mycobacterial culture / Xpert Ultra.', 'specimens', 7000, '7,000 specimens.', 'NTPS-2026 lab register', 'BD MGIT 960 + Cepheid Xpert Ultra', 'quarterly', 1, 9, NOW() - INTERVAL '60 days') RETURNING id INTO v_kpi2;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2025/26', 'Q4', '2026-06-30', 9, 'PI + 5 regional managers + 75 enumerators + 10 lab techs onboarded; 1 site (Marsabit) has staffing delay.', 'Year-1: 12,400 screened; 1,200 sputa cultured; first 18 RR-TB cases identified.', 'Two mobile CXR vans deployed; GeneXpert Ultra commissioned at all clusters.', 'CXR mobile-van operations training (n=20); enumerator GCP+CAPI (n=85).', 'Marsabit cluster staffing; logistics for North-Eastern in long rains.', 7200000, 1800000, 1280000, 520000, -3.5, 'accepted', '2026-07-09 09:00:00+03', 88.0, 1, 9, '2026-07-15 13:00:00+03', 'amber', 'Strong national reach; address Marsabit staffing.')
  RETURNING id INTO v_rep;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep, 90, 100, 100, 100, 100, 78, 100, 100, 88.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep, 9, 'Centre Director', 'accept', 'amber', 'Excellent breadth; Marsabit needs targeted support.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep, v_kpi1, 14000, 12400, 88.6, 'behind'),
    (v_rep, v_kpi2,  1500,  1200, 80.0, 'behind');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep, 'amber', 9, 'Year-1 slightly below screening target.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'abstract', 'NTPS-2026 first-year findings: TB prevalence and care-seeking across 25 Kenyan clusters', 'Makaja A, Mukami P, Sitienei J, Cobelens F', '2026-08-12', 'presented', 'Union Africa Region TB Conference 2026', NULL, 0, NULL, 'open', NULL, 9);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. Alphone Makaja',    'Principal Investigator', 'R-PI', 'PhD Public Health',     1.00, 'KEM-2017-0066', '2026-04-15', 'grant'),
    (v_pid, 'Dr. Pamela Mukami',     'Co-PI',                  'R-CO', 'PhD Epidemiology',      0.50, 'KEM-2014-0027', '2026-04-15', 'grant'),
    (v_pid, 'James Maina',           'Mobile CXR coordinator', 'R-CRA','BSc Radiography',       1.00, 'KEM-2024-1411', '2026-05-01', 'grant'),
    (v_pid, 'Hellen Wairimu',        'TB lab supervisor',      'R-LAB','MSc Medical Microbiology',1.00,'KEM-2024-1412', '2026-05-01', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'Mobile CXR van operations & radiation safety', 'training','2026-04-20','2026-04-24','Nairobi', 20, 'KEMRI – CRDR + WHO',                'All operators certified.'),
    (v_pid, 'NTPS enumerator GCP + CAPI training',           'training','2026-04-08','2026-04-19','Multi-region hubs', 85, 'KEMRI – CRDR + NTLDU', 'All 85 enumerators certified.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Mobile CXR van (Delft Light)',     'vehicle','CXR-VAN-2026-LOT1','KEM-VEH-3711','2026-04-04', 380000, 'USD', 'Delft Imaging','James Maina',    'Coast / Eastern circuit', 'in_use'),
    (v_pid, 'Mobile CXR van (Delft Light)',     'vehicle','CXR-VAN-2026-LOT2','KEM-VEH-3712','2026-04-04', 380000, 'USD', 'Delft Imaging','James Maina',    'Rift / Western circuit',  'in_use'),
    (v_pid, 'Cepheid GeneXpert (Edge ×8)',      'lab',    'GX-EDGE-2026-LOT','KEM-LAB-2811', '2026-04-08',  240000, 'USD', 'Cepheid',      'Hellen Wairimu', 'Distributed across clusters', 'in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',    'Field staff, lab techs, supervisors',         2800000, 540000, 'USD', 'FY2025/26'),
    (v_pid, 'equipment',    'Mobile CXR vans + GeneXpert (one-off)',       1090000,1000000, 'USD', 'FY2025/26'),
    (v_pid, 'consumables',  'Cartridges, MGIT tubes, transport media',     1320000, 320000, 'USD', 'FY2025/26'),
    (v_pid, 'travel',       'Inter-cluster travel + WHO review meetings',   620000, 165000, 'USD', 'FY2025/26'),
    (v_pid, 'subcontract',  'KIT Royal Tropical Institute analysis',        540000, 105000, 'USD', 'FY2025/26'),
    (v_pid, 'indirect',     'KEMRI overhead 15%',                           830000, 150000, 'USD', 'FY2025/26');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Sputum Xpert MTB/RIF Ultra', 'Cepheid GeneXpert Edge', 'Sputum', 7000, 1200, 97.0, 18, 'USD'),
    (v_pid, 'Mycobacterial liquid culture','BD MGIT 960',           'Sputum', 7000, 980, 92.0, 24, 'USD');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner', 'NTLDU (Ministry of Health)', '2026-06-04', 'NTLDU asked for early county briefs to inform 2027–2031 strategic plan.', 'County brief schedule prioritised; first 5 released August 2026.', 'actioned');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Mobile CXR vans dramatically increase screening throughput in remote clusters.'),
    (v_pid, 'weakness',    'Marsabit & Tana River clusters consistently slower due to logistics.'),
    (v_pid, 'opportunity', 'Direct Global Fund and NTLDU strategic-plan use of findings.'),
    (v_pid, 'lesson',      'Pre-deploying lab consumables to cluster nodes 30 days ahead avoids cartridge stock-outs.');
END $$;

-- ----------------------------------------------------------------------------
-- 12. SBE-Kenya — Snakebite Envenomation Surveillance
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint;
  v_rep bigint;
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
    'KEMRI-CIPDCR-2025-002', 'research', 'KEMRI-2025-SBE-002',
    'Snakebite Envenomation Surveillance Kenya (SBE-Kenya): hospital-based surveillance of snakebite incidence, anti-venom availability, and clinical outcomes in arid and semi-arid lands',
    'SBE-Kenya',
    1, 11, 4, 2,
    1400000, 'GBP', 'grant_award', 'observational_surveillance',
    'investigator_initiated', 'WT-228715/Z/23/Z', '228715/Z/23/Z', 'KEMRI-LR-2025-027',
    'KEMRI/SERU/CIPDCR/621/4823', '2025-05-15', '2028-05-14',
    'NACOSTI/P/25/31655', '2025-05-29',
    '2025-08-01', '2028-07-31', '2025-08-15',
    'KEMRI – CIPDCR Snakebite Research Unit', 'Kenya',
    '["3","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA4-Policy-Engagement"]'::jsonb,
    'Neglected Tropical Diseases', 'Snakebite envenomation',
    'active', 'green', 'implementation', 1
  ) RETURNING id INTO v_pid;

  -- 18 snake-endemic counties (Northern + arid + coastal)
  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    (v_pid, 'Lodwar County Hospital',                   'Kenya', 'Turkana',     'Lodwar Town',     3.1192, 35.5973),
    (v_pid, 'Kapenguria County Hospital',               'Kenya', 'West Pokot',  'Kapenguria',      1.2418, 35.1126),
    (v_pid, 'Maralal County Hospital',                  'Kenya', 'Samburu',     'Samburu Central', 1.0998, 36.6985),
    (v_pid, 'Marsabit County Referral Hospital',        'Kenya', 'Marsabit',    'Saku',            2.3284, 37.9899),
    (v_pid, 'Isiolo County Referral Hospital',          'Kenya', 'Isiolo',      'Isiolo Central',  0.3543, 37.5826),
    (v_pid, 'Mandera County Referral Hospital',         'Kenya', 'Mandera',     'Mandera East',    3.9366, 41.8669),
    (v_pid, 'Wajir County Referral Hospital',           'Kenya', 'Wajir',       'Wajir East',      1.7471, 40.0573),
    (v_pid, 'Garissa County Referral Hospital',         'Kenya', 'Garissa',     'Garissa Township',-0.4536, 39.6406),
    (v_pid, 'Hola Sub-County Hospital',                 'Kenya', 'Tana River',  'Galole',          -1.5042, 40.0214),
    (v_pid, 'Kilifi County Hospital',                   'Kenya', 'Kilifi',      'Kilifi North',    -3.6309, 39.8499),
    (v_pid, 'Msambweni County Referral Hospital',       'Kenya', 'Kwale',       'Msambweni',       -4.4720, 39.4836),
    (v_pid, 'King Fahad Hospital, Lamu',                'Kenya', 'Lamu',        'Lamu West',       -2.2696, 40.9006),
    (v_pid, 'Voi District Hospital',                    'Kenya', 'Taita-Taveta','Voi',             -3.3960, 38.5618),
    (v_pid, 'Kitui County Hospital',                    'Kenya', 'Kitui',       'Kitui Central',   -1.3675, 38.0107),
    (v_pid, 'Wote County Hospital',                     'Kenya', 'Makueni',     'Wote',            -1.7831, 37.6244),
    (v_pid, 'Kabarnet County Hospital',                 'Kenya', 'Baringo',     'Baringo Central', 0.4906, 35.7430),
    (v_pid, 'Nanyuki Teaching & Referral Hospital',     'Kenya', 'Laikipia',    'Laikipia East',   0.0167, 37.0667),
    (v_pid, 'Kilgoris Sub-County Hospital',             'Kenya', 'Narok',       'Trans Mara West',-1.0125, 34.8800);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role) VALUES
    (v_pid, 'Dr. George Omondi',     'PhD',     'Medical toxinology',  'KEMRI – CIPDCR',                    'Co-PI'),
    (v_pid, 'Dr. James Kalama',      'MBChB',   'Emergency medicine',  'Kenyatta National Hospital',        'External advisor'),
    (v_pid, 'Prof. David Lalloo',    'MD',      'Tropical medicine',   'Liverpool School of Tropical Med',  'External advisor');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Quantify snakebite incidence, mortality and morbidity at 18 ASAL hospital sentinel sites.'),
    (v_pid, 2, 'Document anti-venom stock-out rates, time-to-treatment and clinical outcomes.'),
    (v_pid, 3, 'Map snake-species responsible for envenomation using species-specific photo identification + immunoassays.'),
    (v_pid, 4, 'Inform Ministry of Health and WHO snakebite roadmap targets for 2030.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'SBE-K1', 'Snakebite cases captured', 'Confirmed snakebite cases recorded across all sites.', 'cases', 4000, '4,000 cases over 36 months.', 'SBE e-CRF', 'Hospital register + tablet', 'quarterly', 1, 9, NOW() - INTERVAL '120 days') RETURNING id INTO v_kpi1;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2025/26', 'Q3', '2026-03-31', 1, 'PI, 2 co-PIs, 18 site coordinators (one per ASAL hospital).', 'Year-1 cases captured: 1,420 confirmed snakebites; 36% needing anti-venom.', 'Tablet fleet + lab kits deployed.', 'Snakebite case-management refresher training (n=42).', 'Frequent anti-venom stock-outs at 6 sites — escalated to PPB.', 1400000, 380000, 245000, 135000, -3.5, 'accepted', '2026-04-08 11:00:00+03', 92.5, 1, 9, '2026-04-12 14:00:00+03', 'green', 'Strong execution; PPB engagement on stock-outs essential.')
  RETURNING id INTO v_rep;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep, 95, 100, 100, 100, 100, 86, 100, 100, 92.5, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep, 9, 'Centre Director', 'accept', 'green', 'Strong national surveillance reach.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep, v_kpi1, 1300, 1420, 109.2, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep, 'green', 9, 'Q3 acceptance.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication','Snakebite envenomation in Kenyan ASALs: incidence, anti-venom availability, and outcomes', 'KEMRI testuser, Omondi G, Kalama J, Lalloo D', '2026-05-22', 'published', 'PLOS Neglected Tropical Diseases', '10.1371/journal.pntd.0011875', 0, 4.4, 'open', 91.0, 1),
    (v_pid, 'policy_brief','Snakebite anti-venom national supply: emergency replenishment plan', 'KEMRI – CIPDCR', '2026-06-15', 'released', 'Kenya MoH / Pharmacy & Poisons Board', NULL, 0, NULL, 'open', NULL, 1);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. KEMRI Test User',     'Principal Investigator', 'R-PI',  'PhD Public Health',     1.00, 'KEM-2017-0080', '2025-08-01', 'grant'),
    (v_pid, 'Dr. George Omondi',       'Co-PI',                  'R-CO',  'PhD Toxinology',        0.40, 'KEM-2014-0044', '2025-08-01', 'kemri'),
    (v_pid, 'Aisha Hassan',            'Sentinel coordinator',   'R-CRA', 'BSc Public Health',     1.00, 'KEM-2024-1511', '2025-08-15', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'Snakebite case-management refresher training', 'training','2025-09-08','2025-09-12','Garissa', 42, 'KEMRI – CIPDCR + LSTM', 'All 42 ASAL sentinel staff certified.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Toyota Hilux 4WD double-cab', 'vehicle','TLX-2025-91','KEM-VEH-3811','2025-08-25', 47000, 'GBP', 'Toyota Kenya','Aisha Hassan', 'CIPDCR Northern Field Office','in_use'),
    (v_pid, 'Lenovo M10 tablet fleet (24)', 'ict','LEN-M10-2025-LOT5','KEM-ICT-2911','2025-08-29',  7200, 'GBP', 'Lenovo Kenya','Aisha Hassan', 'Distributed across all sites','in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Site coordinators and lab techs',           520000, 105000, 'GBP', 'FY2025/26'),
    (v_pid, 'equipment',   'Vehicle + tablet fleet (one-off)',           54200,  54200, 'GBP', 'FY2025/26'),
    (v_pid, 'consumables', 'Anti-venom assays, photo-ID kits',          280000,  68000, 'GBP', 'FY2025/26'),
    (v_pid, 'travel',      'Inter-site monitoring',                      155000,  35000, 'GBP', 'FY2025/26'),
    (v_pid, 'subcontract', 'LSTM technical support',                     180000,  42000, 'GBP', 'FY2025/26'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                         210000,  21000, 'GBP', 'FY2025/26');

  INSERT INTO kemri_lab_analyses (project_id, analysis_type, platform, sample_type, total_planned, completed, qc_pass_rate, unit_cost, currency) VALUES
    (v_pid, 'Snake species ELISA',  'In-house ELISA',  'Whole blood / wound swab', 4000, 510, 92.0,  6, 'GBP');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'regulatory', 'Pharmacy & Poisons Board (PPB)', '2026-02-19', 'PPB committed to monthly anti-venom audit using SBE-Kenya data.', 'KIMES dashboard exposed monthly to PPB; first audit June 2026.', 'actioned');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'KEMRI – CIPDCR Snakebite Research Unit is Africa''s reference WHO collaborating centre.'),
    (v_pid, 'opportunity', 'Direct contribution to WHO 2030 snakebite roadmap.'),
    (v_pid, 'lesson',      'Photo-ID app slashed time-to-species-confirmation from 6 hours to under 15 minutes.');
END $$;

-- ----------------------------------------------------------------------------
-- 13. AMU-PPS-Kenya — Hospital Antimicrobial Use Point-Prevalence Survey
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_pid bigint;
  v_kpi1 bigint;
  v_rep bigint;
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
    'KEMRI-CMR-2026-002', 'research', 'KEMRI-2026-AMU-002',
    'Kenya Hospital Antimicrobial Use Point-Prevalence Survey (AMU-PPS-Kenya): WHO PPS methodology applied across 35 level 4-6 hospitals',
    'AMU-PPS-Kenya',
    13, 3, 5, 4,
    950000, 'GBP', 'grant_award', 'point_prevalence_survey',
    'cooperative_agreement', 'FCDO-FF-AMU-PPS-2026', 'FF-AMU-PPS-2026', 'KEMRI-LR-2026-014',
    'KEMRI/SERU/CMR/812/5158', '2026-02-04', '2027-08-03',
    'NACOSTI/P/26/32208', '2026-02-19',
    '2026-03-15', '2027-09-30', '2026-04-01',
    'KEMRI – Centre for Microbiology Research, Nairobi', 'Kenya',
    '["3","17"]'::jsonb,
    '["KRA1-Research-Excellence","KRA4-Policy-Engagement"]'::jsonb,
    'Antimicrobial Resistance', 'Antimicrobial stewardship',
    'active', 'green', 'implementation', 13
  ) RETURNING id INTO v_pid;

  -- 35 hospitals — every region of Kenya covered for true national PPS
  INSERT INTO kemri_research_sites (project_id, site_name, country, county, sub_county, latitude, longitude) VALUES
    -- Nairobi
    (v_pid, 'Kenyatta National Hospital',           'Kenya', 'Nairobi',     'Dagoretti North', -1.3025, 36.8061),
    (v_pid, 'Mama Lucy Kibaki Hospital',            'Kenya', 'Nairobi',     'Embakasi',        -1.2738, 36.9171),
    (v_pid, 'Mbagathi County Hospital',             'Kenya', 'Nairobi',     'Dagoretti South', -1.3193, 36.7972),
    (v_pid, 'Mater Misericordiae Hospital',         'Kenya', 'Nairobi',     'Embakasi South',  -1.3070, 36.8333),
    -- Coast
    (v_pid, 'Coast General Teaching Hospital',      'Kenya', 'Mombasa',     'Mvita',           -4.0519, 39.6657),
    (v_pid, 'Aga Khan Hospital, Mombasa',           'Kenya', 'Mombasa',     'Nyali',           -4.0220, 39.6900),
    (v_pid, 'Kilifi County Hospital',               'Kenya', 'Kilifi',      'Kilifi North',    -3.6309, 39.8499),
    (v_pid, 'Msambweni County Referral Hospital',   'Kenya', 'Kwale',       'Msambweni',       -4.4720, 39.4836),
    (v_pid, 'Voi District Hospital',                'Kenya', 'Taita-Taveta','Voi',             -3.3960, 38.5618),
    (v_pid, 'King Fahad Hospital, Lamu',            'Kenya', 'Lamu',        'Lamu West',       -2.2696, 40.9006),
    -- Eastern
    (v_pid, 'Embu Level 5 Hospital',                'Kenya', 'Embu',        'Manyatta',        -0.5311, 37.4500),
    (v_pid, 'Meru Level 5 Hospital',                'Kenya', 'Meru',        'Imenti North',     0.0463, 37.6559),
    (v_pid, 'Chuka County Hospital',                'Kenya', 'Tharaka-Nithi','Chuka',          -0.3377, 37.6483),
    (v_pid, 'Kitui County Referral Hospital',       'Kenya', 'Kitui',       'Kitui Central',   -1.3675, 38.0107),
    (v_pid, 'Wote County Hospital',                 'Kenya', 'Makueni',     'Wote',            -1.7831, 37.6244),
    (v_pid, 'Marsabit County Referral Hospital',    'Kenya', 'Marsabit',    'Saku',             2.3284, 37.9899),
    (v_pid, 'Isiolo County Referral Hospital',      'Kenya', 'Isiolo',      'Isiolo Central',   0.3543, 37.5826),
    -- North-Eastern
    (v_pid, 'Garissa County Referral Hospital',     'Kenya', 'Garissa',     'Garissa Township',-0.4536, 39.6406),
    (v_pid, 'Wajir County Referral Hospital',       'Kenya', 'Wajir',       'Wajir East',       1.7471, 40.0573),
    (v_pid, 'Mandera County Referral Hospital',     'Kenya', 'Mandera',     'Mandera East',     3.9366, 41.8669),
    -- Central
    (v_pid, 'Nyeri County Referral Hospital',       'Kenya', 'Nyeri',       'Nyeri Town',      -0.4170, 36.9479),
    (v_pid, 'Murang''a County Referral Hospital',   'Kenya', 'Murang''a',   'Murang''a South', -0.7167, 37.1500),
    (v_pid, 'Kerugoya County Hospital',             'Kenya', 'Kirinyaga',   'Kirinyaga Central',-0.4983, 37.2803),
    (v_pid, 'Olkalou Sub-County Hospital',          'Kenya', 'Nyandarua',   'Olkalou',         -0.2866, 36.4068),
    (v_pid, 'Thika Level 5 Hospital',               'Kenya', 'Kiambu',      'Thika Town',      -1.0341, 37.0833),
    -- Rift Valley
    (v_pid, 'Moi Teaching & Referral Hospital',     'Kenya', 'Uasin Gishu', 'Eldoret East',     0.5143, 35.2698),
    (v_pid, 'Nakuru County Referral Hospital',      'Kenya', 'Nakuru',      'Nakuru Town East',-0.3031, 36.0800),
    (v_pid, 'Kericho County Referral Hospital',     'Kenya', 'Kericho',     'Ainamoi',         -0.3677, 35.2832),
    (v_pid, 'Kapenguria County Hospital',           'Kenya', 'West Pokot',  'Kapenguria',       1.2418, 35.1126),
    (v_pid, 'Lodwar County Hospital',               'Kenya', 'Turkana',     'Lodwar Town',      3.1192, 35.5973),
    -- Western
    (v_pid, 'Kakamega County General Hospital',     'Kenya', 'Kakamega',    'Lurambi',          0.2839, 34.7519),
    (v_pid, 'Bungoma County Referral Hospital',     'Kenya', 'Bungoma',     'Kanduyi',          0.5635, 34.5606),
    -- Nyanza
    (v_pid, 'Jaramogi Oginga Odinga T&R Hospital',  'Kenya', 'Kisumu',      'Kisumu Central',  -0.0917, 34.7680),
    (v_pid, 'Migori County Referral Hospital',      'Kenya', 'Migori',      'Suna East',       -1.0634, 34.4731),
    (v_pid, 'Kisii Teaching & Referral Hospital',   'Kenya', 'Kisii',       'Kisii Central',   -0.6817, 34.7791);

  INSERT INTO kemri_research_coinvestigators (project_id, full_name, qualification, specialty, institution, role) VALUES
    (v_pid, 'Prof. Sam Kariuki',     'PhD, FRCPath',  'Bacterial AMR',     'KEMRI – CMR',                'Co-PI'),
    (v_pid, 'Dr. Loice Achieng',     'MBChB, MMed',   'Internal medicine', 'University of Nairobi',      'External advisor'),
    (v_pid, 'Dr. Catrin Moore',      'PhD',           'AMR epidemiology',  'St George''s, University of London', 'External advisor');

  INSERT INTO kemri_research_objectives (project_id, ordinal, description) VALUES
    (v_pid, 1, 'Apply WHO Antimicrobial Use PPS methodology in 35 level-4 to level-6 hospitals across all 8 Kenyan regions.'),
    (v_pid, 2, 'Quantify prevalence of antimicrobial use, indication, and adherence to STG.'),
    (v_pid, 3, 'Identify top targets for antimicrobial stewardship interventions, including Watch / Reserve antibiotics.'),
    (v_pid, 4, 'Train 105 hospital pharmacists and IPC focal persons in PPS methodology.');

  INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description, unit_of_measure, target_value, expected_output, data_source, collection_method, reporting_frequency, is_smart, approved_by, approved_at) VALUES
    (v_pid, 'AMU-K1', 'Hospital PPS audits completed', 'Hospitals with completed first-round PPS audit.', 'hospitals', 35, '35 hospital reports.', 'AMU-PPS REDCap database', 'Tablet-based PPS form', 'quarterly', 1, 9, NOW() - INTERVAL '60 days') RETURNING id INTO v_kpi1;

  INSERT INTO kemri_milestone_reports (project_id, fy_label, quarter, reporting_period_end, pi_user_id, staff_status_narrative, lab_analyses_summary, equipment_acquired_summary, capacity_building_summary, emerging_risks, budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct, status, submitted_at, dqa_score, dqa_passed, reviewed_by, reviewed_at, rag_status, reviewer_comments)
  VALUES (v_pid, 'FY2025/26', 'Q4', '2026-06-30', 13, 'PI + 8 regional auditors + 105 hospital focal persons trained.', 'No lab analyses for this study (chart audit only).', 'Tablet fleet for 8 regional auditors deployed.', 'Three-day PPS methodology training per region (n=105).', 'No material risks.', 950000, 240000, 162000, 78000, -2.0, 'accepted', '2026-07-09 10:00:00+03', 94.0, 1, 9, '2026-07-13 13:00:00+03', 'green', 'Strong national reach across all 8 regions.')
  RETURNING id INTO v_rep;
  INSERT INTO kemri_dqa_scores (report_id, completeness_score, numeric_range_score, gps_validation_score, financial_arithmetic_score, date_logic_score, cross_field_score, seru_expiry_score, duplicate_check_score, overall_score, passed)
    VALUES (v_rep, 96, 100, 100, 100, 100, 90, 100, 100, 94.0, 1);
  INSERT INTO kemri_peer_reviews (report_id, reviewer_user_id, reviewer_role, decision, rag_status, comments) VALUES
    (v_rep, 9, 'Centre Director', 'accept', 'green', 'Excellent national reach.');
  INSERT INTO kemri_kpi_achievements (report_id, kpi_id, target_value, actual_value, achievement_pct, status) VALUES
    (v_rep, v_kpi1, 35, 28, 80.0, 'on_track');
  INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason) VALUES
    (v_pid, v_rep, 'green', 9, 'Q4 acceptance.');

  INSERT INTO kemri_outputs (project_id, output_type, title, authors, date_recorded, status, venue, doi, citation_count, impact_factor, access_level, fair_score, reported_by) VALUES
    (v_pid, 'publication','Antimicrobial use prevalence in Kenyan level-4-6 hospitals: a national PPS', 'Wilson G, Kariuki S, Achieng L, Moore C', '2026-08-12', 'in_press', 'BMJ Global Health', '10.1136/bmjgh-2026-014812', 0, 8.1, 'open', 91.0, 13);

  INSERT INTO kemri_research_staff (project_id, staff_name, role, role_code, qualification, fte, payroll_no, start_date, funded_by) VALUES
    (v_pid, 'Dr. George Wilson',     'Principal Investigator', 'R-PI', 'PhD Public Health',     1.00, 'KEM-2018-0072', '2026-03-15', 'grant'),
    (v_pid, 'Prof. Sam Kariuki',     'Co-PI / CMR Director',   'R-CO', 'PhD, FRCPath',          0.20, 'KEM-2010-0011', '2026-03-15', 'kemri'),
    (v_pid, 'Catherine Wanjiru',     'PPS regional auditor',   'R-CRA','BPharm, MSc',           1.00, 'KEM-2024-1611', '2026-04-01', 'grant');

  INSERT INTO kemri_capacity_building (project_id, event_title, event_type, start_date, end_date, location, participants_count, facilitator, outcome_summary) VALUES
    (v_pid, 'WHO PPS methodology training (regional cohorts)', 'training','2026-04-08','2026-04-26','Multi-region hubs', 105, 'KEMRI – CMR + St George''s London', 'All 105 hospital focal persons certified.');

  INSERT INTO kemri_research_equipment (project_id, item_name, category, serial_number, asset_tag, acquisition_date, acquisition_cost, currency, vendor, custodian, location, status) VALUES
    (v_pid, 'Lenovo M10 audit tablets (24)', 'ict','LEN-M10-2026-LOT8','KEM-ICT-3011','2026-03-22', 7200, 'GBP', 'Lenovo Kenya', 'Catherine Wanjiru', 'Distributed across regions','in_use');

  INSERT INTO kemri_budget_lines (project_id, category, description, budgeted_amount, expenditure_to_date, currency, fy_label) VALUES
    (v_pid, 'personnel',   'Regional auditors and PI',                 320000, 88000, 'GBP', 'FY2025/26'),
    (v_pid, 'equipment',   'Audit tablets (one-off)',                    7200,  7200, 'GBP', 'FY2025/26'),
    (v_pid, 'travel',      'Inter-hospital travel for PPS rounds',      245000, 42000, 'GBP', 'FY2025/26'),
    (v_pid, 'subcontract', 'St George''s London analysis support',      130000, 18000, 'GBP', 'FY2025/26'),
    (v_pid, 'indirect',    'KEMRI overhead 15%',                        140000,  6800, 'GBP', 'FY2025/26');

  INSERT INTO kemri_operations_feedback (project_id, feedback_type, source, date_received, summary, action_taken, status) VALUES
    (v_pid, 'partner', 'AMR National Steering Committee (MoH)', '2026-06-04', 'Steering committee requested integration of PPS data into national AMR dashboard.', 'KIMES PPS aggregates added to MoH AMR dashboard nightly export.', 'closed');

  INSERT INTO kemri_swot_lessons (project_id, category, description) VALUES
    (v_pid, 'strength',    'Tablet-based audit shrinks data lag from weeks to under 24 hours.'),
    (v_pid, 'opportunity', 'AMR National Steering Committee adopting PPS as routine annual exercise from 2027.'),
    (v_pid, 'lesson',      'Regional auditors with prescribing background find audit gaps that pure data clerks miss.');
END $$;

COMMIT;

-- =============================================================================
-- Sanity: how the GIS dashboard now sees the world
-- =============================================================================
SELECT
  (SELECT COUNT(*) FROM kemri_research_projects WHERE voided=0) AS projects,
  (SELECT COUNT(*) FROM kemri_research_sites    WHERE voided=0) AS sites,
  (SELECT COUNT(DISTINCT UPPER(TRIM(county))) FROM kemri_research_sites WHERE voided=0 AND county IS NOT NULL) AS counties_with_activity,
  (SELECT SUM(funding_amount) FROM kemri_research_projects WHERE voided=0 AND status<>'closing') AS active_funding,
  (SELECT COUNT(*) FROM kemri_milestone_reports WHERE voided=0) AS reports;
