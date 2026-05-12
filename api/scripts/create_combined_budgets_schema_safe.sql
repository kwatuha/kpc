-- Schema for Combined Budgets Feature
-- This allows multiple budget containers to be combined into a single organizational budget
-- Safe version that checks for existing columns

-- Check and add isCombined column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'budgets';
SET @columnname = 'isCombined';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` TINYINT(1) DEFAULT 0 AFTER `budgetType`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add parentBudgetId column if it doesn't exist
SET @columnname = 'parentBudgetId';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` INT(11) DEFAULT NULL AFTER `isCombined`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add indexes if they don't exist (MySQL doesn't support IF NOT EXISTS for indexes, so we'll try-catch)
-- Note: These will fail silently if indexes already exist
ALTER TABLE `budgets` 
ADD KEY `idx_isCombined` (`isCombined`);

ALTER TABLE `budgets` 
ADD KEY `idx_parentBudgetId` (`parentBudgetId`);

-- Add foreign key constraint if it doesn't exist
-- Note: This will fail if the constraint already exists, which is fine
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (CONSTRAINT_NAME = 'fk_budgets_parent')
  ) > 0,
  'SELECT 1', -- Constraint exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD CONSTRAINT `fk_budgets_parent` FOREIGN KEY (`parentBudgetId`) REFERENCES `budgets` (`budgetId`) ON DELETE SET NULL ON UPDATE CASCADE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

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



