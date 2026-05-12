/**
 * Helper script to generate UPDATE statements for sector aliases
 * 
 * This script reads sectors with aliases from your local database
 * and generates SQL UPDATE statements that you can paste into the
 * migration script.
 * 
 * Usage: node scripts/migration/generate-sector-alias-updates.js
 */

const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Load environment variables from api/.env manually
function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
        throw new Error(`.env file not found at: ${envPath}`);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                envVars[key] = value;
            }
        }
    });
    
    // Set environment variables
    Object.keys(envVars).forEach(key => {
        if (!process.env[key]) {
            process.env[key] = envVars[key];
        }
    });
    
    return envVars;
}

// Load .env file
const envPath = path.join(__dirname, '../../api/.env');
try {
    loadEnvFile(envPath);
    console.log(`✓ Loaded environment variables from: ${envPath}\n`);
} catch (error) {
    console.error(`❌ Error loading .env file: ${error.message}`);
    process.exit(1);
}

// Verify database connection info
if (!process.env.DB_HOST || !process.env.DB_NAME) {
    console.error('❌ Error: Database connection information not found in environment variables.');
    console.error('Please ensure api/.env file contains DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME');
    process.exit(1);
}

// Create database connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function generateSectorAliasUpdates() {
    try {
        console.log(`Connecting to database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
        console.log('Fetching sectors with aliases from local database...\n');
        
        // Fetch all sectors with aliases
        const result = await pool.query(`
            SELECT id, name, alias
            FROM sectors
            WHERE alias IS NOT NULL 
            AND alias != ''
            AND voided = false
            ORDER BY name
        `);

        const sectors = result.rows || [];
        
        if (sectors.length === 0) {
            console.log('No sectors with aliases found in local database.');
            return;
        }

        console.log(`Found ${sectors.length} sectors with aliases\n`);
        console.log('='.repeat(80));
        console.log('COPY THE FOLLOWING UPDATE STATEMENTS INTO YOUR MIGRATION SCRIPT:');
        console.log('='.repeat(80));
        console.log();

        // Generate UPDATE statements
        sectors.forEach((sector, index) => {
            const escapedName = sector.name.replace(/'/g, "''"); // Escape single quotes
            const escapedAlias = sector.alias.replace(/'/g, "''"); // Escape single quotes
            console.log(`UPDATE sectors SET alias = '${escapedAlias}' WHERE id = ${sector.id} AND name = '${escapedName}';`);
        });

        console.log();
        console.log('='.repeat(80));
        console.log(`Total: ${sectors.length} UPDATE statements generated`);
        console.log('='.repeat(80));
        console.log();
        console.log('Alternative: Bulk update using temporary table:');
        console.log();
        console.log('-- Create temporary table');
        console.log('CREATE TEMP TABLE sector_aliases_temp (');
        console.log('    id INTEGER,');
        console.log('    name VARCHAR(255),');
        console.log('    alias VARCHAR(255)');
        console.log(');');
        console.log();
        console.log('-- Insert data');
        console.log('INSERT INTO sector_aliases_temp (id, name, alias) VALUES');
        
        sectors.forEach((sector, index) => {
            const escapedName = sector.name.replace(/'/g, "''");
            const escapedAlias = sector.alias.replace(/'/g, "''");
            const comma = index < sectors.length - 1 ? ',' : ';';
            console.log(`    (${sector.id}, '${escapedName}', '${escapedAlias}')${comma}`);
        });
        
        console.log();
        console.log('-- Update sectors table');
        console.log('UPDATE sectors s');
        console.log('SET alias = t.alias');
        console.log('FROM sector_aliases_temp t');
        console.log('WHERE s.id = t.id AND s.name = t.name;');
        console.log();
        console.log('-- Clean up');
        console.log('DROP TABLE sector_aliases_temp;');

    } catch (error) {
        console.error('Error generating UPDATE statements:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run script
if (require.main === module) {
    generateSectorAliasUpdates()
        .then(() => {
            console.log('\n✅ Script completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = generateSectorAliasUpdates;
