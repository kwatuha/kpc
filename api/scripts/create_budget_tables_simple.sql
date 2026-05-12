-- Create budget management tables for container-based budget system
-- Simplified version without DELIMITER for direct execution

-- Budget Containers Table
CREATE TABLE IF NOT EXISTS budgets (
  budgetId INT(11) NOT NULL AUTO_INCREMENT,
  budgetName VARCHAR(255) NOT NULL,
  budgetType VARCHAR(50) DEFAULT 'Draft',
  finYearId INT(11) NOT NULL,
  departmentId INT(11) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  totalAmount DECIMAL(15,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Draft',
  isFrozen TINYINT(1) DEFAULT 0,
  requiresApprovalForChanges TINYINT(1) DEFAULT 1,
  approvedBy INT(11) DEFAULT NULL,
  approvedAt DATETIME DEFAULT NULL,
  rejectedBy INT(11) DEFAULT NULL,
  rejectedAt DATETIME DEFAULT NULL,
  rejectionReason TEXT DEFAULT NULL,
  userId INT(11) NOT NULL,
  voided TINYINT(1) DEFAULT 0,
  voidedBy INT(11) DEFAULT NULL,
  voidedAt DATETIME DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (budgetId),
  KEY idx_finYearId (finYearId),
  KEY idx_departmentId (departmentId),
  KEY idx_status (status),
  KEY idx_voided (voided),
  CONSTRAINT fk_budgets_finYear FOREIGN KEY (finYearId) REFERENCES financialyears (finYearId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_department FOREIGN KEY (departmentId) REFERENCES departments (departmentId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget Items Table
CREATE TABLE IF NOT EXISTS budget_items (
  itemId INT(11) NOT NULL AUTO_INCREMENT,
  budgetId INT(11) NOT NULL,
  projectId INT(11) DEFAULT NULL,
  projectName VARCHAR(255) NOT NULL,
  departmentId INT(11) NOT NULL,
  subcountyId INT(11) DEFAULT NULL,
  wardId INT(11) DEFAULT NULL,
  amount DECIMAL(15,2) NOT NULL,
  remarks TEXT DEFAULT NULL,
  addedAfterApproval TINYINT(1) DEFAULT 0,
  changeRequestId INT(11) DEFAULT NULL,
  userId INT(11) NOT NULL,
  voided TINYINT(1) DEFAULT 0,
  voidedBy INT(11) DEFAULT NULL,
  voidedAt DATETIME DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId),
  KEY idx_budgetId (budgetId),
  KEY idx_projectId (projectId),
  KEY idx_departmentId (departmentId),
  KEY idx_voided (voided),
  CONSTRAINT fk_budget_items_budget FOREIGN KEY (budgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_budget_items_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budget_items_department FOREIGN KEY (departmentId) REFERENCES departments (departmentId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_budget_items_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget Changes Table (Change Requests)
CREATE TABLE IF NOT EXISTS budget_changes (
  changeId INT(11) NOT NULL AUTO_INCREMENT,
  budgetId INT(11) NOT NULL,
  itemId INT(11) DEFAULT NULL,
  changeType VARCHAR(50) NOT NULL,
  changeReason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending Approval',
  oldValue JSON DEFAULT NULL,
  newValue JSON DEFAULT NULL,
  requestedBy INT(11) NOT NULL,
  requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewedBy INT(11) DEFAULT NULL,
  reviewedAt DATETIME DEFAULT NULL,
  reviewNotes TEXT DEFAULT NULL,
  userId INT(11) NOT NULL,
  voided TINYINT(1) DEFAULT 0,
  voidedBy INT(11) DEFAULT NULL,
  voidedAt DATETIME DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (changeId),
  KEY idx_budgetId (budgetId),
  KEY idx_itemId (itemId),
  KEY idx_status (status),
  KEY idx_voided (voided),
  CONSTRAINT fk_budget_changes_budget FOREIGN KEY (budgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_item FOREIGN KEY (itemId) REFERENCES budget_items (itemId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_requestedBy FOREIGN KEY (requestedBy) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_reviewedBy FOREIGN KEY (reviewedBy) REFERENCES users (userId) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




