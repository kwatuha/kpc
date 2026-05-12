-- Add public approval fields to projects table
-- This allows county to control which projects are visible in the public Projects Gallery

ALTER TABLE projects
ADD COLUMN approved_for_public TINYINT(1) DEFAULT 0 COMMENT 'Whether the project is approved for public viewing',
ADD COLUMN approved_by INT NULL COMMENT 'User ID who approved the project',
ADD COLUMN approved_at DATETIME NULL COMMENT 'When the project was approved',
ADD COLUMN approval_notes TEXT NULL COMMENT 'Notes from the approver',
ADD COLUMN revision_requested TINYINT(1) DEFAULT 0 COMMENT 'Whether revision was requested',
ADD COLUMN revision_notes TEXT NULL COMMENT 'Notes about requested revisions',
ADD COLUMN revision_requested_by INT NULL COMMENT 'User ID who requested revision',
ADD COLUMN revision_requested_at DATETIME NULL COMMENT 'When revision was requested',
ADD COLUMN revision_submitted_at DATETIME NULL COMMENT 'When revision was submitted';

-- Add foreign key constraints
ALTER TABLE projects
ADD CONSTRAINT fk_projects_approved_by FOREIGN KEY (approved_by) REFERENCES users(userId) ON DELETE SET NULL,
ADD CONSTRAINT fk_projects_revision_requested_by FOREIGN KEY (revision_requested_by) REFERENCES users(userId) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_projects_approved_for_public ON projects(approved_for_public);
CREATE INDEX idx_projects_revision_requested ON projects(revision_requested);

