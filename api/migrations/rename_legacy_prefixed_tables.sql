-- Migration: Rename all  prefixed tables to remove  prefix
-- Description: Removes  prefix from all table names
-- Date: 2026-02-28
-- WARNING: This is a destructive operation. Backup your database first!

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Rename all  prefixed tables
RENAME TABLE activities TO activities;
RENAME TABLE annual_workplans TO annual_workplans;
RENAME TABLE assigned_assets TO assigned_assets;
RENAME TABLE attachments TO attachments;
RENAME TABLE attachmenttypes TO attachmenttypes;
RENAME TABLE attendance TO attendance;
RENAME TABLE categories TO categories;
RENAME TABLE contractor_users TO contractor_users;
RENAME TABLE contractors TO contractors;
RENAME TABLE counties TO counties;
RENAME TABLE departments TO departments;
RENAME TABLE employee_bank_details TO employee_bank_details;
RENAME TABLE employee_benefits TO employee_benefits;
RENAME TABLE employee_compensation TO employee_compensation;
RENAME TABLE employee_contracts TO employee_contracts;
RENAME TABLE employee_dependants TO employee_dependants;
RENAME TABLE employee_disciplinary TO employee_disciplinary;
RENAME TABLE employee_leave_entitlements TO employee_leave_entitlements;
RENAME TABLE employee_loans TO employee_loans;
RENAME TABLE employee_memberships TO employee_memberships;
RENAME TABLE employee_performance TO employee_performance;
RENAME TABLE employee_project_assignments TO employee_project_assignments;
RENAME TABLE employee_promotions TO employee_promotions;
RENAME TABLE employee_retirements TO employee_retirements;
RENAME TABLE employee_terminations TO employee_terminations;
RENAME TABLE employee_training TO employee_training;
RENAME TABLE financialyears TO financialyears;
RENAME TABLE inspection_teams TO inspection_teams;
RENAME TABLE job_groups TO job_groups;
RENAME TABLE leave_applications TO leave_applications;
RENAME TABLE leave_types TO leave_types;
RENAME TABLE milestone_activities TO milestone_activities;
RENAME TABLE milestone_attachments TO milestone_attachments;
RENAME TABLE monthly_payroll TO monthly_payroll;
RENAME TABLE participants TO participants;
RENAME TABLE payment_approval_history TO payment_approval_history;
RENAME TABLE payment_approval_levels TO payment_approval_levels;
RENAME TABLE payment_details TO payment_details;
RENAME TABLE payment_request_approvals TO payment_request_approvals;
RENAME TABLE payment_request_documents TO payment_request_documents;
RENAME TABLE payment_request_milestones TO payment_request_milestones;
RENAME TABLE payment_status_definitions TO payment_status_definitions;
RENAME TABLE planningdocuments TO planningdocuments;
RENAME TABLE privileges TO privileges;
RENAME TABLE programs TO programs;
RENAME TABLE project_assignments TO project_assignments;
RENAME TABLE project_climate_risk TO project_climate_risk;
RENAME TABLE project_concept_notes TO project_concept_notes;
RENAME TABLE project_contractor_assignments TO project_contractor_assignments;
RENAME TABLE project_counties TO project_counties;
RENAME TABLE project_documents TO project_documents;
RENAME TABLE project_esohsg_screening TO project_esohsg_screening;
RENAME TABLE project_financials TO project_financials;
RENAME TABLE project_fy_breakdown TO project_fy_breakdown;
RENAME TABLE project_hazard_assessment TO project_hazard_assessment;
RENAME TABLE project_implementation_plan TO project_implementation_plan;
RENAME TABLE project_m_and_e TO project_m_and_e;
RENAME TABLE project_maps TO project_maps;
RENAME TABLE project_milestone_implementations TO project_milestone_implementations;
RENAME TABLE project_milestones TO project_milestones;
RENAME TABLE project_monitoring_records TO project_monitoring_records;
RENAME TABLE project_needs_assessment TO project_needs_assessment;
RENAME TABLE project_payment_requests TO project_payment_requests;
RENAME TABLE project_photos TO project_photos;
RENAME TABLE project_readiness TO project_readiness;
RENAME TABLE project_risks TO project_risks;
RENAME TABLE project_roles TO project_roles;
RENAME TABLE project_staff_assignments TO project_staff_assignments;
RENAME TABLE project_stages TO project_stages;
RENAME TABLE project_stakeholders TO project_stakeholders;
RENAME TABLE project_subcounties TO project_subcounties;
RENAME TABLE project_sustainability TO project_sustainability;
RENAME TABLE project_wards TO project_wards;
RENAME TABLE project_workflow_steps TO project_workflow_steps;
RENAME TABLE project_workflows TO project_workflows;
RENAME TABLE projectfeedback TO projectfeedback;
RENAME TABLE projects TO projects;
RENAME TABLE public_holidays TO public_holidays;
RENAME TABLE role_privileges TO role_privileges;
RENAME TABLE roles TO roles;
RENAME TABLE sections TO sections;
RENAME TABLE staff TO staff;
RENAME TABLE strategicplans TO strategicplans;
RENAME TABLE studyparticipants TO studyparticipants;
RENAME TABLE subcounties TO subcounties;
RENAME TABLE subprograms TO subprograms;
RENAME TABLE users TO users;
RENAME TABLE wards TO wards;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Note: After running this migration, you must update all code references
-- from * to the new table names without the prefix.
