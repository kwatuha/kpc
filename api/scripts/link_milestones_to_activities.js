/**
 * Script to link existing milestones and activities for projects
 * This ensures that activities are properly linked to milestones for proper display
 * Run this after importing projects to fix any missing links
 */

const pool = require('../config/db');

async function linkMilestonesToActivities() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        console.log('Linking milestones to activities for existing projects...\n');
        
        // Get all projects with activities but potentially missing milestone links
        const [projects] = await connection.query(`
            SELECT DISTINCT p.id as projectId, p.projectName, p.categoryId
            FROM projects p
            INNER JOIN activities a ON p.id = a.projectId
            WHERE p.voided = 0
            ORDER BY p.id
        `);
        
        console.log(`Found ${projects.length} project(s) with activities\n`);
        
        let totalLinksCreated = 0;
        let projectsProcessed = 0;
        
        for (const project of projects) {
            const { projectId, projectName, categoryId } = project;
            console.log(`Processing project: ${projectName} (ID: ${projectId})`);
            
            // Get all milestones for this project
            const [milestones] = await connection.query(
                'SELECT milestoneId, milestoneName, description FROM project_milestones WHERE projectId = ? AND voided = 0',
                [projectId]
            );
            
            // Get all activities for this project
            const [activities] = await connection.query(
                'SELECT activityId, activityName, activityDescription FROM activities WHERE projectId = ?',
                [projectId]
            );
            
            console.log(`  → Found ${milestones.length} milestone(s) and ${activities.length} activity(ies)`);
            
            if (milestones.length === 0) {
                console.log('  ⚠ No milestones found. Creating from category templates if category exists...');
                
                if (categoryId) {
                    // First, try to find the corresponding categories.categoryId
                    // Projects use project_milestone_implementations.categoryId, but category_milestones references categories.categoryId
                    const [projCategory] = await connection.query(
                        'SELECT categoryName FROM project_milestone_implementations WHERE categoryId = ?',
                        [categoryId]
                    );
                    
                    let actualCategoryId = categoryId;
                    if (projCategory.length > 0) {
                        // Find matching category in categories by name
                        const [catCategory] = await connection.query(
                            'SELECT categoryId FROM categories WHERE categoryName = ? AND voided = 0',
                            [projCategory[0].categoryName]
                        );
                        if (catCategory.length > 0) {
                            actualCategoryId = catCategory[0].categoryId;
                        }
                    }
                    
                    // Auto-create milestones from category templates
                    const [milestoneTemplates] = await connection.query(
                        'SELECT milestoneName, description, sequenceOrder FROM category_milestones WHERE categoryId = ? AND voided = 0 ORDER BY sequenceOrder',
                        [actualCategoryId]
                    );
                    
                    if (milestoneTemplates.length > 0) {
                        for (const template of milestoneTemplates) {
                            await connection.query(
                                'INSERT INTO project_milestones (projectId, milestoneName, description, sequenceOrder, status, progress, weight, completed, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [projectId, template.milestoneName, template.description, template.sequenceOrder, 'not_started', 0, 1, 0, 1]
                            );
                        }
                        console.log(`  ✓ Created ${milestoneTemplates.length} milestone(s) from category template`);
                        
                        // Re-fetch milestones after creation
                        const [newMilestones] = await connection.query(
                            'SELECT milestoneId, milestoneName, description FROM project_milestones WHERE projectId = ? AND voided = 0',
                            [projectId]
                        );
                        milestones.push(...newMilestones);
                    } else {
                        console.log('  ⚠ Category has no milestone templates');
                    }
                } else {
                    console.log('  ⚠ Project has no category assigned');
                }
            }
            
            if (milestones.length === 0 || activities.length === 0) {
                console.log('  ⏭ Skipping - need both milestones and activities\n');
                continue;
            }
            
            // Try to link activities to milestones using name/description matching
            let linksCreated = 0;
            for (const activity of activities) {
                const activityName = (activity.activityName || '').toLowerCase();
                const activityDesc = (activity.activityDescription || '').toLowerCase();
                
                // Find matching milestones
                const matchingMilestones = milestones.filter(milestone => {
                    const milestoneName = (milestone.milestoneName || '').toLowerCase();
                    const milestoneDesc = (milestone.description || '').toLowerCase();
                    
                    // Check if activity name/desc contains milestone keywords or vice versa
                    const activityContains = activityName.includes(milestoneName) || 
                                           activityDesc.includes(milestoneName) ||
                                           activityName.includes(milestoneDesc) ||
                                           activityDesc.includes(milestoneDesc);
                    
                    const milestoneContains = milestoneName.includes(activityName) || 
                                             milestoneDesc.includes(activityName) ||
                                             milestoneName.includes(activityDesc) ||
                                             milestoneDesc.includes(activityDesc);
                    
                    return activityContains || milestoneContains;
                });
                
                // If no fuzzy match, try exact word matching for common terms
                if (matchingMilestones.length === 0) {
                    const activityWords = activityName.split(/\s+/).filter(w => w.length > 3);
                    matchingMilestones.push(...milestones.filter(milestone => {
                        const milestoneName = (milestone.milestoneName || '').toLowerCase();
                        const milestoneDesc = (milestone.description || '').toLowerCase();
                        return activityWords.some(word => 
                            milestoneName.includes(word) || milestoneDesc.includes(word)
                        );
                    }));
                }
                
                // Link to first matching milestone (or all if multiple strong matches)
                for (const milestone of matchingMilestones) {
                    // Check if link already exists
                    const [existingLink] = await connection.query(
                        'SELECT COUNT(*) as count FROM milestone_activities WHERE milestoneId = ? AND activityId = ?',
                        [milestone.milestoneId, activity.activityId]
                    );
                    
                    if (existingLink[0].count === 0) {
                        await connection.query(
                            'INSERT INTO milestone_activities (milestoneId, activityId) VALUES (?, ?)',
                            [milestone.milestoneId, activity.activityId]
                        );
                        linksCreated++;
                        console.log(`    ✓ Linked "${activity.activityName}" → "${milestone.milestoneName}"`);
                    }
                }
                
                // If still no match found, link to first milestone (default behavior)
                if (matchingMilestones.length === 0 && milestones.length > 0) {
                    const [existingLink] = await connection.query(
                        'SELECT COUNT(*) as count FROM milestone_activities WHERE milestoneId = ? AND activityId = ?',
                        [milestones[0].milestoneId, activity.activityId]
                    );
                    
                    if (existingLink[0].count === 0) {
                        await connection.query(
                            'INSERT INTO milestone_activities (milestoneId, activityId) VALUES (?, ?)',
                            [milestones[0].milestoneId, activity.activityId]
                        );
                        linksCreated++;
                        console.log(`    → Linked "${activity.activityName}" → "${milestones[0].milestoneName}" (default)`);
                    }
                }
            }
            
            totalLinksCreated += linksCreated;
            projectsProcessed++;
            console.log(`  ✓ Created ${linksCreated} link(s) for this project\n`);
        }
        
        await connection.commit();
        
        console.log('\n=== SUMMARY ===');
        console.log(`Projects processed: ${projectsProcessed}`);
        console.log(`Total links created: ${totalLinksCreated}`);
        console.log('✅ Successfully linked milestones to activities!');
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error linking milestones to activities:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

// Run the script
linkMilestonesToActivities().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

