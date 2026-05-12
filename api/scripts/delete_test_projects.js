/**
 * Script to delete/void projects imported from NIMES_20_PROJECT_DATA.xlsx
 * Run this script to clean up test data before re-importing
 */

const pool = require('../config/db');

async function deleteTestProjects() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // Find projects matching Road Construction - Main Street
        const [projects] = await connection.query(
            'SELECT id, projectName, ProjectRefNum FROM projects WHERE (projectName LIKE ? OR ProjectRefNum LIKE ?) AND voided = 0',
            ['%Road Construction%', 'PRJ-2024-001%']
        );
        
        console.log(`Found ${projects.length} project(s) to delete/void:`);
        projects.forEach(p => {
            console.log(`  - ID: ${p.id}, Name: ${p.projectName}, Ref: ${p.ProjectRefNum}`);
        });
        
        if (projects.length === 0) {
            console.log('No projects found to delete.');
            await connection.commit();
            return;
        }
        
        const projectIds = projects.map(p => p.id);
        
        // Delete related data first (in correct order due to foreign keys)
        console.log('\nDeleting related records...');
        
        // Delete milestone activities
        await connection.query(
            'DELETE FROM milestone_activities WHERE activityId IN (SELECT activityId FROM activities WHERE projectId IN (?))',
            [projectIds]
        );
        
        // Delete activities
        await connection.query('DELETE FROM activities WHERE projectId IN (?)', [projectIds]);
        
        // Delete milestones
        await connection.query('DELETE FROM project_milestones WHERE projectId IN (?)', [projectIds]);
        
        // Delete contractor assignments
        await connection.query('DELETE FROM project_contractor_assignments WHERE projectId IN (?)', [projectIds]);
        
        // Delete location associations
        await connection.query('DELETE FROM project_counties WHERE projectId IN (?)', [projectIds]);
        await connection.query('DELETE FROM project_subcounties WHERE projectId IN (?)', [projectIds]);
        await connection.query('DELETE FROM project_wards WHERE projectId IN (?)', [projectIds]);
        
        // Void the projects (soft delete)
        const [result] = await connection.query(
            'UPDATE projects SET voided = 1, voidedBy = 1 WHERE id IN (?)',
            [projectIds]
        );
        
        await connection.commit();
        console.log(`\n✅ Successfully voided ${result.affectedRows} project(s) and deleted related records.`);
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error deleting projects:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

// Run the script
deleteTestProjects().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});











