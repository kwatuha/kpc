/**
 * Script to assign contractors to projects based on NIMES file data
 * This will create contractors if they don't exist and assign them to projects
 */

const XLSX = require('xlsx');
const pool = require('../config/db');

const excelFile = '/home/dev/dev/imes_working/v5/NIMES_20_PROJECT_DATA.xlsx';

// Helper function
const normalizeStr = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v !== 'string') return String(v);
    return v.trim().replace(/[''"]/g, '');
};

async function assignContractorsToProjects() {
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
        
        let contractorsCreated = 0;
        let assignmentsCreated = 0;
        let assignmentsUpdated = 0;
        let errors = [];
        
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
                continue;
            }
            
            // Find project in database
            const [projects] = await connection.query(
                'SELECT id, projectName FROM projects WHERE (projectName = ? OR ProjectRefNum = ?) AND voided = 0',
                [projectName, projectRef]
            );
            
            if (projects.length === 0) {
                console.log(`Row ${i + 2}: Project "${projectName}" not found in database, skipping`);
                continue;
            }
            
            const project = projects[0];
            const projectId = project.id;
            
            // Get contractor info
            const contractorName = normalizeStr(rowObj['Contractor'] || rowObj['ContractorCompany']);
            if (!contractorName || contractorName.trim() === '') {
                continue;
            }
            
            const contactPerson = normalizeStr(rowObj['ContractorContactPerson'] || rowObj['Contractor Contact Person']) || contractorName;
            const email = normalizeStr(rowObj['ContractorEmail'] || rowObj['Contractor Email']);
            const phone = normalizeStr(rowObj['ContractorPhone'] || rowObj['Contractor Phone']);
            
            // Normalize contractor name for matching
            const normalizedContractorName = contractorName.trim().replace(/'/g, '').replace(/\s+/g, '');
            
            // Find existing contractor
            const [existingContractors] = await connection.query(
                `SELECT contractorId, companyName FROM contractors 
                 WHERE LOWER(TRIM(REPLACE(REPLACE(companyName, '''', ''), ' ', ''))) = LOWER(?)
                 AND (voided IS NULL OR voided = 0)
                 LIMIT 1`,
                [normalizedContractorName]
            );
            
            let contractorId = null;
            
            if (existingContractors.length > 0) {
                contractorId = existingContractors[0].contractorId;
                console.log(`Row ${i + 2}: Found existing contractor "${existingContractors[0].companyName}" (ID: ${contractorId})`);
                
                // Update contractor with additional details if provided
                if (contactPerson || email || phone) {
                    const updateFields = {};
                    if (contactPerson && contactPerson !== contractorName) updateFields.contactPerson = contactPerson;
                    if (email) updateFields.email = email;
                    if (phone) updateFields.phone = phone;
                    
                    if (Object.keys(updateFields).length > 0) {
                        try {
                            await connection.query(
                                'UPDATE contractors SET ? WHERE contractorId = ?',
                                [updateFields, contractorId]
                            );
                            console.log(`  ✓ Updated contractor details`);
                        } catch (err) {
                            console.warn(`  ✗ Failed to update contractor:`, err.message);
                        }
                    }
                }
            } else {
                // Create new contractor
                try {
                    const [insertResult] = await connection.query(
                        'INSERT INTO contractors (companyName, contactPerson, email, phone, userId, voided) VALUES (?, ?, ?, ?, ?, 0)',
                        [contractorName, contactPerson, email || null, phone || null, 1]
                    );
                    contractorId = insertResult.insertId;
                    contractorsCreated++;
                    console.log(`Row ${i + 2}: ✓ Created contractor "${contractorName}" (ID: ${contractorId})`);
                } catch (err) {
                    console.error(`Row ${i + 2}: ✗ Failed to create contractor "${contractorName}":`, err.message);
                    errors.push(`Row ${i + 2}: Failed to create contractor "${contractorName}": ${err.message}`);
                    continue;
                }
            }
            
            // Check if assignment already exists
            const [existingAssignments] = await connection.query(
                'SELECT * FROM project_contractor_assignments WHERE projectId = ? AND contractorId = ? AND (voided IS NULL OR voided = 0)',
                [projectId, contractorId]
            );
            
            if (existingAssignments.length > 0) {
                console.log(`  ⏭ Assignment already exists for project "${project.name}"`);
                continue;
            }
            
            // Create assignment
            try {
                await connection.query(
                    'INSERT INTO project_contractor_assignments (projectId, contractorId, voided) VALUES (?, ?, 0)',
                    [projectId, contractorId]
                );
                assignmentsCreated++;
                console.log(`  ✓ Assigned contractor to project "${project.projectName}"`);
            } catch (err) {
                console.error(`  ✗ Failed to assign contractor:`, err.message);
                errors.push(`Row ${i + 2}: Failed to assign contractor to project: ${err.message}`);
            }
        }
        
        await connection.commit();
        
        console.log(`\n=== SUMMARY ===`);
        console.log(`Contractors created: ${contractorsCreated}`);
        console.log(`Assignments created: ${assignmentsCreated}`);
        console.log(`Errors: ${errors.length}`);
        if (errors.length > 0) {
            console.log('\nErrors:');
            errors.forEach(e => console.log('  -', e));
        }
        console.log('\n✅ Successfully processed contractor assignments!');
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error assigning contractors:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

// Run the script
assignContractorsToProjects().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});











