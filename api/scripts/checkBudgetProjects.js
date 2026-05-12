/**
 * Diagnostic script to check projects imported with budgetId 7
 * Run with: node api/scripts/checkBudgetProjects.js
 */

require('dotenv').config();
const pool = require('../config/db');

async function checkBudgetProjects() {
    const budgetId = 7;
    
    try {
        console.log(`\n=== Checking projects for budgetId ${budgetId} ===\n`);
        
        // Total count of projects with this budgetId
        const [totalCount] = await pool.query(
            'SELECT COUNT(*) as count FROM projects WHERE budgetId = ? AND voided = 0',
            [budgetId]
        );
        console.log(`Total projects with budgetId ${budgetId}: ${totalCount[0].count}`);
        
        // Count by status
        const [statusCounts] = await pool.query(
            `SELECT status, COUNT(*) as count 
             FROM projects 
             WHERE budgetId = ? AND voided = 0 
             GROUP BY status 
             ORDER BY count DESC`,
            [budgetId]
        );
        console.log('\nProjects by status:');
        statusCounts.forEach(row => {
            console.log(`  ${row.status || '(NULL)'}: ${row.count}`);
        });
        
        // Count procurement-related statuses
        const [procurementCount] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM projects 
             WHERE budgetId = ? 
               AND voided = 0 
               AND (LOWER(status) LIKE '%procurement%' OR LOWER(status) LIKE '%under procurement%')`,
            [budgetId]
        );
        console.log(`\nProjects with procurement-related status: ${procurementCount[0].count}`);
        
        // Check for projects with NULL status
        const [nullStatusCount] = await pool.query(
            'SELECT COUNT(*) as count FROM projects WHERE budgetId = ? AND voided = 0 AND (status IS NULL OR status = "")',
            [budgetId]
        );
        console.log(`Projects with NULL or empty status: ${nullStatusCount[0].count}`);
        
        // Sample projects with different statuses
        console.log('\nSample projects (first 10):');
        const [samples] = await pool.query(
            `SELECT id, projectName, status, budgetId, voided, createdAt 
             FROM projects 
             WHERE budgetId = ? AND voided = 0 
             ORDER BY id 
             LIMIT 10`,
            [budgetId]
        );
        samples.forEach(project => {
            console.log(`  ID: ${project.id}, Name: ${project.projectName?.substring(0, 50)}..., Status: ${project.status || '(NULL)'}`);
        });
        
        // Check for projects that should be "Under Procurement" but aren't
        const [wrongStatus] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM projects 
             WHERE budgetId = ? 
               AND voided = 0 
               AND status IS NOT NULL 
               AND status != '' 
               AND LOWER(status) NOT LIKE '%procurement%' 
               AND LOWER(status) NOT LIKE '%under procurement%'`,
            [budgetId]
        );
        console.log(`\nProjects with non-procurement status: ${wrongStatus[0].count}`);
        
        if (wrongStatus[0].count > 0) {
            console.log('\nSample projects with non-procurement status:');
            const [wrongStatusSamples] = await pool.query(
                `SELECT id, projectName, status 
                 FROM projects 
                 WHERE budgetId = ? 
                   AND voided = 0 
                   AND status IS NOT NULL 
                   AND status != '' 
                   AND LOWER(status) NOT LIKE '%procurement%' 
                   AND LOWER(status) NOT LIKE '%under procurement%'
                 LIMIT 5`,
                [budgetId]
            );
            wrongStatusSamples.forEach(project => {
                console.log(`  ID: ${project.id}, Status: "${project.status}"`);
            });
        }
        
        console.log('\n=== Summary ===');
        console.log(`Expected: 705 projects`);
        console.log(`Found: ${totalCount[0].count} total projects`);
        console.log(`Procurement status: ${procurementCount[0].count} projects`);
        console.log(`Difference: ${705 - totalCount[0].count} missing projects`);
        
    } catch (error) {
        console.error('Error checking budget projects:', error);
    } finally {
        await pool.end();
    }
}

checkBudgetProjects();
