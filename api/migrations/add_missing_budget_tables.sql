-- Migration: Add missing budget tables from original database
-- These tables exist in the original database but were missing from gov_db
-- Date: 2026-02-28

-- Create budgets table (matching original structure with isCombined and parentBudgetId)
CREATE TABLE IF NOT EXISTS `budgets` (
  `budgetId` int NOT NULL AUTO_INCREMENT,
  `budgetName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `budgetType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `isCombined` tinyint(1) DEFAULT '0',
  `parentBudgetId` int DEFAULT NULL,
  `finYearId` int NOT NULL,
  `departmentId` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `totalAmount` decimal(15,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `isFrozen` tinyint(1) DEFAULT '0',
  `requiresApprovalForChanges` tinyint(1) DEFAULT '1',
  `approvedBy` int DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `rejectedBy` int DEFAULT NULL,
  `rejectedAt` datetime DEFAULT NULL,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
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

-- Create budget_items table (matching original structure)
CREATE TABLE IF NOT EXISTS `budget_items` (
  `itemId` int NOT NULL AUTO_INCREMENT,
  `budgetId` int NOT NULL,
  `projectId` int DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
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

-- Create budget_changes table (matching original structure)
CREATE TABLE IF NOT EXISTS `budget_changes` (
  `changeId` int NOT NULL AUTO_INCREMENT,
  `budgetId` int NOT NULL,
  `itemId` int DEFAULT NULL,
  `changeType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changeReason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Pending Approval',
  `oldValue` json DEFAULT NULL,
  `newValue` json DEFAULT NULL,
  `requestedBy` int NOT NULL,
  `requestedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewedBy` int DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `reviewNotes` text COLLATE utf8mb4_unicode_ci,
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

-- Create budget_combinations table (matching original structure)
CREATE TABLE IF NOT EXISTS `budget_combinations` (
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
