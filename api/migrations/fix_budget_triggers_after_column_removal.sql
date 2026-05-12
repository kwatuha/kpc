-- Migration: Fix budget triggers after removing amount column from budget_items
-- Purpose: Update triggers to calculate totalAmount from projects.costOfProject instead of budget_items.amount
-- Date: 2026-02-02

-- Drop existing triggers
DROP TRIGGER IF EXISTS `update_budget_total_on_insert`;
DROP TRIGGER IF EXISTS `update_budget_total_on_update`;
DROP TRIGGER IF EXISTS `update_budget_total_on_delete`;

-- Recreate triggers to use projects.costOfProject
DELIMITER $$

CREATE TRIGGER `update_budget_total_on_insert` 
AFTER INSERT ON `budget_items`
FOR EACH ROW
BEGIN
    UPDATE `budgets` 
    SET `totalAmount` = (
        SELECT COALESCE(SUM(p.`costOfProject`), 0)
        FROM `budget_items` bi
        INNER JOIN `projects` p ON bi.`projectId` = p.`id`
        WHERE bi.`budgetId` = NEW.`budgetId` 
          AND bi.`voided` = 0 
          AND p.`voided` = 0
    )
    WHERE `budgetId` = NEW.`budgetId`;
END$$

CREATE TRIGGER `update_budget_total_on_update` 
AFTER UPDATE ON `budget_items`
FOR EACH ROW
BEGIN
    IF OLD.`voided` != NEW.`voided` OR OLD.`projectId` != NEW.`projectId` THEN
        UPDATE `budgets` 
        SET `totalAmount` = (
            SELECT COALESCE(SUM(p.`costOfProject`), 0)
            FROM `budget_items` bi
            INNER JOIN `projects` p ON bi.`projectId` = p.`id`
            WHERE bi.`budgetId` = NEW.`budgetId` 
              AND bi.`voided` = 0 
              AND p.`voided` = 0
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
            SELECT COALESCE(SUM(p.`costOfProject`), 0)
            FROM `budget_items` bi
            INNER JOIN `projects` p ON bi.`projectId` = p.`id`
            WHERE bi.`budgetId` = OLD.`budgetId` 
              AND bi.`voided` = 0 
              AND p.`voided` = 0
        )
        WHERE `budgetId` = OLD.`budgetId`;
    END IF;
END$$

DELIMITER ;
