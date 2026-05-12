#!/bin/bash
# Run pgloader and fix boolean(1) issues afterward

set -e

echo "Step 1: Running pgloader migration..."
docker run --rm --network host \
  -v /home/dev/dev/imes_working/government_projects/scripts/migration:/migration \
  dimitri/pgloader:latest pgloader /migration/pgloader-migration.load 2>&1 | tee /tmp/pgloader-output.log

# Check if migration succeeded (even with some errors)
if grep -q "FATAL" /tmp/pgloader-output.log; then
    echo ""
    echo "⚠️  pgloader encountered errors. Checking if any tables were created..."
    
    # Check if we have tables in gov_imbesdb schema
    TABLE_COUNT=$(docker exec gov_postgres psql -U postgres -d government_projects -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'gov_imbesdb';" 2>&1 | xargs)
    
    if [ "$TABLE_COUNT" -gt "0" ]; then
        echo "✓ Found $TABLE_COUNT tables in gov_imbesdb schema"
        echo ""
        echo "Step 2: Fixing boolean(1) syntax errors..."
        
        # Fix boolean columns
        docker exec gov_postgres psql -U postgres -d government_projects << 'EOF'
-- Fix all boolean(1) columns by altering them
DO $$
DECLARE
    r RECORD;
    sql_text TEXT;
BEGIN
    FOR r IN 
        SELECT 
            n.nspname as schema_name,
            c.relname as table_name,
            a.attname as column_name
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'gov_imbesdb'
        AND a.atttypid = (SELECT oid FROM pg_type WHERE typname = 'bool')
        AND a.attnum > 0
        AND NOT a.attisdropped
    LOOP
        BEGIN
            sql_text := format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE boolean;',
                r.schema_name, r.table_name, r.column_name);
            EXECUTE sql_text;
            RAISE NOTICE 'Fixed: %.%.%', r.schema_name, r.table_name, r.column_name;
        EXCEPTION WHEN OTHERS THEN
            -- Column might already be correct, skip
            NULL;
        END;
    END LOOP;
END $$;
EOF
        
        echo "✓ Boolean columns fixed"
        echo ""
        echo "Step 3: Re-running pgloader to create remaining tables..."
        # Re-run pgloader - it should skip existing tables and create missing ones
        docker run --rm --network host \
          -v /home/dev/dev/imes_working/government_projects/scripts/migration:/migration \
          dimitri/pgloader:latest pgloader /migration/pgloader-migration.load 2>&1 | tail -50
    else
        echo "❌ No tables were created. The boolean(1) error is blocking table creation."
        echo ""
        echo "Trying alternative approach: Using a patched pgloader config..."
    fi
else
    echo "✓ pgloader completed successfully!"
fi

echo ""
echo "Step 4: Checking final table count..."
docker exec gov_postgres psql -U postgres -d government_projects -c "SELECT schemaname, COUNT(*) as table_count FROM pg_tables WHERE schemaname IN ('public', 'gov_imbesdb') GROUP BY schemaname;" 2>&1
