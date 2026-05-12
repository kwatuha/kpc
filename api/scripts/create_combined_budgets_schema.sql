-- Schema for Combined Budgets Feature
-- This allows multiple budget containers to be combined into a single organizational budget

-- Add isCombined field to budgets table
ALTER TABLE `budgets` 
ADD COLUMN `isCombined` TINYINT(1) DEFAULT 0 AFTER `budgetType`,
ADD COLUMN `parentBudgetId` INT(11) DEFAULT NULL AFTER `isCombined`,
ADD KEY `idx_isCombined` (`isCombined`),
ADD KEY `idx_parentBudgetId` (`parentBudgetId`),
ADD CONSTRAINT `fk_budgets_parent` FOREIGN KEY (`parentBudgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Table to track which containers are part of a combined budget
CREATE TABLE IF NOT EXISTS `budget_combinations` (
  `combinationId` INT(11) NOT NULL AUTO_INCREMENT,
  `combinedBudgetId` INT(11) NOT NULL COMMENT 'The parent combined budget container',
  `containerBudgetId` INT(11) NOT NULL COMMENT 'A container that is part of the combined budget',
  `displayOrder` INT(11) DEFAULT 0 COMMENT 'Order in which containers appear in the combined view',
  `userId` INT(11) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`combinationId`),
  UNIQUE KEY `unique_combination` (`combinedBudgetId`, `containerBudgetId`),
  KEY `idx_combinedBudgetId` (`combinedBudgetId`),
  KEY `idx_containerBudgetId` (`containerBudgetId`),
  CONSTRAINT `fk_combinations_combined` FOREIGN KEY (`combinedBudgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_combinations_container` FOREIGN KEY (`containerBudgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_combinations_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



