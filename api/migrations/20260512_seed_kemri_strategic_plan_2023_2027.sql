-- ============================================================================
-- KEMRI 5th Strategic Plan 2023/24 - 2027/28
-- Source: /home/dev/dev/kemri/api/adp/FINALAPPROVEDSTRATEGICPLAN3.27.pdf
--    Theme:        "Innovative Human Health Research for Sustainable Health Outcomes"
--    Vision:       "Global Leader in Research for Human Health"
--    Mission:      "To improve the quality of human health through research,
--                   innovation, capacity development and service delivery"
--    Strategic Goal: To become a global leader in research for human health
--                    through innovation and translation
-- ============================================================================

-- Deactivate any other plans first so the KEMRI plan is the only active one.
UPDATE strategicplans SET is_active = FALSE WHERE is_active = TRUE;

WITH upsert_plan AS (
    INSERT INTO strategicplans
        (cidpid, "cidpName", "startDate", "endDate", vision, mission,
         theme, strategic_goal, core_values, is_active, voided, "createdAt", "updatedAt")
    VALUES (
        'KEMRI-SP-2023-2027',
        'KEMRI 5th Strategic Plan 2023/24 - 2027/28',
        '2023-07-01'::timestamp, '2028-06-30'::timestamp,
        'Global Leader in Research for Human Health',
        'To improve the quality of human health through research, innovation, capacity development and service delivery',
        'Innovative Human Health Research for Sustainable Health Outcomes',
        'To become a global leader in research for human health through innovation and translation',
        'P-Partnerships, R-Rectitude, I-Inclusivity, C-Creativity and Innovation, E-Excellence',
        TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT DO NOTHING
    RETURNING id, cidpid
)
SELECT 1;

-- If the INSERT was skipped (re-run), make sure the plan is active.
UPDATE strategicplans
   SET is_active = TRUE,
       vision = COALESCE(vision, 'Global Leader in Research for Human Health'),
       mission = COALESCE(mission, 'To improve the quality of human health through research, innovation, capacity development and service delivery'),
       theme = COALESCE(theme, 'Innovative Human Health Research for Sustainable Health Outcomes'),
       strategic_goal = COALESCE(strategic_goal, 'To become a global leader in research for human health through innovation and translation'),
       core_values = COALESCE(core_values, 'P-Partnerships, R-Rectitude, I-Inclusivity, C-Creativity and Innovation, E-Excellence')
 WHERE cidpid = 'KEMRI-SP-2023-2027';

-- ----------------------------------------------------------------------------
-- 6 KRAs (Key Result Areas) — table 3.1 of the plan
-- ----------------------------------------------------------------------------
INSERT INTO programs (cidpid, "programName", "programCode", programme, description, objectives, voided, "createdAt", "updatedAt")
VALUES
  ('KEMRI-SP-2023-2027', 'KRA 1: Research for Human Health',          'KRA1', 'Research for Human Health',
   'Strengthen clinical, biomedical, public health, and health system research alongside data science & knowledge management to inform Kenya''s UHC agenda.',
   'SO1 Strengthen clinical/biomedical/public-health/health-system research; SO2 Build data science and knowledge management systems', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('KEMRI-SP-2023-2027', 'KRA 2: Innovation and Product Development', 'KRA2', 'Innovation and Product Development',
   'Undertake scientific and technological innovation, establish incubation centres, and link research to industry and policy.',
   'SO3 Undertake scientific and technological innovation', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('KEMRI-SP-2023-2027', 'KRA 3: Disease Surveillance and Response',  'KRA3', 'Disease Surveillance and Response',
   'Strengthen national capacity for early disease detection and timely response to biothreats, NCDs and communicable diseases.',
   'SO4 Strengthen disease surveillance system', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('KEMRI-SP-2023-2027', 'KRA 4: Research Capacity Building',         'KRA4', 'Research Capacity Building',
   'Build human-health research capacity through post-graduate programmes and the KEMRI Graduate School of Health Research.',
   'SO5 Build human health research capacity', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('KEMRI-SP-2023-2027', 'KRA 5: Financial Sustainability',           'KRA5', 'Financial Sustainability',
   'Grow revenue, strengthen partnerships, and implement cost-saving measures so the institute can sustain world-class research.',
   'SO6 Strengthen partnerships and collaboration; SO7 Enhance Financial Sustainability', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('KEMRI-SP-2023-2027', 'KRA 6: Institutional Strengthening',        'KRA6', 'Institutional Strengthening',
   'Re-engineer internal processes, develop human capital, modernise infrastructure & ICT, and embed planning, M&E and quality assurance.',
   'SO8 Re-engineer business processes; SO9 Build institutional human capital; SO10 Upgrade infrastructure; SO11 Resilient ICT; SO12 Strengthen planning, M&E', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12 Strategic Objectives (subprograms) with KPIs / indicators / 5-year targets
-- ----------------------------------------------------------------------------
WITH p AS (
    SELECT "programId", "programCode"
      FROM programs
     WHERE cidpid = 'KEMRI-SP-2023-2027'
)
INSERT INTO subprograms (
    "programId", "subProgramName", "subProgramCode", "subProgramme",
    "keyOutcome", kpi, "unitOfMeasure",
    baseline,
    "yr1Targets","yr2Targets","yr3Targets","yr4Targets","yr5Targets",
    "yr1Budget","yr2Budget","yr3Budget","yr4Budget","yr5Budget","totalBudget",
    remarks, voided, "createdAt","updatedAt"
)
SELECT * FROM (
  VALUES
    -- SO1
    ((SELECT "programId" FROM p WHERE "programCode"='KRA1'), 'SO1: Strengthen clinical, biomedical, public-health and health-system research', 'SO1', 'SO1: Strengthen clinical, biomedical, public-health and health-system research',
     'New, high-quality research studies approved and implemented across NCDs, NTDs, infectious diseases, AMR, mental health, food/nutrition and OMICS technologies (FY2023/24 - FY2027/28).',
     'Number of new research studies approved and implemented (all programmes)',
     'count', '1,074',
     '152', '163', '180', '195', '212',
     1855000000.00, 2080000000.00, 2410000000.00, 2740000000.00, 3100000000.00, 12185000000.00,
     'Aggregates 12 strategy lines: 1.1 - 1.8 of the implementation matrix (NCDs, NTDs, infectious diseases, SRH, AMR, mental health, food/nutrition, biosafety, regulatory).',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO2
    ((SELECT "programId" FROM p WHERE "programCode"='KRA1'), 'SO2: Build data science and knowledge-management systems', 'SO2', 'SO2: Build data science and knowledge-management systems',
     'Enterprise data-management, analytics, protection strategies and knowledge translation in place.',
     'Number of data products / KM artefacts (dashboards, policy briefs, datasets) released',
     'count', '5',
     '4', '6', '8', '10', '12',
     45000000.00, 60000000.00, 80000000.00, 95000000.00, 110000000.00, 390000000.00,
     'Includes the KIMES platform itself, FAIR datasets in open repositories, and quarterly Research Uptake Bulletin.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO3
    ((SELECT "programId" FROM p WHERE "programCode"='KRA2'), 'SO3: Undertake scientific and technological innovation', 'SO3', 'SO3: Undertake scientific and technological innovation',
     'New innovations / prototypes for human-health products with at least one commercialised pipeline per year.',
     'Number of innovations developed, patented, or commercialised',
     'count', '3',
     '2', '3', '4', '5', '6',
     120000000.00, 160000000.00, 200000000.00, 240000000.00, 280000000.00, 1000000000.00,
     'Includes the Bio-manufacturing Training Hub, stem-cell regenerative medicine, and incubation centres.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO4
    ((SELECT "programId" FROM p WHERE "programCode"='KRA3'), 'SO4: Strengthen disease surveillance systems', 'SO4', 'SO4: Strengthen disease surveillance systems',
     'Operational sentinel-surveillance networks and rapid outbreak response capacity for priority bio-threats.',
     'Number of active sentinel/surveillance networks with quarterly data products',
     'count', '4',
     '6', '8', '10', '12', '14',
     180000000.00, 220000000.00, 260000000.00, 300000000.00, 340000000.00, 1300000000.00,
     'KIRSS (respiratory pathogens), AMR surveillance, NTD surveillance, vector-borne disease watch, genomic surveillance.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO5
    ((SELECT "programId" FROM p WHERE "programCode"='KRA4'), 'SO5: Build human-health research capacity', 'SO5', 'SO5: Build human-health research capacity',
     'KEMRI Graduate School producing accredited researchers across MSc, PhD and short-courses.',
     'Number of post-graduate students enrolled and graduated cumulatively',
     'count', '120',
     '60', '80', '100', '120', '140',
     90000000.00, 110000000.00, 130000000.00, 150000000.00, 170000000.00, 650000000.00,
     'Includes fellowships, short-courses, and faculty exchange; supports KGS-HR rollout.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO6
    ((SELECT "programId" FROM p WHERE "programCode"='KRA5'), 'SO6: Strengthen and establish strategic partnerships and collaboration', 'SO6', 'SO6: Strengthen and establish strategic partnerships and collaboration',
     'Sustained portfolio of high-value donor / academic / industry partnerships.',
     'Number of active signed MoUs / consortia and value of mobilised resources (KES B)',
     'partnerships+KES_B', '18 active / KES 32.4B',
     '20', '24', '28', '32', '36',
     35000000.00, 40000000.00, 45000000.00, 50000000.00, 55000000.00, 225000000.00,
     'Includes Wellcome, NIH, Global Fund, Gavi, Africa CDC, WHO, county governments.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO7
    ((SELECT "programId" FROM p WHERE "programCode"='KRA5'), 'SO7: Enhance financial sustainability', 'SO7', 'SO7: Enhance financial sustainability',
     'Diversified revenue base from donors, PPPs, commercial services and Exchequer.',
     'Total revenue mobilised (KES Billions, cumulative)',
     'KES_B', 'KES 18.0B',
     '8.5', '10.0', '12.0', '14.0', '16.0',
     0, 0, 0, 0, 0, 0,
     'Targets are revenue, not budget; budget is captured against the originating activities.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO8
    ((SELECT "programId" FROM p WHERE "programCode"='KRA6'), 'SO8: Re-engineer internal business processes', 'SO8', 'SO8: Re-engineer internal business processes',
     'Streamlined SOPs, fleet, records and supply-chain processes; clean audit opinions.',
     'Annual ISO surveillance audits passed without major non-conformities',
     'count', '1 of 1',
     '1', '1', '1', '1', '1',
     25000000.00, 28000000.00, 30000000.00, 33000000.00, 36000000.00, 152000000.00,
     'Combines internal-audit, ISO 9001, ISO 15189 and procurement-process improvement.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO9
    ((SELECT "programId" FROM p WHERE "programCode"='KRA6'), 'SO9: Build institutional human capital', 'SO9', 'SO9: Build institutional human capital',
     'High-performing, diverse, motivated workforce with optimal succession.',
     'Staff establishment filled (%) and average training hours per staff per year',
     'pct+hours', '74% / 18 hrs',
     '78', '82', '86', '90', '92',
     450000000.00, 490000000.00, 530000000.00, 580000000.00, 630000000.00, 2680000000.00,
     'Headcount, training, performance management, employee engagement.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO10
    ((SELECT "programId" FROM p WHERE "programCode"='KRA6'), 'SO10: Establish and upgrade health-research infrastructure', 'SO10', 'SO10: Establish and upgrade health-research infrastructure',
     'Modernised laboratories, biorepositories and clinical-trial facilities.',
     'Number of laboratories upgraded to BSL2+ / accredited',
     'count', '6',
     '2', '3', '4', '5', '6',
     280000000.00, 320000000.00, 370000000.00, 420000000.00, 470000000.00, 1860000000.00,
     'Includes biomanufacturing hub, ABSL3 expansion, and centre refurbishments.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO11
    ((SELECT "programId" FROM p WHERE "programCode"='KRA6'), 'SO11: Establish resilient ICT systems', 'SO11', 'SO11: Establish resilient ICT systems',
     'Modern ICT platform with cyber-resilience and analytics; KIMES rolled out institute-wide.',
     'KIMES adoption (%) across centres and ISO 27001 surveillance audits passed',
     'pct+count', '0% / 0',
     '40', '70', '90', '95', '98',
     85000000.00, 110000000.00, 130000000.00, 150000000.00, 170000000.00, 645000000.00,
     'KIMES, ERP, cyber-resilience, data analytics layer.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- SO12
    ((SELECT "programId" FROM p WHERE "programCode"='KRA6'), 'SO12: Strengthen planning, monitoring and evaluation', 'SO12', 'SO12: Strengthen planning, monitoring and evaluation',
     'Quarterly M&E reports produced on time; quality assurance embedded across research and service delivery.',
     'On-time quarterly M&E reports submitted (%) and SERU compliance (%)',
     'pct', '60% / 78%',
     '85', '90', '95', '98', '100',
     45000000.00, 55000000.00, 65000000.00, 75000000.00, 85000000.00, 325000000.00,
     'Powered by KIMES automated DQA and reminder workflows.',
     false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS t
ON CONFLICT DO NOTHING;
