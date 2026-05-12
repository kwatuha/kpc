/**
 * Migration script to add alias column to sectors and agencies tables
 * Run this script to add the alias field for short names/abbreviations
 * 
 * Usage: node scripts/migration/add-alias-to-sectors-agencies.js
 */

const pool = require('../../api/config/db');

async function addAliasColumn() {
    const DB_TYPE = process.env.DB_TYPE || 'postgresql';
    
    try {
        console.log('Starting migration: Adding alias column to sectors and agencies tables...');
        
        if (DB_TYPE === 'postgresql') {
            // Add alias column to sectors table (PostgreSQL)
            try {
                await pool.query(`
                    ALTER TABLE sectors 
                    ADD COLUMN IF NOT EXISTS alias VARCHAR(255);
                `);
                console.log('✓ Added alias column to sectors table (PostgreSQL)');
            } catch (err) {
                if (err.code === '42701') { // Column already exists
                    console.log('✓ Alias column already exists in sectors table');
                } else {
                    throw err;
                }
            }
            
            // Add alias column to agencies table (PostgreSQL)
            try {
                await pool.query(`
                    ALTER TABLE agencies 
                    ADD COLUMN IF NOT EXISTS alias VARCHAR(255);
                `);
                console.log('✓ Added alias column to agencies table (PostgreSQL)');
            } catch (err) {
                if (err.code === '42701') { // Column already exists
                    console.log('✓ Alias column already exists in agencies table');
                } else {
                    throw err;
                }
            }
        } else {
            // Add alias column to sectors table (MySQL)
            try {
                await pool.query(`
                    ALTER TABLE sectors 
                    ADD COLUMN alias VARCHAR(255) NULL;
                `);
                console.log('✓ Added alias column to sectors table (MySQL)');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') { // Column already exists
                    console.log('✓ Alias column already exists in sectors table');
                } else {
                    throw err;
                }
            }
            
            // Add alias column to agencies table (MySQL)
            try {
                await pool.query(`
                    ALTER TABLE agencies 
                    ADD COLUMN alias VARCHAR(255) NULL;
                `);
                console.log('✓ Added alias column to agencies table (MySQL)');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') { // Column already exists
                    console.log('✓ Alias column already exists in agencies table');
                } else {
                    throw err;
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!');
        console.log('You can now use the alias field in Sectors and Agencies management pages.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migration
if (require.main === module) {
    addAliasColumn()
        .then(() => {
            console.log('Migration script finished.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = addAliasColumn;
