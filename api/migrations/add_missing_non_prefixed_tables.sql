-- Migration: Add missing tables that don't have kemri_ prefix
-- These tables exist in the original database but were missing from gov_db
-- Date: 2026-02-28

SET FOREIGN_KEY_CHECKS = 0;

-- Chat system tables
CREATE TABLE IF NOT EXISTS `chat_rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(255) NOT NULL,
  `room_type` enum('direct','group','project','department','role') NOT NULL,
  `project_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `fk_chat_rooms_project` (`project_id`),
  KEY `fk_chat_rooms_creator` (`created_by`),
  KEY `idx_chat_rooms_type` (`room_type`),
  KEY `idx_chat_rooms_active` (`is_active`),
  KEY `fk_chat_rooms_role` (`role_id`),
  CONSTRAINT `fk_chat_rooms_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_rooms_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_rooms_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`roleId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `chat_room_participants` (
  `room_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `is_muted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`room_id`,`user_id`),
  KEY `fk_chat_participants_user` (`user_id`),
  KEY `idx_chat_participants_user` (`user_id`),
  CONSTRAINT `fk_chat_participants_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_participants_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `message_text` text,
  `message_type` enum('text','file','image','system','announcement') DEFAULT 'text',
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `reply_to_message_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `edited_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`message_id`),
  KEY `fk_chat_messages_room` (`room_id`),
  KEY `fk_chat_messages_sender` (`sender_id`),
  KEY `fk_chat_messages_reply` (`reply_to_message_id`),
  KEY `idx_chat_messages_created_at` (`created_at`),
  KEY `idx_chat_messages_room_created` (`room_id`,`created_at`),
  CONSTRAINT `fk_chat_messages_reply` FOREIGN KEY (`reply_to_message_id`) REFERENCES `chat_messages` (`message_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_chat_messages_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `chat_message_reactions` (
  `message_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reaction_type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`,`user_id`,`reaction_type`),
  KEY `fk_chat_reactions_user` (`user_id`),
  CONSTRAINT `fk_chat_reactions_message` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`message_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_reactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Citizen features tables
CREATE TABLE IF NOT EXISTS `citizen_proposals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `estimated_cost` decimal(15,2) NOT NULL,
  `proposer_name` varchar(255) NOT NULL,
  `proposer_email` varchar(255) NOT NULL,
  `proposer_phone` varchar(50) NOT NULL,
  `proposer_address` text,
  `justification` text NOT NULL,
  `expected_benefits` text NOT NULL,
  `timeline` varchar(100) NOT NULL,
  `status` enum('Draft','Under Review','Approved','Rejected') DEFAULT 'Under Review',
  `submission_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_notes` text,
  `voided` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_for_public` tinyint(1) DEFAULT '0' COMMENT 'Whether this proposal is approved for public viewing',
  `approved_by` int DEFAULT NULL COMMENT 'User ID who approved this for public viewing',
  `approved_at` datetime DEFAULT NULL COMMENT 'Date and time when approved for public viewing',
  `approval_notes` text COMMENT 'Notes from the approver',
  `revision_requested` tinyint(1) DEFAULT '0' COMMENT 'Whether revisions have been requested',
  `revision_notes` text COMMENT 'Notes from approver about what needs to be changed',
  `revision_requested_by` int DEFAULT NULL COMMENT 'User ID who requested revisions',
  `revision_requested_at` datetime DEFAULT NULL COMMENT 'Date and time when revisions were requested',
  `revision_submitted_at` datetime DEFAULT NULL COMMENT 'Date and time when creator submitted revisions',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_submission_date` (`submission_date`),
  KEY `idx_reviewed_by` (`reviewed_by`),
  KEY `idx_approved_for_public` (`approved_for_public`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `idx_revision_requested` (`revision_requested`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `county_proposed_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `estimated_cost` decimal(15,2) NOT NULL,
  `justification` text NOT NULL,
  `expected_benefits` text NOT NULL,
  `timeline` varchar(100) NOT NULL,
  `status` enum('Planning','Approved','Implementation','Completed','Cancelled') DEFAULT 'Planning',
  `priority` enum('High','Medium','Low') DEFAULT 'Medium',
  `department` varchar(255) NOT NULL,
  `project_manager` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `progress` decimal(5,2) DEFAULT '0.00',
  `budget_allocated` decimal(15,2) DEFAULT '0.00',
  `budget_utilized` decimal(15,2) DEFAULT '0.00',
  `stakeholders` text,
  `risks` text,
  `created_by` int DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_for_public` tinyint(1) DEFAULT '0' COMMENT 'Whether this project is approved for public viewing',
  `approved_by` int DEFAULT NULL COMMENT 'User ID who approved this for public viewing',
  `approved_at` datetime DEFAULT NULL COMMENT 'Date and time when approved for public viewing',
  `approval_notes` text COMMENT 'Notes from the approver',
  `revision_requested` tinyint(1) DEFAULT '0' COMMENT 'Whether revisions have been requested',
  `revision_notes` text COMMENT 'Notes from approver about what needs to be changed',
  `revision_requested_by` int DEFAULT NULL COMMENT 'User ID who requested revisions',
  `revision_requested_at` datetime DEFAULT NULL COMMENT 'Date and time when revisions were requested',
  `revision_submitted_at` datetime DEFAULT NULL COMMENT 'Date and time when creator submitted revisions',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_priority` (`priority`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_approved_for_public` (`approved_for_public`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `idx_revision_requested` (`revision_requested`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `county_proposed_project_milestones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `target_date` date NOT NULL,
  `completed` tinyint(1) DEFAULT '0',
  `completed_date` date DEFAULT NULL,
  `sequence_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_milestone_project` (`project_id`),
  CONSTRAINT `fk_milestone_project` FOREIGN KEY (`project_id`) REFERENCES `county_proposed_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `project_announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `content` text NOT NULL,
  `category` enum('Project Launch','Public Consultation','Progress Update','Completion','Tender Notice','General Announcement','Public Participation','Project Update','Call for Proposals','Service Notice','Emergency') NOT NULL,
  `type` enum('Meeting','Workshop','Public Forum','Launch Event','Progress Report','Tender','General','Event','Update','Opportunity','Notice','Emergency') NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `location` varchar(255) NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `status` enum('Upcoming','Active','Completed','Open','Closed','Cancelled') DEFAULT 'Upcoming',
  `priority` enum('High','Medium','Low') DEFAULT 'Medium',
  `image_url` varchar(500) DEFAULT NULL,
  `attendees` int DEFAULT '0',
  `max_attendees` int DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_for_public` tinyint(1) DEFAULT '0' COMMENT 'Whether this announcement is approved for public viewing',
  `approved_by` int DEFAULT NULL COMMENT 'User ID who approved this for public viewing',
  `approved_at` datetime DEFAULT NULL COMMENT 'Date and time when approved for public viewing',
  `approval_notes` text COMMENT 'Notes from the approver',
  `revision_requested` tinyint(1) DEFAULT '0' COMMENT 'Whether revisions have been requested',
  `revision_notes` text COMMENT 'Notes from approver about what needs to be changed',
  `revision_requested_by` int DEFAULT NULL COMMENT 'User ID who requested revisions',
  `revision_requested_at` datetime DEFAULT NULL COMMENT 'Date and time when revisions were requested',
  `revision_submitted_at` datetime DEFAULT NULL COMMENT 'Date and time when creator submitted revisions',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_date` (`date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_approved_for_public` (`approved_for_public`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `idx_revision_requested` (`revision_requested`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Feedback system tables
CREATE TABLE IF NOT EXISTS `public_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional - Respondent name (for follow-up)',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` int DEFAULT NULL,
  `status` enum('pending','reviewed','responded','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `admin_response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `responded_by` int DEFAULT NULL,
  `responded_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rating_overall_support` tinyint DEFAULT NULL COMMENT 'Overall Satisfaction/Support (1=Strongly Oppose, 5=Strongly Support)',
  `rating_quality_of_life_impact` tinyint DEFAULT NULL COMMENT 'Perceived Impact on Quality of Life (1=Highly Negative, 5=Highly Positive)',
  `rating_community_alignment` tinyint DEFAULT NULL COMMENT 'Alignment with Community Needs (1=Not Aligned, 5=Perfectly Aligned)',
  `rating_transparency` tinyint DEFAULT NULL COMMENT 'Perceived Transparency and Communication (1=Very Poor, 5=Excellent)',
  `rating_feasibility_confidence` tinyint DEFAULT NULL COMMENT 'Confidence in Timeline and Budget (1=Very Low, 5=Very High)',
  `moderation_status` enum('pending','approved','rejected','flagged') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `moderation_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `custom_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `moderator_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `moderated_by` int DEFAULT NULL,
  `moderated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `responded_by` (`responded_by`),
  KEY `idx_status` (`status`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_ratings` (`rating_overall_support`,`rating_quality_of_life_impact`,`rating_community_alignment`,`rating_transparency`,`rating_feasibility_confidence`),
  CONSTRAINT `public_feedback_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `public_feedback_ibfk_2` FOREIGN KEY (`responded_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `public_feedback_chk_1` CHECK ((`rating_overall_support` between 1 and 5)),
  CONSTRAINT `public_feedback_chk_2` CHECK ((`rating_quality_of_life_impact` between 1 and 5)),
  CONSTRAINT `public_feedback_chk_3` CHECK ((`rating_community_alignment` between 1 and 5)),
  CONSTRAINT `public_feedback_chk_4` CHECK ((`rating_transparency` between 1 and 5)),
  CONSTRAINT `public_feedback_chk_5` CHECK ((`rating_feasibility_confidence` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Public feedback with 5-point Likert scale ratings for county projects';

CREATE TABLE IF NOT EXISTS `approved_public_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feedback_id` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `approval_notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feedback_id` (`feedback_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `approved_public_feedback_ibfk_1` FOREIGN KEY (`feedback_id`) REFERENCES `public_feedback` (`id`) ON DELETE CASCADE,
  CONSTRAINT `approved_public_feedback_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `feedback_moderation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feedback_id` int NOT NULL,
  `feedback_type` enum('public_feedback','project_feedback') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public_feedback',
  `moderation_status` enum('pending','approved','rejected','flagged') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `moderation_reason` enum('inappropriate_content','spam','off_topic','personal_attack','false_information','duplicate','incomplete','language_violation','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `custom_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `moderator_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `moderated_by` int DEFAULT NULL,
  `moderated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_feedback_moderation` (`feedback_id`,`feedback_type`),
  KEY `idx_feedback_id` (`feedback_id`),
  KEY `idx_moderation_status` (`moderation_status`),
  KEY `idx_moderated_by` (`moderated_by`),
  KEY `idx_moderated_at` (`moderated_at`),
  KEY `idx_feedback_type` (`feedback_type`),
  CONSTRAINT `feedback_moderation_ibfk_1` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `feedback_moderation_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_name` (`setting_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `moderation_queue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feedback_id` int NOT NULL,
  `feedback_type` enum('public_feedback','project_feedback') DEFAULT 'public_feedback',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `queued_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_id` (`feedback_id`),
  KEY `idx_feedback_type` (`feedback_type`),
  KEY `idx_priority` (`priority`),
  KEY `idx_queued_at` (`queued_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard system tables
CREATE TABLE IF NOT EXISTS `dashboard_tabs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tab_key` varchar(50) NOT NULL,
  `tab_name` varchar(100) NOT NULL,
  `tab_icon` varchar(100) DEFAULT NULL,
  `tab_order` int DEFAULT '0',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tab_key` (`tab_key`),
  KEY `idx_dashboard_tabs_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `dashboard_components` (
  `id` int NOT NULL AUTO_INCREMENT,
  `component_key` varchar(100) NOT NULL,
  `component_name` varchar(200) NOT NULL,
  `component_type` varchar(50) NOT NULL,
  `component_file` varchar(200) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `component_key` (`component_key`),
  KEY `idx_dashboard_components_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `dashboard_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `permission_key` varchar(100) NOT NULL,
  `permission_name` varchar(200) NOT NULL,
  `description` text,
  `component_key` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_key` (`permission_key`),
  KEY `component_key` (`component_key`),
  CONSTRAINT `dashboard_permissions_ibfk_1` FOREIGN KEY (`component_key`) REFERENCES `dashboard_components` (`component_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `component_data_access_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `component_key` varchar(100) NOT NULL,
  `rule_type` enum('department','ward','project','budget','status','custom') NOT NULL,
  `rule_config` json NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_comp_access_component` (`component_key`),
  KEY `idx_rule_type` (`rule_type`),
  CONSTRAINT `fk_comp_access_component` FOREIGN KEY (`component_key`) REFERENCES `dashboard_components` (`component_key`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `role_dashboard_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `tab_key` varchar(50) NOT NULL,
  `component_key` varchar(100) NOT NULL,
  `component_order` int DEFAULT '0',
  `is_required` tinyint(1) DEFAULT '0',
  `permissions` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_tab_component` (`role_name`,`tab_key`,`component_key`),
  KEY `component_key` (`component_key`),
  KEY `idx_role_dashboard_config_role` (`role_name`),
  KEY `idx_role_dashboard_config_tab` (`tab_key`),
  CONSTRAINT `role_dashboard_config_ibfk_1` FOREIGN KEY (`tab_key`) REFERENCES `dashboard_tabs` (`tab_key`),
  CONSTRAINT `role_dashboard_config_ibfk_2` FOREIGN KEY (`component_key`) REFERENCES `dashboard_components` (`component_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `role_dashboard_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `granted` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_name`,`permission_key`),
  KEY `permission_key` (`permission_key`),
  KEY `idx_role_dashboard_permissions_role` (`role_name`),
  CONSTRAINT `role_dashboard_permissions_ibfk_1` FOREIGN KEY (`permission_key`) REFERENCES `dashboard_permissions` (`permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_dashboard_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tab_key` varchar(50) NOT NULL,
  `component_key` varchar(100) NOT NULL,
  `is_enabled` tinyint(1) DEFAULT '1',
  `component_order` int DEFAULT '0',
  `custom_settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_tab_component` (`user_id`,`tab_key`,`component_key`),
  KEY `tab_key` (`tab_key`),
  KEY `component_key` (`component_key`),
  KEY `idx_user_dashboard_preferences_user` (`user_id`),
  CONSTRAINT `user_dashboard_preferences_ibfk_1` FOREIGN KEY (`tab_key`) REFERENCES `dashboard_tabs` (`tab_key`),
  CONSTRAINT `user_dashboard_preferences_ibfk_2` FOREIGN KEY (`component_key`) REFERENCES `dashboard_components` (`component_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User access control tables
CREATE TABLE IF NOT EXISTS `user_data_filters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `filter_type` enum('budget_range','progress_status','project_type','date_range','custom') NOT NULL,
  `filter_key` varchar(100) NOT NULL,
  `filter_value` json NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user_filter_user` (`user_id`),
  KEY `idx_filter_type` (`filter_type`),
  CONSTRAINT `fk_user_filter_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_department_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `department_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_department` (`user_id`,`department_id`),
  KEY `fk_user_dept_user` (`user_id`),
  KEY `fk_user_dept_department` (`department_id`),
  CONSTRAINT `fk_user_dept_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`departmentId`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_dept_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_project_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `access_level` enum('view','edit','manage','admin') DEFAULT 'view',
  `assigned_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_project` (`user_id`,`project_id`),
  KEY `fk_user_proj_user` (`user_id`),
  KEY `fk_user_proj_project` (`project_id`),
  KEY `fk_user_proj_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_user_proj_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_proj_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_proj_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_ward_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `ward_id` int NOT NULL,
  `access_level` enum('read','write','admin') DEFAULT 'read',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_ward` (`user_id`,`ward_id`),
  KEY `fk_user_ward_user` (`user_id`),
  KEY `fk_user_ward_ward` (`ward_id`),
  CONSTRAINT `fk_user_ward_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_ward_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`wardId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
