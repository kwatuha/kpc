-- Script to clean up duplicate financial years before adding unique constraint
-- This keeps the record with the lowest finYearId and voids or deletes duplicates

-- Step 1: Identify duplicates
-- Run this query to see duplicates:
-- SELECT finYearName, COUNT(*) as count 
-- FROM financialyears 
-- WHERE voided = 0 
-- GROUP BY finYearName 
-- HAVING COUNT(*) > 1;

-- Step 2: Void duplicate records (keeping the one with lowest finYearId)
-- This will void all duplicates except the first one (lowest finYearId)
UPDATE financialyears fy1
INNER JOIN (
    SELECT finYearName, MIN(finYearId) as minId
    FROM financialyears
    WHERE voided = 0
    GROUP BY finYearName
    HAVING COUNT(*) > 1
) fy2 ON fy1.finYearName = fy2.finYearName
SET fy1.voided = 1, fy1.voidedBy = 1
WHERE fy1.finYearId != fy2.minId 
  AND fy1.voided = 0;

-- Step 3: Verify no duplicates remain (should return empty result)
-- SELECT finYearName, COUNT(*) as count 
-- FROM financialyears 
-- WHERE voided = 0 
-- GROUP BY finYearName 
-- HAVING COUNT(*) > 1;


