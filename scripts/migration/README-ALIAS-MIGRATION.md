# Alias Columns Migration Guide

This guide helps you add alias columns to `sectors` and `agencies` tables and update sectors with alias data from your local database.

## Files

1. **add-alias-columns-and-update-sectors.sql** - Main SQL migration script
2. **generate-sector-alias-updates.js** - Helper script to generate UPDATE statements from local DB

## Quick Start

### Option 1: Using the Helper Script (Recommended)

1. **Generate UPDATE statements from your local database:**
   ```bash
   node scripts/migration/generate-sector-alias-updates.js
   ```

2. **Copy the generated UPDATE statements** and paste them into `add-alias-columns-and-update-sectors.sql` (replace the example UPDATE statements)

3. **Run the migration script on your remote server:**
   ```bash
   psql -U your_username -d your_database -f scripts/migration/add-alias-columns-and-update-sectors.sql
   ```

### Option 2: Manual SQL Export

1. **Export sectors with aliases from your local database:**
   ```sql
   SELECT id, name, alias 
   FROM sectors 
   WHERE alias IS NOT NULL AND alias != '';
   ```

2. **Create UPDATE statements** based on the exported data:
   ```sql
   UPDATE sectors SET alias = 'Health' WHERE id = 1 AND name = 'Health';
   UPDATE sectors SET alias = 'Infra' WHERE id = 2 AND name = 'Infrastructure';
   -- Add all your sectors...
   ```

3. **Add the UPDATE statements** to `add-alias-columns-and-update-sectors.sql`

4. **Run the migration script on your remote server**

### Option 3: Bulk Update Using Temporary Table

If you have many sectors, use the bulk update approach shown in the migration script:

1. Create a temporary table
2. Insert all your sector data
3. Update sectors table in one query
4. Drop the temporary table

The helper script (`generate-sector-alias-updates.js`) also generates this bulk update SQL for you.

## Verification

After running the migration, verify the changes:

```sql
-- Check if columns exist
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('sectors', 'agencies') 
AND column_name = 'alias';

-- Check sectors with aliases
SELECT id, name, alias 
FROM sectors 
WHERE alias IS NOT NULL AND alias != ''
ORDER BY name;

-- Count sectors with/without aliases
SELECT 
    COUNT(*) as total_sectors,
    COUNT(alias) as sectors_with_alias,
    COUNT(*) - COUNT(alias) as sectors_without_alias
FROM sectors
WHERE voided = false;
```

## Notes

- The script uses `DO $$` blocks to safely check if columns exist before creating them
- All UPDATE statements include both `id` and `name` checks for safety
- The script is idempotent - you can run it multiple times safely
- Make sure to backup your database before running the migration

## Troubleshooting

If you encounter errors:

1. **Column already exists**: This is normal if you've run the script before. The script handles this gracefully.

2. **Permission errors**: Make sure your database user has ALTER TABLE permissions.

3. **Data type mismatches**: Ensure the alias values match VARCHAR(255) format.

4. **Missing sectors**: If some sectors don't have aliases, they will remain NULL, which is fine.
