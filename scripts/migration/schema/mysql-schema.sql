mysqldump: [Warning] Using a password on the command line interface can be insecure.
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces
-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: gov_imbesdb
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `activityId` int NOT NULL AUTO_INCREMENT,
  `workplanId` int DEFAULT NULL,
  `projectId` int DEFAULT NULL,
  `activityName` text,
  `activityDescription` text,
  `responsibleOfficer` varchar(255) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `budgetAllocated` decimal(15,2) DEFAULT NULL,
  `actualCost` decimal(15,2) DEFAULT NULL,
  `percentageComplete` decimal(5,2) DEFAULT '0.00',
  `activityStatus` enum('not_started','in_progress','completed','delayed','cancelled') DEFAULT 'not_started',
  `voided` tinyint(1) DEFAULT '0',
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `remarks` text,
  PRIMARY KEY (`activityId`),
  KEY `idx_workplan` (`workplanId`),
  KEY `idx_project` (`projectId`),
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`workplanId`) REFERENCES `annual_workplans` (`workplanId`),
  CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `fk_activities_projects` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `annual_workplans`
--

DROP TABLE IF EXISTS `annual_workplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annual_workplans` (
  `workplanId` int NOT NULL AUTO_INCREMENT,
  `subProgramId` int DEFAULT NULL,
  `financialYear` varchar(9) DEFAULT NULL,
  `workplanName` varchar(255) DEFAULT NULL,
  `workplanDescription` text,
  `approvalStatus` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
  `totalBudget` decimal(15,2) DEFAULT NULL,
  `actualExpenditure` decimal(15,2) DEFAULT '0.00',
  `performanceScore` decimal(5,2) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `challenges` text,
  `lessons` text,
  `recommendations` text,
  PRIMARY KEY (`workplanId`),
  KEY `idx_subprogram` (`subProgramId`),
  KEY `idx_financial_year` (`financialYear`),
  CONSTRAINT `annual_workplans_ibfk_1` FOREIGN KEY (`subProgramId`) REFERENCES `subprograms` (`subProgramId`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `approved_public_feedback`
--

DROP TABLE IF EXISTS `approved_public_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approved_public_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feedback_id` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `approval_notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feedback_id` (`feedback_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `approved_public_feedback_ibfk_1` FOREIGN KEY (`feedback_id`) REFERENCES `public_feedback` (`id`) ON DELETE CASCADE,
  CONSTRAINT `approved_public_feedback_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assigned_assets`
--

DROP TABLE IF EXISTS `assigned_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigned_assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `assetName` varchar(255) NOT NULL,
  `serialNumber` varchar(255) DEFAULT NULL,
  `assignmentDate` date NOT NULL,
  `returnDate` date DEFAULT NULL,
  `condition` varchar(255) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `assigned_assets_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachments` (
  `attachmentId` int NOT NULL AUTO_INCREMENT,
  `assetId` int DEFAULT NULL,
  `typeId` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `path` text,
  `size` int DEFAULT NULL,
  `contentBlob` varchar(255) DEFAULT NULL,
  `description` text,
  `documentNo` varchar(255) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT NULL,
  `voidedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`attachmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attachmenttypes`
--

DROP TABLE IF EXISTS `attachmenttypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachmenttypes` (
  `typeId` int NOT NULL AUTO_INCREMENT,
  `attachmentName` varchar(255) DEFAULT NULL,
  `description` text,
  `voided` tinyint(1) DEFAULT NULL,
  `voidedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`typeId`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `date` date NOT NULL,
  `checkInTime` datetime NOT NULL,
  `checkOutTime` datetime DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `budget_changes`
--

DROP TABLE IF EXISTS `budget_changes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_changes` (
  `changeId` int NOT NULL AUTO_INCREMENT,
  `budgetId` int NOT NULL,
  `itemId` int DEFAULT NULL,
  `changeType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `changeReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending Approval',
  `oldValue` json DEFAULT NULL,
  `newValue` json DEFAULT NULL,
  `requestedBy` int NOT NULL,
  `requestedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewedBy` int DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `reviewNotes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `userId` int NOT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `voidedBy` int DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`changeId`),
  KEY `idx_budgetId` (`budgetId`),
  KEY `idx_itemId` (`itemId`),
  KEY `idx_status` (`status`),
  KEY `idx_voided` (`voided`),
  KEY `fk_budget_changes_requestedBy` (`requestedBy`),
  KEY `fk_budget_changes_reviewedBy` (`reviewedBy`),
  CONSTRAINT `fk_budget_changes_budget` FOREIGN KEY (`budgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_changes_item` FOREIGN KEY (`itemId`) REFERENCES `budget_items` (`itemId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_changes_requestedBy` FOREIGN KEY (`requestedBy`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_changes_reviewedBy` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `budget_combinations`
--

DROP TABLE IF EXISTS `budget_combinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_combinations` (
  `combinationId` int NOT NULL AUTO_INCREMENT,
  `combinedBudgetId` int NOT NULL COMMENT 'The parent combined budget container',
  `containerBudgetId` int NOT NULL COMMENT 'A container that is part of the combined budget',
  `displayOrder` int DEFAULT '0' COMMENT 'Order in which containers appear in the combined view',
  `userId` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`combinationId`),
  UNIQUE KEY `unique_combination` (`combinedBudgetId`,`containerBudgetId`),
  KEY `idx_combinedBudgetId` (`combinedBudgetId`),
  KEY `idx_containerBudgetId` (`containerBudgetId`),
  KEY `fk_combinations_user` (`userId`),
  CONSTRAINT `fk_combinations_combined` FOREIGN KEY (`combinedBudgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_combinations_container` FOREIGN KEY (`containerBudgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_combinations_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `budget_items`
--

DROP TABLE IF EXISTS `budget_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_items` (
  `itemId` int NOT NULL AUTO_INCREMENT,
  `budgetId` int NOT NULL,
  `projectId` int DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `addedAfterApproval` tinyint(1) DEFAULT '0',
  `changeRequestId` int DEFAULT NULL,
  `userId` int NOT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `voidedBy` int DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`itemId`),
  KEY `idx_budgetId` (`budgetId`),
  KEY `idx_projectId` (`projectId`),
  KEY `idx_voided` (`voided`),
  KEY `fk_budget_items_user` (`userId`),
  CONSTRAINT `fk_budget_items_budget` FOREIGN KEY (`budgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_items_project` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_items_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `budgetId` int NOT NULL AUTO_INCREMENT,
  `budgetName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `budgetType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `isCombined` tinyint(1) DEFAULT '0',
  `parentBudgetId` int DEFAULT NULL,
  `finYearId` int NOT NULL,
  `departmentId` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `totalAmount` decimal(15,2) DEFAULT '0.00',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `isFrozen` tinyint(1) DEFAULT '0',
  `requiresApprovalForChanges` tinyint(1) DEFAULT '1',
  `approvedBy` int DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `rejectedBy` int DEFAULT NULL,
  `rejectedAt` datetime DEFAULT NULL,
  `rejectionReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `userId` int NOT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `voidedBy` int DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`budgetId`),
  KEY `idx_finYearId` (`finYearId`),
  KEY `idx_departmentId` (`departmentId`),
  KEY `idx_status` (`status`),
  KEY `idx_voided` (`voided`),
  KEY `fk_budgets_user` (`userId`),
  KEY `idx_isCombined` (`isCombined`),
  KEY `idx_parentBudgetId` (`parentBudgetId`),
  CONSTRAINT `fk_budgets_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`departmentId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budgets_finYear` FOREIGN KEY (`finYearId`) REFERENCES `financialyears` (`finYearId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_budgets_parent` FOREIGN KEY (`parentBudgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budgets_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `categoryId` int NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(255) DEFAULT NULL,
  `description` text,
  `picture` varchar(255) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT NULL,
  `voidedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`categoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category_milestones`
--

DROP TABLE IF EXISTS `category_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_milestones` (
  `milestoneId` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `milestoneName` varchar(255) NOT NULL,
  `description` text,
  `sequenceOrder` int NOT NULL,
  `userId` int DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`milestoneId`),
  KEY `userId` (`userId`),
  KEY `fk_category_milestones_category` (`categoryId`),
  CONSTRAINT `category_milestones_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `fk_category_milestones_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`categoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_message_reactions`
--

DROP TABLE IF EXISTS `chat_message_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_message_reactions` (
  `message_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reaction_type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`,`user_id`,`reaction_type`),
  KEY `fk_chat_reactions_user` (`user_id`),
  CONSTRAINT `fk_chat_reactions_message` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`message_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_reactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_room_participants`
--

DROP TABLE IF EXISTS `chat_room_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_room_participants` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `citizen_proposals`
--

DROP TABLE IF EXISTS `citizen_proposals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citizen_proposals` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `component_data_access_rules`
--

DROP TABLE IF EXISTS `component_data_access_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `component_data_access_rules` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contractor_users`
--

DROP TABLE IF EXISTS `contractor_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractor_users` (
  `contractorUserId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `contractorId` int NOT NULL,
  PRIMARY KEY (`contractorUserId`),
  KEY `userId` (`userId`),
  KEY `contractorId` (`contractorId`),
  CONSTRAINT `contractor_users_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `contractor_users_ibfk_2` FOREIGN KEY (`contractorId`) REFERENCES `contractors` (`contractorId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contractors`
--

DROP TABLE IF EXISTS `contractors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractors` (
  `contractorId` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`contractorId`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `counties`
--

DROP TABLE IF EXISTS `counties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `counties` (
  `countyId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `geoSpatial` varchar(255) DEFAULT NULL,
  `geoCode` varchar(255) DEFAULT NULL,
  `geoLat` decimal(10,7) DEFAULT NULL,
  `geoLon` decimal(10,7) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`countyId`),
  UNIQUE KEY `uq_county_name` (`name`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `counties_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `counties_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `county_proposed_project_milestones`
--

DROP TABLE IF EXISTS `county_proposed_project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `county_proposed_project_milestones` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `county_proposed_projects`
--

DROP TABLE IF EXISTS `county_proposed_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `county_proposed_projects` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dashboard_components`
--

DROP TABLE IF EXISTS `dashboard_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard_components` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dashboard_permissions`
--

DROP TABLE IF EXISTS `dashboard_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard_permissions` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dashboard_tabs`
--

DROP TABLE IF EXISTS `dashboard_tabs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard_tabs` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `departmentId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `alias` text,
  `location` text,
  `address` text,
  `contactPerson` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `email` text,
  `remarks` text,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`departmentId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_bank_details`
--

DROP TABLE IF EXISTS `employee_bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_bank_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountNumber` varchar(255) NOT NULL,
  `branchName` varchar(255) DEFAULT NULL,
  `isPrimary` tinyint DEFAULT '0',
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_bank_details_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_benefits`
--

DROP TABLE IF EXISTS `employee_benefits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_benefits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `benefitName` varchar(255) NOT NULL,
  `enrollmentDate` date DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_benefits_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_compensation`
--

DROP TABLE IF EXISTS `employee_compensation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_compensation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `baseSalary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT NULL,
  `bonuses` decimal(10,2) DEFAULT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `accountNumber` varchar(255) DEFAULT NULL,
  `payFrequency` varchar(50) NOT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_compensation_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_contracts`
--

DROP TABLE IF EXISTS `employee_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_contracts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `contractType` varchar(50) NOT NULL,
  `contractStartDate` date NOT NULL,
  `contractEndDate` date DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_contracts_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_dependants`
--

DROP TABLE IF EXISTS `employee_dependants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_dependants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `dependantName` varchar(255) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_dependants_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_disciplinary`
--

DROP TABLE IF EXISTS `employee_disciplinary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_disciplinary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `actionType` varchar(255) NOT NULL,
  `actionDate` date NOT NULL,
  `reason` text NOT NULL,
  `comments` text,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_disciplinary_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_leave_entitlements`
--

DROP TABLE IF EXISTS `employee_leave_entitlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_leave_entitlements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `leaveTypeId` int NOT NULL,
  `year` int NOT NULL,
  `allocatedDays` decimal(5,2) NOT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `entitlement_unique` (`staffId`,`leaveTypeId`,`year`),
  KEY `leaveTypeId` (`leaveTypeId`),
  CONSTRAINT `employee_leave_entitlements_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`),
  CONSTRAINT `employee_leave_entitlements_ibfk_2` FOREIGN KEY (`leaveTypeId`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_loans`
--

DROP TABLE IF EXISTS `employee_loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `loanAmount` decimal(10,2) NOT NULL,
  `loanDate` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `repaymentSchedule` text,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_loans_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_memberships`
--

DROP TABLE IF EXISTS `employee_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_memberships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `organizationName` varchar(255) NOT NULL,
  `membershipNumber` varchar(255) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_memberships_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_performance`
--

DROP TABLE IF EXISTS `employee_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_performance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `reviewDate` date NOT NULL,
  `reviewScore` int DEFAULT NULL,
  `comments` text,
  `reviewerId` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId_fk` (`staffId`),
  CONSTRAINT `performance_staff_fk` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_project_assignments`
--

DROP TABLE IF EXISTS `employee_project_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_project_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `projectId` varchar(255) NOT NULL,
  `milestoneName` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `dueDate` date DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_project_assignments_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_promotions`
--

DROP TABLE IF EXISTS `employee_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `oldJobGroupId` int DEFAULT NULL,
  `newJobGroupId` int DEFAULT NULL,
  `promotionDate` date NOT NULL,
  `comments` text,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  KEY `oldJobGroupId` (`oldJobGroupId`),
  KEY `newJobGroupId` (`newJobGroupId`),
  CONSTRAINT `employee_promotions_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`),
  CONSTRAINT `employee_promotions_ibfk_2` FOREIGN KEY (`oldJobGroupId`) REFERENCES `job_groups` (`id`),
  CONSTRAINT `employee_promotions_ibfk_3` FOREIGN KEY (`newJobGroupId`) REFERENCES `job_groups` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_retirements`
--

DROP TABLE IF EXISTS `employee_retirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_retirements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `retirementDate` date NOT NULL,
  `retirementType` varchar(255) NOT NULL,
  `comments` text,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_retirements_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_terminations`
--

DROP TABLE IF EXISTS `employee_terminations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_terminations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `exitDate` date NOT NULL,
  `reason` text NOT NULL,
  `exitInterviewDetails` text,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_terminations_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_training`
--

DROP TABLE IF EXISTS `employee_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_training` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `courseName` varchar(255) NOT NULL,
  `institution` varchar(255) DEFAULT NULL,
  `certificationName` varchar(255) DEFAULT NULL,
  `completionDate` date DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `employee_training_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feedback_moderation`
--

DROP TABLE IF EXISTS `feedback_moderation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback_moderation` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feedback_moderation_settings`
--

DROP TABLE IF EXISTS `feedback_moderation_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback_moderation_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_name` (`setting_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `financialyears`
--

DROP TABLE IF EXISTS `financialyears`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financialyears` (
  `finYearId` int NOT NULL AUTO_INCREMENT,
  `finYearName` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `remarks` text,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`finYearId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `financialyears_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `financialyears_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inspection_teams`
--

DROP TABLE IF EXISTS `inspection_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `staffId` int NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `voided` tinyint NOT NULL DEFAULT '0',
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `requestId` (`requestId`),
  KEY `staffId` (`staffId`),
  KEY `userId` (`userId`),
  CONSTRAINT `inspection_teams_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `project_payment_requests` (`requestId`) ON DELETE CASCADE,
  CONSTRAINT `inspection_teams_ibfk_2` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`) ON DELETE RESTRICT,
  CONSTRAINT `inspection_teams_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_groups`
--

DROP TABLE IF EXISTS `job_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `groupName` varchar(255) NOT NULL,
  `salaryScale` decimal(10,2) DEFAULT NULL,
  `description` text,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leave_applications`
--

DROP TABLE IF EXISTS `leave_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `leaveTypeId` int NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `numberOfDays` int DEFAULT NULL,
  `reason` text,
  `handoverStaffId` int DEFAULT NULL,
  `handoverComments` text,
  `status` enum('Pending','Approved','Rejected','Completed') DEFAULT 'Pending',
  `approvedStartDate` date DEFAULT NULL,
  `approvedEndDate` date DEFAULT NULL,
  `actualReturnDate` date DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  KEY `handoverStaffId` (`handoverStaffId`),
  KEY `leaveTypeId` (`leaveTypeId`),
  CONSTRAINT `leave_applications_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`),
  CONSTRAINT `leave_applications_ibfk_2` FOREIGN KEY (`handoverStaffId`) REFERENCES `staff` (`staffId`),
  CONSTRAINT `leave_applications_ibfk_3` FOREIGN KEY (`leaveTypeId`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `numberOfDays` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `milestone_activities`
--

DROP TABLE IF EXISTS `milestone_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `milestone_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `milestoneId` int NOT NULL,
  `activityId` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_milestone_activity` (`milestoneId`,`activityId`),
  KEY `activityId` (`activityId`),
  CONSTRAINT `milestone_activities_ibfk_1` FOREIGN KEY (`milestoneId`) REFERENCES `project_milestones` (`milestoneId`),
  CONSTRAINT `milestone_activities_ibfk_2` FOREIGN KEY (`activityId`) REFERENCES `activities` (`activityId`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `milestone_attachments`
--

DROP TABLE IF EXISTS `milestone_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `milestone_attachments` (
  `attachmentId` int NOT NULL AUTO_INCREMENT,
  `milestoneId` int NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `filePath` varchar(255) NOT NULL,
  `fileType` varchar(50) DEFAULT NULL,
  `description` text,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  `fileSize` int DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachmentId`),
  KEY `milestoneId` (`milestoneId`),
  KEY `userId` (`userId`),
  CONSTRAINT `milestone_attachments_ibfk_1` FOREIGN KEY (`milestoneId`) REFERENCES `project_milestones` (`milestoneId`) ON DELETE CASCADE,
  CONSTRAINT `milestone_attachments_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `moderation_queue`
--

DROP TABLE IF EXISTS `moderation_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moderation_queue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feedback_id` int NOT NULL,
  `feedback_type` enum('public_feedback','project_feedback') COLLATE utf8mb4_unicode_ci DEFAULT 'public_feedback',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `queued_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_id` (`feedback_id`),
  KEY `idx_feedback_type` (`feedback_type`),
  KEY `idx_priority` (`priority`),
  KEY `idx_queued_at` (`queued_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_payroll`
--

DROP TABLE IF EXISTS `monthly_payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_payroll` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `payPeriod` date NOT NULL,
  `grossSalary` decimal(10,2) NOT NULL,
  `netSalary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT NULL,
  `deductions` decimal(10,2) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `monthly_payroll_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `participants`
--

DROP TABLE IF EXISTS `participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `individualId` int DEFAULT NULL,
  `householdId` int DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `villageLocality` int DEFAULT NULL,
  `gpsLongitude` decimal(10,7) DEFAULT NULL,
  `gpsLatitude` decimal(10,7) DEFAULT NULL,
  `vectorBorneDiseaseStatus` varchar(255) DEFAULT NULL,
  `malariaDiagnosis` varchar(255) DEFAULT NULL,
  `dengueDiagnosis` varchar(255) DEFAULT NULL,
  `leishmaniasisDiagnosis` varchar(255) DEFAULT NULL,
  `waterSource` varchar(255) DEFAULT NULL,
  `housingType` varchar(255) DEFAULT NULL,
  `mosquitoNetUsage` int DEFAULT NULL,
  `educationLevel` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `incomeKshMonth` decimal(15,2) DEFAULT NULL,
  `accessToHealthcareKm` varchar(255) DEFAULT NULL,
  `climatePerceptionScore` decimal(15,2) DEFAULT NULL,
  `createdOn` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_approval_history`
--

DROP TABLE IF EXISTS `payment_approval_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_approval_history` (
  `historyId` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `action` enum('Approve','Reject','Comment','Returned for Correction','Assigned') NOT NULL,
  `actionByUserId` int NOT NULL,
  `assignedToUserId` int DEFAULT NULL,
  `actionDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  PRIMARY KEY (`historyId`),
  KEY `requestId` (`requestId`),
  KEY `actionByUserId` (`actionByUserId`),
  KEY `assignedToUserId` (`assignedToUserId`),
  CONSTRAINT `payment_approval_history_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `project_payment_requests` (`requestId`),
  CONSTRAINT `payment_approval_history_ibfk_2` FOREIGN KEY (`actionByUserId`) REFERENCES `users` (`userId`),
  CONSTRAINT `payment_approval_history_ibfk_3` FOREIGN KEY (`assignedToUserId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_approval_levels`
--

DROP TABLE IF EXISTS `payment_approval_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_approval_levels` (
  `levelId` int NOT NULL AUTO_INCREMENT,
  `levelName` varchar(255) NOT NULL,
  `roleId` int NOT NULL,
  `approvalOrder` int NOT NULL,
  `workflowId` int DEFAULT NULL,
  PRIMARY KEY (`levelId`),
  UNIQUE KEY `roleId` (`roleId`,`approvalOrder`),
  KEY `workflowId` (`workflowId`),
  CONSTRAINT `payment_approval_levels_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`roleId`),
  CONSTRAINT `payment_approval_levels_ibfk_2` FOREIGN KEY (`workflowId`) REFERENCES `project_workflows` (`workflowId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_details`
--

DROP TABLE IF EXISTS `payment_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_details` (
  `detailId` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `paymentMode` enum('Bank Transfer','Cheque','Mobile Money','Other') NOT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `accountNumber` varchar(255) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `paidByUserId` int NOT NULL,
  `paidAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdByUserId` int DEFAULT NULL,
  `voided` tinyint NOT NULL DEFAULT '0',
  `voidedByUserId` int DEFAULT NULL,
  PRIMARY KEY (`detailId`),
  UNIQUE KEY `requestId` (`requestId`),
  KEY `paidByUserId` (`paidByUserId`),
  KEY `createdByUserId` (`createdByUserId`),
  KEY `voidedByUserId` (`voidedByUserId`),
  CONSTRAINT `payment_details_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `project_payment_requests` (`requestId`),
  CONSTRAINT `payment_details_ibfk_2` FOREIGN KEY (`paidByUserId`) REFERENCES `users` (`userId`),
  CONSTRAINT `payment_details_ibfk_3` FOREIGN KEY (`createdByUserId`) REFERENCES `users` (`userId`),
  CONSTRAINT `payment_details_ibfk_4` FOREIGN KEY (`voidedByUserId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_request_approvals`
--

DROP TABLE IF EXISTS `payment_request_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_request_approvals` (
  `approvalId` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `stage` varchar(100) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL,
  `comments` text,
  `actionByUserId` int NOT NULL,
  `actionDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint NOT NULL DEFAULT '0',
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`approvalId`),
  KEY `requestId` (`requestId`),
  KEY `actionByUserId` (`actionByUserId`),
  CONSTRAINT `payment_request_approvals_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `project_payment_requests` (`requestId`) ON DELETE CASCADE,
  CONSTRAINT `payment_request_approvals_ibfk_2` FOREIGN KEY (`actionByUserId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_request_documents`
--

DROP TABLE IF EXISTS `payment_request_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_request_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `documentType` enum('invoice','photo','inspection_report','payment_certificate','other') NOT NULL,
  `documentPath` varchar(255) NOT NULL,
  `description` text,
  `uploadedByUserId` int NOT NULL,
  `voided` tinyint NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `requestId` (`requestId`),
  KEY `uploadedByUserId` (`uploadedByUserId`),
  CONSTRAINT `payment_request_documents_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `project_payment_requests` (`requestId`) ON DELETE CASCADE,
  CONSTRAINT `payment_request_documents_ibfk_2` FOREIGN KEY (`uploadedByUserId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_request_milestones`
--

DROP TABLE IF EXISTS `payment_request_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_request_milestones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `activityId` int NOT NULL,
  `status` enum('accomplished','not_accomplished') NOT NULL DEFAULT 'accomplished',
  `voided` tinyint NOT NULL DEFAULT '0',
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `requestId` (`requestId`),
  KEY `activityId` (`activityId`),
  KEY `userId` (`userId`),
  CONSTRAINT `payment_request_milestones_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `project_payment_requests` (`requestId`) ON DELETE CASCADE,
  CONSTRAINT `payment_request_milestones_ibfk_2` FOREIGN KEY (`activityId`) REFERENCES `activities` (`activityId`) ON DELETE CASCADE,
  CONSTRAINT `payment_request_milestones_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_status_definitions`
--

DROP TABLE IF EXISTS `payment_status_definitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_status_definitions` (
  `statusId` int NOT NULL AUTO_INCREMENT,
  `statusName` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`statusId`),
  UNIQUE KEY `statusName` (`statusName`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planningdocuments`
--

DROP TABLE IF EXISTS `planningdocuments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planningdocuments` (
  `attachmentId` int NOT NULL AUTO_INCREMENT,
  `fileName` varchar(255) NOT NULL,
  `filePath` varchar(255) NOT NULL COMMENT 'Path or URL where the file is stored (e.g., S3, local, shared drive)',
  `fileType` varchar(50) DEFAULT NULL COMMENT 'e.g., pdf, docx, xlsx, image/jpeg',
  `fileSize` int DEFAULT NULL COMMENT 'File size in bytes',
  `description` text COMMENT 'Short description of the attachment',
  `entityId` int NOT NULL COMMENT 'The ID of the related strategic plan, program, or subProgram',
  `entityType` varchar(50) NOT NULL COMMENT 'The type of entity: "planPRegistry", "program", "subProgram"',
  `uploadedBy` int DEFAULT NULL COMMENT 'FK to kemri_users.userId or kemri_staff.staffId (who uploaded it)',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`attachmentId`),
  KEY `idx_entity_id_type` (`entityId`,`entityType`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `privileges`
--

DROP TABLE IF EXISTS `privileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `privileges` (
  `privilegeId` int NOT NULL AUTO_INCREMENT,
  `privilegeName` varchar(255) DEFAULT NULL,
  `description` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`privilegeId`),
  UNIQUE KEY `unique_privilege_name` (`privilegeName`)
) ENGINE=InnoDB AUTO_INCREMENT=353 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `programId` int NOT NULL AUTO_INCREMENT,
  `cidpid` varchar(255) DEFAULT NULL,
  `departmentId` int DEFAULT NULL,
  `sectionId` int DEFAULT NULL,
  `programme` text,
  `needsPriorities` text,
  `strategies` varchar(255) DEFAULT NULL,
  `remarks` text,
  `objectives` text,
  `outcomes` text,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`programId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `programs_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=652 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_announcements`
--

DROP TABLE IF EXISTS `project_announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_announcements` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_assignments`
--

DROP TABLE IF EXISTS `project_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `staffId` int NOT NULL,
  `milestoneName` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `dueDate` date DEFAULT NULL,
  `completionDate` date DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `projectId` (`projectId`),
  KEY `staffId` (`staffId`),
  CONSTRAINT `project_assignments_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_assignments_ibfk_2` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_climate_risk`
--

DROP TABLE IF EXISTS `project_climate_risk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_climate_risk` (
  `climateRiskId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `hazardName` varchar(255) NOT NULL,
  `hazardExposure` varchar(50) DEFAULT NULL,
  `vulnerability` varchar(50) DEFAULT NULL,
  `riskLevel` varchar(50) DEFAULT NULL,
  `riskReductionStrategies` text,
  `riskReductionCosts` decimal(15,2) DEFAULT NULL,
  `resourcesRequired` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`climateRiskId`),
  UNIQUE KEY `projectId` (`projectId`,`hazardName`),
  CONSTRAINT `project_climate_risk_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_concept_notes`
--

DROP TABLE IF EXISTS `project_concept_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_concept_notes` (
  `conceptNoteId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `situationAnalysis` text,
  `problemStatement` text,
  `relevanceProjectIdea` text,
  `scopeOfProject` text,
  `projectGoal` text,
  `goalIndicator` text,
  `goalMeansVerification` text,
  `goalAssumptions` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`conceptNoteId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_concept_notes_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_contractor_assignments`
--

DROP TABLE IF EXISTS `project_contractor_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_contractor_assignments` (
  `projectId` int NOT NULL,
  `contractorId` int NOT NULL,
  `assignmentDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`projectId`,`contractorId`),
  KEY `contractorId` (`contractorId`),
  CONSTRAINT `project_contractor_assignments_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_contractor_assignments_ibfk_2` FOREIGN KEY (`contractorId`) REFERENCES `contractors` (`contractorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_counties`
--

DROP TABLE IF EXISTS `project_counties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_counties` (
  `projectId` int NOT NULL,
  `countyId` int NOT NULL,
  `assignedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`projectId`,`countyId`),
  KEY `fk_project_county_county` (`countyId`),
  CONSTRAINT `fk_project_county_county` FOREIGN KEY (`countyId`) REFERENCES `counties` (`countyId`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_county_project` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_documents`
--

DROP TABLE IF EXISTS `project_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `milestoneId` int DEFAULT NULL,
  `requestId` int DEFAULT NULL,
  `documentType` varchar(50) NOT NULL,
  `documentCategory` enum('payment','milestone','general') NOT NULL,
  `documentPath` varchar(255) NOT NULL,
  `description` text,
  `userId` int NOT NULL,
  `isProjectCover` tinyint(1) NOT NULL DEFAULT '0',
  `displayOrder` int DEFAULT NULL,
  `voided` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('pending_review','in_progress','completed','approved','rejected') NOT NULL DEFAULT 'pending_review',
  `progressPercentage` decimal(5,2) DEFAULT NULL,
  `originalFileName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_documents_projects_idx` (`projectId`),
  KEY `fk_documents_milestones_idx` (`milestoneId`),
  KEY `fk_documents_requests_idx` (`requestId`),
  KEY `fk_documents_users_idx` (`userId`),
  CONSTRAINT `fk_documents_milestones` FOREIGN KEY (`milestoneId`) REFERENCES `project_milestones` (`milestoneId`) ON DELETE SET NULL,
  CONSTRAINT `fk_documents_projects` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_documents_requests` FOREIGN KEY (`requestId`) REFERENCES `project_payment_requests` (`requestId`) ON DELETE SET NULL,
  CONSTRAINT `fk_documents_users` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_esohsg_screening`
--

DROP TABLE IF EXISTS `project_esohsg_screening`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_esohsg_screening` (
  `screeningId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `emcaTriggers` tinyint(1) DEFAULT NULL,
  `emcaDescription` text,
  `worldBankSafeguardApplicable` tinyint(1) DEFAULT NULL,
  `worldBankStandards` text,
  `goKPoliciesApplicable` tinyint(1) DEFAULT NULL,
  `goKPoliciesLaws` text,
  `environmentalHealthSafetyImpacts` json DEFAULT NULL,
  `socialImpacts` json DEFAULT NULL,
  `publicParticipationConsultation` json DEFAULT NULL,
  `screeningResultOutcome` text,
  `specialConditions` text,
  `screeningUndertakenBy` varchar(255) DEFAULT NULL,
  `screeningDesignation` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`screeningId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_esohsg_screening_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_financials`
--

DROP TABLE IF EXISTS `project_financials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_financials` (
  `financialsId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `capitalCostConsultancy` decimal(15,2) DEFAULT NULL,
  `capitalCostLandAcquisition` decimal(15,2) DEFAULT NULL,
  `capitalCostSitePrep` decimal(15,2) DEFAULT NULL,
  `capitalCostConstruction` decimal(15,2) DEFAULT NULL,
  `capitalCostPlantEquipment` decimal(15,2) DEFAULT NULL,
  `capitalCostFixturesFittings` decimal(15,2) DEFAULT NULL,
  `capitalCostOther` decimal(15,2) DEFAULT NULL,
  `recurrentCostLabor` decimal(15,2) DEFAULT NULL,
  `recurrentCostOperating` decimal(15,2) DEFAULT NULL,
  `recurrentCostMaintenance` decimal(15,2) DEFAULT NULL,
  `recurrentCostOther` decimal(15,2) DEFAULT NULL,
  `proposedSourceFinancing` varchar(255) DEFAULT NULL,
  `costImplicationsRelatedProjects` text,
  `landExpropriationRequired` tinyint(1) DEFAULT NULL,
  `landExpropriationExpenses` decimal(15,2) DEFAULT NULL,
  `compensationRequired` tinyint(1) DEFAULT NULL,
  `otherAttendantCosts` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`financialsId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_financials_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_fy_breakdown`
--

DROP TABLE IF EXISTS `project_fy_breakdown`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_fy_breakdown` (
  `fyBreakdownId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `financialYear` varchar(20) NOT NULL,
  `totalCost` decimal(15,2) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`fyBreakdownId`),
  UNIQUE KEY `projectId` (`projectId`,`financialYear`),
  CONSTRAINT `project_fy_breakdown_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_hazard_assessment`
--

DROP TABLE IF EXISTS `project_hazard_assessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_hazard_assessment` (
  `hazardId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `hazardName` varchar(255) NOT NULL,
  `question` text,
  `answerYesNo` tinyint(1) DEFAULT NULL,
  `remarks` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`hazardId`),
  UNIQUE KEY `projectId` (`projectId`,`hazardName`),
  CONSTRAINT `project_hazard_assessment_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_implementation_plan`
--

DROP TABLE IF EXISTS `project_implementation_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_implementation_plan` (
  `planId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `description` text,
  `keyPerformanceIndicators` text,
  `responsiblePersons` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`planId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_implementation_plan_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_m_and_e`
--

DROP TABLE IF EXISTS `project_m_and_e`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_m_and_e` (
  `mAndEId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `description` text,
  `mechanismsInPlace` text,
  `resourcesBudgetary` text,
  `resourcesHuman` text,
  `dataGatheringMethod` text,
  `reportingChannels` text,
  `lessonsLearnedProcess` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`mAndEId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_m_and_e_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_maps`
--

DROP TABLE IF EXISTS `project_maps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_maps` (
  `mapId` int NOT NULL AUTO_INCREMENT,
  `projectId` int DEFAULT NULL,
  `map` text,
  `voided` tinyint(1) DEFAULT NULL,
  `voidedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`mapId`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_milestone_implementations`
--

DROP TABLE IF EXISTS `project_milestone_implementations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_milestone_implementations` (
  `categoryId` int NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(255) NOT NULL,
  `description` text,
  `userId` int DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`categoryId`),
  UNIQUE KEY `categoryName` (`categoryName`),
  KEY `userId` (`userId`),
  CONSTRAINT `project_milestone_implementations_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_milestones`
--

DROP TABLE IF EXISTS `project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_milestones` (
  `milestoneId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `milestoneName` varchar(255) NOT NULL,
  `description` text,
  `dueDate` date DEFAULT NULL,
  `sequenceOrder` int DEFAULT NULL,
  `status` varchar(255) DEFAULT 'Not Started',
  `completed` tinyint(1) DEFAULT '0',
  `completedDate` date DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  `voidedBy` int DEFAULT NULL,
  `progress` decimal(5,2) DEFAULT '0.00',
  `weight` decimal(5,2) DEFAULT '1.00',
  PRIMARY KEY (`milestoneId`),
  KEY `projectId` (`projectId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `project_milestones_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_milestones_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `project_milestones_ibfk_3` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `project_milestones_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `project_milestones_ibfk_5` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_monitoring_records`
--

DROP TABLE IF EXISTS `project_monitoring_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_monitoring_records` (
  `recordId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `observationDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `comment` text,
  `warningLevel` varchar(20) DEFAULT 'None',
  `isRoutineObservation` tinyint(1) DEFAULT '1',
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `recommendations` text,
  `challenges` text,
  PRIMARY KEY (`recordId`),
  KEY `projectId` (`projectId`),
  KEY `userId` (`userId`),
  CONSTRAINT `project_monitoring_records_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_monitoring_records_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_needs_assessment`
--

DROP TABLE IF EXISTS `project_needs_assessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_needs_assessment` (
  `needsAssessmentId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `targetBeneficiaries` text,
  `estimateEndUsers` text,
  `physicalDemandCompletion` text,
  `proposedPhysicalCapacity` text,
  `mainBenefitsAsset` text,
  `significantExternalBenefitsNegativeEffects` text,
  `significantDifferencesBenefitsAlternatives` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`needsAssessmentId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_needs_assessment_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_payment_requests`
--

DROP TABLE IF EXISTS `project_payment_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_payment_requests` (
  `requestId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `contractorId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `currentApprovalLevelId` int DEFAULT NULL,
  `paymentStatusId` int DEFAULT NULL,
  `submittedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  `approvedByUserId` int DEFAULT NULL,
  `approvalDate` timestamp NULL DEFAULT NULL,
  `rejectionReason` text,
  `comments` text,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`requestId`),
  KEY `projectId` (`projectId`),
  KEY `contractorId` (`contractorId`),
  KEY `fk_payment_request_approval_level` (`currentApprovalLevelId`),
  KEY `fk_payment_request_status` (`paymentStatusId`),
  CONSTRAINT `fk_payment_request_approval_level` FOREIGN KEY (`currentApprovalLevelId`) REFERENCES `payment_approval_levels` (`levelId`),
  CONSTRAINT `fk_payment_request_status` FOREIGN KEY (`paymentStatusId`) REFERENCES `payment_status_definitions` (`statusId`),
  CONSTRAINT `project_payment_requests_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_payment_requests_ibfk_2` FOREIGN KEY (`contractorId`) REFERENCES `contractors` (`contractorId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_photos`
--

DROP TABLE IF EXISTS `project_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_photos` (
  `photoId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `filePath` varchar(255) NOT NULL,
  `fileType` varchar(50) DEFAULT NULL,
  `fileSize` int DEFAULT NULL,
  `description` text,
  `isDefault` tinyint(1) DEFAULT '0',
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint(1) DEFAULT '0',
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`photoId`),
  KEY `projectId` (`projectId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `project_photos_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_photos_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `project_photos_ibfk_3` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_readiness`
--

DROP TABLE IF EXISTS `project_readiness`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_readiness` (
  `readinessId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `designsPreparedApproved` tinyint(1) DEFAULT NULL,
  `landAcquiredSiteReady` tinyint(1) DEFAULT NULL,
  `regulatoryApprovalsObtained` tinyint(1) DEFAULT NULL,
  `governmentAgenciesInvolved` text,
  `consultationsUndertaken` tinyint(1) DEFAULT NULL,
  `canBePhasedScaledDown` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`readinessId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_readiness_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_risks`
--

DROP TABLE IF EXISTS `project_risks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_risks` (
  `riskId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `riskDescription` text,
  `likelihood` varchar(50) DEFAULT NULL,
  `impact` varchar(50) DEFAULT NULL,
  `mitigationStrategy` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`riskId`),
  KEY `projectId` (`projectId`),
  CONSTRAINT `project_risks_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_roles`
--

DROP TABLE IF EXISTS `project_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_roles` (
  `roleId` int NOT NULL AUTO_INCREMENT,
  `roleName` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`roleId`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_staff_assignments`
--

DROP TABLE IF EXISTS `project_staff_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_staff_assignments` (
  `assignmentId` int NOT NULL AUTO_INCREMENT,
  `projectId` int DEFAULT NULL,
  `staffId` int DEFAULT NULL,
  `roleId` int DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`assignmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_stages`
--

DROP TABLE IF EXISTS `project_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_stages` (
  `stageId` int NOT NULL AUTO_INCREMENT,
  `stageName` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`stageId`),
  UNIQUE KEY `stageName` (`stageName`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_stakeholders`
--

DROP TABLE IF EXISTS `project_stakeholders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_stakeholders` (
  `stakeholderId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `stakeholderName` varchar(255) DEFAULT NULL,
  `levelInfluence` varchar(50) DEFAULT NULL,
  `engagementStrategy` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`stakeholderId`),
  KEY `projectId` (`projectId`),
  CONSTRAINT `project_stakeholders_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_subcounties`
--

DROP TABLE IF EXISTS `project_subcounties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_subcounties` (
  `projectId` int NOT NULL,
  `subcountyId` int NOT NULL,
  `assignedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`projectId`,`subcountyId`),
  KEY `fk_project_subcounty_subcounty` (`subcountyId`),
  CONSTRAINT `fk_project_subcounty_project` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_subcounty_subcounty` FOREIGN KEY (`subcountyId`) REFERENCES `subcounties` (`subcountyId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_sustainability`
--

DROP TABLE IF EXISTS `project_sustainability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_sustainability` (
  `sustainabilityId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `description` text,
  `owningOrganization` varchar(255) DEFAULT NULL,
  `hasAssetRegister` tinyint(1) DEFAULT NULL,
  `technicalCapacityAdequacy` text,
  `managerialCapacityAdequacy` text,
  `financialCapacityAdequacy` text,
  `avgAnnualPersonnelCost` decimal(15,2) DEFAULT NULL,
  `annualOperationMaintenanceCost` decimal(15,2) DEFAULT NULL,
  `otherOperatingCosts` decimal(15,2) DEFAULT NULL,
  `revenueSources` text,
  `operationalCostsCoveredByRevenue` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`sustainabilityId`),
  UNIQUE KEY `projectId` (`projectId`),
  CONSTRAINT `project_sustainability_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_wards`
--

DROP TABLE IF EXISTS `project_wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_wards` (
  `projectId` int NOT NULL,
  `wardId` int NOT NULL,
  `assignedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`projectId`,`wardId`),
  KEY `fk_project_ward_ward` (`wardId`),
  CONSTRAINT `fk_project_ward_project` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_ward_ward` FOREIGN KEY (`wardId`) REFERENCES `wards` (`wardId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_workflow_steps`
--

DROP TABLE IF EXISTS `project_workflow_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_workflow_steps` (
  `stepId` int NOT NULL AUTO_INCREMENT,
  `workflowId` int NOT NULL,
  `stageId` int NOT NULL,
  `stepOrder` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint NOT NULL DEFAULT '0',
  `createdByUserId` int DEFAULT NULL,
  `voidedByUserId` int DEFAULT NULL,
  PRIMARY KEY (`stepId`),
  KEY `workflowId` (`workflowId`),
  KEY `stageId` (`stageId`),
  KEY `createdByUserId` (`createdByUserId`),
  KEY `voidedByUserId` (`voidedByUserId`),
  CONSTRAINT `project_workflow_steps_ibfk_1` FOREIGN KEY (`workflowId`) REFERENCES `project_workflows` (`workflowId`),
  CONSTRAINT `project_workflow_steps_ibfk_2` FOREIGN KEY (`stageId`) REFERENCES `project_stages` (`stageId`),
  CONSTRAINT `project_workflow_steps_ibfk_3` FOREIGN KEY (`createdByUserId`) REFERENCES `users` (`userId`),
  CONSTRAINT `project_workflow_steps_ibfk_4` FOREIGN KEY (`voidedByUserId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_workflows`
--

DROP TABLE IF EXISTS `project_workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_workflows` (
  `workflowId` int NOT NULL AUTO_INCREMENT,
  `workflowName` varchar(255) NOT NULL,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint NOT NULL DEFAULT '0',
  `createdByUserId` int DEFAULT NULL,
  `voidedByUserId` int DEFAULT NULL,
  PRIMARY KEY (`workflowId`),
  UNIQUE KEY `workflowName` (`workflowName`),
  KEY `createdByUserId` (`createdByUserId`),
  KEY `voidedByUserId` (`voidedByUserId`),
  CONSTRAINT `project_workflows_ibfk_1` FOREIGN KEY (`createdByUserId`) REFERENCES `users` (`userId`),
  CONSTRAINT `project_workflows_ibfk_2` FOREIGN KEY (`voidedByUserId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projectfeedback`
--

DROP TABLE IF EXISTS `projectfeedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projectfeedback` (
  `feedbackId` int NOT NULL AUTO_INCREMENT,
  `projectId` int DEFAULT NULL,
  `feedbackMessage` text,
  `response` varchar(255) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT NULL,
  `voidedBy` varchar(255) DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `updatedBy` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  `voidingReason` varchar(255) DEFAULT NULL,
  `submittedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`feedbackId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectName` varchar(255) DEFAULT NULL,
  `directorate` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `costOfProject` decimal(15,2) DEFAULT NULL,
  `paidOut` decimal(15,2) DEFAULT NULL,
  `objective` text,
  `expectedOutput` text,
  `principalInvestigator` text,
  `expectedOutcome` text,
  `status` varchar(255) DEFAULT NULL,
  `statusReason` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `principalInvestigatorStaffId` int DEFAULT NULL,
  `departmentId` int DEFAULT NULL,
  `sectionId` int DEFAULT NULL,
  `finYearId` int DEFAULT NULL,
  `programId` int DEFAULT NULL,
  `subProgramId` int DEFAULT NULL,
  `categoryId` int DEFAULT NULL,
  `projectDescription` text,
  `userId` int DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `defaultPhotoId` int DEFAULT NULL,
  `overallProgress` decimal(5,2) DEFAULT '0.00',
  `workflowId` int DEFAULT NULL,
  `currentStageId` int DEFAULT NULL,
  `approved_for_public` tinyint(1) DEFAULT '0' COMMENT 'Whether the project is approved for public viewing',
  `approved_by` int DEFAULT NULL COMMENT 'User ID who approved the project',
  `approved_at` datetime DEFAULT NULL COMMENT 'When the project was approved',
  `approval_notes` text COMMENT 'Notes from the approver',
  `revision_requested` tinyint(1) DEFAULT '0' COMMENT 'Whether revision was requested',
  `revision_notes` text COMMENT 'Notes about requested revisions',
  `revision_requested_by` int DEFAULT NULL COMMENT 'User ID who requested revision',
  `revision_requested_at` datetime DEFAULT NULL COMMENT 'When revision was requested',
  `revision_submitted_at` datetime DEFAULT NULL COMMENT 'When revision was submitted',
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  KEY `userId` (`userId`),
  KEY `fk_default_photo` (`defaultPhotoId`),
  KEY `workflowId` (`workflowId`),
  KEY `currentStageId` (`currentStageId`),
  KEY `fk_projects_approved_by` (`approved_by`),
  KEY `fk_projects_revision_requested_by` (`revision_requested_by`),
  KEY `idx_projects_approved_for_public` (`approved_for_public`),
  KEY `idx_projects_revision_requested` (`revision_requested`),
  CONSTRAINT `fk_default_photo` FOREIGN KEY (`defaultPhotoId`) REFERENCES `project_photos` (`photoId`),
  CONSTRAINT `fk_projects_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `fk_projects_revision_requested_by` FOREIGN KEY (`revision_requested_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `project_milestone_implementations` (`categoryId`) ON DELETE SET NULL,
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`workflowId`) REFERENCES `project_workflows` (`workflowId`),
  CONSTRAINT `projects_ibfk_4` FOREIGN KEY (`currentStageId`) REFERENCES `project_stages` (`stageId`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `public_feedback`
--

DROP TABLE IF EXISTS `public_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_feedback` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `public_holidays`
--

DROP TABLE IF EXISTS `public_holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `holidayName` varchar(255) NOT NULL,
  `holidayDate` date NOT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voided` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `holiday_date_unique` (`holidayDate`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_dashboard_config`
--

DROP TABLE IF EXISTS `role_dashboard_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_dashboard_config` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_dashboard_permissions`
--

DROP TABLE IF EXISTS `role_dashboard_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_dashboard_permissions` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_privileges`
--

DROP TABLE IF EXISTS `role_privileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_privileges` (
  `roleId` int NOT NULL,
  `privilegeId` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`roleId`,`privilegeId`),
  KEY `fk_role_privilege_privilegeId` (`privilegeId`),
  CONSTRAINT `fk_role_privilege_privilegeId` FOREIGN KEY (`privilegeId`) REFERENCES `privileges` (`privilegeId`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_privilege_roleId` FOREIGN KEY (`roleId`) REFERENCES `roles` (`roleId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `roleId` int NOT NULL AUTO_INCREMENT,
  `roleName` varchar(255) DEFAULT NULL,
  `description` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`roleId`),
  UNIQUE KEY `unique_role_name` (`roleName`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `sectionId` int NOT NULL AUTO_INCREMENT,
  `departmentId` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `alias` text,
  `location` text,
  `address` text,
  `contactPerson` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `email` text,
  `remarks` text,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`sectionId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `sections_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `staffId` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` text,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `departmentId` int DEFAULT NULL,
  `jobGroupId` int DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `placeOfBirth` varchar(255) DEFAULT NULL,
  `bloodType` varchar(10) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `nationalId` varchar(50) DEFAULT NULL,
  `kraPin` varchar(50) DEFAULT NULL,
  `employmentStatus` varchar(20) DEFAULT 'Active',
  `startDate` date DEFAULT NULL,
  `emergencyContactName` varchar(255) DEFAULT NULL,
  `emergencyContactRelationship` varchar(100) DEFAULT NULL,
  `emergencyContactPhone` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `maritalStatus` varchar(50) DEFAULT NULL,
  `employmentType` varchar(50) DEFAULT NULL,
  `managerId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`staffId`),
  UNIQUE KEY `nationalId` (`nationalId`),
  UNIQUE KEY `kraPin` (`kraPin`),
  KEY `managerId_fk` (`managerId`),
  KEY `fk_department` (`departmentId`),
  KEY `fk_job_group` (`jobGroupId`),
  CONSTRAINT `fk_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`departmentId`),
  CONSTRAINT `fk_job_group` FOREIGN KEY (`jobGroupId`) REFERENCES `job_groups` (`id`),
  CONSTRAINT `managerId_fk` FOREIGN KEY (`managerId`) REFERENCES `staff` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `strategicplans`
--

DROP TABLE IF EXISTS `strategicplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `strategicplans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cidpid` varchar(255) DEFAULT NULL,
  `cidpName` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `theme` text,
  `vision` text,
  `mission` text,
  `remarks` text,
  `voided` tinyint(1) DEFAULT NULL,
  `voidedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `studyparticipants`
--

DROP TABLE IF EXISTS `studyparticipants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studyparticipants` (
  `individualId` int NOT NULL AUTO_INCREMENT,
  `householdId` varchar(50) DEFAULT NULL,
  `gpsLatitudeIndividual` decimal(10,7) DEFAULT NULL,
  `gpsLongitudeIndividual` decimal(10,7) DEFAULT NULL,
  `county` varchar(100) DEFAULT NULL,
  `subCounty` varchar(100) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `educationLevel` varchar(255) DEFAULT NULL,
  `diseaseStatusMalaria` varchar(255) DEFAULT NULL,
  `diseaseStatusDengue` varchar(255) DEFAULT NULL,
  `mosquitoNetUse` varchar(255) DEFAULT NULL,
  `waterStoragePractices` varchar(100) DEFAULT NULL,
  `climatePerception` varchar(100) DEFAULT NULL,
  `recentRainfall` varchar(255) DEFAULT NULL,
  `averageTemperatureC` varchar(100) DEFAULT NULL,
  `householdSize` varchar(100) DEFAULT NULL,
  `accessToHealthcare` varchar(255) DEFAULT NULL,
  `projectId` int DEFAULT NULL,
  `voided` tinyint DEFAULT '0',
  PRIMARY KEY (`individualId`)
) ENGINE=InnoDB AUTO_INCREMENT=897 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subcounties`
--

DROP TABLE IF EXISTS `subcounties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcounties` (
  `subcountyId` int NOT NULL AUTO_INCREMENT,
  `countyId` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `postalCode` varchar(255) DEFAULT NULL,
  `email` text,
  `phone` varchar(255) DEFAULT NULL,
  `address` text,
  `geoSpatial` varchar(255) DEFAULT NULL,
  `polygon` text,
  `geoCode` varchar(255) DEFAULT NULL,
  `geoLat` varchar(255) DEFAULT NULL,
  `geoLon` varchar(255) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`subcountyId`),
  KEY `fk_subcounty_county` (`countyId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `fk_subcounty_county` FOREIGN KEY (`countyId`) REFERENCES `counties` (`countyId`) ON DELETE SET NULL,
  CONSTRAINT `subcounties_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `subcounties_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subprograms`
--

DROP TABLE IF EXISTS `subprograms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subprograms` (
  `subProgramId` int NOT NULL AUTO_INCREMENT,
  `programId` int DEFAULT NULL,
  `subProgramme` text,
  `keyOutcome` text,
  `kpi` text,
  `baseline` varchar(255) DEFAULT NULL,
  `yr1Targets` varchar(255) DEFAULT NULL,
  `yr2Targets` varchar(255) DEFAULT NULL,
  `yr3Targets` varchar(255) DEFAULT NULL,
  `yr4Targets` varchar(255) DEFAULT NULL,
  `yr5Targets` varchar(255) DEFAULT NULL,
  `yr1Budget` decimal(15,2) DEFAULT NULL,
  `yr2Budget` decimal(15,2) DEFAULT NULL,
  `yr3Budget` decimal(15,2) DEFAULT NULL,
  `yr4Budget` decimal(15,2) DEFAULT NULL,
  `yr5Budget` decimal(15,2) DEFAULT NULL,
  `totalBudget` decimal(15,2) DEFAULT NULL,
  `remarks` text,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`subProgramId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `subprograms_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `subprograms_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=774 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_dashboard_preferences`
--

DROP TABLE IF EXISTS `user_dashboard_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_dashboard_preferences` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_data_filters`
--

DROP TABLE IF EXISTS `user_data_filters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_data_filters` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_department_assignments`
--

DROP TABLE IF EXISTS `user_department_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_department_assignments` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_project_assignments`
--

DROP TABLE IF EXISTS `user_project_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_project_assignments` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_ward_assignments`
--

DROP TABLE IF EXISTS `user_ward_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_ward_assignments` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `passwordHash` varchar(255) DEFAULT NULL,
  `email` text,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `roleId` int DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wards`
--

DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards` (
  `wardId` int NOT NULL AUTO_INCREMENT,
  `subcountyId` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `postalCode` varchar(255) DEFAULT NULL,
  `email` text,
  `phone` varchar(255) DEFAULT NULL,
  `address` text,
  `polygon` text,
  `geoSpatial` varchar(255) DEFAULT NULL,
  `geoCode` varchar(255) DEFAULT NULL,
  `geoLat` varchar(255) DEFAULT NULL,
  `geoLon` varchar(255) DEFAULT NULL,
  `voided` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voidedBy` int DEFAULT NULL,
  PRIMARY KEY (`wardId`),
  KEY `fk_ward_subcounty` (`subcountyId`),
  KEY `userId` (`userId`),
  KEY `voidedBy` (`voidedBy`),
  CONSTRAINT `fk_ward_subcounty` FOREIGN KEY (`subcountyId`) REFERENCES `subcounties` (`subcountyId`) ON DELETE SET NULL,
  CONSTRAINT `wards_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL,
  CONSTRAINT `wards_ibfk_2` FOREIGN KEY (`voidedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-28 15:53:32
