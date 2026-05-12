-- Add privileges for County Proposed Projects and Project Announcements

-- County Proposed Projects privileges
INSERT INTO privileges (privilegeName, description, createdAt, updatedAt) VALUES
('county_proposed_projects.read', 'Allows viewing all county proposed projects.', NOW(), NOW()),
('county_proposed_projects.create', 'Allows creating new county proposed projects.', NOW(), NOW()),
('county_proposed_projects.update', 'Allows updating existing county proposed projects.', NOW(), NOW()),
('county_proposed_projects.delete', 'Allows deleting county proposed projects.', NOW(), NOW()),

-- Project Announcements privileges
('project_announcements.read', 'Allows viewing all project announcements.', NOW(), NOW()),
('project_announcements.create', 'Allows creating new project announcements.', NOW(), NOW()),
('project_announcements.update', 'Allows updating existing project announcements.', NOW(), NOW()),
('project_announcements.delete', 'Allows deleting project announcements.', NOW(), NOW());

-- Assign all privileges to admin role (roleId = 1)
-- Note: Adjust roleId if your admin role has a different ID
INSERT INTO role_privileges (roleId, privilegeId, createdAt)
SELECT 1, privilegeId, NOW()
FROM privileges
WHERE privilegeName IN (
    'county_proposed_projects.read',
    'county_proposed_projects.create',
    'county_proposed_projects.update',
    'county_proposed_projects.delete',
    'project_announcements.read',
    'project_announcements.create',
    'project_announcements.update',
    'project_announcements.delete'
)
ON DUPLICATE KEY UPDATE roleId = roleId; -- Prevent duplicate entries

