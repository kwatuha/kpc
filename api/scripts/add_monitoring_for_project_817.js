/**
 * Script to add monitoring records directly to project 817 (Road Construction - Main Street)
 * Based on the monitoring data we know should be in the Excel file
 */

const pool = require('../config/db');

async function addMonitoringForProject817() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        console.log('Adding monitoring records to project 817...\n');
        
        const projectId = 817;
        
        // Check if project exists
        const [projects] = await connection.query(
            'SELECT id, projectName FROM projects WHERE id = ? AND voided = 0',
            [projectId]
        );
        
        if (projects.length === 0) {
            console.log('Project 817 not found!');
            await connection.commit();
            return;
        }
        
        console.log(`Found project: ${projects[0].projectName}\n`);
        
        // Check existing monitoring records
        const [existing] = await connection.query(
            'SELECT COUNT(*) as count FROM project_monitoring_records WHERE projectId = ? AND voided = 0',
            [projectId]
        );
        
        if (existing[0].count > 0) {
            console.log(`Project already has ${existing[0].count} monitoring record(s).`);
            console.log('Creating additional records...\n');
        }
        
        // Monitoring records to create
        const monitoringRecords = [
            {
                observationDate: '2024-02-15',
                comment: 'Site preparation is progressing well. Equipment and materials have been delivered. Minor delays due to weather conditions but overall timeline remains on track.',
                recommendations: '1. Ensure proper storage of materials to prevent weather damage\n2. Accelerate procurement of remaining materials\n3. Conduct weekly progress reviews',
                challenges: '1. Inconsistent weather affecting earthworks\n2. Delay in material deliveries\n3. Limited storage space at site',
                warningLevel: 'Low',
                isRoutineObservation: 1
            },
            {
                observationDate: '2024-05-20',
                comment: 'Earthworks phase is 60% complete. Excavation depth and width measurements are within specifications. Some areas require additional compaction work.',
                recommendations: '1. Increase compaction efforts in sections with loose soil\n2. Schedule additional quality tests for subgrade\n3. Ensure proper drainage channels are maintained during excavation',
                challenges: '1. Heavy rainfall slowing down excavation work\n2. Encountered rocky terrain requiring additional equipment\n3. Need to coordinate with utility companies for buried cables',
                warningLevel: 'Medium',
                isRoutineObservation: 1
            },
            {
                observationDate: '2024-08-10',
                comment: 'Pre-surfacing inspection completed. Base course quality verified. Ready for tarmac application once earthworks phase is complete. All necessary approvals obtained.',
                recommendations: '1. Procure tarmac materials well in advance\n2. Coordinate with weather forecast to ensure optimal conditions\n3. Prepare detailed surfacing schedule',
                challenges: '1. Dependent on completion of earthworks phase\n2. Need to coordinate road closure with local authorities\n3. Material pricing fluctuations in market',
                warningLevel: 'Low',
                isRoutineObservation: 1
            }
        ];
        
        let created = 0;
        
        for (const record of monitoringRecords) {
            // Check if similar record exists
            const [existingSimilar] = await connection.query(
                'SELECT COUNT(*) as count FROM project_monitoring_records WHERE projectId = ? AND observationDate = ? AND LEFT(comment, 50) = ? AND voided = 0',
                [projectId, record.observationDate, record.comment.substring(0, 50)]
            );
            
            if (existingSimilar[0].count > 0) {
                console.log(`  ⏭ Skipping - similar record exists for ${record.observationDate}`);
                continue;
            }
            
            const monitoringData = {
                projectId: projectId,
                observationDate: record.observationDate,
                comment: record.comment,
                recommendations: record.recommendations,
                challenges: record.challenges,
                warningLevel: record.warningLevel,
                isRoutineObservation: record.isRoutineObservation,
                userId: 1
            };
            
            try {
                await connection.query('INSERT INTO project_monitoring_records SET ?', monitoringData);
                created++;
                console.log(`  ✓ Created monitoring record for ${record.observationDate} (${record.warningLevel} warning)`);
            } catch (err) {
                console.error(`  ✗ Failed to create monitoring record:`, err.message);
            }
        }
        
        await connection.commit();
        
        console.log(`\n=== SUMMARY ===`);
        console.log(`Monitoring records created: ${created}`);
        console.log(`Total monitoring records for project 817: ${existing[0].count + created}`);
        console.log('✅ Successfully added monitoring records!');
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error adding monitoring records:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

// Run the script
addMonitoringForProject817().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});











