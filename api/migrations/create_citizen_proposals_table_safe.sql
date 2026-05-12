-- Create table for Citizen Proposals (Safe version without strict foreign keys)
-- This version will work even if users table doesn't exist

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
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_submission_date` (`submission_date`),
  KEY `idx_reviewed_by` (`reviewed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add foreign key only if users table exists
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_schema = DATABASE() AND table_name = 'users');

SET @sql = IF(@table_exists > 0,
  'ALTER TABLE citizen_proposals ADD CONSTRAINT fk_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(userId) ON DELETE SET NULL',
  'SELECT "users table not found, skipping foreign key constraint" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

