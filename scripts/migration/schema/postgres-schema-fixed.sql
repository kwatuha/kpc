SET search_path = public;

-- PostgreSQL Schema Converted from MySQL
-- Generated: 2026-02-28T15:55:31.559Z
-- Original: mysql-schema.sql
-- 
-- Note: This is an automated conversion. Please review and test thoroughly.
-- Some MySQL-specific features may need manual adjustment.

mysqldump: [Warning] password on the command line interface can be insecure.
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces
-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: gov_imbesdb
-- ------------------------------------------------------
-- Server version	8.0.44

--
-- Table structure for table activities
--

DROP TABLE IF EXISTS activities;

CREATE TABLE IF NOT EXISTS activities (
  activityId INTEGER NOT NULL,
  workplanId INTEGER DEFAULT NULL,
  projectId INTEGER DEFAULT NULL,
  activityName TEXT,
  activityDescription TEXT,
  responsibleOfficer VARCHAR(255) DEFAULT NULL,
  startDate DATE DEFAULT NULL,
  endDate DATE DEFAULT NULL,
  budgetAllocated NUMERIC(15,2) DEFAULT NULL,
  actualCost NUMERIC(15,2) DEFAULT NULL,
  percentageComplete NUMERIC(5,2) DEFAULT '0.00',
  activityStatus VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'not_started',
  voided BOOLEAN DEFAULT FALSE,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  CONSTRAINT activities_ibfk_1 FOREIGN KEY (workplanId) REFERENCES annual_workplans (workplanId),
  CONSTRAINT activities_ibfk_2 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT fk_activities_projects FOREIGN KEY (projectId) REFERENCES projects (id) )

--
-- Table structure for table annual_workplans
--

DROP TABLE IF EXISTS annual_workplans;

CREATE TABLE IF NOT EXISTS annual_workplans (
  workplanId INTEGER NOT NULL,
  subProgramId INTEGER DEFAULT NULL,
  financialYear VARCHAR(9) DEFAULT NULL,
  workplanName VARCHAR(255) DEFAULT NULL,
  workplanDescription TEXT,
  approvalStatus VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'draft',
  totalBudget NUMERIC(15,2) DEFAULT NULL,
  actualExpenditure NUMERIC(15,2) DEFAULT '0.00',
  performanceScore NUMERIC(5,2) DEFAULT NULL,
  voided BOOLEAN DEFAULT FALSE,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  challenges TEXT,
  lessons TEXT,
  recommendations TEXT,
  CONSTRAINT annual_workplans_ibfk_1 FOREIGN KEY (subProgramId) REFERENCES subprograms (subProgramId) )

--
-- Table structure for table approved_public_feedback
--

DROP TABLE IF EXISTS approved_public_feedback;

CREATE TABLE IF NOT EXISTS approved_public_feedback (
  id INTEGER NOT NULL,
  feedback_id INTEGER NOT NULL,
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approval_notes TEXT,
  
  CONSTRAINT approved_public_feedback_ibfk_1 FOREIGN KEY (feedback_id) REFERENCES public_feedback (id) ON DELETE CASCADE,
  CONSTRAINT approved_public_feedback_ibfk_2 FOREIGN KEY (approved_by) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table assigned_assets
--

DROP TABLE IF EXISTS assigned_assets;

CREATE TABLE IF NOT EXISTS assigned_assets (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  assetName VARCHAR(255) NOT NULL,
  serialNumber VARCHAR(255) DEFAULT NULL,
  assignmentDate DATE NOT NULL,
  returnDate DATE DEFAULT NULL,
  condition VARCHAR(255) DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT assigned_assets_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table attachments
--

DROP TABLE IF EXISTS attachments;

CREATE TABLE IF NOT EXISTS attachments (
  attachmentId INTEGER NOT NULL,
  assetId INTEGER DEFAULT NULL,
  typeId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  path TEXT,
  size INTEGER DEFAULT NULL,
  contentBlob VARCHAR(255) DEFAULT NULL,
  description TEXT,
  documentNo VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);
--
-- Table structure for table attachmenttypes
--

DROP TABLE IF EXISTS attachmenttypes;

CREATE TABLE IF NOT EXISTS attachmenttypes (
  typeId INTEGER NOT NULL,
  attachmentName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);
--
-- Table structure for table attendance
--

DROP TABLE IF EXISTS attendance;

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  DATE DATE NOT NULL,
  checkInTime TIMESTAMP NOT NULL,
  checkOutTime TIMESTAMP DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT attendance_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table budget_changes
--

DROP TABLE IF EXISTS budget_changes;

CREATE TABLE IF NOT EXISTS budget_changes (
  changeId INTEGER NOT NULL,
  budgetId INTEGER NOT NULL,
  itemId INTEGER DEFAULT NULL,
  changeType VARCHAR(50) CHARACTER SET utf8mb4 NOT NULL,
  changeReason TEXT CHARACTER SET utf8mb4 NOT NULL,
  status VARCHAR(50) CHARACTER SET utf8mb4 DEFAULT 'Pending Approval',
  oldValue JSONB DEFAULT NULL,
  newValue JSONB DEFAULT NULL,
  requestedBy INTEGER NOT NULL,
  requestedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  reviewedBy INTEGER DEFAULT NULL,
  reviewedAt TIMESTAMP DEFAULT NULL,
  reviewNotes TEXT CHARACTER SET utf8mb4,
  userId INTEGER NOT NULL,
  voided BOOLEAN DEFAULT FALSE,
  voidedBy INTEGER DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ,
  CONSTRAINT fk_budget_changes_budget FOREIGN KEY (budgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_item FOREIGN KEY (itemId) REFERENCES budget_items (itemId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_requestedBy FOREIGN KEY (requestedBy) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_reviewedBy FOREIGN KEY (reviewedBy) REFERENCES users (userId) ON DELETE SET NULL ON UPDATE CASCADE
);
--
-- Table structure for table budget_combinations
--

DROP TABLE IF EXISTS budget_combinations;

CREATE TABLE IF NOT EXISTS budget_combinations (
  combinationId INTEGER NOT NULL,
  combinedBudgetId INTEGER NOT NULL,
  containerBudgetId INTEGER NOT NULL,
  displayOrder INTEGER DEFAULT '0',
  userId INTEGER NOT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_combinations_combined FOREIGN KEY (combinedBudgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_combinations_container FOREIGN KEY (containerBudgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_combinations_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
);
--
-- Table structure for table budget_items
--

DROP TABLE IF EXISTS budget_items;

CREATE TABLE IF NOT EXISTS budget_items (
  itemId INTEGER NOT NULL,
  budgetId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  remarks TEXT CHARACTER SET utf8mb4,
  addedAfterApproval BOOLEAN DEFAULT FALSE,
  changeRequestId INTEGER DEFAULT NULL,
  userId INTEGER NOT NULL,
  voided BOOLEAN DEFAULT FALSE,
  voidedBy INTEGER DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ,
  CONSTRAINT fk_budget_items_budget FOREIGN KEY (budgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_budget_items_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budget_items_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
);
--
-- Table structure for table budgets
--

DROP TABLE IF EXISTS budgets;

CREATE TABLE IF NOT EXISTS budgets (
  budgetId INTEGER NOT NULL,
  budgetName VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL,
  budgetType VARCHAR(50) CHARACTER SET utf8mb4 DEFAULT 'Draft',
  isCombined BOOLEAN DEFAULT FALSE,
  parentBudgetId INTEGER DEFAULT NULL,
  finYearId INTEGER NOT NULL,
  departmentId INTEGER DEFAULT NULL,
  description TEXT CHARACTER SET utf8mb4,
  totalAmount NUMERIC(15,2) DEFAULT '0.00',
  status VARCHAR(50) CHARACTER SET utf8mb4 DEFAULT 'Draft',
  isFrozen BOOLEAN DEFAULT FALSE,
  requiresApprovalForChanges BOOLEAN DEFAULT TRUE,
  approvedBy INTEGER DEFAULT NULL,
  approvedAt TIMESTAMP DEFAULT NULL,
  rejectedBy INTEGER DEFAULT NULL,
  rejectedAt TIMESTAMP DEFAULT NULL,
  rejectionReason TEXT CHARACTER SET utf8mb4,
  userId INTEGER NOT NULL,
  voided BOOLEAN DEFAULT FALSE,
  voidedBy INTEGER DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ,
  CONSTRAINT fk_budgets_department FOREIGN KEY (departmentId) REFERENCES departments (departmentId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_finYear FOREIGN KEY (finYearId) REFERENCES financialyears (finYearId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_parent FOREIGN KEY (parentBudgetId) REFERENCES budgets (budgetId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
);
--
-- Table structure for table categories
--

DROP TABLE IF EXISTS categories;

CREATE TABLE IF NOT EXISTS categories (
  categoryId INTEGER NOT NULL,
  categoryName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  picture VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);
--
-- Table structure for table category_milestones
--

DROP TABLE IF EXISTS category_milestones;

CREATE TABLE IF NOT EXISTS category_milestones (
  milestoneId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  milestoneName VARCHAR(255) NOT NULL,
  description TEXT,
  sequenceOrder INTEGER NOT NULL,
  userId INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT category_milestones_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT fk_category_milestones_category FOREIGN KEY (categoryId) REFERENCES categories (categoryId) )

--
-- Table structure for table chat_message_reactions
--

DROP TABLE IF EXISTS chat_message_reactions;

CREATE TABLE IF NOT EXISTS chat_message_reactions (
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reaction_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_reactions_message FOREIGN KEY (message_id) REFERENCES chat_messages (message_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_reactions_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);
--
-- Table structure for table chat_messages
--

DROP TABLE IF EXISTS chat_messages;

CREATE TABLE IF NOT EXISTS chat_messages (
  message_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message_text TEXT,
  message_type VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'TEXT',
  file_url VARCHAR(500) DEFAULT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_size INTEGER DEFAULT NULL,
  reply_to_message_id INTEGER DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  ,
  CONSTRAINT fk_chat_messages_reply FOREIGN KEY (reply_to_message_id) REFERENCES chat_messages (message_id) ON DELETE SET NULL,
  CONSTRAINT fk_chat_messages_room FOREIGN KEY (room_id) REFERENCES chat_rooms (room_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users (userId) ON DELETE CASCADE
);
--
-- Table structure for table chat_room_participants
--

DROP TABLE IF EXISTS chat_room_participants;

CREATE TABLE IF NOT EXISTS chat_room_participants (
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP NULL DEFAULT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_chat_participants_room FOREIGN KEY (room_id) REFERENCES chat_rooms (room_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_participants_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);
--
-- Table structure for table chat_rooms
--

DROP TABLE IF EXISTS chat_rooms;

CREATE TABLE IF NOT EXISTS chat_rooms (
  room_id INTEGER NOT NULL,
  room_name VARCHAR(255) NOT NULL,
  room_type VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  project_id INTEGER DEFAULT NULL,
  department_id INTEGER DEFAULT NULL,
  created_by INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  role_id INTEGER DEFAULT NULL,
  ,
  CONSTRAINT fk_chat_rooms_creator FOREIGN KEY (created_by) REFERENCES users (userId) ON DELETE CASCADE,
  CONSTRAINT fk_chat_rooms_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_rooms_role FOREIGN KEY (role_id) REFERENCES roles (roleId) ON DELETE CASCADE
);
--
-- Table structure for table citizen_proposals
--

DROP TABLE IF EXISTS citizen_proposals;

CREATE TABLE IF NOT EXISTS citizen_proposals (
  id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  estimated_cost NUMERIC(15,2) NOT NULL,
  proposer_name VARCHAR(255) NOT NULL,
  proposer_email VARCHAR(255) NOT NULL,
  proposer_phone VARCHAR(50) NOT NULL,
  proposer_address TEXT,
  justification TEXT NOT NULL,
  expected_benefits TEXT NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'Under Review',
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INTEGER DEFAULT NULL,
  reviewed_at TIMESTAMP DEFAULT NULL,
  review_notes TEXT,
  voided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  approved_for_public BOOLEAN DEFAULT FALSE,
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT FALSE,
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  );
--
-- Table structure for table component_data_access_rules
--

DROP TABLE IF EXISTS component_data_access_rules;

CREATE TABLE IF NOT EXISTS component_data_access_rules (
  id INTEGER NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  rule_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comp_access_component FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) ON DELETE CASCADE
);
--
-- Table structure for table contractor_users
--

DROP TABLE IF EXISTS contractor_users;

CREATE TABLE IF NOT EXISTS contractor_users (
  contractorUserId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  contractorId INTEGER NOT NULL,
  CONSTRAINT contractor_users_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId),
  CONSTRAINT contractor_users_ibfk_2 FOREIGN KEY (contractorId) REFERENCES contractors (contractorId) )

--
-- Table structure for table contractors
--

DROP TABLE IF EXISTS contractors;

CREATE TABLE IF NOT EXISTS contractors (
  contractorId INTEGER NOT NULL,
  companyName VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE,
  userId INTEGER DEFAULT NULL);
--
-- Table structure for table counties
--

DROP TABLE IF EXISTS counties;

CREATE TABLE IF NOT EXISTS counties (
  countyId INTEGER NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  geoSpatial VARCHAR(255) DEFAULT NULL,
  geoCode VARCHAR(255) DEFAULT NULL,
  geoLat NUMERIC(10,7) DEFAULT NULL,
  geoLon NUMERIC(10,7) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT counties_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT counties_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table county_proposed_project_milestones
--

DROP TABLE IF EXISTS county_proposed_project_milestones;

CREATE TABLE IF NOT EXISTS county_proposed_project_milestones (
  id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE DEFAULT NULL,
  sequence_order INTEGER DEFAULT '0',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_milestone_project FOREIGN KEY (project_id) REFERENCES county_proposed_projects (id) ON DELETE CASCADE
);
--
-- Table structure for table county_proposed_projects
--

DROP TABLE IF EXISTS county_proposed_projects;

CREATE TABLE IF NOT EXISTS county_proposed_projects (
  id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  estimated_cost NUMERIC(15,2) NOT NULL,
  justification TEXT NOT NULL,
  expected_benefits TEXT NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'Planning',
  priority VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'Medium',
  department VARCHAR(255) NOT NULL,
  project_manager VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  progress NUMERIC(5,2) DEFAULT '0.00',
  budget_allocated NUMERIC(15,2) DEFAULT '0.00',
  budget_utilized NUMERIC(15,2) DEFAULT '0.00',
  stakeholders TEXT,
  risks TEXT,
  created_by INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  approved_for_public BOOLEAN DEFAULT FALSE,
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT FALSE,
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  );
--
-- Table structure for table dashboard_components
--

DROP TABLE IF EXISTS dashboard_components;

CREATE TABLE IF NOT EXISTS dashboard_components (
  id INTEGER NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  component_name VARCHAR(200) NOT NULL,
  component_type VARCHAR(50) NOT NULL,
  component_file VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP);
--
-- Table structure for table dashboard_permissions
--

DROP TABLE IF EXISTS dashboard_permissions;

CREATE TABLE IF NOT EXISTS dashboard_permissions (
  id INTEGER NOT NULL,
  permission_key VARCHAR(100) NOT NULL,
  permission_name VARCHAR(200) NOT NULL,
  description TEXT,
  component_key VARCHAR(100) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT dashboard_permissions_ibfk_1 FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) )

--
-- Table structure for table dashboard_tabs
--

DROP TABLE IF EXISTS dashboard_tabs;

CREATE TABLE IF NOT EXISTS dashboard_tabs (
  id INTEGER NOT NULL,
  tab_key VARCHAR(50) NOT NULL,
  tab_name VARCHAR(100) NOT NULL,
  tab_icon VARCHAR(100) DEFAULT NULL,
  tab_order INTEGER DEFAULT '0',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP);
--
-- Table structure for table departments
--

DROP TABLE IF EXISTS departments;

CREATE TABLE IF NOT EXISTS departments (
  departmentId INTEGER NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  alias TEXT,
  location TEXT,
  address TEXT,
  contactPerson VARCHAR(255) DEFAULT NULL,
  phoneNumber VARCHAR(255) DEFAULT NULL,
  email TEXT,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT departments_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT departments_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table employee_bank_details
--

DROP TABLE IF EXISTS employee_bank_details;

CREATE TABLE IF NOT EXISTS employee_bank_details (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  bankName VARCHAR(255) NOT NULL,
  accountNumber VARCHAR(255) NOT NULL,
  branchName VARCHAR(255) DEFAULT NULL,
  isPrimary SMALLINT DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_bank_details_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_benefits
--

DROP TABLE IF EXISTS employee_benefits;

CREATE TABLE IF NOT EXISTS employee_benefits (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  benefitName VARCHAR(255) NOT NULL,
  enrollmentDate DATE DEFAULT NULL,
  status VARCHAR(50) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_benefits_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_compensation
--

DROP TABLE IF EXISTS employee_compensation;

CREATE TABLE IF NOT EXISTS employee_compensation (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  baseSalary NUMERIC(10,2) NOT NULL,
  allowances NUMERIC(10,2) DEFAULT NULL,
  bonuses NUMERIC(10,2) DEFAULT NULL,
  bankName VARCHAR(255) DEFAULT NULL,
  accountNumber VARCHAR(255) DEFAULT NULL,
  payFrequency VARCHAR(50) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_compensation_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_contracts
--

DROP TABLE IF EXISTS employee_contracts;

CREATE TABLE IF NOT EXISTS employee_contracts (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  contractType VARCHAR(50) NOT NULL,
  contractStartDate DATE NOT NULL,
  contractEndDate DATE DEFAULT NULL,
  status VARCHAR(50) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_contracts_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_dependants
--

DROP TABLE IF EXISTS employee_dependants;

CREATE TABLE IF NOT EXISTS employee_dependants (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  dependantName VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  dateOfBirth DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_dependants_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_disciplinary
--

DROP TABLE IF EXISTS employee_disciplinary;

CREATE TABLE IF NOT EXISTS employee_disciplinary (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  actionType VARCHAR(255) NOT NULL,
  actionDate DATE NOT NULL,
  reason TEXT NOT NULL,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_disciplinary_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_leave_entitlements
--

DROP TABLE IF EXISTS employee_leave_entitlements;

CREATE TABLE IF NOT EXISTS employee_leave_entitlements (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  leaveTypeId INTEGER NOT NULL,
  INTEGER INTEGER NOT NULL,
  allocatedDays NUMERIC(5,2) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT employee_leave_entitlements_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId),
  CONSTRAINT employee_leave_entitlements_ibfk_2 FOREIGN KEY (leaveTypeId) REFERENCES leave_types (id) )

--
-- Table structure for table employee_loans
--

DROP TABLE IF EXISTS employee_loans;

CREATE TABLE IF NOT EXISTS employee_loans (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  loanAmount NUMERIC(10,2) NOT NULL,
  loanDate DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  repaymentSchedule TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_loans_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_memberships
--

DROP TABLE IF EXISTS employee_memberships;

CREATE TABLE IF NOT EXISTS employee_memberships (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  organizationName VARCHAR(255) NOT NULL,
  membershipNumber VARCHAR(255) DEFAULT NULL,
  startDate DATE DEFAULT NULL,
  endDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_memberships_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_performance
--

DROP TABLE IF EXISTS employee_performance;

CREATE TABLE IF NOT EXISTS employee_performance (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  reviewDate DATE NOT NULL,
  reviewScore INTEGER DEFAULT NULL,
  comments TEXT,
  reviewerId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN NOT NULL DEFAULT '0',
  CONSTRAINT performance_staff_fk FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_project_assignments
--

DROP TABLE IF EXISTS employee_project_assignments;

CREATE TABLE IF NOT EXISTS employee_project_assignments (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  projectId VARCHAR(255) NOT NULL,
  milestoneName VARCHAR(255) DEFAULT NULL,
  role VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  dueDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE,
  CONSTRAINT employee_project_assignments_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_promotions
--

DROP TABLE IF EXISTS employee_promotions;

CREATE TABLE IF NOT EXISTS employee_promotions (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  oldJobGroupId INTEGER DEFAULT NULL,
  newJobGroupId INTEGER DEFAULT NULL,
  promotionDate DATE NOT NULL,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_promotions_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId),
  CONSTRAINT employee_promotions_ibfk_2 FOREIGN KEY (oldJobGroupId) REFERENCES job_groups (id),
  CONSTRAINT employee_promotions_ibfk_3 FOREIGN KEY (newJobGroupId) REFERENCES job_groups (id) )

--
-- Table structure for table employee_retirements
--

DROP TABLE IF EXISTS employee_retirements;

CREATE TABLE IF NOT EXISTS employee_retirements (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  retirementDate DATE NOT NULL,
  retirementType VARCHAR(255) NOT NULL,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_retirements_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_terminations
--

DROP TABLE IF EXISTS employee_terminations;

CREATE TABLE IF NOT EXISTS employee_terminations (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  exitDate DATE NOT NULL,
  reason TEXT NOT NULL,
  exitInterviewDetails TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_terminations_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_training
--

DROP TABLE IF EXISTS employee_training;

CREATE TABLE IF NOT EXISTS employee_training (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  courseName VARCHAR(255) NOT NULL,
  institution VARCHAR(255) DEFAULT NULL,
  certificationName VARCHAR(255) DEFAULT NULL,
  completionDate DATE DEFAULT NULL,
  expiryDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT employee_training_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table feedback_moderation
--

DROP TABLE IF EXISTS feedback_moderation;

CREATE TABLE IF NOT EXISTS feedback_moderation (
  id INTEGER NOT NULL,
  feedback_id INTEGER NOT NULL,
  feedback_type VARCHAR(50) -- CHECK constraint removed (needs manual review) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'public_feedback',
  moderation_status VARCHAR(50) -- CHECK constraint removed (needs manual review) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'pending',
  moderation_reason VARCHAR(50) -- CHECK constraint removed (needs manual review) CHARACTER SET utf8mb4 DEFAULT NULL,
  custom_reason TEXT CHARACTER SET utf8mb4,
  moderator_notes TEXT CHARACTER SET utf8mb4,
  moderated_by INTEGER DEFAULT NULL,
  moderated_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ,
  CONSTRAINT feedback_moderation_ibfk_1 FOREIGN KEY (moderated_by) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table feedback_moderation_settings
--

DROP TABLE IF EXISTS feedback_moderation_settings;

CREATE TABLE IF NOT EXISTS feedback_moderation_settings (
  id INTEGER NOT NULL,
  setting_name VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL,
  setting_value TEXT CHARACTER SET utf8mb4 NOT NULL,
  description TEXT CHARACTER SET utf8mb4,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
--
-- Table structure for table financialyears
--

DROP TABLE IF EXISTS financialyears;

CREATE TABLE IF NOT EXISTS financialyears (
  finYearId INTEGER NOT NULL,
  finYearName VARCHAR(255) DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT financialyears_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT financialyears_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table inspection_teams
--

DROP TABLE IF EXISTS inspection_teams;

CREATE TABLE IF NOT EXISTS inspection_teams (
  id INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  role VARCHAR(100) DEFAULT NULL,
  voided SMALLINT NOT NULL DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inspection_teams_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT inspection_teams_ibfk_2 FOREIGN KEY (staffId) REFERENCES staff (staffId) ON DELETE RESTRICT,
  CONSTRAINT inspection_teams_ibfk_3 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT
);
--
-- Table structure for table job_groups
--

DROP TABLE IF EXISTS job_groups;

CREATE TABLE IF NOT EXISTS job_groups (
  id INTEGER NOT NULL,
  groupName VARCHAR(255) NOT NULL,
  salaryScale NUMERIC(10,2) DEFAULT NULL,
  description TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0'
);
--
-- Table structure for table leave_applications
--

DROP TABLE IF EXISTS leave_applications;

CREATE TABLE IF NOT EXISTS leave_applications (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  leaveTypeId INTEGER NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  numberOfDays INTEGER DEFAULT NULL,
  reason TEXT,
  handoverStaffId INTEGER DEFAULT NULL,
  handoverComments TEXT,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'Pending',
  approvedStartDate DATE DEFAULT NULL,
  approvedEndDate DATE DEFAULT NULL,
  actualReturnDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT leave_applications_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId),
  CONSTRAINT leave_applications_ibfk_2 FOREIGN KEY (handoverStaffId) REFERENCES staff (staffId),
  CONSTRAINT leave_applications_ibfk_3 FOREIGN KEY (leaveTypeId) REFERENCES leave_types (id) )

--
-- Table structure for table leave_types
--

DROP TABLE IF EXISTS leave_types;

CREATE TABLE IF NOT EXISTS leave_types (
  id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  numberOfDays INTEGER DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0'
);
--
-- Table structure for table milestone_activities
--

DROP TABLE IF EXISTS milestone_activities;

CREATE TABLE IF NOT EXISTS milestone_activities (
  id INTEGER NOT NULL,
  milestoneId INTEGER NOT NULL,
  activityId INTEGER NOT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT milestone_activities_ibfk_1 FOREIGN KEY (milestoneId) REFERENCES project_milestones (milestoneId),
  CONSTRAINT milestone_activities_ibfk_2 FOREIGN KEY (activityId) REFERENCES activities (activityId) )

--
-- Table structure for table milestone_attachments
--

DROP TABLE IF EXISTS milestone_attachments;

CREATE TABLE IF NOT EXISTS milestone_attachments (
  attachmentId INTEGER NOT NULL,
  milestoneId INTEGER NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT NULL,
  description TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE,
  fileSize INTEGER DEFAULT NULL,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT milestone_attachments_ibfk_1 FOREIGN KEY (milestoneId) REFERENCES project_milestones (milestoneId) ON DELETE CASCADE,
  CONSTRAINT milestone_attachments_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table moderation_queue
--

DROP TABLE IF EXISTS moderation_queue;

CREATE TABLE IF NOT EXISTS moderation_queue (
  id INTEGER NOT NULL,
  feedback_id INTEGER NOT NULL,
  feedback_type VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'public_feedback',
  priority VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'medium',
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP DEFAULT NULL,
  processed_by INTEGER DEFAULT NULL);
--
-- Table structure for table monthly_payroll
--

DROP TABLE IF EXISTS monthly_payroll;

CREATE TABLE IF NOT EXISTS monthly_payroll (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  payPeriod DATE NOT NULL,
  grossSalary NUMERIC(10,2) NOT NULL,
  netSalary NUMERIC(10,2) NOT NULL,
  allowances NUMERIC(10,2) DEFAULT NULL,
  deductions NUMERIC(10,2) DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT monthly_payroll_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table participants
--

DROP TABLE IF EXISTS participants;

CREATE TABLE IF NOT EXISTS participants (
  id INTEGER NOT NULL,
  individualId INTEGER DEFAULT NULL,
  householdId INTEGER DEFAULT NULL,
  gender VARCHAR(255) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  villageLocality INTEGER DEFAULT NULL,
  gpsLongitude NUMERIC(10,7) DEFAULT NULL,
  gpsLatitude NUMERIC(10,7) DEFAULT NULL,
  vectorBorneDiseaseStatus VARCHAR(255) DEFAULT NULL,
  malariaDiagnosis VARCHAR(255) DEFAULT NULL,
  dengueDiagnosis VARCHAR(255) DEFAULT NULL,
  leishmaniasisDiagnosis VARCHAR(255) DEFAULT NULL,
  waterSource VARCHAR(255) DEFAULT NULL,
  housingType VARCHAR(255) DEFAULT NULL,
  mosquitoNetUsage INTEGER DEFAULT NULL,
  educationLevel VARCHAR(255) DEFAULT NULL,
  occupation VARCHAR(255) DEFAULT NULL,
  incomeKshMonth NUMERIC(15,2) DEFAULT NULL,
  accessToHealthcareKm VARCHAR(255) DEFAULT NULL,
  climatePerceptionScore NUMERIC(15,2) DEFAULT NULL,
  createdOn TIMESTAMP DEFAULT NULL
);
--
-- Table structure for table payment_approval_history
--

DROP TABLE IF EXISTS payment_approval_history;

CREATE TABLE IF NOT EXISTS payment_approval_history (
  historyId INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  action VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  actionByUserId INTEGER NOT NULL,
  assignedToUserId INTEGER DEFAULT NULL,
  actionDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  CONSTRAINT payment_approval_history_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId),
  CONSTRAINT payment_approval_history_ibfk_2 FOREIGN KEY (actionByUserId) REFERENCES users (userId),
  CONSTRAINT payment_approval_history_ibfk_3 FOREIGN KEY (assignedToUserId) REFERENCES users (userId) )

--
-- Table structure for table payment_approval_levels
--

DROP TABLE IF EXISTS payment_approval_levels;

CREATE TABLE IF NOT EXISTS payment_approval_levels (
  levelId INTEGER NOT NULL,
  levelName VARCHAR(255) NOT NULL,
  roleId INTEGER NOT NULL,
  approvalOrder INTEGER NOT NULL,
  workflowId INTEGER DEFAULT NULL,
  
  CONSTRAINT payment_approval_levels_ibfk_1 FOREIGN KEY (roleId) REFERENCES roles (roleId),
  CONSTRAINT payment_approval_levels_ibfk_2 FOREIGN KEY (workflowId) REFERENCES project_workflows (workflowId) )

--
-- Table structure for table payment_details
--

DROP TABLE IF EXISTS payment_details;

CREATE TABLE IF NOT EXISTS payment_details (
  detailId INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  paymentMode VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  bankName VARCHAR(255) DEFAULT NULL,
  accountNumber VARCHAR(255) DEFAULT NULL,
  transactionId VARCHAR(255) DEFAULT NULL,
  paidByUserId INTEGER NOT NULL,
  paidAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdByUserId INTEGER DEFAULT NULL,
  voided SMALLINT NOT NULL DEFAULT '0',
  voidedByUserId INTEGER DEFAULT NULL,
  CONSTRAINT payment_details_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId),
  CONSTRAINT payment_details_ibfk_2 FOREIGN KEY (paidByUserId) REFERENCES users (userId),
  CONSTRAINT payment_details_ibfk_3 FOREIGN KEY (createdByUserId) REFERENCES users (userId),
  CONSTRAINT payment_details_ibfk_4 FOREIGN KEY (voidedByUserId) REFERENCES users (userId) )

--
-- Table structure for table payment_request_approvals
--

DROP TABLE IF EXISTS payment_request_approvals;

CREATE TABLE IF NOT EXISTS payment_request_approvals (
  approvalId INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  stage VARCHAR(100) NOT NULL,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  comments TEXT,
  actionByUserId INTEGER NOT NULL,
  actionDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT NOT NULL DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT NULL,
  updatedAt TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT payment_request_approvals_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT payment_request_approvals_ibfk_2 FOREIGN KEY (actionByUserId) REFERENCES users (userId) ON DELETE RESTRICT
);
--
-- Table structure for table payment_request_documents
--

DROP TABLE IF EXISTS payment_request_documents;

CREATE TABLE IF NOT EXISTS payment_request_documents (
  id INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  documentType VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  documentPath VARCHAR(255) NOT NULL,
  description TEXT,
  uploadedByUserId INTEGER NOT NULL,
  voided SMALLINT NOT NULL DEFAULT '0',
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_request_documents_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT payment_request_documents_ibfk_2 FOREIGN KEY (uploadedByUserId) REFERENCES users (userId) ON DELETE RESTRICT
);
--
-- Table structure for table payment_request_milestones
--

DROP TABLE IF EXISTS payment_request_milestones;

CREATE TABLE IF NOT EXISTS payment_request_milestones (
  id INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  activityId INTEGER NOT NULL,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL DEFAULT 'accomplished',
  voided SMALLINT NOT NULL DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_request_milestones_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT payment_request_milestones_ibfk_2 FOREIGN KEY (activityId) REFERENCES activities (activityId) ON DELETE CASCADE,
  CONSTRAINT payment_request_milestones_ibfk_3 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT
);
--
-- Table structure for table payment_status_definitions
--

DROP TABLE IF EXISTS payment_status_definitions;

CREATE TABLE IF NOT EXISTS payment_status_definitions (
  statusId INTEGER NOT NULL,
  statusName VARCHAR(255) NOT NULL,
  description TEXT);
--
-- Table structure for table planningdocuments
--

DROP TABLE IF EXISTS planningdocuments;

CREATE TABLE IF NOT EXISTS planningdocuments (
  attachmentId INTEGER NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT NULL,
  fileSize INTEGER DEFAULT NULL,
  description TEXT,
  entityId INTEGER NOT NULL,
  entityType VARCHAR(50) NOT NULL,
  uploadedBy INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE);
--
-- Table structure for table privileges
--

DROP TABLE IF EXISTS privileges;

CREATE TABLE IF NOT EXISTS privileges (
  privilegeId INTEGER NOT NULL,
  privilegeName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL);
--
-- Table structure for table programs
--

DROP TABLE IF EXISTS programs;

CREATE TABLE IF NOT EXISTS programs (
  programId INTEGER NOT NULL,
  cidpid VARCHAR(255) DEFAULT NULL,
  departmentId INTEGER DEFAULT NULL,
  sectionId INTEGER DEFAULT NULL,
  programme TEXT,
  needsPriorities TEXT,
  strategies VARCHAR(255) DEFAULT NULL,
  remarks TEXT,
  objectives TEXT,
  outcomes TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  description TEXT,
  CONSTRAINT programs_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT programs_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table project_announcements
--

DROP TABLE IF EXISTS project_announcements;

CREATE TABLE IF NOT EXISTS project_announcements (
  id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  type VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  DATE DATE NOT NULL,
  TIME TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  organizer VARCHAR(255) NOT NULL,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'Upcoming',
  priority VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'Medium',
  image_url VARCHAR(500) DEFAULT NULL,
  attendees INTEGER DEFAULT '0',
  max_attendees INTEGER DEFAULT '0',
  created_by INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  approved_for_public BOOLEAN DEFAULT FALSE,
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT FALSE,
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  );
--
-- Table structure for table project_assignments
--

DROP TABLE IF EXISTS project_assignments;

CREATE TABLE IF NOT EXISTS project_assignments (
  id INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  milestoneName VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL,
  dueDate DATE DEFAULT NULL,
  completionDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT project_assignments_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_assignments_ibfk_2 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table project_climate_risk
--

DROP TABLE IF EXISTS project_climate_risk;

CREATE TABLE IF NOT EXISTS project_climate_risk (
  climateRiskId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  hazardName VARCHAR(255) NOT NULL,
  hazardExposure VARCHAR(50) DEFAULT NULL,
  vulnerability VARCHAR(50) DEFAULT NULL,
  riskLevel VARCHAR(50) DEFAULT NULL,
  riskReductionStrategies TEXT,
  riskReductionCosts NUMERIC(15,2) DEFAULT NULL,
  resourcesRequired TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_climate_risk_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_concept_notes
--

DROP TABLE IF EXISTS project_concept_notes;

CREATE TABLE IF NOT EXISTS project_concept_notes (
  conceptNoteId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  situationAnalysis TEXT,
  problemStatement TEXT,
  relevanceProjectIdea TEXT,
  scopeOfProject TEXT,
  projectGoal TEXT,
  goalIndicator TEXT,
  goalMeansVerification TEXT,
  goalAssumptions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_concept_notes_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_contractor_assignments
--

DROP TABLE IF EXISTS project_contractor_assignments;

CREATE TABLE IF NOT EXISTS project_contractor_assignments (
  projectId INTEGER NOT NULL,
  contractorId INTEGER NOT NULL,
  assignmentDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT project_contractor_assignments_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_contractor_assignments_ibfk_2 FOREIGN KEY (contractorId) REFERENCES contractors (contractorId) )

--
-- Table structure for table project_counties
--

DROP TABLE IF EXISTS project_counties;

CREATE TABLE IF NOT EXISTS project_counties (
  projectId INTEGER NOT NULL,
  countyId INTEGER NOT NULL,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT fk_project_county_county FOREIGN KEY (countyId) REFERENCES counties (countyId) ON DELETE CASCADE,
  CONSTRAINT fk_project_county_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_documents
--

DROP TABLE IF EXISTS project_documents;

CREATE TABLE IF NOT EXISTS project_documents (
  id INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  milestoneId INTEGER DEFAULT NULL,
  requestId INTEGER DEFAULT NULL,
  documentType VARCHAR(50) NOT NULL,
  documentCategory VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  documentPath VARCHAR(255) NOT NULL,
  description TEXT,
  userId INTEGER NOT NULL,
  isProjectCover BOOLEAN NOT NULL DEFAULT '0',
  displayOrder INTEGER DEFAULT NULL,
  voided BOOLEAN NOT NULL DEFAULT '0',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL DEFAULT 'pending_review',
  progressPercentage NUMERIC(5,2) DEFAULT NULL,
  originalFileName VARCHAR(255) DEFAULT NULL,
  ,
  CONSTRAINT fk_documents_milestones FOREIGN KEY (milestoneId) REFERENCES project_milestones (milestoneId) ON DELETE SET NULL,
  CONSTRAINT fk_documents_projects FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_requests FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE SET NULL,
  CONSTRAINT fk_documents_users FOREIGN KEY (userId) REFERENCES users (userId) )

--
-- Table structure for table project_esohsg_screening
--

DROP TABLE IF EXISTS project_esohsg_screening;

CREATE TABLE IF NOT EXISTS project_esohsg_screening (
  screeningId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  emcaTriggers BOOLEAN DEFAULT NULL,
  emcaDescription TEXT,
  worldBankSafeguardApplicable BOOLEAN DEFAULT NULL,
  worldBankStandards TEXT,
  goKPoliciesApplicable BOOLEAN DEFAULT NULL,
  goKPoliciesLaws TEXT,
  environmentalHealthSafetyImpacts JSONB DEFAULT NULL,
  socialImpacts JSONB DEFAULT NULL,
  publicParticipationConsultation JSONB DEFAULT NULL,
  screeningResultOutcome TEXT,
  specialConditions TEXT,
  screeningUndertakenBy VARCHAR(255) DEFAULT NULL,
  screeningDesignation VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_esohsg_screening_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_financials
--

DROP TABLE IF EXISTS project_financials;

CREATE TABLE IF NOT EXISTS project_financials (
  financialsId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  capitalCostConsultancy NUMERIC(15,2) DEFAULT NULL,
  capitalCostLandAcquisition NUMERIC(15,2) DEFAULT NULL,
  capitalCostSitePrep NUMERIC(15,2) DEFAULT NULL,
  capitalCostConstruction NUMERIC(15,2) DEFAULT NULL,
  capitalCostPlantEquipment NUMERIC(15,2) DEFAULT NULL,
  capitalCostFixturesFittings NUMERIC(15,2) DEFAULT NULL,
  capitalCostOther NUMERIC(15,2) DEFAULT NULL,
  recurrentCostLabor NUMERIC(15,2) DEFAULT NULL,
  recurrentCostOperating NUMERIC(15,2) DEFAULT NULL,
  recurrentCostMaintenance NUMERIC(15,2) DEFAULT NULL,
  recurrentCostOther NUMERIC(15,2) DEFAULT NULL,
  proposedSourceFinancing VARCHAR(255) DEFAULT NULL,
  costImplicationsRelatedProjects TEXT,
  landExpropriationRequired BOOLEAN DEFAULT NULL,
  landExpropriationExpenses NUMERIC(15,2) DEFAULT NULL,
  compensationRequired BOOLEAN DEFAULT NULL,
  otherAttendantCosts TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_financials_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_fy_breakdown
--

DROP TABLE IF EXISTS project_fy_breakdown;

CREATE TABLE IF NOT EXISTS project_fy_breakdown (
  fyBreakdownId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  financialYear VARCHAR(20) NOT NULL,
  totalCost NUMERIC(15,2) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_fy_breakdown_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_hazard_assessment
--

DROP TABLE IF EXISTS project_hazard_assessment;

CREATE TABLE IF NOT EXISTS project_hazard_assessment (
  hazardId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  hazardName VARCHAR(255) NOT NULL,
  question TEXT,
  answerYesNo BOOLEAN DEFAULT NULL,
  remarks TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_hazard_assessment_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_implementation_plan
--

DROP TABLE IF EXISTS project_implementation_plan;

CREATE TABLE IF NOT EXISTS project_implementation_plan (
  planId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  description TEXT,
  keyPerformanceIndicators TEXT,
  responsiblePersons TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_implementation_plan_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_m_and_e
--

DROP TABLE IF EXISTS project_m_and_e;

CREATE TABLE IF NOT EXISTS project_m_and_e (
  mAndEId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  description TEXT,
  mechanismsInPlace TEXT,
  resourcesBudgetary TEXT,
  resourcesHuman TEXT,
  dataGatheringMethod TEXT,
  reportingChannels TEXT,
  lessonsLearnedProcess TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_m_and_e_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_maps
--

DROP TABLE IF EXISTS project_maps;

CREATE TABLE IF NOT EXISTS project_maps (
  mapId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  map TEXT,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);
--
-- Table structure for table project_milestone_implementations
--

DROP TABLE IF EXISTS project_milestone_implementations;

CREATE TABLE IF NOT EXISTS project_milestone_implementations (
  categoryId INTEGER NOT NULL,
  categoryName VARCHAR(255) NOT NULL,
  description TEXT,
  userId INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT project_milestone_implementations_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table project_milestones
--

DROP TABLE IF EXISTS project_milestones;

CREATE TABLE IF NOT EXISTS project_milestones (
  milestoneId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  milestoneName VARCHAR(255) NOT NULL,
  description TEXT,
  dueDate DATE DEFAULT NULL,
  sequenceOrder INTEGER DEFAULT NULL,
  status VARCHAR(255) DEFAULT 'Not Started',
  completed BOOLEAN DEFAULT FALSE,
  completedDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE,
  voidedBy INTEGER DEFAULT NULL,
  progress NUMERIC(5,2) DEFAULT '0.00',
  weight NUMERIC(5,2) DEFAULT '1.00',
  CONSTRAINT project_milestones_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT project_milestones_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT project_milestones_ibfk_3 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT project_milestones_ibfk_4 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT project_milestones_ibfk_5 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table project_monitoring_records
--

DROP TABLE IF EXISTS project_monitoring_records;

CREATE TABLE IF NOT EXISTS project_monitoring_records (
  recordId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  observationDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  comment TEXT,
  warningLevel VARCHAR(20) DEFAULT 'None',
  isRoutineObservation BOOLEAN DEFAULT TRUE,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  recommendations TEXT,
  challenges TEXT,
  CONSTRAINT project_monitoring_records_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_monitoring_records_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) )

--
-- Table structure for table project_needs_assessment
--

DROP TABLE IF EXISTS project_needs_assessment;

CREATE TABLE IF NOT EXISTS project_needs_assessment (
  needsAssessmentId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  targetBeneficiaries TEXT,
  estimateEndUsers TEXT,
  physicalDemandCompletion TEXT,
  proposedPhysicalCapacity TEXT,
  mainBenefitsAsset TEXT,
  significantExternalBenefitsNegativeEffects TEXT,
  significantDifferencesBenefitsAlternatives TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_needs_assessment_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_payment_requests
--

DROP TABLE IF EXISTS project_payment_requests;

CREATE TABLE IF NOT EXISTS project_payment_requests (
  requestId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  contractorId INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  currentApprovalLevelId INTEGER DEFAULT NULL,
  paymentStatusId INTEGER DEFAULT NULL,
  submittedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  approvedByUserId INTEGER DEFAULT NULL,
  approvalDate TIMESTAMP NULL DEFAULT NULL,
  rejectionReason TEXT,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT NULL,
  updatedAt TIMESTAMP NULL DEFAULT NULL,
  ,
  CONSTRAINT fk_payment_request_approval_level FOREIGN KEY (currentApprovalLevelId) REFERENCES payment_approval_levels (levelId),
  CONSTRAINT fk_payment_request_status FOREIGN KEY (paymentStatusId) REFERENCES payment_status_definitions (statusId),
  CONSTRAINT project_payment_requests_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_payment_requests_ibfk_2 FOREIGN KEY (contractorId) REFERENCES contractors (contractorId) )

--
-- Table structure for table project_photos
--

DROP TABLE IF EXISTS project_photos;

CREATE TABLE IF NOT EXISTS project_photos (
  photoId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT NULL,
  fileSize INTEGER DEFAULT NULL,
  description TEXT,
  isDefault BOOLEAN DEFAULT FALSE,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT FALSE,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT project_photos_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_photos_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId),
  CONSTRAINT project_photos_ibfk_3 FOREIGN KEY (voidedBy) REFERENCES users (userId) )

--
-- Table structure for table project_readiness
--

DROP TABLE IF EXISTS project_readiness;

CREATE TABLE IF NOT EXISTS project_readiness (
  readinessId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  designsPreparedApproved BOOLEAN DEFAULT NULL,
  landAcquiredSiteReady BOOLEAN DEFAULT NULL,
  regulatoryApprovalsObtained BOOLEAN DEFAULT NULL,
  governmentAgenciesInvolved TEXT,
  consultationsUndertaken BOOLEAN DEFAULT NULL,
  canBePhasedScaledDown BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_readiness_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_risks
--

DROP TABLE IF EXISTS project_risks;

CREATE TABLE IF NOT EXISTS project_risks (
  riskId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  riskDescription TEXT,
  likelihood VARCHAR(50) DEFAULT NULL,
  impact VARCHAR(50) DEFAULT NULL,
  mitigationStrategy TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT project_risks_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_roles
--

DROP TABLE IF EXISTS project_roles;

CREATE TABLE IF NOT EXISTS project_roles (
  roleId INTEGER NOT NULL,
  roleName VARCHAR(255) DEFAULT NULL,
  description TEXT
);
--
-- Table structure for table project_staff_assignments
--

DROP TABLE IF EXISTS project_staff_assignments;

CREATE TABLE IF NOT EXISTS project_staff_assignments (
  assignmentId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  staffId INTEGER DEFAULT NULL,
  roleId INTEGER DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  isActive BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  voided SMALLINT DEFAULT '0'
);
--
-- Table structure for table project_stages
--

DROP TABLE IF EXISTS project_stages;

CREATE TABLE IF NOT EXISTS project_stages (
  stageId INTEGER NOT NULL,
  stageName VARCHAR(255) NOT NULL,
  description TEXT);
--
-- Table structure for table project_stakeholders
--

DROP TABLE IF EXISTS project_stakeholders;

CREATE TABLE IF NOT EXISTS project_stakeholders (
  stakeholderId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  stakeholderName VARCHAR(255) DEFAULT NULL,
  levelInfluence VARCHAR(50) DEFAULT NULL,
  engagementStrategy TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT project_stakeholders_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_subcounties
--

DROP TABLE IF EXISTS project_subcounties;

CREATE TABLE IF NOT EXISTS project_subcounties (
  projectId INTEGER NOT NULL,
  subcountyId INTEGER NOT NULL,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT fk_project_subcounty_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_subcounty_subcounty FOREIGN KEY (subcountyId) REFERENCES subcounties (subcountyId) ON DELETE CASCADE
);
--
-- Table structure for table project_sustainability
--

DROP TABLE IF EXISTS project_sustainability;

CREATE TABLE IF NOT EXISTS project_sustainability (
  sustainabilityId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  description TEXT,
  owningOrganization VARCHAR(255) DEFAULT NULL,
  hasAssetRegister BOOLEAN DEFAULT NULL,
  technicalCapacityAdequacy TEXT,
  managerialCapacityAdequacy TEXT,
  financialCapacityAdequacy TEXT,
  avgAnnualPersonnelCost NUMERIC(15,2) DEFAULT NULL,
  annualOperationMaintenanceCost NUMERIC(15,2) DEFAULT NULL,
  otherOperatingCosts NUMERIC(15,2) DEFAULT NULL,
  revenueSources TEXT,
  operationalCostsCoveredByRevenue BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  
  CONSTRAINT project_sustainability_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);
--
-- Table structure for table project_wards
--

DROP TABLE IF EXISTS project_wards;

CREATE TABLE IF NOT EXISTS project_wards (
  projectId INTEGER NOT NULL,
  wardId INTEGER NOT NULL,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT fk_project_ward_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_ward_ward FOREIGN KEY (wardId) REFERENCES wards (wardId) ON DELETE CASCADE
);
--
-- Table structure for table project_workflow_steps
--

DROP TABLE IF EXISTS project_workflow_steps;

CREATE TABLE IF NOT EXISTS project_workflow_steps (
  stepId INTEGER NOT NULL,
  workflowId INTEGER NOT NULL,
  stageId INTEGER NOT NULL,
  stepOrder INTEGER NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT NOT NULL DEFAULT '0',
  createdByUserId INTEGER DEFAULT NULL,
  voidedByUserId INTEGER DEFAULT NULL,
  ,
  CONSTRAINT project_workflow_steps_ibfk_1 FOREIGN KEY (workflowId) REFERENCES project_workflows (workflowId),
  CONSTRAINT project_workflow_steps_ibfk_2 FOREIGN KEY (stageId) REFERENCES project_stages (stageId),
  CONSTRAINT project_workflow_steps_ibfk_3 FOREIGN KEY (createdByUserId) REFERENCES users (userId),
  CONSTRAINT project_workflow_steps_ibfk_4 FOREIGN KEY (voidedByUserId) REFERENCES users (userId) )

--
-- Table structure for table project_workflows
--

DROP TABLE IF EXISTS project_workflows;

CREATE TABLE IF NOT EXISTS project_workflows (
  workflowId INTEGER NOT NULL,
  workflowName VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT NOT NULL DEFAULT '0',
  createdByUserId INTEGER DEFAULT NULL,
  voidedByUserId INTEGER DEFAULT NULL,
  CONSTRAINT project_workflows_ibfk_1 FOREIGN KEY (createdByUserId) REFERENCES users (userId),
  CONSTRAINT project_workflows_ibfk_2 FOREIGN KEY (voidedByUserId) REFERENCES users (userId) )

--
-- Table structure for table projectfeedback
--

DROP TABLE IF EXISTS projectfeedback;

CREATE TABLE IF NOT EXISTS projectfeedback (
  feedbackId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  feedbackMessage TEXT,
  response VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL,
  createdBy VARCHAR(255) DEFAULT NULL,
  updatedBy TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  voidingReason VARCHAR(255) DEFAULT NULL,
  submittedDate TIMESTAMP DEFAULT NULL
);
--
-- Table structure for table projects
--

DROP TABLE IF EXISTS projects;

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER NOT NULL,
  projectName VARCHAR(255) DEFAULT NULL,
  directorate VARCHAR(255) DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  costOfProject NUMERIC(15,2) DEFAULT NULL,
  paidOut NUMERIC(15,2) DEFAULT NULL,
  objective TEXT,
  expectedOutput TEXT,
  principalInvestigator TEXT,
  expectedOutcome TEXT,
  status VARCHAR(255) DEFAULT NULL,
  statusReason TEXT,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  principalInvestigatorStaffId INTEGER DEFAULT NULL,
  departmentId INTEGER DEFAULT NULL,
  sectionId INTEGER DEFAULT NULL,
  finYearId INTEGER DEFAULT NULL,
  programId INTEGER DEFAULT NULL,
  subProgramId INTEGER DEFAULT NULL,
  categoryId INTEGER DEFAULT NULL,
  projectDescription TEXT,
  userId INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT FALSE,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  defaultPhotoId INTEGER DEFAULT NULL,
  overallProgress NUMERIC(5,2) DEFAULT '0.00',
  workflowId INTEGER DEFAULT NULL,
  currentStageId INTEGER DEFAULT NULL,
  approved_for_public BOOLEAN DEFAULT FALSE,
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT FALSE,
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  ,
  ,
  CONSTRAINT fk_default_photo FOREIGN KEY (defaultPhotoId) REFERENCES project_photos (photoId),
  CONSTRAINT fk_projects_approved_by FOREIGN KEY (approved_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT fk_projects_revision_requested_by FOREIGN KEY (revision_requested_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT projects_ibfk_1 FOREIGN KEY (categoryId) REFERENCES project_milestone_implementations (categoryId) ON DELETE SET NULL,
  CONSTRAINT projects_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT projects_ibfk_3 FOREIGN KEY (workflowId) REFERENCES project_workflows (workflowId),
  CONSTRAINT projects_ibfk_4 FOREIGN KEY (currentStageId) REFERENCES project_stages (stageId) )

--
-- Table structure for table public_feedback
--

DROP TABLE IF EXISTS public_feedback;

CREATE TABLE IF NOT EXISTS public_feedback (
  id INTEGER NOT NULL,
  name VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  email VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  phone VARCHAR(50) CHARACTER SET utf8mb4 DEFAULT NULL,
  subject VARCHAR(500) CHARACTER SET utf8mb4 DEFAULT NULL,
  message TEXT CHARACTER SET utf8mb4 NOT NULL,
  project_id INTEGER DEFAULT NULL,
  status VARCHAR(50) -- CHECK constraint removed (needs manual review) CHARACTER SET utf8mb4 DEFAULT 'pending',
  admin_response TEXT CHARACTER SET utf8mb4,
  responded_by INTEGER DEFAULT NULL,
  responded_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rating_overall_support SMALLINT DEFAULT NULL,
  rating_quality_of_life_impact SMALLINT DEFAULT NULL,
  rating_community_alignment SMALLINT DEFAULT NULL,
  rating_transparency SMALLINT DEFAULT NULL,
  rating_feasibility_confidence SMALLINT DEFAULT NULL,
  moderation_status VARCHAR(50) -- CHECK constraint removed (needs manual review) CHARACTER SET utf8mb4 DEFAULT 'pending',
  moderation_reason VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  custom_reason TEXT CHARACTER SET utf8mb4,
  moderator_notes TEXT CHARACTER SET utf8mb4,
  moderated_by INTEGER DEFAULT NULL,
  moderated_at TIMESTAMP DEFAULT NULL,
  ,
  CONSTRAINT public_feedback_ibfk_1 FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT public_feedback_ibfk_2 FOREIGN KEY (responded_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT public_feedback_chk_1 CHECK ((rating_overall_support between 1 and 5)),
  CONSTRAINT public_feedback_chk_2 CHECK ((rating_quality_of_life_impact between 1 and 5)),
  CONSTRAINT public_feedback_chk_3 CHECK ((rating_community_alignment between 1 and 5)),
  CONSTRAINT public_feedback_chk_4 CHECK ((rating_transparency between 1 and 5)),
  CONSTRAINT public_feedback_chk_5 CHECK ((rating_feasibility_confidence between 1 and 5))
);
--
-- Table structure for table public_holidays
--

DROP TABLE IF EXISTS public_holidays;

CREATE TABLE IF NOT EXISTS public_holidays (
  id INTEGER NOT NULL,
  holidayName VARCHAR(255) NOT NULL,
  holidayDate DATE NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN NOT NULL DEFAULT '0');
--
-- Table structure for table role_dashboard_config
--

DROP TABLE IF EXISTS role_dashboard_config;

CREATE TABLE IF NOT EXISTS role_dashboard_config (
  id INTEGER NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  tab_key VARCHAR(50) NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  component_order INTEGER DEFAULT '0',
  is_required BOOLEAN DEFAULT FALSE,
  permissions JSONB DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_dashboard_config_ibfk_1 FOREIGN KEY (tab_key) REFERENCES dashboard_tabs (tab_key),
  CONSTRAINT role_dashboard_config_ibfk_2 FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) )

--
-- Table structure for table role_dashboard_permissions
--

DROP TABLE IF EXISTS role_dashboard_permissions;

CREATE TABLE IF NOT EXISTS role_dashboard_permissions (
  id INTEGER NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  permission_key VARCHAR(100) NOT NULL,
  granted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_dashboard_permissions_ibfk_1 FOREIGN KEY (permission_key) REFERENCES dashboard_permissions (permission_key) )

--
-- Table structure for table role_privileges
--

DROP TABLE IF EXISTS role_privileges;

CREATE TABLE IF NOT EXISTS role_privileges (
  roleId INTEGER NOT NULL,
  privilegeId INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  CONSTRAINT fk_role_privilege_privilegeId FOREIGN KEY (privilegeId) REFERENCES privileges (privilegeId) ON DELETE CASCADE,
  CONSTRAINT fk_role_privilege_roleId FOREIGN KEY (roleId) REFERENCES roles (roleId) ON DELETE CASCADE
);
--
-- Table structure for table roles
--

DROP TABLE IF EXISTS roles;

CREATE TABLE IF NOT EXISTS roles (
  roleId INTEGER NOT NULL,
  roleName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL);
--
-- Table structure for table sections
--

DROP TABLE IF EXISTS sections;

CREATE TABLE IF NOT EXISTS sections (
  sectionId INTEGER NOT NULL,
  departmentId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  alias TEXT,
  location TEXT,
  address TEXT,
  contactPerson VARCHAR(255) DEFAULT NULL,
  phoneNumber VARCHAR(255) DEFAULT NULL,
  email TEXT,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT sections_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT sections_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table staff
--

DROP TABLE IF EXISTS staff;

CREATE TABLE IF NOT EXISTS staff (
  staffId INTEGER NOT NULL,
  firstName VARCHAR(255) DEFAULT NULL,
  lastName VARCHAR(255) DEFAULT NULL,
  email TEXT,
  phoneNumber VARCHAR(255) DEFAULT NULL,
  departmentId INTEGER DEFAULT NULL,
  jobGroupId INTEGER DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  dateOfBirth DATE DEFAULT NULL,
  placeOfBirth VARCHAR(255) DEFAULT NULL,
  bloodType VARCHAR(10) DEFAULT NULL,
  religion VARCHAR(100) DEFAULT NULL,
  nationalId VARCHAR(50) DEFAULT NULL,
  kraPin VARCHAR(50) DEFAULT NULL,
  employmentStatus VARCHAR(20) DEFAULT 'Active',
  startDate DATE DEFAULT NULL,
  emergencyContactName VARCHAR(255) DEFAULT NULL,
  emergencyContactRelationship VARCHAR(100) DEFAULT NULL,
  emergencyContactPhone VARCHAR(255) DEFAULT NULL,
  nationality VARCHAR(255) DEFAULT NULL,
  maritalStatus VARCHAR(50) DEFAULT NULL,
  employmentType VARCHAR(50) DEFAULT NULL,
  managerId INTEGER DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  role VARCHAR(255) DEFAULT NULL,
  voided SMALLINT DEFAULT '0',
  CONSTRAINT fk_department FOREIGN KEY (departmentId) REFERENCES departments (departmentId),
  CONSTRAINT fk_job_group FOREIGN KEY (jobGroupId) REFERENCES job_groups (id),
  CONSTRAINT managerId_fk FOREIGN KEY (managerId) REFERENCES staff (staffId) )

--
-- Table structure for table strategicplans
--

DROP TABLE IF EXISTS strategicplans;

CREATE TABLE IF NOT EXISTS strategicplans (
  id INTEGER NOT NULL,
  cidpid VARCHAR(255) DEFAULT NULL,
  cidpName VARCHAR(255) DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  theme TEXT,
  vision TEXT,
  mission TEXT,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);
--
-- Table structure for table studyparticipants
--

DROP TABLE IF EXISTS studyparticipants;

CREATE TABLE IF NOT EXISTS studyparticipants (
  individualId INTEGER NOT NULL,
  householdId VARCHAR(50) DEFAULT NULL,
  gpsLatitudeIndividual NUMERIC(10,7) DEFAULT NULL,
  gpsLongitudeIndividual NUMERIC(10,7) DEFAULT NULL,
  county VARCHAR(100) DEFAULT NULL,
  subCounty VARCHAR(100) DEFAULT NULL,
  gender VARCHAR(255) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  occupation VARCHAR(255) DEFAULT NULL,
  educationLevel VARCHAR(255) DEFAULT NULL,
  diseaseStatusMalaria VARCHAR(255) DEFAULT NULL,
  diseaseStatusDengue VARCHAR(255) DEFAULT NULL,
  mosquitoNetUse VARCHAR(255) DEFAULT NULL,
  waterStoragePractices VARCHAR(100) DEFAULT NULL,
  climatePerception VARCHAR(100) DEFAULT NULL,
  recentRainfall VARCHAR(255) DEFAULT NULL,
  averageTemperatureC VARCHAR(100) DEFAULT NULL,
  householdSize VARCHAR(100) DEFAULT NULL,
  accessToHealthcare VARCHAR(255) DEFAULT NULL,
  projectId INTEGER DEFAULT NULL,
  voided SMALLINT DEFAULT '0'
);
--
-- Table structure for table subcounties
--

DROP TABLE IF EXISTS subcounties;

CREATE TABLE IF NOT EXISTS subcounties (
  subcountyId INTEGER NOT NULL,
  countyId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  postalCode VARCHAR(255) DEFAULT NULL,
  email TEXT,
  phone VARCHAR(255) DEFAULT NULL,
  address TEXT,
  geoSpatial VARCHAR(255) DEFAULT NULL,
  polygon TEXT,
  geoCode VARCHAR(255) DEFAULT NULL,
  geoLat VARCHAR(255) DEFAULT NULL,
  geoLon VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT fk_subcounty_county FOREIGN KEY (countyId) REFERENCES counties (countyId) ON DELETE SET NULL,
  CONSTRAINT subcounties_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT subcounties_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table subprograms
--

DROP TABLE IF EXISTS subprograms;

CREATE TABLE IF NOT EXISTS subprograms (
  subProgramId INTEGER NOT NULL,
  programId INTEGER DEFAULT NULL,
  subProgramme TEXT,
  keyOutcome TEXT,
  kpi TEXT,
  baseline VARCHAR(255) DEFAULT NULL,
  yr1Targets VARCHAR(255) DEFAULT NULL,
  yr2Targets VARCHAR(255) DEFAULT NULL,
  yr3Targets VARCHAR(255) DEFAULT NULL,
  yr4Targets VARCHAR(255) DEFAULT NULL,
  yr5Targets VARCHAR(255) DEFAULT NULL,
  yr1Budget NUMERIC(15,2) DEFAULT NULL,
  yr2Budget NUMERIC(15,2) DEFAULT NULL,
  yr3Budget NUMERIC(15,2) DEFAULT NULL,
  yr4Budget NUMERIC(15,2) DEFAULT NULL,
  yr5Budget NUMERIC(15,2) DEFAULT NULL,
  totalBudget NUMERIC(15,2) DEFAULT NULL,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT subprograms_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT subprograms_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
--
-- Table structure for table user_dashboard_preferences
--

DROP TABLE IF EXISTS user_dashboard_preferences;

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  tab_key VARCHAR(50) NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  component_order INTEGER DEFAULT '0',
  custom_settings JSONB DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_dashboard_preferences_ibfk_1 FOREIGN KEY (tab_key) REFERENCES dashboard_tabs (tab_key),
  CONSTRAINT user_dashboard_preferences_ibfk_2 FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) )

--
-- Table structure for table user_data_filters
--

DROP TABLE IF EXISTS user_data_filters;

CREATE TABLE IF NOT EXISTS user_data_filters (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  filter_type VARCHAR(50) -- CHECK constraint removed (needs manual review) NOT NULL,
  filter_key VARCHAR(100) NOT NULL,
  filter_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_filter_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);
--
-- Table structure for table user_department_assignments
--

DROP TABLE IF EXISTS user_department_assignments;

CREATE TABLE IF NOT EXISTS user_department_assignments (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  department_id INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_dept_department FOREIGN KEY (department_id) REFERENCES departments (departmentId) ON DELETE CASCADE,
  CONSTRAINT fk_user_dept_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);
--
-- Table structure for table user_project_assignments
--

DROP TABLE IF EXISTS user_project_assignments;

CREATE TABLE IF NOT EXISTS user_project_assignments (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  access_level VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'view',
  assigned_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_proj_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT fk_user_proj_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_proj_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);
--
-- Table structure for table user_ward_assignments
--

DROP TABLE IF EXISTS user_ward_assignments;

CREATE TABLE IF NOT EXISTS user_ward_assignments (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  ward_id INTEGER NOT NULL,
  access_level VARCHAR(50) -- CHECK constraint removed (needs manual review) DEFAULT 'read',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_ward_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE,
  CONSTRAINT fk_user_ward_ward FOREIGN KEY (ward_id) REFERENCES wards (wardId) ON DELETE CASCADE
);
--
-- Table structure for table users
--

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  userId INTEGER NOT NULL,
  username VARCHAR(255) DEFAULT NULL,
  passwordHash VARCHAR(255) DEFAULT NULL,
  email TEXT,
  firstName VARCHAR(255) DEFAULT NULL,
  lastName VARCHAR(255) DEFAULT NULL,
  roleId INTEGER DEFAULT NULL,
  isActive BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  voided BOOLEAN DEFAULT FALSE
);
--
-- Table structure for table wards
--

DROP TABLE IF EXISTS wards;

CREATE TABLE IF NOT EXISTS wards (
  wardId INTEGER NOT NULL,
  subcountyId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  postalCode VARCHAR(255) DEFAULT NULL,
  email TEXT,
  phone VARCHAR(255) DEFAULT NULL,
  address TEXT,
  polygon TEXT,
  geoSpatial VARCHAR(255) DEFAULT NULL,
  geoCode VARCHAR(255) DEFAULT NULL,
  geoLat VARCHAR(255) DEFAULT NULL,
  geoLon VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  CONSTRAINT fk_ward_subcounty FOREIGN KEY (subcountyId) REFERENCES subcounties (subcountyId) ON DELETE SET NULL,
  CONSTRAINT wards_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT wards_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);
-- Dump completed on 2026-02-28 15:53:32
