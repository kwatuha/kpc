-- Migration: Create Budget Containers System
-- This migration creates a new budget structure where:
-- 1. Budgets are containers (e.g., "2024-2025 Approved budget") that can contain multiple items
-- 2. Budget items are individual projects/line items within a budget
-- 3. Budget changes track modifications after approval for audit purposes

-- Step 1: Create budgets table (Budget Containers)
CREATE TABLE IF NOT EXISTS `budgets` (
  `budgetId` int NOT NULL AUTO_INCREMENT,
  `budgetName` varchar(500) NOT NULL COMMENT 'Budget name (e.g., "2024-2025 Approved budget")',
  `budgetType` enum('Draft','Approved','Proposed') DEFAULT 'Draft' COMMENT 'Type of budget',
  `finYearId` int NOT NULL COMMENT 'Financial year this budget belongs to',
  `departmentId` int DEFAULT NULL COMMENT 'Department this budget is for (NULL = all departments)',
  `description` text COMMENT 'Description of the budget',
  `totalAmount` decimal(15,2) DEFAULT 0.00 COMMENT 'Total amount across all items (calculated)',
  `status` enum('Draft','Pending Approval','Approved','Rejected','Frozen') DEFAULT 'Draft',
  `isFrozen` tinyint(1) DEFAULT 0 COMMENT 'If 1, no items can be added without approval',
  `requiresApprovalForChanges` tinyint(1) DEFAULT 1 COMMENT 'If 1, changes after approval require approval',
  `approvedBy` int DEFAULT NULL COMMENT 'User who approved this budget',
  `approvedAt` datetime DEFAULT NULL COMMENT 'Date and time of approval',
  `rejectedBy` int DEFAULT NULL COMMENT 'User who rejected this budget',
  `rejectedAt` datetime DEFAULT NULL COMMENT 'Date and time of rejection',
  `rejectionReason` text COMMENT 'Reason for rejection',
  `voided` tinyint(1) DEFAULT 0,
  `voidedBy` int DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  `userId` int DEFAULT NULL COMMENT 'User who created this budget',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`budgetId`),
  KEY `idx_finYearId` (`finYearId`),
  KEY `idx_departmentId` (`departmentId`),
  KEY `idx_status` (`status`),
  KEY `idx_budgetType` (`budgetType`),
  KEY `idx_voided` (`voided`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_budgets_finYear` FOREIGN KEY (`finYearId`) REFERENCES `financialyears` (`finYearId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_budgets_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`departmentId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budgets_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budgets_approvedBy` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budgets_rejectedBy` FOREIGN KEY (`rejectedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Step 2: Create budget_items table (Items within budgets)
CREATE TABLE IF NOT EXISTS `budget_items` (
  `itemId` int NOT NULL AUTO_INCREMENT,
  `budgetId` int NOT NULL COMMENT 'Budget container this item belongs to',
  `projectId` int DEFAULT NULL COMMENT 'Linked project (optional)',
  `projectName` varchar(500) NOT NULL COMMENT 'Project name (can be linked to project or standalone)',
  `departmentId` int NOT NULL,
  `subcountyId` int DEFAULT NULL,
  `wardId` int DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL COMMENT 'Budget amount for this item',
  `remarks` text COMMENT 'Additional notes or remarks',
  `status` enum('Active','Pending Approval','Approved','Rejected','Removed') DEFAULT 'Active',
  `addedAfterApproval` tinyint(1) DEFAULT 0 COMMENT 'If 1, this item was added after budget approval',
  `changeRequestId` int DEFAULT NULL COMMENT 'Reference to change request if added/modified after approval',
  `voided` tinyint(1) DEFAULT 0,
  `voidedBy` int DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  `userId` int DEFAULT NULL COMMENT 'User who created this item',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`itemId`),
  KEY `idx_budgetId` (`budgetId`),
  KEY `idx_projectId` (`projectId`),
  KEY `idx_departmentId` (`departmentId`),
  KEY `idx_subcountyId` (`subcountyId`),
  KEY `idx_wardId` (`wardId`),
  KEY `idx_status` (`status`),
  KEY `idx_voided` (`voided`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_budget_items_budget` FOREIGN KEY (`budgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_items_project` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_items_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`departmentId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_items_subcounty` FOREIGN KEY (`subcountyId`) REFERENCES `subcounties` (`subcountyId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_items_ward` FOREIGN KEY (`wardId`) REFERENCES `wards` (`wardId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_items_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Step 3: Create budget_changes table (Audit trail for changes after approval)
CREATE TABLE IF NOT EXISTS `budget_changes` (
  `changeId` int NOT NULL AUTO_INCREMENT,
  `budgetId` int NOT NULL COMMENT 'Budget container this change relates to',
  `itemId` int DEFAULT NULL COMMENT 'Budget item that was changed (NULL if budget-level change)',
  `changeType` enum('Item Added','Item Modified','Item Removed','Amount Changed','Status Changed','Budget Approved','Budget Rejected','Budget Frozen','Budget Unfrozen') NOT NULL,
  `oldValue` text COMMENT 'Previous value (JSON format for complex changes)',
  `newValue` text COMMENT 'New value (JSON format for complex changes)',
  `changeReason` text NOT NULL COMMENT 'Reason for the change (required)',
  `status` enum('Pending Approval','Approved','Rejected') DEFAULT 'Pending Approval' COMMENT 'Status of the change request',
  `requestedBy` int NOT NULL COMMENT 'User who requested the change',
  `requestedAt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Date and time of change request',
  `reviewedBy` int DEFAULT NULL COMMENT 'User who reviewed/approved the change',
  `reviewedAt` datetime DEFAULT NULL COMMENT 'Date and time of review',
  `reviewNotes` text COMMENT 'Notes from reviewer',
  `voided` tinyint(1) DEFAULT 0,
  `voidedBy` int DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`changeId`),
  KEY `idx_budgetId` (`budgetId`),
  KEY `idx_itemId` (`itemId`),
  KEY `idx_changeType` (`changeType`),
  KEY `idx_status` (`status`),
  KEY `idx_requestedBy` (`requestedBy`),
  KEY `idx_requestedAt` (`requestedAt`),
  KEY `idx_voided` (`voided`),
  CONSTRAINT `fk_budget_changes_budget` FOREIGN KEY (`budgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_changes_item` FOREIGN KEY (`itemId`) REFERENCES `budget_items` (`itemId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_changes_requestedBy` FOREIGN KEY (`requestedBy`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_budget_changes_reviewedBy` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Step 4: Create trigger to update budget totalAmount when items are added/updated/deleted
DELIMITER $$

CREATE TRIGGER `update_budget_total_on_insert` 
AFTER INSERT ON `budget_items`
FOR EACH ROW
BEGIN
    UPDATE `budgets` 
    SET `totalAmount` = (
        SELECT COALESCE(SUM(`amount`), 0)
        FROM `budget_items`
        WHERE `budgetId` = NEW.`budgetId` AND `voided` = 0 AND `status` IN ('Active', 'Approved')
    )
    WHERE `budgetId` = NEW.`budgetId`;
END$$

CREATE TRIGGER `update_budget_total_on_update` 
AFTER UPDATE ON `budget_items`
FOR EACH ROW
BEGIN
    IF OLD.`voided` != NEW.`voided` OR OLD.`amount` != NEW.`amount` OR OLD.`status` != NEW.`status` THEN
        UPDATE `budgets` 
        SET `totalAmount` = (
            SELECT COALESCE(SUM(`amount`), 0)
            FROM `budget_items`
            WHERE `budgetId` = NEW.`budgetId` AND `voided` = 0 AND `status` IN ('Active', 'Approved')
        )
        WHERE `budgetId` = NEW.`budgetId`;
    END IF;
END$$

CREATE TRIGGER `update_budget_total_on_delete` 
AFTER UPDATE ON `budget_items`
FOR EACH ROW
BEGIN
    IF NEW.`voided` = 1 AND OLD.`voided` = 0 THEN
        UPDATE `budgets` 
        SET `totalAmount` = (
            SELECT COALESCE(SUM(`amount`), 0)
            FROM `budget_items`
            WHERE `budgetId` = OLD.`budgetId` AND `voided` = 0 AND `status` IN ('Active', 'Approved')
        )
        WHERE `budgetId` = OLD.`budgetId`;
    END IF;
END$$

DELIMITER ;

-- Step 5: Optional - Migrate existing data from approved_budgets
-- This creates a budget container for each unique financial year and migrates items
-- Uncomment and run this section if you want to migrate existing data

/*
-- Create a budget container for each unique financial year
INSERT INTO `budgets` (`budgetName`, `budgetType`, `finYearId`, `status`, `userId`, `createdAt`)
SELECT 
    CONCAT(fy.`finYearName`, ' Approved Budget') as `budgetName`,
    'Approved' as `budgetType`,
    ab.`finYearId`,
    'Approved' as `status`,
    MIN(ab.`userId`) as `userId`,
    MIN(ab.`createdAt`) as `createdAt`
FROM `approved_budgets` ab
INNER JOIN `financialyears` fy ON ab.`finYearId` = fy.`finYearId`
WHERE ab.`voided` = 0 AND ab.`status` = 'Approved'
GROUP BY ab.`finYearId`, fy.`finYearName`;

-- Migrate budget items
INSERT INTO `budget_items` (
    `budgetId`, `projectId`, `projectName`, `departmentId`, `subcountyId`, `wardId`, 
    `amount`, `remarks`, `status`, `userId`, `createdAt`
)
SELECT 
    b.`budgetId`,
    ab.`projectId`,
    ab.`projectName`,
    ab.`departmentId`,
    ab.`subcountyId`,
    ab.`wardId`,
    ab.`amount`,
    ab.`remarks`,
    'Active' as `status`,
    ab.`userId`,
    ab.`createdAt`
FROM `approved_budgets` ab
INNER JOIN `budgets` b ON ab.`finYearId` = b.`finYearId` AND b.`budgetType` = 'Approved'
WHERE ab.`voided` = 0 AND ab.`status` = 'Approved';
*/





