-- Update the type ENUM in project_announcements table to match frontend values
ALTER TABLE `project_announcements` 
MODIFY COLUMN `type` ENUM(
    'Meeting',
    'Workshop',
    'Public Forum',
    'Launch Event',
    'Progress Report',
    'Tender',
    'General',
    'Event',
    'Update',
    'Opportunity',
    'Notice',
    'Emergency'
) NOT NULL;

-- Update the category ENUM to match frontend values
ALTER TABLE `project_announcements` 
MODIFY COLUMN `category` ENUM(
    'Project Launch',
    'Public Consultation',
    'Progress Update',
    'Completion',
    'Tender Notice',
    'General Announcement',
    'Public Participation',
    'Project Update',
    'Call for Proposals',
    'Service Notice',
    'Emergency'
) NOT NULL;

