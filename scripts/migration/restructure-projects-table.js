/**
 * Migration script to restructure local projects table to match remote structure
 * This script handles the data migration more carefully, including lookups for department/section names
 */

const { Pool } = require('pg');
const fs = require('fs');

const pgConfig = {
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'postgres',
    database: 'government_projects'
};

async function restructureProjectsTable() {
    const pool = new Pool(pgConfig);
    
    try {
        console.log('Starting projects table restructuring...\n');
        
        // Read the SQL migration file
        const sql = fs.readFileSync(__dirname + '/restructure-projects-table.sql', 'utf8');
        
        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('BEGIN') && !s.startsWith('COMMIT'));
        
        console.log(`Executing ${statements.length} SQL statements...\n`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip verification query at the end
            if (statement.includes('information_schema.columns')) {
                continue;
            }
            
            try {
                console.log(`[${i + 1}/${statements.length}] Executing statement...`);
                await pool.query(statement);
                console.log(`  ✓ Success\n`);
            } catch (error) {
                // Some errors are expected (e.g., column already exists, column doesn't exist)
                if (error.message.includes('already exists') || 
                    error.message.includes('does not exist') ||
                    error.message.includes('column') && error.message.includes('cannot be dropped')) {
                    console.log(`  ⚠ Skipped (expected): ${error.message.split('\n')[0]}\n`);
                } else {
                    console.error(`  ✗ Error: ${error.message}\n`);
                    throw error;
                }
            }
        }
        
        // Now do the data migration with proper lookups
        console.log('Migrating data with lookups...\n');
        
        // Get department and section names for lookups
        // Departments table uses camelCase, projects table uses lowercase
        const deptResult = await pool.query('SELECT "departmentId", name FROM departments');
        const deptMap = new Map(deptResult.rows.map(d => [d.departmentId, d.name]));
        
        // Sections table might not exist
        let sectionMap = new Map();
        try {
            const sectionResult = await pool.query('SELECT "sectionId", name FROM sections');
            sectionMap = new Map(sectionResult.rows.map(s => [s.sectionId, s.name]));
        } catch (err) {
            console.log('  ⚠ Sections table not found, skipping section lookups\n');
        }
        
        // Get all projects
        const projectsResult = await pool.query('SELECT * FROM projects');
        const projects = projectsResult.rows;
        
        console.log(`Processing ${projects.length} projects...\n`);
        
        for (const project of projects) {
            const updates = {};
            
            // Update ministry from departmentid (projects uses lowercase, departments uses camelCase)
            const deptId = project.departmentid || project.departmentId;
            if (deptId && deptMap.has(deptId)) {
                updates.ministry = deptMap.get(deptId);
            }
            
            // Update state_department from sectionid (projects uses lowercase, sections uses camelCase)
            const sectionId = project.sectionid || project.sectionId;
            if (sectionId && sectionMap.has(sectionId)) {
                updates.state_department = sectionMap.get(sectionId);
            }
            
            // Update implementing_agency from directorate
            if (project.directorate && !project.implementing_agency) {
                updates.implementing_agency = project.directorate;
            }
            
            // Update JSONB columns if they're null
            if (!project.timeline) {
                updates.timeline = {
                    start_date: project.startdate ? project.startdate.toISOString().split('T')[0] : null,
                    expected_completion_date: project.enddate ? project.enddate.toISOString().split('T')[0] : null,
                    last_updated: project.updatedat ? project.updatedat.toISOString().split('T')[0] : null
                };
            }
            
            if (!project.budget) {
                updates.budget = {
                    allocated_amount_kes: project.costofproject || 0,
                    disbursed_amount_kes: project.paidout || 0,
                    contracted: project.contracted || false,
                    budget_id: project.budgetid || null
                };
            }
            
            if (!project.progress) {
                updates.progress = {
                    status: project.status || null,
                    status_reason: project.statusreason || null,
                    percentage_complete: project.overallprogress || 0,
                    latest_update_summary: project.statusreason || null
                };
            }
            
            if (!project.public_engagement) {
                updates.public_engagement = {
                    approved_for_public: project.approved_for_public || false,
                    approved_by: project.approved_by || null,
                    approved_at: project.approved_at ? project.approved_at.toISOString() : null,
                    approval_notes: project.approval_notes || null,
                    revision_requested: project.revision_requested || false,
                    revision_notes: project.revision_notes || null,
                    revision_requested_by: project.revision_requested_by || null,
                    revision_requested_at: project.revision_requested_at ? project.revision_requested_at.toISOString() : null,
                    revision_submitted_at: project.revision_submitted_at ? project.revision_submitted_at.toISOString() : null,
                    feedback_enabled: project.approved_for_public || false,
                    complaints_received: 0
                };
            }
            
            if (!project.data_sources) {
                updates.data_sources = {
                    project_ref_num: project.projectrefnum || null,
                    created_by_user_id: project.userid || null,
                    source_system: 'IMBES'
                };
            }
            
            if (!project.notes) {
                updates.notes = {
                    objective: project.objective || null,
                    expected_output: project.expectedoutput || null,
                    expected_outcome: project.expectedoutcome || null,
                    program_id: project.programid || null,
                    subprogram_id: project.subprogramid || null,
                    default_photo_id: project.defaultphotoid || null,
                    workflow_id: project.workflowid || null,
                    current_stage_id: project.currentstageid || null
                };
            }
            
            // Apply updates
            if (Object.keys(updates).length > 0) {
                const setClauses = [];
                const values = [];
                let paramIndex = 1;
                
                for (const [key, value] of Object.entries(updates)) {
                    if (typeof value === 'object' && value !== null) {
                        setClauses.push(`${key} = $${paramIndex}`);
                        values.push(JSON.stringify(value));
                    } else {
                        setClauses.push(`${key} = $${paramIndex}`);
                        values.push(value);
                    }
                    paramIndex++;
                }
                
                values.push(project.id || project.project_id);
                
                await pool.query(
                    `UPDATE projects SET ${setClauses.join(', ')} WHERE ${project.id ? 'id' : 'project_id'} = $${paramIndex}`,
                    values
                );
            }
        }
        
        console.log('✅ Data migration complete!\n');
        
        // Verify the new structure
        console.log('Verifying new table structure...\n');
        const [columns] = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'projects' 
            ORDER BY ordinal_position
        `);
        
        console.log('Current columns:');
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        console.log(`\n✅ Migration complete! Table now has ${columns.rows.length} columns.`);
        
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migration
restructureProjectsTable()
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nMigration failed:', error);
        process.exit(1);
    });
