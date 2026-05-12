/**
 * Script to add monitoring records to existing projects from the NIMES file
 * This will read the Excel file and create monitoring records for projects that don't have them
 */

const XLSX = require('xlsx');
const pool = require('../config/db');

// File path - adjust if needed
const excelFile = process.env.EXCEL_FILE_PATH || '/home/dev/dev/imes_working/v5/NIMES_20_PROJECT_DATA.xlsx';

// Helper functions (same as in comprehensiveProjectRoutes)
const parseDateToYMD = (value) => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) {
        const yyyy = value.getFullYear();
        const mm = value.getMonth() + 1;
        const dd = value.getDate();
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (mm === 2 && ((yyyy % 4 === 0 && yyyy % 100 !== 0) || (yyyy % 400 === 0))) {
            daysInMonth[1] = 29;
        }
        const maxDays = daysInMonth[mm - 1];
        const fixedDay = dd > maxDays ? maxDays : dd;
        return `${yyyy}-${String(mm).padStart(2, '0')}-${String(fixedDay).padStart(2, '0')}`;
    }
    if (typeof value === 'string') {
        const s = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    }
    return null;
};

const normalizeStr = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v !== 'string') return String(v);
    return v.trim().replace(/[''"]/g, '');
};

const parseBool = (v) => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        return ['1', 'true', 'yes', 'y'].includes(s);
    }
    return false;
};

async function addMonitoringToProjects() {
    let connection;
    try {
        // Read Excel file
        const workbook = XLSX.readFile(excelFile, { cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headers = rawData[0];
        const dataRows = rawData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));
        
        console.log(`Found ${dataRows.length} rows in Excel file\n`);
        
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        let recordsCreated = 0;
        let recordsSkipped = 0;
        
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            
            // Map row to object
            const rowObj = {};
            headers.forEach((header, idx) => {
                rowObj[header] = row[idx];
            });
            
            // Get project identifier
            const projectName = normalizeStr(rowObj['Project Name'] || rowObj['ProjectName']);
            const projectRef = normalizeStr(rowObj['Project Ref Num'] || rowObj['ProjectRefNum']);
            
            if (!projectName && !projectRef) {
                console.log(`Row ${i + 2}: Skipping - no project name or ref`);
                continue;
            }
            
            // Find project in database
            const [projects] = await connection.query(
                'SELECT id, projectName FROM projects WHERE (projectName = ? OR ProjectRefNum = ?) AND voided = 0',
                [projectName, projectRef]
            );
            
            if (projects.length === 0) {
                console.log(`Row ${i + 2}: Project "${projectName}" not found in database, skipping`);
                recordsSkipped++;
                continue;
            }
            
            const project = projects[0];
            const projectId = project.id;
            
            // Check monitoring data
            const monitoringComment = normalizeStr(rowObj['MonitoringComment'] || rowObj['Monitoring Comment']);
            
            if (!monitoringComment || monitoringComment.trim() === '') {
                console.log(`Row ${i + 2}: No monitoring comment, skipping`);
                recordsSkipped++;
                continue;
            }
            
            // Check if monitoring record already exists for this project with this comment
            const [existing] = await connection.query(
                'SELECT COUNT(*) as count FROM project_monitoring_records WHERE projectId = ? AND comment = ? AND voided = 0',
                [projectId, monitoringComment.substring(0, 255)]
            );
            
            if (existing[0].count > 0) {
                console.log(`Row ${i + 2}: Monitoring record already exists for project "${projectName}", skipping`);
                recordsSkipped++;
                continue;
            }
            
            // Create monitoring record
            const monitoringData = {
                projectId: projectId,
                comment: monitoringComment,
                recommendations: normalizeStr(rowObj['MonitoringRecommendations'] || rowObj['Monitoring Recommendations']) || null,
                challenges: normalizeStr(rowObj['MonitoringChallenges'] || rowObj['Monitoring Challenges']) || null,
                warningLevel: normalizeStr(rowObj['MonitoringWarningLevel'] || rowObj['Monitoring Warning Level']) || 'None',
                isRoutineObservation: parseBool(rowObj['IsRoutineObservation'] || rowObj['Is Routine Observation']) !== false ? 1 : 0,
                userId: 1
            };
            
            // Parse observation date
            const obsDate = parseDateToYMD(rowObj['MonitoringObservationDate'] || rowObj['Monitoring Observation Date']);
            if (obsDate) {
                monitoringData.observationDate = obsDate;
            }
            
            try {
                await connection.query('INSERT INTO project_monitoring_records SET ?', monitoringData);
                recordsCreated++;
                console.log(`✓ Row ${i + 2}: Created monitoring record for project "${projectName}" (ID: ${projectId})`);
            } catch (err) {
                console.error(`✗ Row ${i + 2}: Failed to create monitoring record:`, err.message);
            }
        }
        
        await connection.commit();
        
        console.log(`\n=== SUMMARY ===`);
        console.log(`Monitoring records created: ${recordsCreated}`);
        console.log(`Records skipped: ${recordsSkipped}`);
        console.log('✅ Successfully added monitoring records to projects!');
        
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
addMonitoringToProjects().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

