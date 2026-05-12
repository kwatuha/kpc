CREATE TABLE "activities" (
  "activityId" int NOT NULL ,
  "workplanId" int DEFAULT NULL,
  "projectId" int DEFAULT NULL,
  "activityName" text,
  "activityDescription" text,
  "responsibleOfficer" varchar(255) DEFAULT NULL,
  "startDate" DATE DEFAULT NULL,
  "endDate" DATE DEFAULT NULL,
  "budgetAllocated" decimal(15,2) DEFAULT NULL,
  "actualCost" decimal(15,2) DEFAULT NULL,
  "percentageComplete" decimal(5,2) DEFAULT '0.00',
  "activityStatus" VARCHAR(50) DEFAULT 'not_started',
  "voided" BOOLEAN DEFAULT '0',
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "remarks" text,
  PRIMARY KEY ("activityId")) ;

CREATE TABLE "annual_workplans" (
  "workplanId" int NOT NULL ,
  "subProgramId" int DEFAULT NULL,
  "financialYear" varchar(9) DEFAULT NULL,
  "workplanName" varchar(255) DEFAULT NULL,
  "workplanDescription" text,
  "approvalStatus" VARCHAR(50) DEFAULT 'draft',
  "totalBudget" decimal(15,2) DEFAULT NULL,
  "actualExpenditure" decimal(15,2) DEFAULT '0.00',
  "performanceScore" decimal(5,2) DEFAULT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "challenges" text,
  "lessons" text,
  "recommendations" text,
  PRIMARY KEY ("workplanId")) ;

CREATE TABLE "approved_public_feedback" (
  "id" int NOT NULL ,
  "feedback_id" int NOT NULL,
  "approved_by" int DEFAULT NULL,
  "approved_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "approval_notes" text,
  PRIMARY KEY ("id") 
) ;

CREATE TABLE "assigned_assets" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "assetName" varchar(255) NOT NULL,
  "serialNumber" varchar(255) DEFAULT NULL,
  "assignmentDate" DATE NOT NULL,
  "returnDate" DATE DEFAULT NULL,
  "condition" varchar(255) DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "attachments" (
  "attachmentId" int NOT NULL ,
  "assetId" int DEFAULT NULL,
  "typeId" int DEFAULT NULL,
  "name" varchar(255) DEFAULT NULL,
  "path" text,
  "size" int DEFAULT NULL,
  "contentBlob" varchar(255) DEFAULT NULL,
  "description" text,
  "documentNo" varchar(255) DEFAULT NULL,
  "voided" BOOLEAN DEFAULT NULL,
  "voidedBy" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("attachmentId")
) ;

CREATE TABLE "attachmenttypes" (
  "typeId" int NOT NULL ,
  "attachmentName" varchar(255) DEFAULT NULL,
  "description" text,
  "voided" BOOLEAN DEFAULT NULL,
  "voidedBy" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("typeId")
) ;

CREATE TABLE "attendance" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "DATE" DATE NOT NULL,
  "checkInTime" TIMESTAMP NOT NULL,
  "checkOutTime" TIMESTAMP DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "budget_changes" (
  "changeId" int NOT NULL ,
  "budgetId" int NOT NULL,
  "itemId" int DEFAULT NULL,
  "changeType" varchar(50) NOT NULL,
  "changeReason" text NOT NULL,
  "status" varchar(50) DEFAULT 'Pending Approval',
  "oldValue" json DEFAULT NULL,
  "newValue" json DEFAULT NULL,
  "requestedBy" int NOT NULL,
  "requestedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedBy" int DEFAULT NULL,
  "reviewedAt" TIMESTAMP DEFAULT NULL,
  "reviewNotes" text,
  "userId" int NOT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "voidedBy" int DEFAULT NULL,
  "voidedAt" TIMESTAMP DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("changeId")  ON UPDATE CASCADENULL ON UPDATE CASCADE
) ;

CREATE TABLE "budget_combinations" (
  "combinationId" int NOT NULL ,
  "combinedBudgetId" int NOT NULL,
  "containerBudgetId" int NOT NULL,
  "displayOrder" int DEFAULT '0',
  "userId" int NOT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("combinationId")
) ;

CREATE TABLE "budget_items" (
  "itemId" int NOT NULL ,
  "budgetId" int NOT NULL,
  "projectId" int DEFAULT NULL,
  "remarks" text,
  "addedAfterApproval" BOOLEAN DEFAULT '0',
  "changeRequestId" int DEFAULT NULL,
  "userId" int NOT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "voidedBy" int DEFAULT NULL,
  "voidedAt" TIMESTAMP DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("itemId")  ON UPDATE CASCADE
) ;

CREATE TABLE "budgets" (
  "budgetId" int NOT NULL ,
  "budgetName" varchar(255) NOT NULL,
  "budgetType" varchar(50) DEFAULT 'Draft',
  "isCombined" BOOLEAN DEFAULT '0',
  "parentBudgetId" int DEFAULT NULL,
  "finYearId" int NOT NULL,
  "departmentId" int DEFAULT NULL,
  "description" text,
  "totalAmount" decimal(15,2) DEFAULT '0.00',
  "status" varchar(50) DEFAULT 'Draft',
  "isFrozen" BOOLEAN DEFAULT '0',
  "requiresApprovalForChanges" BOOLEAN DEFAULT '1',
  "approvedBy" int DEFAULT NULL,
  "approvedAt" TIMESTAMP DEFAULT NULL,
  "rejectedBy" int DEFAULT NULL,
  "rejectedAt" TIMESTAMP DEFAULT NULL,
  "rejectionReason" text,
  "userId" int NOT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "voidedBy" int DEFAULT NULL,
  "voidedAt" TIMESTAMP DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("budgetId")  ON UPDATE CASCADENULL ON UPDATE CASCADE
) ;

CREATE TABLE "categories" (
  "categoryId" int NOT NULL ,
  "categoryName" varchar(255) DEFAULT NULL,
  "description" text,
  "picture" varchar(255) DEFAULT NULL,
  "voided" BOOLEAN DEFAULT NULL,
  "voidedBy" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("categoryId")
) ;

CREATE TABLE "category_milestones" (
  "milestoneId" int NOT NULL ,
  "categoryId" int NOT NULL,
  "milestoneName" varchar(255) NOT NULL,
  "description" text,
  "sequenceOrder" int NOT NULL,
  "userId" int DEFAULT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("milestoneId") ) ;

CREATE TABLE "chat_message_reactions" (
  "message_id" int NOT NULL,
  "user_id" int NOT NULL,
  "reaction_type" varchar(50) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("message_id","user_id","reaction_type")) ;

CREATE TABLE "chat_messages" (
  "message_id" int NOT NULL ,
  "room_id" int NOT NULL,
  "sender_id" int NOT NULL,
  "message_text" text,
  "message_type" VARCHAR(50) DEFAULT 'text',
  "file_url" varchar(500) DEFAULT NULL,
  "file_name" varchar(255) DEFAULT NULL,
  "file_size" int DEFAULT NULL,
  "reply_to_message_id" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "edited_at" timestamp NULL DEFAULT NULL,
  "is_deleted" BOOLEAN DEFAULT '0',
  PRIMARY KEY ("message_id") ) ;

CREATE TABLE "chat_room_participants" (
  "room_id" int NOT NULL,
  "user_id" int NOT NULL,
  "joined_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "last_read_at" timestamp NULL DEFAULT NULL,
  "is_admin" BOOLEAN DEFAULT '0',
  "is_muted" BOOLEAN DEFAULT '0',
  PRIMARY KEY ("room_id","user_id")) ;

CREATE TABLE "chat_rooms" (
  "room_id" int NOT NULL ,
  "room_name" varchar(255) NOT NULL,
  "room_type" VARCHAR(50) NOT NULL,
  "project_id" int DEFAULT NULL,
  "department_id" int DEFAULT NULL,
  "created_by" int NOT NULL,
  "description" text,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "is_active" BOOLEAN DEFAULT '1',
  "role_id" int DEFAULT NULL,
  PRIMARY KEY ("room_id")) ;

CREATE TABLE "citizen_proposals" (
  "id" int NOT NULL ,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "category" varchar(100) NOT NULL,
  "location" varchar(255) NOT NULL,
  "estimated_cost" decimal(15,2) NOT NULL,
  "proposer_name" varchar(255) NOT NULL,
  "proposer_email" varchar(255) NOT NULL,
  "proposer_phone" varchar(50) NOT NULL,
  "proposer_address" text,
  "justification" text NOT NULL,
  "expected_benefits" text NOT NULL,
  "timeline" varchar(100) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'Under Review',
  "submission_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "reviewed_by" int DEFAULT NULL,
  "reviewed_at" TIMESTAMP DEFAULT NULL,
  "review_notes" text,
  "voided" BOOLEAN DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "approved_for_public" BOOLEAN DEFAULT '0',
  "approved_by" int DEFAULT NULL,
  "approved_at" TIMESTAMP DEFAULT NULL,
  "approval_notes" text,
  "revision_requested" BOOLEAN DEFAULT '0',
  "revision_notes" text,
  "revision_requested_by" int DEFAULT NULL,
  "revision_requested_at" TIMESTAMP DEFAULT NULL,
  "revision_submitted_at" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "component_data_access_rules" (
  "id" int NOT NULL ,
  "component_key" varchar(100) NOT NULL,
  "rule_type" VARCHAR(50) NOT NULL,
  "rule_config" json NOT NULL,
  "is_active" BOOLEAN DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "contractor_users" (
  "contractorUserId" int NOT NULL ,
  "userId" int NOT NULL,
  "contractorId" int NOT NULL,
  PRIMARY KEY ("contractorUserId")) ;

CREATE TABLE "contractors" (
  "contractorId" int NOT NULL ,
  "companyName" varchar(255) NOT NULL,
  "contactPerson" varchar(255) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "phone" varchar(50) DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "voided" BOOLEAN DEFAULT '0',
  "userId" int DEFAULT NULL,
  PRIMARY KEY ("contractorId")
) ;

CREATE TABLE "counties" (
  "countyId" int NOT NULL ,
  "name" varchar(255) DEFAULT NULL,
  "geoSpatial" varchar(255) DEFAULT NULL,
  "geoCode" varchar(255) DEFAULT NULL,
  "geoLat" decimal(10,7) DEFAULT NULL,
  "geoLon" decimal(10,7) DEFAULT NULL,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("countyId") 
) ;

CREATE TABLE "county_proposed_project_milestones" (
  "id" int NOT NULL ,
  "project_id" int NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "target_date" DATE NOT NULL,
  "completed" BOOLEAN DEFAULT '0',
  "completed_date" DATE DEFAULT NULL,
  "sequence_order" int DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "county_proposed_projects" (
  "id" int NOT NULL ,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "category" varchar(100) NOT NULL,
  "location" varchar(255) NOT NULL,
  "estimated_cost" decimal(15,2) NOT NULL,
  "justification" text NOT NULL,
  "expected_benefits" text NOT NULL,
  "timeline" varchar(100) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'Planning',
  "priority" VARCHAR(50) DEFAULT 'Medium',
  "department" varchar(255) NOT NULL,
  "project_manager" varchar(255) NOT NULL,
  "contact" varchar(255) NOT NULL,
  "start_date" DATE DEFAULT NULL,
  "end_date" DATE DEFAULT NULL,
  "progress" decimal(5,2) DEFAULT '0.00',
  "budget_allocated" decimal(15,2) DEFAULT '0.00',
  "budget_utilized" decimal(15,2) DEFAULT '0.00',
  "stakeholders" text,
  "risks" text,
  "created_by" int DEFAULT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "approved_for_public" BOOLEAN DEFAULT '0',
  "approved_by" int DEFAULT NULL,
  "approved_at" TIMESTAMP DEFAULT NULL,
  "approval_notes" text,
  "revision_requested" BOOLEAN DEFAULT '0',
  "revision_notes" text,
  "revision_requested_by" int DEFAULT NULL,
  "revision_requested_at" TIMESTAMP DEFAULT NULL,
  "revision_submitted_at" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "dashboard_components" (
  "id" int NOT NULL ,
  "component_key" varchar(100) NOT NULL,
  "component_name" varchar(200) NOT NULL,
  "component_type" varchar(50) NOT NULL,
  "component_file" varchar(200) NOT NULL,
  "description" text,
  "is_active" BOOLEAN DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "dashboard_permissions" (
  "id" int NOT NULL ,
  "permission_key" varchar(100) NOT NULL,
  "permission_name" varchar(200) NOT NULL,
  "description" text,
  "component_key" varchar(100) DEFAULT NULL,
  "is_active" BOOLEAN DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "dashboard_tabs" (
  "id" int NOT NULL ,
  "tab_key" varchar(50) NOT NULL,
  "tab_name" varchar(100) NOT NULL,
  "tab_icon" varchar(100) DEFAULT NULL,
  "tab_order" int DEFAULT '0',
  "description" text,
  "is_active" BOOLEAN DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "departments" (
  "departmentId" int NOT NULL ,
  "name" varchar(255) DEFAULT NULL,
  "alias" text,
  "location" text,
  "address" text,
  "contactPerson" varchar(255) DEFAULT NULL,
  "phoneNumber" varchar(255) DEFAULT NULL,
  "email" text,
  "remarks" text,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("departmentId") 
) ;

CREATE TABLE "employee_bank_details" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "bankName" varchar(255) NOT NULL,
  "accountNumber" varchar(255) NOT NULL,
  "branchName" varchar(255) DEFAULT NULL,
  "isPrimary" SMALLINT DEFAULT '0',
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_benefits" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "benefitName" varchar(255) NOT NULL,
  "enrollmentDate" DATE DEFAULT NULL,
  "status" varchar(50) NOT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_compensation" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "baseSalary" decimal(10,2) NOT NULL,
  "allowances" decimal(10,2) DEFAULT NULL,
  "bonuses" decimal(10,2) DEFAULT NULL,
  "bankName" varchar(255) DEFAULT NULL,
  "accountNumber" varchar(255) DEFAULT NULL,
  "payFrequency" varchar(50) NOT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_contracts" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "contractType" varchar(50) NOT NULL,
  "contractStartDate" DATE NOT NULL,
  "contractEndDate" DATE DEFAULT NULL,
  "status" varchar(50) NOT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_dependants" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "dependantName" varchar(255) NOT NULL,
  "relationship" varchar(50) NOT NULL,
  "dateOfBirth" DATE DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_disciplinary" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "actionType" varchar(255) NOT NULL,
  "actionDate" DATE NOT NULL,
  "reason" text NOT NULL,
  "comments" text,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_leave_entitlements" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "leaveTypeId" int NOT NULL,
  "year" int NOT NULL,
  "allocatedDays" decimal(5,2) NOT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" BOOLEAN DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_loans" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "loanAmount" decimal(10,2) NOT NULL,
  "loanDate" DATE NOT NULL,
  "status" varchar(50) NOT NULL,
  "repaymentSchedule" text,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_memberships" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "organizationName" varchar(255) NOT NULL,
  "membershipNumber" varchar(255) DEFAULT NULL,
  "startDate" DATE DEFAULT NULL,
  "endDate" DATE DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_performance" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "reviewDate" DATE NOT NULL,
  "reviewScore" int DEFAULT NULL,
  "comments" text,
  "reviewerId" int DEFAULT NULL,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" BOOLEAN NOT NULL DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_project_assignments" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "projectId" varchar(255) NOT NULL,
  "milestoneName" varchar(255) DEFAULT NULL,
  "role" varchar(255) DEFAULT NULL,
  "status" varchar(50) DEFAULT 'Pending',
  "dueDate" DATE DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" BOOLEAN DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_promotions" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "oldJobGroupId" int DEFAULT NULL,
  "newJobGroupId" int DEFAULT NULL,
  "promotionDate" DATE NOT NULL,
  "comments" text,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_retirements" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "retirementDate" DATE NOT NULL,
  "retirementType" varchar(255) NOT NULL,
  "comments" text,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_terminations" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "exitDate" DATE NOT NULL,
  "reason" text NOT NULL,
  "exitInterviewDetails" text,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "employee_training" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "courseName" varchar(255) NOT NULL,
  "institution" varchar(255) DEFAULT NULL,
  "certificationName" varchar(255) DEFAULT NULL,
  "completionDate" DATE DEFAULT NULL,
  "expiryDate" DATE DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "feedback_moderation" (
  "id" int NOT NULL ,
  "feedback_id" int NOT NULL,
  "feedback_type" VARCHAR(50) NOT NULL DEFAULT 'public_feedback',
  "moderation_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
  "moderation_reason" VARCHAR(50) DEFAULT NULL,
  "custom_reason" text,
  "moderator_notes" text,
  "moderated_by" int DEFAULT NULL,
  "moderated_at" TIMESTAMP DEFAULT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id") 
) ;

CREATE TABLE "feedback_moderation_settings" (
  "id" int NOT NULL ,
  "setting_name" varchar(100) NOT NULL,
  "setting_value" text NOT NULL,
  "description" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "financialyears" (
  "finYearId" int NOT NULL ,
  "finYearName" varchar(255) DEFAULT NULL,
  "startDate" TIMESTAMP DEFAULT NULL,
  "endDate" TIMESTAMP DEFAULT NULL,
  "remarks" text,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("finYearId") 
) ;

CREATE TABLE "inspection_teams" (
  "id" int NOT NULL ,
  "requestId" int NOT NULL,
  "staffId" int NOT NULL,
  "role" varchar(100) DEFAULT NULL,
  "voided" SMALLINT NOT NULL DEFAULT '0',
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "job_groups" (
  "id" int NOT NULL ,
  "groupName" varchar(255) NOT NULL,
  "salaryScale" decimal(10,2) DEFAULT NULL,
  "description" text,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")
) ;

CREATE TABLE "leave_applications" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "leaveTypeId" int NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "numberOfDays" int DEFAULT NULL,
  "reason" text,
  "handoverStaffId" int DEFAULT NULL,
  "handoverComments" text,
  "status" VARCHAR(50) DEFAULT 'Pending',
  "approvedStartDate" DATE DEFAULT NULL,
  "approvedEndDate" DATE DEFAULT NULL,
  "actualReturnDate" DATE DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "leave_types" (
  "id" int NOT NULL ,
  "name" varchar(255) NOT NULL,
  "description" text,
  "numberOfDays" int DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")
) ;

CREATE TABLE "milestone_activities" (
  "id" int NOT NULL ,
  "milestoneId" int NOT NULL,
  "activityId" int NOT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "milestone_attachments" (
  "attachmentId" int NOT NULL ,
  "milestoneId" int NOT NULL,
  "fileName" varchar(255) NOT NULL,
  "filePath" varchar(255) NOT NULL,
  "fileType" varchar(50) DEFAULT NULL,
  "description" text,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "voided" BOOLEAN DEFAULT '0',
  "fileSize" int DEFAULT NULL,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("attachmentId") 
) ;

CREATE TABLE "moderation_queue" (
  "id" int NOT NULL ,
  "feedback_id" int NOT NULL,
  "feedback_type" VARCHAR(50) DEFAULT 'public_feedback',
  "priority" VARCHAR(50) DEFAULT 'medium',
  "queued_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP DEFAULT NULL,
  "processed_by" int DEFAULT NULL,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "monthly_payroll" (
  "id" int NOT NULL ,
  "staffId" int NOT NULL,
  "payPeriod" DATE NOT NULL,
  "grossSalary" decimal(10,2) NOT NULL,
  "netSalary" decimal(10,2) NOT NULL,
  "allowances" decimal(10,2) DEFAULT NULL,
  "deductions" decimal(10,2) DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "participants" (
  "id" int NOT NULL ,
  "individualId" int DEFAULT NULL,
  "householdId" int DEFAULT NULL,
  "gender" varchar(255) DEFAULT NULL,
  "age" int DEFAULT NULL,
  "villageLocality" int DEFAULT NULL,
  "gpsLongitude" decimal(10,7) DEFAULT NULL,
  "gpsLatitude" decimal(10,7) DEFAULT NULL,
  "vectorBorneDiseaseStatus" varchar(255) DEFAULT NULL,
  "malariaDiagnosis" varchar(255) DEFAULT NULL,
  "dengueDiagnosis" varchar(255) DEFAULT NULL,
  "leishmaniasisDiagnosis" varchar(255) DEFAULT NULL,
  "waterSource" varchar(255) DEFAULT NULL,
  "housingType" varchar(255) DEFAULT NULL,
  "mosquitoNetUsage" int DEFAULT NULL,
  "educationLevel" varchar(255) DEFAULT NULL,
  "occupation" varchar(255) DEFAULT NULL,
  "incomeKshMonth" decimal(15,2) DEFAULT NULL,
  "accessToHealthcareKm" varchar(255) DEFAULT NULL,
  "climatePerceptionScore" decimal(15,2) DEFAULT NULL,
  "createdOn" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "payment_approval_history" (
  "historyId" int NOT NULL ,
  "requestId" int NOT NULL,
  "action" VARCHAR(50) NOT NULL,
  "actionByUserId" int NOT NULL,
  "assignedToUserId" int DEFAULT NULL,
  "actionDate" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" text,
  PRIMARY KEY ("historyId")) ;

CREATE TABLE "payment_approval_levels" (
  "levelId" int NOT NULL ,
  "levelName" varchar(255) NOT NULL,
  "roleId" int NOT NULL,
  "approvalOrder" int NOT NULL,
  "workflowId" int DEFAULT NULL,
  PRIMARY KEY ("levelId")) ;

CREATE TABLE "payment_details" (
  "detailId" int NOT NULL ,
  "requestId" int NOT NULL,
  "paymentMode" VARCHAR(50) NOT NULL,
  "bankName" varchar(255) DEFAULT NULL,
  "accountNumber" varchar(255) DEFAULT NULL,
  "transactionId" varchar(255) DEFAULT NULL,
  "paidByUserId" int NOT NULL,
  "paidAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" text,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  "createdByUserId" int DEFAULT NULL,
  "voided" SMALLINT NOT NULL DEFAULT '0',
  "voidedByUserId" int DEFAULT NULL,
  PRIMARY KEY ("detailId")) ;

CREATE TABLE "payment_request_approvals" (
  "approvalId" int NOT NULL ,
  "requestId" int NOT NULL,
  "stage" varchar(100) NOT NULL,
  "status" VARCHAR(50) NOT NULL,
  "comments" text,
  "actionByUserId" int NOT NULL,
  "actionDate" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "voided" SMALLINT NOT NULL DEFAULT '0',
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT NULL,
  "updatedAt" timestamp NULL DEFAULT NULL,
  PRIMARY KEY ("approvalId")) ;

CREATE TABLE "payment_request_documents" (
  "id" int NOT NULL ,
  "requestId" int NOT NULL,
  "documentType" VARCHAR(50) NOT NULL,
  "documentPath" varchar(255) NOT NULL,
  "description" text,
  "uploadedByUserId" int NOT NULL,
  "voided" SMALLINT NOT NULL DEFAULT '0',
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")) ;

CREATE TABLE "payment_request_milestones" (
  "id" int NOT NULL ,
  "requestId" int NOT NULL,
  "activityId" int NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'accomplished',
  "voided" SMALLINT NOT NULL DEFAULT '0',
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "payment_status_definitions" (
  "statusId" int NOT NULL ,
  "statusName" varchar(255) NOT NULL,
  "description" text,
  PRIMARY KEY ("statusId")
) ;

CREATE TABLE "planningdocuments" (
  "attachmentId" int NOT NULL ,
  "fileName" varchar(255) NOT NULL,
  "filePath" varchar(255) NOT NULL, S3, local, shared drive)',
  "fileType" varchar(50) DEFAULT NULL, pdf, docx, xlsx, image/jpeg',
  "fileSize" int DEFAULT NULL,
  "description" text,
  "entityId" int NOT NULL, program, or subProgram',
  "entityType" varchar(50) NOT NULL, "program", "subProgram"',
  "uploadedBy" int DEFAULT NULL)',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" BOOLEAN DEFAULT '0',
  PRIMARY KEY ("attachmentId")
) ;

CREATE TABLE "privileges" (
  "privilegeId" int NOT NULL ,
  "privilegeName" varchar(255) DEFAULT NULL,
  "description" text,
  "createdAt" TIMESTAMP DEFAULT NULL,
  "updatedAt" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("privilegeId")
) ;

CREATE TABLE "programs" (
  "programId" int NOT NULL ,
  "cidpid" varchar(255) DEFAULT NULL,
  "departmentId" int DEFAULT NULL,
  "sectionId" int DEFAULT NULL,
  "programme" text,
  "needsPriorities" text,
  "strategies" varchar(255) DEFAULT NULL,
  "remarks" text,
  "objectives" text,
  "outcomes" text,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  "description" text,
  PRIMARY KEY ("programId") 
) ;

CREATE TABLE "project_announcements" (
  "id" int NOT NULL ,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "content" text NOT NULL,
  "category" VARCHAR(50) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "DATE" DATE NOT NULL,
  "time" time NOT NULL,
  "location" varchar(255) NOT NULL,
  "organizer" varchar(255) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'Upcoming',
  "priority" VARCHAR(50) DEFAULT 'Medium',
  "image_url" varchar(500) DEFAULT NULL,
  "attendees" int DEFAULT '0',
  "max_attendees" int DEFAULT '0',
  "created_by" int DEFAULT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "approved_for_public" BOOLEAN DEFAULT '0',
  "approved_by" int DEFAULT NULL,
  "approved_at" TIMESTAMP DEFAULT NULL,
  "approval_notes" text,
  "revision_requested" BOOLEAN DEFAULT '0',
  "revision_notes" text,
  "revision_requested_by" int DEFAULT NULL,
  "revision_requested_at" TIMESTAMP DEFAULT NULL,
  "revision_submitted_at" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "project_assignments" (
  "id" int NOT NULL ,
  "projectId" int NOT NULL,
  "staffId" int NOT NULL,
  "milestoneName" varchar(255) NOT NULL,
  "role" varchar(255) DEFAULT NULL,
  "status" varchar(50) DEFAULT NULL,
  "dueDate" DATE DEFAULT NULL,
  "completionDate" DATE DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("id")) ;

CREATE TABLE "project_climate_risk" (
  "climateRiskId" int NOT NULL ,
  "projectId" int NOT NULL,
  "hazardName" varchar(255) NOT NULL,
  "hazardExposure" varchar(50) DEFAULT NULL,
  "vulnerability" varchar(50) DEFAULT NULL,
  "riskLevel" varchar(50) DEFAULT NULL,
  "riskReductionStrategies" text,
  "riskReductionCosts" decimal(15,2) DEFAULT NULL,
  "resourcesRequired" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("climateRiskId")) ;

CREATE TABLE "project_concept_notes" (
  "conceptNoteId" int NOT NULL ,
  "projectId" int NOT NULL,
  "situationAnalysis" text,
  "problemStatement" text,
  "relevanceProjectIdea" text,
  "scopeOfProject" text,
  "projectGoal" text,
  "goalIndicator" text,
  "goalMeansVerification" text,
  "goalAssumptions" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("conceptNoteId")) ;

CREATE TABLE "project_contractor_assignments" (
  "projectId" int NOT NULL,
  "contractorId" int NOT NULL,
  "assignmentDate" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("projectId","contractorId")) ;

CREATE TABLE "project_counties" (
  "projectId" int NOT NULL,
  "countyId" int NOT NULL,
  "assignedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("projectId","countyId")) ;

CREATE TABLE "project_documents" (
  "id" int NOT NULL ,
  "projectId" int NOT NULL,
  "milestoneId" int DEFAULT NULL,
  "requestId" int DEFAULT NULL,
  "documentType" varchar(50) NOT NULL,
  "documentCategory" VARCHAR(50) NOT NULL,
  "documentPath" varchar(255) NOT NULL,
  "description" text,
  "userId" int NOT NULL,
  "isProjectCover" BOOLEAN NOT NULL DEFAULT '0',
  "displayOrder" int DEFAULT NULL,
  "voided" BOOLEAN NOT NULL DEFAULT '0',
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending_review',
  "progressPercentage" decimal(5,2) DEFAULT NULL,
  "originalFileName" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("id") ) ;

CREATE TABLE "project_esohsg_screening" (
  "screeningId" int NOT NULL ,
  "projectId" int NOT NULL,
  "emcaTriggers" BOOLEAN DEFAULT NULL,
  "emcaDescription" text,
  "worldBankSafeguardApplicable" BOOLEAN DEFAULT NULL,
  "worldBankStandards" text,
  "goKPoliciesApplicable" BOOLEAN DEFAULT NULL,
  "goKPoliciesLaws" text,
  "environmentalHealthSafetyImpacts" json DEFAULT NULL,
  "socialImpacts" json DEFAULT NULL,
  "publicParticipationConsultation" json DEFAULT NULL,
  "screeningResultOutcome" text,
  "specialConditions" text,
  "screeningUndertakenBy" varchar(255) DEFAULT NULL,
  "screeningDesignation" varchar(255) DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("screeningId")) ;

CREATE TABLE "project_financials" (
  "financialsId" int NOT NULL ,
  "projectId" int NOT NULL,
  "capitalCostConsultancy" decimal(15,2) DEFAULT NULL,
  "capitalCostLandAcquisition" decimal(15,2) DEFAULT NULL,
  "capitalCostSitePrep" decimal(15,2) DEFAULT NULL,
  "capitalCostConstruction" decimal(15,2) DEFAULT NULL,
  "capitalCostPlantEquipment" decimal(15,2) DEFAULT NULL,
  "capitalCostFixturesFittings" decimal(15,2) DEFAULT NULL,
  "capitalCostOther" decimal(15,2) DEFAULT NULL,
  "recurrentCostLabor" decimal(15,2) DEFAULT NULL,
  "recurrentCostOperating" decimal(15,2) DEFAULT NULL,
  "recurrentCostMaintenance" decimal(15,2) DEFAULT NULL,
  "recurrentCostOther" decimal(15,2) DEFAULT NULL,
  "proposedSourceFinancing" varchar(255) DEFAULT NULL,
  "costImplicationsRelatedProjects" text,
  "landExpropriationRequired" BOOLEAN DEFAULT NULL,
  "landExpropriationExpenses" decimal(15,2) DEFAULT NULL,
  "compensationRequired" BOOLEAN DEFAULT NULL,
  "otherAttendantCosts" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("financialsId")) ;

CREATE TABLE "project_fy_breakdown" (
  "fyBreakdownId" int NOT NULL ,
  "projectId" int NOT NULL,
  "financialYear" varchar(20) NOT NULL,
  "totalCost" decimal(15,2) DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("fyBreakdownId")) ;

CREATE TABLE "project_hazard_assessment" (
  "hazardId" int NOT NULL ,
  "projectId" int NOT NULL,
  "hazardName" varchar(255) NOT NULL,
  "question" text,
  "answerYesNo" BOOLEAN DEFAULT NULL,
  "remarks" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("hazardId")) ;

CREATE TABLE "project_implementation_plan" (
  "planId" int NOT NULL ,
  "projectId" int NOT NULL,
  "description" text,
  "keyPerformanceIndicators" text,
  "responsiblePersons" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("planId")) ;

CREATE TABLE "project_m_and_e" (
  "mAndEId" int NOT NULL ,
  "projectId" int NOT NULL,
  "description" text,
  "mechanismsInPlace" text,
  "resourcesBudgetary" text,
  "resourcesHuman" text,
  "dataGatheringMethod" text,
  "reportingChannels" text,
  "lessonsLearnedProcess" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("mAndEId")) ;

CREATE TABLE "project_maps" (
  "mapId" int NOT NULL ,
  "projectId" int DEFAULT NULL,
  "map" text,
  "voided" BOOLEAN DEFAULT NULL,
  "voidedBy" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("mapId")
) ;

CREATE TABLE "project_milestone_implementations" (
  "categoryId" int NOT NULL ,
  "categoryName" varchar(255) NOT NULL,
  "description" text,
  "userId" int DEFAULT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("categoryId") 
) ;

CREATE TABLE "project_milestones" (
  "milestoneId" int NOT NULL ,
  "projectId" int NOT NULL,
  "milestoneName" varchar(255) NOT NULL,
  "description" text,
  "dueDate" DATE DEFAULT NULL,
  "sequenceOrder" int DEFAULT NULL,
  "status" varchar(255) DEFAULT 'Not Started',
  "completed" BOOLEAN DEFAULT '0',
  "completedDate" DATE DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" BOOLEAN DEFAULT '0',
  "voidedBy" int DEFAULT NULL,
  "progress" decimal(5,2) DEFAULT '0.00',
  "weight" decimal(5,2) DEFAULT '1.00',
  PRIMARY KEY ("milestoneId") NULL
) ;

CREATE TABLE "project_monitoring_records" (
  "recordId" int NOT NULL ,
  "projectId" int NOT NULL,
  "observationDate" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "comment" text,
  "warningLevel" varchar(20) DEFAULT 'None',
  "isRoutineObservation" BOOLEAN DEFAULT '1',
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "voided" BOOLEAN DEFAULT '0',
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "recommendations" text,
  "challenges" text,
  PRIMARY KEY ("recordId")) ;

CREATE TABLE "project_needs_assessment" (
  "needsAssessmentId" int NOT NULL ,
  "projectId" int NOT NULL,
  "targetBeneficiaries" text,
  "estimateEndUsers" text,
  "physicalDemandCompletion" text,
  "proposedPhysicalCapacity" text,
  "mainBenefitsAsset" text,
  "significantExternalBenefitsNegativeEffects" text,
  "significantDifferencesBenefitsAlternatives" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("needsAssessmentId")) ;

CREATE TABLE "project_payment_requests" (
  "requestId" int NOT NULL ,
  "projectId" int NOT NULL,
  "contractorId" int NOT NULL,
  "amount" decimal(10,2) NOT NULL,
  "description" text NOT NULL,
  "currentApprovalLevelId" int DEFAULT NULL,
  "paymentStatusId" int DEFAULT NULL,
  "submittedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "voided" SMALLINT DEFAULT '0',
  "approvedByUserId" int DEFAULT NULL,
  "approvalDate" timestamp NULL DEFAULT NULL,
  "rejectionReason" text,
  "comments" text,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT NULL,
  "updatedAt" timestamp NULL DEFAULT NULL,
  PRIMARY KEY ("requestId")) ;

CREATE TABLE "project_photos" (
  "photoId" int NOT NULL ,
  "projectId" int NOT NULL,
  "fileName" varchar(255) NOT NULL,
  "filePath" varchar(255) NOT NULL,
  "fileType" varchar(50) DEFAULT NULL,
  "fileSize" int DEFAULT NULL,
  "description" text,
  "isDefault" BOOLEAN DEFAULT '0',
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" BOOLEAN DEFAULT '0',
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("photoId")) ;

CREATE TABLE "project_readiness" (
  "readinessId" int NOT NULL ,
  "projectId" int NOT NULL,
  "designsPreparedApproved" BOOLEAN DEFAULT NULL,
  "landAcquiredSiteReady" BOOLEAN DEFAULT NULL,
  "regulatoryApprovalsObtained" BOOLEAN DEFAULT NULL,
  "governmentAgenciesInvolved" text,
  "consultationsUndertaken" BOOLEAN DEFAULT NULL,
  "canBePhasedScaledDown" BOOLEAN DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("readinessId")) ;

CREATE TABLE "project_risks" (
  "riskId" int NOT NULL ,
  "projectId" int NOT NULL,
  "riskDescription" text,
  "likelihood" varchar(50) DEFAULT NULL,
  "impact" varchar(50) DEFAULT NULL,
  "mitigationStrategy" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("riskId")) ;

CREATE TABLE "project_roles" (
  "roleId" int NOT NULL ,
  "roleName" varchar(255) DEFAULT NULL,
  "description" text,
  PRIMARY KEY ("roleId")
) ;

CREATE TABLE "project_staff_assignments" (
  "assignmentId" int NOT NULL ,
  "projectId" int DEFAULT NULL,
  "staffId" int DEFAULT NULL,
  "roleId" int DEFAULT NULL,
  "startDate" TIMESTAMP DEFAULT NULL,
  "endDate" TIMESTAMP DEFAULT NULL,
  "isActive" BOOLEAN DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT NULL,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("assignmentId")
) ;

CREATE TABLE "project_stages" (
  "stageId" int NOT NULL ,
  "stageName" varchar(255) NOT NULL,
  "description" text,
  PRIMARY KEY ("stageId")
) ;

CREATE TABLE "project_stakeholders" (
  "stakeholderId" int NOT NULL ,
  "projectId" int NOT NULL,
  "stakeholderName" varchar(255) DEFAULT NULL,
  "levelInfluence" varchar(50) DEFAULT NULL,
  "engagementStrategy" text,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("stakeholderId")) ;

CREATE TABLE "project_subcounties" (
  "projectId" int NOT NULL,
  "subcountyId" int NOT NULL,
  "assignedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("projectId","subcountyId")) ;

CREATE TABLE "project_sustainability" (
  "sustainabilityId" int NOT NULL ,
  "projectId" int NOT NULL,
  "description" text,
  "owningOrganization" varchar(255) DEFAULT NULL,
  "hasAssetRegister" BOOLEAN DEFAULT NULL,
  "technicalCapacityAdequacy" text,
  "managerialCapacityAdequacy" text,
  "financialCapacityAdequacy" text,
  "avgAnnualPersonnelCost" decimal(15,2) DEFAULT NULL,
  "annualOperationMaintenanceCost" decimal(15,2) DEFAULT NULL,
  "otherOperatingCosts" decimal(15,2) DEFAULT NULL,
  "revenueSources" text,
  "operationalCostsCoveredByRevenue" BOOLEAN DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("sustainabilityId")) ;

CREATE TABLE "project_wards" (
  "projectId" int NOT NULL,
  "wardId" int NOT NULL,
  "assignedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("projectId","wardId")) ;

CREATE TABLE "project_workflow_steps" (
  "stepId" int NOT NULL ,
  "workflowId" int NOT NULL,
  "stageId" int NOT NULL,
  "stepOrder" int NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT NOT NULL DEFAULT '0',
  "createdByUserId" int DEFAULT NULL,
  "voidedByUserId" int DEFAULT NULL,
  PRIMARY KEY ("stepId")) ;

CREATE TABLE "project_workflows" (
  "workflowId" int NOT NULL ,
  "workflowName" varchar(255) NOT NULL,
  "description" text,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" SMALLINT NOT NULL DEFAULT '0',
  "createdByUserId" int DEFAULT NULL,
  "voidedByUserId" int DEFAULT NULL,
  PRIMARY KEY ("workflowId")) ;

CREATE TABLE "projectfeedback" (
  "feedbackId" int NOT NULL ,
  "projectId" int DEFAULT NULL,
  "feedbackMessage" text,
  "response" varchar(255) DEFAULT NULL,
  "voided" BOOLEAN DEFAULT NULL,
  "voidedBy" varchar(255) DEFAULT NULL,
  "createdBy" varchar(255) DEFAULT NULL,
  "updatedBy" TIMESTAMP DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT NULL,
  "updatedAt" TIMESTAMP DEFAULT NULL,
  "voidedAt" TIMESTAMP DEFAULT NULL,
  "voidingReason" varchar(255) DEFAULT NULL,
  "submittedDate" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("feedbackId")
) ;

CREATE TABLE "projects" (
  "id" int NOT NULL ,
  "projectName" varchar(255) DEFAULT NULL,
  "directorate" varchar(255) DEFAULT NULL,
  "startDate" TIMESTAMP DEFAULT NULL,
  "endDate" TIMESTAMP DEFAULT NULL,
  "costOfProject" decimal(15,2) DEFAULT NULL,
  "paidOut" decimal(15,2) DEFAULT NULL,
  "objective" text,
  "expectedOutput" text,
  "principalInvestigator" text,
  "expectedOutcome" text,
  "status" varchar(255) DEFAULT NULL,
  "statusReason" text,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "principalInvestigatorStaffId" int DEFAULT NULL,
  "departmentId" int DEFAULT NULL,
  "sectionId" int DEFAULT NULL,
  "finYearId" int DEFAULT NULL,
  "programId" int DEFAULT NULL,
  "subProgramId" int DEFAULT NULL,
  "categoryId" int DEFAULT NULL,
  "projectDescription" text,
  "userId" int DEFAULT NULL,
  "voided" BOOLEAN DEFAULT '0',
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "defaultPhotoId" int DEFAULT NULL,
  "overallProgress" decimal(5,2) DEFAULT '0.00',
  "workflowId" int DEFAULT NULL,
  "currentStageId" int DEFAULT NULL,
  "approved_for_public" BOOLEAN DEFAULT '0',
  "approved_by" int DEFAULT NULL,
  "approved_at" TIMESTAMP DEFAULT NULL,
  "approval_notes" text,
  "revision_requested" BOOLEAN DEFAULT '0',
  "revision_notes" text,
  "revision_requested_by" int DEFAULT NULL,
  "revision_requested_at" TIMESTAMP DEFAULT NULL,
  "revision_submitted_at" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("id") NULL) ;

CREATE TABLE "public_feedback" (
  "id" int NOT NULL ,
  "name" varchar(255) DEFAULT NULL)',
  "email" varchar(255) DEFAULT NULL,
  "phone" varchar(50) DEFAULT NULL,
  "subject" varchar(500) DEFAULT NULL,
  "message" text NOT NULL,
  "project_id" int DEFAULT NULL,
  "status" VARCHAR(50) DEFAULT 'pending',
  "admin_response" text,
  "responded_by" int DEFAULT NULL,
  "responded_at" TIMESTAMP DEFAULT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "rating_overall_support" SMALLINT DEFAULT NULL, 5=Strongly Support)',
  "rating_quality_of_life_impact" SMALLINT DEFAULT NULL, 5=Highly Positive)',
  "rating_community_alignment" SMALLINT DEFAULT NULL, 5=Perfectly Aligned)',
  "rating_transparency" SMALLINT DEFAULT NULL, 5=Excellent)',
  "rating_feasibility_confidence" SMALLINT DEFAULT NULL, 5=Very High)',
  "moderation_status" VARCHAR(50) DEFAULT 'pending',
  "moderation_reason" varchar(255) DEFAULT NULL,
  "custom_reason" text,
  "moderator_notes" text,
  "moderated_by" int DEFAULT NULL,
  "moderated_at" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("id") ,
  CONSTRAINT "public_feedback_chk_1" CHECK (("rating_overall_support" between 1 and 5)),
  CONSTRAINT "public_feedback_chk_2" CHECK (("rating_quality_of_life_impact" between 1 and 5)),
  CONSTRAINT "public_feedback_chk_3" CHECK (("rating_community_alignment" between 1 and 5)),
  CONSTRAINT "public_feedback_chk_4" CHECK (("rating_transparency" between 1 and 5)),
  CONSTRAINT "public_feedback_chk_5" CHECK (("rating_feasibility_confidence" between 1 and 5))
) ;

CREATE TABLE "public_holidays" (
  "id" int NOT NULL ,
  "holidayName" varchar(255) NOT NULL,
  "holidayDate" DATE NOT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voided" BOOLEAN NOT NULL DEFAULT '0',
  PRIMARY KEY ("id")
) ;

CREATE TABLE "role_dashboard_config" (
  "id" int NOT NULL ,
  "role_name" varchar(50) NOT NULL,
  "tab_key" varchar(50) NOT NULL,
  "component_key" varchar(100) NOT NULL,
  "component_order" int DEFAULT '0',
  "is_required" BOOLEAN DEFAULT '0',
  "permissions" json DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "role_dashboard_permissions" (
  "id" int NOT NULL ,
  "role_name" varchar(50) NOT NULL,
  "permission_key" varchar(100) NOT NULL,
  "granted" BOOLEAN DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "role_privileges" (
  "roleId" int NOT NULL,
  "privilegeId" int NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("roleId","privilegeId")) ;

CREATE TABLE "roles" (
  "roleId" int NOT NULL ,
  "roleName" varchar(255) DEFAULT NULL,
  "description" text,
  "createdAt" TIMESTAMP DEFAULT NULL,
  "updatedAt" TIMESTAMP DEFAULT NULL,
  PRIMARY KEY ("roleId")
) ;

CREATE TABLE "sections" (
  "sectionId" int NOT NULL ,
  "departmentId" int DEFAULT NULL,
  "name" varchar(255) DEFAULT NULL,
  "alias" text,
  "location" text,
  "address" text,
  "contactPerson" varchar(255) DEFAULT NULL,
  "phoneNumber" varchar(255) DEFAULT NULL,
  "email" text,
  "remarks" text,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("sectionId") 
) ;

CREATE TABLE "staff" (
  "staffId" int NOT NULL ,
  "firstName" varchar(255) DEFAULT NULL,
  "lastName" varchar(255) DEFAULT NULL,
  "email" text,
  "phoneNumber" varchar(255) DEFAULT NULL,
  "departmentId" int DEFAULT NULL,
  "jobGroupId" int DEFAULT NULL,
  "gender" varchar(10) DEFAULT NULL,
  "dateOfBirth" DATE DEFAULT NULL,
  "placeOfBirth" varchar(255) DEFAULT NULL,
  "bloodType" varchar(10) DEFAULT NULL,
  "religion" varchar(100) DEFAULT NULL,
  "nationalId" varchar(50) DEFAULT NULL,
  "kraPin" varchar(50) DEFAULT NULL,
  "employmentStatus" varchar(20) DEFAULT 'Active',
  "startDate" DATE DEFAULT NULL,
  "emergencyContactName" varchar(255) DEFAULT NULL,
  "emergencyContactRelationship" varchar(100) DEFAULT NULL,
  "emergencyContactPhone" varchar(255) DEFAULT NULL,
  "nationality" varchar(255) DEFAULT NULL,
  "maritalStatus" varchar(50) DEFAULT NULL,
  "employmentType" varchar(50) DEFAULT NULL,
  "managerId" int DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT NULL,
  "updatedAt" TIMESTAMP DEFAULT NULL,
  "role" varchar(255) DEFAULT NULL,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("staffId")) ;

CREATE TABLE "strategicplans" (
  "id" int NOT NULL ,
  "cidpid" varchar(255) DEFAULT NULL,
  "cidpName" varchar(255) DEFAULT NULL,
  "startDate" TIMESTAMP DEFAULT NULL,
  "endDate" TIMESTAMP DEFAULT NULL,
  "theme" text,
  "vision" text,
  "mission" text,
  "remarks" text,
  "voided" BOOLEAN DEFAULT NULL,
  "voidedBy" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("id")
) ;

CREATE TABLE "studyparticipants" (
  "individualId" int NOT NULL ,
  "householdId" varchar(50) DEFAULT NULL,
  "gpsLatitudeIndividual" decimal(10,7) DEFAULT NULL,
  "gpsLongitudeIndividual" decimal(10,7) DEFAULT NULL,
  "county" varchar(100) DEFAULT NULL,
  "subCounty" varchar(100) DEFAULT NULL,
  "gender" varchar(255) DEFAULT NULL,
  "age" int DEFAULT NULL,
  "occupation" varchar(255) DEFAULT NULL,
  "educationLevel" varchar(255) DEFAULT NULL,
  "diseaseStatusMalaria" varchar(255) DEFAULT NULL,
  "diseaseStatusDengue" varchar(255) DEFAULT NULL,
  "mosquitoNetUse" varchar(255) DEFAULT NULL,
  "waterStoragePractices" varchar(100) DEFAULT NULL,
  "climatePerception" varchar(100) DEFAULT NULL,
  "recentRainfall" varchar(255) DEFAULT NULL,
  "averageTemperatureC" varchar(100) DEFAULT NULL,
  "householdSize" varchar(100) DEFAULT NULL,
  "accessToHealthcare" varchar(255) DEFAULT NULL,
  "projectId" int DEFAULT NULL,
  "voided" SMALLINT DEFAULT '0',
  PRIMARY KEY ("individualId")
) ;

CREATE TABLE "subcounties" (
  "subcountyId" int NOT NULL ,
  "countyId" int DEFAULT NULL,
  "name" varchar(255) DEFAULT NULL,
  "postalCode" varchar(255) DEFAULT NULL,
  "email" text,
  "phone" varchar(255) DEFAULT NULL,
  "address" text,
  "geoSpatial" varchar(255) DEFAULT NULL,
  "polygon" text,
  "geoCode" varchar(255) DEFAULT NULL,
  "geoLat" varchar(255) DEFAULT NULL,
  "geoLon" varchar(255) DEFAULT NULL,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("subcountyId") NULL
) ;

CREATE TABLE "subprograms" (
  "subProgramId" int NOT NULL ,
  "programId" int DEFAULT NULL,
  "subProgramme" text,
  "keyOutcome" text,
  "kpi" text,
  "baseline" varchar(255) DEFAULT NULL,
  "yr1Targets" varchar(255) DEFAULT NULL,
  "yr2Targets" varchar(255) DEFAULT NULL,
  "yr3Targets" varchar(255) DEFAULT NULL,
  "yr4Targets" varchar(255) DEFAULT NULL,
  "yr5Targets" varchar(255) DEFAULT NULL,
  "yr1Budget" decimal(15,2) DEFAULT NULL,
  "yr2Budget" decimal(15,2) DEFAULT NULL,
  "yr3Budget" decimal(15,2) DEFAULT NULL,
  "yr4Budget" decimal(15,2) DEFAULT NULL,
  "yr5Budget" decimal(15,2) DEFAULT NULL,
  "totalBudget" decimal(15,2) DEFAULT NULL,
  "remarks" text,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("subProgramId") 
) ;

CREATE TABLE "user_dashboard_preferences" (
  "id" int NOT NULL ,
  "user_id" int NOT NULL,
  "tab_key" varchar(50) NOT NULL,
  "component_key" varchar(100) NOT NULL,
  "is_enabled" BOOLEAN DEFAULT '1',
  "component_order" int DEFAULT '0',
  "custom_settings" json DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "user_data_filters" (
  "id" int NOT NULL ,
  "user_id" int NOT NULL,
  "filter_type" VARCHAR(50) NOT NULL,
  "filter_key" varchar(100) NOT NULL,
  "filter_value" json NOT NULL,
  "is_active" BOOLEAN DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "user_department_assignments" (
  "id" int NOT NULL ,
  "user_id" int NOT NULL,
  "department_id" int NOT NULL,
  "is_primary" BOOLEAN DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "user_project_assignments" (
  "id" int NOT NULL ,
  "user_id" int NOT NULL,
  "project_id" int NOT NULL,
  "access_level" VARCHAR(50) DEFAULT 'view',
  "assigned_by" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id") ) ;

CREATE TABLE "user_ward_assignments" (
  "id" int NOT NULL ,
  "user_id" int NOT NULL,
  "ward_id" int NOT NULL,
  "access_level" VARCHAR(50) DEFAULT 'read',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")) ;

CREATE TABLE "users" (
  "userId" int NOT NULL ,
  "username" varchar(255) DEFAULT NULL,
  "passwordHash" varchar(255) DEFAULT NULL,
  "email" text,
  "firstName" varchar(255) DEFAULT NULL,
  "lastName" varchar(255) DEFAULT NULL,
  "roleId" int DEFAULT NULL,
  "isActive" BOOLEAN DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT NULL,
  "updatedAt" TIMESTAMP DEFAULT NULL,
  "voided" BOOLEAN DEFAULT '0',
  PRIMARY KEY ("userId")
) ;

CREATE TABLE "wards" (
  "wardId" int NOT NULL ,
  "subcountyId" int DEFAULT NULL,
  "name" varchar(255) DEFAULT NULL,
  "postalCode" varchar(255) DEFAULT NULL,
  "email" text,
  "phone" varchar(255) DEFAULT NULL,
  "address" text,
  "polygon" text,
  "geoSpatial" varchar(255) DEFAULT NULL,
  "geoCode" varchar(255) DEFAULT NULL,
  "geoLat" varchar(255) DEFAULT NULL,
  "geoLon" varchar(255) DEFAULT NULL,
  "voided" BOOLEAN DEFAULT NULL,
  "userId" int DEFAULT NULL,
  "createdAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NULL DEFAULT CURRENT_TIMESTAMP ,
  "voidedBy" int DEFAULT NULL,
  PRIMARY KEY ("wardId") NULL
) ;