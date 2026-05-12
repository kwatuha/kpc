/**
 * Script to check if the new tables exist in the database
 * Run with: node api/scripts/check_tables_exist.js
 */

const pool = require('../config/db');

async function checkTables() {
    const tables = [
        'citizen_proposals',
        'county_proposed_projects',
        'county_proposed_project_milestones',
        'project_announcements'
    ];

    console.log('Checking if tables exist...\n');

    for (const table of tables) {
        try {
            const [rows] = await pool.query(`SHOW TABLES LIKE '${table}'`);
            if (rows.length > 0) {
                const [count] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`✓ ${table} exists (${count[0].count} records)`);
            } else {
                console.log(`✗ ${table} does NOT exist - please run migration`);
            }
        } catch (error) {
            console.error(`✗ Error checking ${table}:`, error.message);
        }
    }

    await pool.end();
}

checkTables().catch(console.error);

