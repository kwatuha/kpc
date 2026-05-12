-- Add public approval fields to project_photos table
-- This allows county to control which photos are visible in the public Projects Gallery

ALTER TABLE project_photos
ADD COLUMN approved_for_public TINYINT(1) DEFAULT 0 COMMENT 'Whether the photo is approved for public viewing',
ADD COLUMN approved_by INT NULL COMMENT 'User ID who approved the photo',
ADD COLUMN approved_at DATETIME NULL COMMENT 'When the photo was approved',
ADD COLUMN approval_notes TEXT NULL COMMENT 'Notes from the approver';

-- Add foreign key constraint
ALTER TABLE project_photos
ADD CONSTRAINT fk_photos_approved_by FOREIGN KEY (approved_by) REFERENCES users(userId) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_photos_approved_for_public ON project_photos(approved_for_public);

