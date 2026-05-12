-- Create triggers to auto-update totalAmount in budgets

DROP TRIGGER IF EXISTS update_budget_total_on_insert;
CREATE TRIGGER update_budget_total_on_insert 
AFTER INSERT ON budget_items
FOR EACH ROW
BEGIN
  UPDATE budgets 
  SET totalAmount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM budget_items 
    WHERE budgetId = NEW.budgetId AND voided = 0
  )
  WHERE budgetId = NEW.budgetId;
END;

DROP TRIGGER IF EXISTS update_budget_total_on_update;
CREATE TRIGGER update_budget_total_on_update 
AFTER UPDATE ON budget_items
FOR EACH ROW
BEGIN
  UPDATE budgets 
  SET totalAmount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM budget_items 
    WHERE budgetId = NEW.budgetId AND voided = 0
  )
  WHERE budgetId = NEW.budgetId;
END;

DROP TRIGGER IF EXISTS update_budget_total_on_delete;
CREATE TRIGGER update_budget_total_on_delete 
AFTER UPDATE ON budget_items
FOR EACH ROW
BEGIN
  IF NEW.voided = 1 AND OLD.voided = 0 THEN
    UPDATE budgets 
    SET totalAmount = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM budget_items 
      WHERE budgetId = NEW.budgetId AND voided = 0
    )
    WHERE budgetId = NEW.budgetId;
  END IF;
END;




