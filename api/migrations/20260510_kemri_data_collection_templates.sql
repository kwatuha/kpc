-- ----------------------------------------------------------------------------
-- KEMRI / KIMES — seed library of data-collection templates
-- ----------------------------------------------------------------------------
-- Adds 10 fillable checklists / forms that map directly onto KEMRI's research
-- M&E workflow:
--
--   1. PI Quarterly Site Visit Checklist        (pi_visit)
--   2. Centre Director Monitoring Visit         (cd_visit)
--   3. MEL Data Quality Audit                   (mel_audit)
--   4. SERU / Ethics Compliance Checklist       (compliance)
--   5. Adverse Event & Protocol Deviation Form  (adverse_event)
--   6. Laboratory QC Checklist                  (lab_qc)
--   7. Equipment Audit Checklist                (equipment_audit)
--   8. Training & Capacity-Building Evaluation  (capacity_building)
--   9. Community / Stakeholder Engagement       (stakeholder_feedback)
--  10. Study Close-Out Checklist                (study_closure)
--
-- IDEMPOTENT: re-running this migration voids any prior KEMRI templates (their
-- submissions remain intact via FK ON DELETE RESTRICT) and re-inserts the
-- canonical set. Legacy non-KEMRI templates are left untouched.
-- ----------------------------------------------------------------------------

-- Ensure the table exists (matches dataCollectionSchema.js)
CREATE TABLE IF NOT EXISTS data_collection_templates (
  template_id        SERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  description        TEXT NULL,
  template_category  TEXT NOT NULL DEFAULT 'general',
  structure          JSONB NOT NULL DEFAULT '{"sections":[]}'::jsonb,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by         INTEGER NULL,
  created_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided             BOOLEAN NOT NULL DEFAULT FALSE
);

-- Idempotency: void any prior 'KEMRI:' rows so the canonical set wins.
UPDATE data_collection_templates
   SET voided     = TRUE,
       is_active  = FALSE,
       updated_at = CURRENT_TIMESTAMP
 WHERE name LIKE 'KEMRI:%'
   AND COALESCE(voided, FALSE) = FALSE;

-- ----------------------------------------------------------------------------
--  1. PI Quarterly Site Visit Checklist
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: PI Quarterly Site Visit Checklist',
  'Used by the Principal Investigator (or delegated co-investigator) during the routine quarterly visit to a study site. Verifies that data collection, ethics, equipment and staffing are all on-track. Submission feeds the §5 Operations and §10 Operations Feedback sections of the next milestone report.',
  'pi_visit',
  $JSON${
    "sections": [
      {
        "id": "visit_basics",
        "title": "Visit basics",
        "items": [
          { "id": "site_name",           "label": "Site name (county / sub-county)",                              "type": "text",        "required": true  },
          { "id": "persons_met",         "label": "Persons met (names & roles)",                                  "type": "textarea",    "required": true  },
          { "id": "visit_purpose",       "label": "Primary purpose of the visit",                                 "type": "select",      "required": true,
            "options": ["Routine monitoring", "Data quality follow-up", "Adverse event investigation", "SERU compliance check", "Donor visit support", "Training / mentorship"] }
        ]
      },
      {
        "id": "site_conditions",
        "title": "Site conditions",
        "items": [
          { "id": "site_accessible",     "label": "Site is accessible and operating normally",                    "type": "yes_no",      "required": true  },
          { "id": "study_signage",       "label": "Approved study signage and SERU letter visibly posted",        "type": "yes_no",      "required": true  },
          { "id": "biosafety",           "label": "Biosafety / OSH standards observed (PPE, sharps, spill kit)",  "type": "yes_no",      "required": true  },
          { "id": "issues_observed",     "label": "Site-condition issues observed (free-text)",                   "type": "textarea",    "required": false }
        ]
      },
      {
        "id": "data_collection",
        "title": "Data collection",
        "items": [
          { "id": "protocol_followed",   "label": "Data collection runs as per the approved protocol",            "type": "yes_no",      "required": true  },
          { "id": "source_docs_current", "label": "Source documents complete and signed within 24h of encounter", "type": "yes_no",      "required": true  },
          { "id": "edc_functional",      "label": "Electronic data capture (REDCap / KoboToolbox / etc.) working","type": "yes_no",      "required": true  },
          { "id": "missing_records_pct", "label": "Missing / late records (% of expected for the period)",        "type": "number",      "required": false },
          { "id": "data_issues",         "label": "Data-quality issues observed",                                 "type": "textarea",    "required": false }
        ]
      },
      {
        "id": "staff_supervision",
        "title": "Staff & supervision",
        "items": [
          { "id": "staff_present",       "label": "Required research staff on duty",                              "type": "yes_no",      "required": true  },
          { "id": "training_current",    "label": "Staff GCP / human subjects training current",                  "type": "yes_no",      "required": true  },
          { "id": "supervision_log",     "label": "Supervision log up-to-date for the past 30 days",              "type": "yes_no",      "required": true  },
          { "id": "staff_concerns",      "label": "Staff concerns or capacity gaps",                              "type": "textarea",    "required": false }
        ]
      },
      {
        "id": "ethics_compliance",
        "title": "Ethics & compliance",
        "items": [
          { "id": "consent_log",         "label": "Informed consent register reviewed (yes/no/N-A)",              "type": "select",      "required": true,
            "options": ["Yes — all consents on file", "Partial — gaps noted", "No — not reviewed", "N/A — non-clinical study"] },
          { "id": "ae_log",              "label": "Adverse-event log reviewed and up-to-date",                    "type": "yes_no",      "required": true  },
          { "id": "seru_posted",         "label": "Current SERU approval letter on file at the site",             "type": "yes_no",      "required": true  }
        ]
      },
      {
        "id": "equipment_supplies",
        "title": "Equipment & supplies",
        "items": [
          { "id": "equipment_status",    "label": "Equipment functional & calibration certificates current",      "type": "yes_no",      "required": true  },
          { "id": "reagent_stock",       "label": "Reagent / commodity stock adequate for next quarter",          "type": "yes_no",      "required": true  },
          { "id": "stockouts",           "label": "Stockouts in the past 30 days (specify items)",                "type": "textarea",    "required": false }
        ]
      },
      {
        "id": "wrap_up",
        "title": "Wrap-up & action items",
        "items": [
          { "id": "actions_agreed",      "label": "Action items agreed with the site team",                       "type": "textarea",    "required": true  },
          { "id": "next_visit_target",   "label": "Target date for the next visit (YYYY-MM-DD)",                  "type": "text",        "required": true  },
          { "id": "overall_assessment",  "label": "Overall site assessment",                                      "type": "select",      "required": true,
            "options": ["Green — on-track", "Amber — minor issues", "Red — significant deviation"] }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  2. Centre Director Monitoring Visit
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: Centre Director Monitoring Visit',
  'Captured by the Centre Director (or designate) when monitoring a study within their portfolio. Drives the RAG decision and any escalation to Level 2 / Level 3 of the non-conformity protocol.',
  'cd_visit',
  $JSON${
    "sections": [
      {
        "id": "study_basics",
        "title": "Study basics",
        "items": [
          { "id": "kemri_project_id",      "label": "KEMRI Project ID",                                    "type": "text",     "required": true  },
          { "id": "pi_present",            "label": "Principal Investigator present at the visit",         "type": "yes_no",   "required": true  },
          { "id": "kpi_dashboard_reviewed","label": "PI Dashboard / KPI report reviewed before the visit", "type": "yes_no",   "required": true  }
        ]
      },
      {
        "id": "performance",
        "title": "Performance review",
        "items": [
          { "id": "kpi_pct",         "label": "Aggregate KPI achievement vs target this quarter (%)",       "type": "number",   "required": true  },
          { "id": "milestone_status","label": "Most-recent milestone status",                               "type": "select",   "required": true,
            "options": ["Submitted on time & accepted", "Submitted late but accepted", "Returned for revision", "Pending PI submission"] },
          { "id": "absorption_pct",  "label": "Cumulative financial absorption (%)",                        "type": "number",   "required": false },
          { "id": "narrative",       "label": "Performance narrative (key wins / concerns)",                "type": "textarea", "required": true  }
        ]
      },
      {
        "id": "risks",
        "title": "Risks & escalations",
        "items": [
          { "id": "open_risks",          "label": "Open risks (technical / financial / regulatory / staff)", "type": "textarea", "required": false },
          { "id": "current_escalation",  "label": "Current escalation level",                                "type": "select",   "required": true,
            "options": ["None", "Level 1 — Caution", "Level 2 — Formal warning", "Level 3 — Corrective action", "Level 4 — DG / Board review"] },
          { "id": "mitigation_actions",  "label": "Mitigation actions agreed",                               "type": "textarea", "required": false }
        ]
      },
      {
        "id": "verdict",
        "title": "Director's verdict",
        "items": [
          { "id": "rag",       "label": "Assigned RAG status this period",                                  "type": "select",   "required": true,
            "options": ["Green", "Amber", "Red"] },
          { "id": "decision",  "label": "Decision on the milestone report",                                  "type": "select",   "required": true,
            "options": ["Accept", "Query the PI", "Escalate", "Defer pending external review"] },
          { "id": "rationale", "label": "Rationale for the decision",                                        "type": "textarea", "required": true  }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  3. MEL Data Quality Audit
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: MEL Data Quality Audit',
  'Independent audit run by the MEL Officer on a sample of records to validate the 8 automated DQA criteria. Used quarterly and ad-hoc on flagged studies.',
  'mel_audit',
  $JSON${
    "sections": [
      {
        "id": "audit_scope",
        "title": "Audit scope",
        "items": [
          { "id": "audit_type",        "label": "Audit type",                            "type": "select",   "required": true,
            "options": ["Routine quarterly audit", "Targeted (RAG-Red follow-up)", "Donor-driven audit", "Ad-hoc spot check"] },
          { "id": "sample_size",       "label": "Number of records sampled",             "type": "number",   "required": true  },
          { "id": "sampling_method",   "label": "Sampling method",                       "type": "select",   "required": true,
            "options": ["Simple random", "Stratified by site", "Systematic (every k-th)", "Census (all records)"] }
        ]
      },
      {
        "id": "dqa_checks",
        "title": "8 DQA criteria — pass / fail per check",
        "items": [
          { "id": "completeness",        "label": "1. Required field completeness ≥ 85 %",                "type": "yes_no", "required": true },
          { "id": "numeric_range",       "label": "2. Numeric range plausibility",                        "type": "yes_no", "required": true },
          { "id": "gps_validity",        "label": "3. GPS coordinate validation",                         "type": "yes_no", "required": true },
          { "id": "financial_arith",     "label": "4. Financial arithmetic (balance = budget − expenditure)","type": "yes_no", "required": true },
          { "id": "date_logic",          "label": "5. Date logic (period end ≥ study start)",             "type": "yes_no", "required": true },
          { "id": "cross_field",         "label": "6. Cross-field consistency (KPI %, expenditure ≤ budget)","type": "yes_no", "required": true },
          { "id": "seru_validity",       "label": "7. SERU approval not expired / expiring within 60 days","type": "yes_no", "required": true },
          { "id": "no_duplicates",       "label": "8. No duplicate Q-period submission",                  "type": "yes_no", "required": true }
        ]
      },
      {
        "id": "findings",
        "title": "Findings",
        "items": [
          { "id": "failed_records_count","label": "Records with at least one failure",     "type": "number",   "required": true  },
          { "id": "pass_rate_pct",       "label": "Overall pass-rate (%)",                 "type": "number",   "required": true  },
          { "id": "key_findings",        "label": "Key findings & root causes",            "type": "textarea", "required": true  },
          { "id": "verdict",             "label": "Audit verdict",                         "type": "select",   "required": true,
            "options": ["Pass", "Conditional pass — CAPA in 30 days", "Fail — escalate to Centre Director"] }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  4. SERU / Ethics Compliance Checklist
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: SERU / Ethics Compliance Checklist',
  'Annual or pre-renewal compliance check covering SERU approval, NACOSTI permit, informed consent, and data-protection obligations.',
  'compliance',
  $JSON${
    "sections": [
      {
        "id": "approvals",
        "title": "Regulatory approvals",
        "items": [
          { "id": "seru_number",        "label": "SERU protocol number",                           "type": "text",     "required": true  },
          { "id": "seru_expiry",        "label": "SERU expiry date (YYYY-MM-DD)",                  "type": "text",     "required": true  },
          { "id": "days_to_expiry",     "label": "Days until expiry",                              "type": "number",   "required": true  },
          { "id": "nacosti_valid",      "label": "NACOSTI permit valid for the current period",    "type": "yes_no",   "required": true  },
          { "id": "amendments_filed",   "label": "Protocol amendments filed since last approval",  "type": "textarea", "required": false }
        ]
      },
      {
        "id": "consent",
        "title": "Informed consent",
        "items": [
          { "id": "icf_version",        "label": "ICF version in current use",                     "type": "text",     "required": true  },
          { "id": "icf_local_lang",     "label": "ICF available in the participant's home language","type": "yes_no",   "required": true  },
          { "id": "consent_log_kept",   "label": "Consent register kept and reviewed weekly",      "type": "yes_no",   "required": true  },
          { "id": "minors_assent",      "label": "Where applicable, minors' assent procedure followed", "type": "select","required": true,
            "options": ["Yes", "Not applicable — adults only", "No — gap noted"] }
        ]
      },
      {
        "id": "privacy",
        "title": "Privacy & data protection",
        "items": [
          { "id": "deidentified",       "label": "Data set is de-identified before sharing",        "type": "yes_no",   "required": true  },
          { "id": "encrypted_storage",  "label": "Storage is encrypted at-rest (AES-256 or equiv.)","type": "yes_no",   "required": true  },
          { "id": "dsa_signed",         "label": "Data-sharing agreement signed for every external recipient", "type": "yes_no", "required": true },
          { "id": "kdpa_alignment",     "label": "Aligned with the Kenya Data Protection Act (2019)","type": "yes_no",   "required": true  }
        ]
      },
      {
        "id": "ae_reporting",
        "title": "Adverse-event reporting",
        "items": [
          { "id": "ae_log_current",     "label": "Adverse-event log up-to-date",                   "type": "yes_no",   "required": true  },
          { "id": "sae_72hr",           "label": "All SAEs reported to SERU within 72 hours",      "type": "yes_no",   "required": true  }
        ]
      },
      {
        "id": "verdict",
        "title": "Compliance verdict",
        "items": [
          { "id": "verdict",  "label": "Compliance verdict", "type": "select", "required": true,
            "options": ["Compliant", "Compliant with observations", "Non-compliant — CAPA required", "Non-compliant — escalate"] },
          { "id": "remarks",  "label": "Remarks",            "type": "textarea", "required": false }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  5. Adverse Event & Protocol Deviation Form
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: Adverse Event & Protocol Deviation Form',
  'Field-fillable form for capturing AEs, SAEs and protocol deviations. Should be filed within 72 hours of discovery for SAEs and 7 days for non-serious events.',
  'adverse_event',
  $JSON${
    "sections": [
      {
        "id": "event_basics",
        "title": "Event basics",
        "items": [
          { "id": "event_type",     "label": "Event type",                                   "type": "select",   "required": true,
            "options": ["Adverse Event (AE)", "Serious Adverse Event (SAE)", "Unexpected Life-Threatening or Grave Event", "Protocol Deviation", "Suspected Unexpected Serious Adverse Reaction (SUSAR)"] },
          { "id": "event_date",     "label": "Date of event (YYYY-MM-DD)",                   "type": "text",     "required": true  },
          { "id": "discovery_date", "label": "Date the event was discovered (YYYY-MM-DD)",   "type": "text",     "required": true  },
          { "id": "site",           "label": "Site where the event occurred",                "type": "text",     "required": true  },
          { "id": "reporter",       "label": "Reporter (name & role)",                       "type": "text",     "required": true  }
        ]
      },
      {
        "id": "description",
        "title": "Description",
        "items": [
          { "id": "narrative",      "label": "Narrative description (what happened)",        "type": "textarea", "required": true  },
          { "id": "severity",       "label": "Severity grade",                               "type": "select",   "required": true,
            "options": ["Mild (Grade 1)", "Moderate (Grade 2)", "Severe (Grade 3)", "Life-threatening (Grade 4)", "Fatal (Grade 5)"] },
          { "id": "expectedness",   "label": "Was the event expected per the protocol / IB?","type": "select",   "required": true,
            "options": ["Expected", "Unexpected"] },
          { "id": "relatedness",    "label": "Relationship to the study / intervention",     "type": "select",   "required": true,
            "options": ["Definitely related", "Probably related", "Possibly related", "Unlikely related", "Not related"] }
        ]
      },
      {
        "id": "actions",
        "title": "Action taken",
        "items": [
          { "id": "participant_status", "label": "Participant status after the event",       "type": "select",   "required": true,
            "options": ["Recovered fully", "Recovering / improving", "Continuing", "Worsening", "Deceased", "Lost to follow-up"] },
          { "id": "intervention",       "label": "Was the study intervention modified or withdrawn?", "type": "select", "required": true,
            "options": ["No change", "Dose / schedule modified", "Intervention temporarily held", "Permanently discontinued"] },
          { "id": "treatment_given",    "label": "Treatment / countermeasure provided",      "type": "textarea", "required": false }
        ]
      },
      {
        "id": "reporting",
        "title": "Onward reporting",
        "items": [
          { "id": "reported_to_pi",     "label": "Reported to the PI",                       "type": "yes_no",   "required": true  },
          { "id": "reported_to_seru",   "label": "Reported to SERU within 72 hours (SAE)",   "type": "yes_no",   "required": false },
          { "id": "reported_to_sponsor","label": "Reported to the sponsor / donor",          "type": "yes_no",   "required": true  },
          { "id": "follow_up_plan",     "label": "Follow-up plan",                           "type": "textarea", "required": true  }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  6. Laboratory QC Checklist
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: Laboratory QC Checklist',
  'Internal QC review of a laboratory supporting one or more KEMRI studies. Aligned with ISO 15189:2022 and KEMRI lab-management SOPs.',
  'lab_qc',
  $JSON${
    "sections": [
      {
        "id": "lab_info",
        "title": "Laboratory information",
        "items": [
          { "id": "lab_name",        "label": "Laboratory name",                                          "type": "text",   "required": true  },
          { "id": "iso15189",        "label": "ISO 15189 accredited",                                     "type": "yes_no", "required": true  },
          { "id": "accred_body",     "label": "Accrediting body (KENAS / SANAS / other)",                 "type": "text",   "required": false },
          { "id": "scope",           "label": "Assays in scope of this QC review",                        "type": "textarea","required": true  }
        ]
      },
      {
        "id": "pre_analytical",
        "title": "Pre-analytical",
        "items": [
          { "id": "reception_sop",   "label": "Sample reception SOP followed for every sample",           "type": "yes_no", "required": true  },
          { "id": "chain_custody",   "label": "Chain-of-custody log complete for the period",             "type": "yes_no", "required": true  },
          { "id": "storage_temps",   "label": "Storage temperatures logged (freezers / fridges)",         "type": "yes_no", "required": true  },
          { "id": "rejection_rate",  "label": "Sample rejection rate (%) for the period",                 "type": "number", "required": false }
        ]
      },
      {
        "id": "analytical",
        "title": "Analytical",
        "items": [
          { "id": "calibration",     "label": "Equipment calibration certificates current",               "type": "yes_no", "required": true  },
          { "id": "internal_qc",     "label": "Internal QC samples run with every batch",                 "type": "yes_no", "required": true  },
          { "id": "eqa_participation","label": "External Quality Assessment (EQA) participation current", "type": "yes_no", "required": true  },
          { "id": "eqa_z_score",     "label": "Most-recent EQA z-score / acceptable range result",        "type": "text",   "required": false }
        ]
      },
      {
        "id": "post_analytical",
        "title": "Post-analytical",
        "items": [
          { "id": "results_validated","label": "Results validated by the lab supervisor",                 "type": "yes_no", "required": true  },
          { "id": "lims_capture",    "label": "Results captured in LIMS within 24 hours",                 "type": "yes_no", "required": true  },
          { "id": "tat_compliance",  "label": "Turn-around-time (TAT) compliance (%)",                    "type": "number", "required": false }
        ]
      },
      {
        "id": "issues",
        "title": "Issues & CAPA",
        "items": [
          { "id": "deviations",      "label": "Deviations / non-conformities identified",                 "type": "textarea","required": false },
          { "id": "capa_initiated",  "label": "Corrective / preventive action (CAPA) initiated",          "type": "yes_no", "required": false },
          { "id": "next_review",     "label": "Target date for the next QC review (YYYY-MM-DD)",          "type": "text",   "required": true  }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  7. Equipment Audit Checklist
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: Equipment Audit Checklist',
  'Annual equipment audit; complements the §6 Equipment register on each study. One submission per asset.',
  'equipment_audit',
  $JSON${
    "sections": [
      {
        "id": "asset_info",
        "title": "Asset information",
        "items": [
          { "id": "asset_name",      "label": "Equipment / asset name",            "type": "text",   "required": true  },
          { "id": "asset_number",    "label": "Asset / serial number",             "type": "text",   "required": true  },
          { "id": "location",        "label": "Physical location (centre / lab / room)", "type": "text", "required": true },
          { "id": "custodian",       "label": "Custodian (name & role)",           "type": "text",   "required": true  },
          { "id": "purchase_date",   "label": "Purchase / commissioning date (YYYY-MM-DD)", "type": "text", "required": false }
        ]
      },
      {
        "id": "condition",
        "title": "Condition",
        "items": [
          { "id": "physical",        "label": "Physical condition",                "type": "select", "required": true,
            "options": ["Good", "Fair", "Poor", "Damaged / out-of-service"] },
          { "id": "in_service",      "label": "Currently in service",              "type": "yes_no", "required": true  },
          { "id": "last_serviced",   "label": "Last servicing date (YYYY-MM-DD)",  "type": "text",   "required": false }
        ]
      },
      {
        "id": "calibration",
        "title": "Calibration",
        "items": [
          { "id": "cal_due_passed",  "label": "Calibration due-date already passed", "type": "yes_no", "required": true  },
          { "id": "cal_cert",        "label": "Calibration certificate available",  "type": "yes_no", "required": true  }
        ]
      },
      {
        "id": "utilization",
        "title": "Utilization & disposition",
        "items": [
          { "id": "utilisation",     "label": "Utilization rate over the past 12 months", "type": "select", "required": true,
            "options": ["Low (< 25 %)", "Medium (25 – 75 %)", "High (> 75 %)", "Idle / out-of-service"] },
          { "id": "fit_for_purpose", "label": "Still fit-for-purpose for current studies", "type": "yes_no", "required": true  },
          { "id": "recommendation",  "label": "Recommendation",                            "type": "select", "required": true,
            "options": ["Retain", "Service / recalibrate", "Reallocate", "Dispose / write-off"] },
          { "id": "comments",        "label": "Comments",                                  "type": "textarea","required": false }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  8. Training & Capacity-Building Evaluation
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: Training & Capacity-Building Evaluation',
  'Post-training evaluation that feeds the §5 Capacity Building section of the milestone report. One submission per attendee.',
  'capacity_building',
  $JSON${
    "sections": [
      {
        "id": "training_basics",
        "title": "Training basics",
        "items": [
          { "id": "training_title",  "label": "Training title",                                   "type": "text",   "required": true  },
          { "id": "dates",           "label": "Dates (YYYY-MM-DD to YYYY-MM-DD)",                 "type": "text",   "required": true  },
          { "id": "venue",           "label": "Venue (city, county or virtual)",                  "type": "text",   "required": true  },
          { "id": "facilitators",    "label": "Facilitator(s)",                                   "type": "textarea","required": true  },
          { "id": "training_modes",  "label": "Mode(s) of delivery",                              "type": "multi_select","required": true,
            "options": ["Lecture", "Hands-on lab / wet-lab", "Tabletop / case-based", "Field practical", "E-learning"] }
        ]
      },
      {
        "id": "feedback",
        "title": "Participant feedback (1 = poor, 5 = excellent)",
        "items": [
          { "id": "relevance",       "label": "Relevance to my work (1–5)",                       "type": "number", "required": true  },
          { "id": "trainer",         "label": "Trainer effectiveness (1–5)",                      "type": "number", "required": true  },
          { "id": "materials",       "label": "Quality of materials (1–5)",                       "type": "number", "required": true  },
          { "id": "facilities",      "label": "Quality of facilities / platform (1–5)",           "type": "number", "required": true  }
        ]
      },
      {
        "id": "outcomes",
        "title": "Learning outcomes",
        "items": [
          { "id": "pre_test",        "label": "Pre-test score (%)",                               "type": "number", "required": false },
          { "id": "post_test",       "label": "Post-test score (%)",                              "type": "number", "required": false },
          { "id": "competencies",    "label": "Competencies you can now apply on the study",      "type": "textarea","required": true  }
        ]
      },
      {
        "id": "application",
        "title": "Application & follow-up",
        "items": [
          { "id": "will_apply",      "label": "I will apply these skills on my study within the next 30 days", "type": "yes_no", "required": true  },
          { "id": "barriers",        "label": "Anticipated barriers to application",              "type": "textarea","required": false },
          { "id": "support_needed",  "label": "Support / mentorship needed",                      "type": "textarea","required": false },
          { "id": "general_comments","label": "General comments",                                 "type": "textarea","required": false }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
--  9. Community / Stakeholder Engagement Feedback
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: Community / Stakeholder Engagement Feedback',
  'Captures feedback gathered from communities, county health teams, partners or donors during a study engagement event. Feeds the §10 Operations Feedback section of the milestone report.',
  'stakeholder_feedback',
  $JSON${
    "sections": [
      {
        "id": "event",
        "title": "Engagement event",
        "items": [
          { "id": "event_type",       "label": "Type of engagement",                              "type": "select", "required": true,
            "options": ["Community Advisory Board (CAB) meeting", "Baraza / village meeting", "County stakeholder forum", "Donor visit", "Internal stakeholder briefing", "Media / dissemination"] },
          { "id": "event_date",       "label": "Event date (YYYY-MM-DD)",                          "type": "text",   "required": true  },
          { "id": "venue",            "label": "Venue / county",                                   "type": "text",   "required": true  },
          { "id": "attendance_count", "label": "Attendance count",                                 "type": "number", "required": true  },
          { "id": "audience",         "label": "Primary audience(s)",                              "type": "multi_select","required": true,
            "options": ["Community members", "Community Health Volunteers", "County health management team", "Sub-county / facility staff", "Implementing partners", "Donors / funders", "Media", "Policy-makers"] }
        ]
      },
      {
        "id": "voice",
        "title": "Stakeholder voice",
        "items": [
          { "id": "top_issues",       "label": "Top 3 issues raised by participants",             "type": "textarea","required": true  },
          { "id": "suggestions",      "label": "Suggestions for improvement",                     "type": "textarea","required": false },
          { "id": "concerns",         "label": "Concerns or fears about the study",               "type": "textarea","required": false },
          { "id": "trust_score",      "label": "Community trust in the study (1 = low, 5 = high)","type": "number", "required": true  }
        ]
      },
      {
        "id": "response",
        "title": "Study response",
        "items": [
          { "id": "actions_taken",    "label": "Actions taken or committed to in response",       "type": "textarea","required": true  },
          { "id": "channels",         "label": "How findings will be communicated back",          "type": "multi_select","required": true,
            "options": ["Follow-up CAB", "SMS / WhatsApp", "Radio / TV", "Posters / leaflets", "Newsletter / report", "Direct visit / meeting"] },
          { "id": "next_engagement",  "label": "Date of next engagement event (YYYY-MM-DD)",      "type": "text",   "required": false }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
-- 10. Study Close-Out Checklist
-- ----------------------------------------------------------------------------
INSERT INTO data_collection_templates (name, description, template_category, structure, is_active)
VALUES (
  'KEMRI: Study Close-Out Checklist',
  'End-of-study close-out worksheet. All items must be evidenced before the Centre Director can mark the study as closed and the 7-year post-study output capture window can begin.',
  'study_closure',
  $JSON${
    "sections": [
      {
        "id": "final_reports",
        "title": "Final reports",
        "items": [
          { "id": "donor_final",    "label": "Final donor / sponsor report submitted",            "type": "yes_no", "required": true  },
          { "id": "seru_final",     "label": "Final report submitted to SERU",                    "type": "yes_no", "required": true  },
          { "id": "kemri_internal", "label": "Internal KEMRI close-out report filed",             "type": "yes_no", "required": true  }
        ]
      },
      {
        "id": "data_archive",
        "title": "Data archive & FAIR",
        "items": [
          { "id": "dataset_deposited","label": "Final cleaned dataset deposited to a repository", "type": "yes_no", "required": true  },
          { "id": "fair_score",     "label": "FAIR score recorded in the Outputs Registry (0–10)","type": "number", "required": false },
          { "id": "access_policy",  "label": "Access policy set",                                  "type": "select", "required": true,
            "options": ["Open access", "Restricted (DUA required)", "Closed (KEMRI internal)"] }
        ]
      },
      {
        "id": "outputs",
        "title": "Outputs registered",
        "items": [
          { "id": "publications",   "label": "All publications & abstracts logged in the registry","type": "yes_no", "required": true  },
          { "id": "policy_briefs",  "label": "Policy briefs disseminated and logged",              "type": "yes_no", "required": false },
          { "id": "ip_filed",       "label": "IP / patents filed where applicable",                "type": "select", "required": true,
            "options": ["Yes — filed", "Not applicable", "Pending decision"] }
        ]
      },
      {
        "id": "specimens",
        "title": "Biospecimens & samples",
        "items": [
          { "id": "specimen_disposition","label": "Disposition of biospecimens",                    "type": "select", "required": true,
            "options": ["Transferred to KEMRI biobank", "Returned to source / participants", "Destroyed per protocol", "Not applicable"] },
          { "id": "biobank_ref",         "label": "Biobank reference number(s)",                   "type": "text",   "required": false }
        ]
      },
      {
        "id": "personnel",
        "title": "Personnel",
        "items": [
          { "id": "staff_debrief",  "label": "Study team debrief held",                            "type": "yes_no", "required": true  },
          { "id": "training_archived","label": "Training records archived",                       "type": "yes_no", "required": true  }
        ]
      },
      {
        "id": "finance",
        "title": "Finance",
        "items": [
          { "id": "final_reconciliation","label": "Final financial reconciliation completed",     "type": "yes_no", "required": true  },
          { "id": "unspent_returned","label": "Unspent funds returned to donor / KEMRI",           "type": "select", "required": true,
            "options": ["Yes — returned", "Carried forward (approved)", "None — fully expended"] },
          { "id": "equip_disposition","label": "Equipment disposition recorded",                   "type": "yes_no", "required": true  }
        ]
      },
      {
        "id": "lessons",
        "title": "Lessons learned",
        "items": [
          { "id": "swot_completed", "label": "Final §11 SWOT completed",                          "type": "yes_no", "required": true  },
          { "id": "lessons_summary","label": "Top 3 lessons learned",                             "type": "textarea","required": true  }
        ]
      },
      {
        "id": "signoff",
        "title": "Sign-off",
        "items": [
          { "id": "pi_signoff",     "label": "PI sign-off (name & date)",                         "type": "text",   "required": true  },
          { "id": "cd_signoff",     "label": "Centre Director sign-off (name & date)",            "type": "text",   "required": true  },
          { "id": "mel_signoff",    "label": "MEL sign-off (name & date)",                        "type": "text",   "required": true  }
        ]
      }
    ]
  }$JSON$::jsonb,
  TRUE
);

-- ----------------------------------------------------------------------------
-- Sanity check
-- ----------------------------------------------------------------------------
-- After running this migration you should see 10 active KEMRI templates:
--   SELECT template_id, name, template_category
--     FROM data_collection_templates
--    WHERE COALESCE(voided,false) = FALSE
--      AND name LIKE 'KEMRI:%'
--    ORDER BY template_id;
