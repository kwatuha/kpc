/**
 * Script to fix projects with budgetId 7 that don't have "Under Procurement" status
 * This fixes the 17 missing projects that should show up when filtering by "Under Procurement"
 * 
 * Run with: node api/scripts/fixBudgetProjectsStatus.js
 */

require('dotenv').config();
const pool = require('../config/db');

async function fixBudgetProjectsStatus() {
    const budgetId = 7;
    
    try {
        console.log(`\n=== Fixing projects for budgetId ${budgetId} ===\n`);
        
        // Find projects that don't have procurement-related status
        const [projectsToFix] = await pool.query(
            `SELECT id, projectName, status 
             FROM projects 
             WHERE budgetId = ? 
               AND voided = 0 
               AND (status IS NULL 
                    OR status = '' 
                    OR (LOWER(status) NOT LIKE '%procurement%' 
                        AND LOWER(status) NOT LIKE '%under procurement%'))`,
            [budgetId]
        );
        
        console.log(`Found ${projectsToFix.length} projects that need status update\n`);
        
        if (projectsToFix.length === 0) {
            console.log('No projects need fixing. All projects already have procurement-related status.');
            return;
        }
        
        // Show sample projects
        console.log('Sample projects to be updated:');
        projectsToFix.slice(0, 5).forEach(project => {
            console.log(`  ID: ${project.id}, Name: ${project.projectName?.substring(0, 50)}..., Current Status: ${project.status || '(NULL)'}`);
        });
        
        // Update all projects to have "Under Procurement" status
        const [updateResult] = await pool.query(
            `UPDATE projects 
             SET status = 'Under Procurement' 
             WHERE budgetId = ? 
               AND voided = 0 
               AND (status IS NULL 
                    OR status = '' 
                    OR (LOWER(status) NOT LIKE '%procurement%' 
                        AND LOWER(status) NOT LIKE '%under procurement%'))`,
            [budgetId]
        );
        
        console.log(`\n✓ Updated ${updateResult.affectedRows} projects to "Under Procurement" status`);
        
        // Verify the fix
        const [procurementCount] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM projects 
             WHERE budgetId = ? 
               AND voided = 0 
               AND (LOWER(status) LIKE '%procurement%' OR LOWER(status) LIKE '%under procurement%')`,
            [budgetId]
        );
        
        const [totalCount] = await pool.query(
            'SELECT COUNT(*) as count FROM projects WHERE budgetId = ? AND voided = 0',
            [budgetId]
        );
        
        console.log(`\n=== Verification ===`);
        console.log(`Total projects with budgetId ${budgetId}: ${totalCount[0].count}`);
        console.log(`Projects with procurement status: ${procurementCount[0].count}`);
        console.log(`Expected: 705 projects`);
        
        if (procurementCount[0].count === totalCount[0].count) {
            console.log(`\n✓ SUCCESS: All projects now have procurement-related status!`);
        } else {
            console.log(`\n⚠ WARNING: ${totalCount[0].count - procurementCount[0].count} projects still don't have procurement status`);
        }
        
    } catch (error) {
        console.error('Error fixing budget projects status:', error);
    } finally {
        await pool.end();
    }
}

fixBudgetProjectsStatus();
