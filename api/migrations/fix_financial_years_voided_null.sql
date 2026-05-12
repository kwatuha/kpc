-- Migration script to fix NULL voided values in financialyears table
-- Sets voided = 0 for records where voided IS NULL (treating NULL as active)
-- This ensures data consistency: voided should be 0 (active) or 1 (deleted), never NULL

-- Step 1: Check how many records have NULL voided values
-- SELECT COUNT(*) as null_count FROM financialyears WHERE voided IS NULL;

-- Step 2: Update NULL voided values to 0 (active)
UPDATE financialyears 
SET voided = 0 
WHERE voided IS NULL;

-- Step 3: Verify the update (should return 0)
-- SELECT COUNT(*) as null_count FROM financialyears WHERE voided IS NULL;

-- Step 4: Optional - Check the distribution of voided values
-- SELECT voided, COUNT(*) as count 
-- FROM financialyears 
-- GROUP BY voided;

















