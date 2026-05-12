-- Create table for Approved Budgets
-- This table stores approved budgets for projects with financial year, project, ward, subcounty, department, and amount
CREATE TABLE IF NOT EXISTS `approved_budgets` (
  `budgetId` int NOT NULL AUTO_INCREMENT,
  `finYearId` int NOT NULL,
  `projectId` int DEFAULT NULL,
  `projectName` varchar(500) NOT NULL COMMENT 'Project name (can be linked to project or standalone)',
  `departmentId` int NOT NULL,
  `subcountyId` int DEFAULT NULL,
  `wardId` int DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL COMMENT 'Approved budget amount',
  `remarks` text COMMENT 'Additional notes or remarks',
  `approvedBy` int DEFAULT NULL COMMENT 'User who approved this budget',
  `approvedAt` datetime DEFAULT NULL COMMENT 'Date and time of approval',
  `status` enum('Draft','Pending','Approved','Rejected','Cancelled') DEFAULT 'Draft',
  `voided` tinyint(1) DEFAULT '0',
  `voidedBy` int DEFAULT NULL,
  `voidedAt` datetime DEFAULT NULL,
  `userId` int DEFAULT NULL COMMENT 'User who created this budget record',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`budgetId`),
  KEY `idx_finYearId` (`finYearId`),
  KEY `idx_projectId` (`projectId`),
  KEY `idx_departmentId` (`departmentId`),
  KEY `idx_subcountyId` (`subcountyId`),
  KEY `idx_wardId` (`wardId`),
  KEY `idx_status` (`status`),
  KEY `idx_voided` (`voided`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_approved_budgets_finYear` FOREIGN KEY (`finYearId`) REFERENCES `financialyears` (`finYearId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_approved_budgets_project` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_approved_budgets_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`departmentId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_approved_budgets_subcounty` FOREIGN KEY (`subcountyId`) REFERENCES `subcounties` (`subcountyId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_approved_budgets_ward` FOREIGN KEY (`wardId`) REFERENCES `wards` (`wardId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_approved_budgets_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_approved_budgets_approvedBy` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`userId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;










