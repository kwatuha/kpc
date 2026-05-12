-- Migration: Add approval fields to project_documents table
-- This allows documents and photos to be approved/revoked for public viewing

ALTER TABLE `project_documents`
ADD COLUMN `approved_for_public` TINYINT(1) DEFAULT 0 AFTER `voided`,
ADD COLUMN `approved_by` INT DEFAULT NULL AFTER `approved_for_public`,
ADD COLUMN `approved_at` DATETIME DEFAULT NULL AFTER `approved_by`,
ADD COLUMN `approval_notes` TEXT DEFAULT NULL AFTER `approved_at`,
ADD KEY `fk_documents_approved_by` (`approved_by`),
ADD CONSTRAINT `fk_documents_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`userId`) ON DELETE SET NULL;













