-- Create table for Project Announcements
CREATE TABLE IF NOT EXISTS `project_announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `content` text NOT NULL,
  `category` enum('Public Participation','Project Launch','Project Update','Call for Proposals','Service Notice','Emergency','General') NOT NULL,
  `type` enum('Meeting','Event','Update','Opportunity','Notice','Emergency','General') NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `location` varchar(255) NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `status` enum('Upcoming','Active','Completed','Open','Closed','Cancelled') DEFAULT 'Upcoming',
  `priority` enum('High','Medium','Low') DEFAULT 'Medium',
  `image_url` varchar(500) DEFAULT NULL,
  `attendees` int DEFAULT '0',
  `max_attendees` int DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `voided` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_date` (`date`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

