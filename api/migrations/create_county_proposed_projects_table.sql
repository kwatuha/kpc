-- Create table for County Proposed Projects
CREATE TABLE IF NOT EXISTS `county_proposed_projects` (
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
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_priority` (`priority`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create table for project milestones
CREATE TABLE IF NOT EXISTS `county_proposed_project_milestones` (
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

