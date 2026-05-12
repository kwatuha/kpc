-- Migration: Add Public Content Approval Privilege
-- Description: Creates the public_content.approve privilege and assigns it to admin role
-- Date: 2025-01-27

-- Add the new privilege
INSERT IGNORE INTO privileges (privilegeName, description, createdAt, updatedAt) VALUES
('public_content.approve', 'Allows approving or revoking public visibility for county projects, citizen proposals, and announcements.', NOW(), NOW());

-- Assign this privilege to the 'admin' role (assuming roleId 1 is admin)
INSERT IGNORE INTO role_privileges (roleId, privilegeId, createdAt)
SELECT 1, privilegeId, NOW() 
FROM privileges 
WHERE privilegeName = 'public_content.approve';

