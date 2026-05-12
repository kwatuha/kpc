/**
 * Script to create contractor and assign to project 817
 */

const pool = require('../config/db');

async function fixContractorAssignment() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        console.log('Fixing contractor assignment for project 817...\n');
        
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
        
        // Contractor details from NIMES file
        const contractorData = {
            companyName: 'ABC Construction Ltd',
            contactPerson: 'James Mwangi',
            email: 'info@abcconstruction.co.ke',
            phone: '+254 712 345 678'
        };
        
        // Check if contractor exists
        const normalizedName = contractorData.companyName.trim().replace(/'/g, '').replace(/\s+/g, '');
        const [existingContractors] = await connection.query(
            `SELECT contractorId, companyName FROM contractors 
             WHERE LOWER(TRIM(REPLACE(REPLACE(companyName, '''', ''), ' ', ''))) = LOWER(?)
             AND (voided IS NULL OR voided = 0)
             LIMIT 1`,
            [normalizedName]
        );
        
        let contractorId = null;
        
        if (existingContractors.length > 0) {
            contractorId = existingContractors[0].contractorId;
            console.log(`Found existing contractor: ${existingContractors[0].companyName} (ID: ${contractorId})`);
            
            // Update contractor details
            try {
                await connection.query(
                    'UPDATE contractors SET contactPerson = ?, email = ?, phone = ? WHERE contractorId = ?',
                    [contractorData.contactPerson, contractorData.email, contractorData.phone, contractorId]
                );
                console.log('✓ Updated contractor details');
            } catch (err) {
                console.warn('⚠ Failed to update contractor details:', err.message);
            }
        } else {
            // Create new contractor
            try {
                const [insertResult] = await connection.query(
                    'INSERT INTO contractors (companyName, contactPerson, email, phone, userId, voided) VALUES (?, ?, ?, ?, ?, 0)',
                    [contractorData.companyName, contractorData.contactPerson, contractorData.email, contractorData.phone, 1]
                );
                contractorId = insertResult.insertId;
                console.log(`✓ Created contractor: ${contractorData.companyName} (ID: ${contractorId})`);
            } catch (err) {
                console.error('✗ Failed to create contractor:', err.message);
                throw err;
            }
        }
        
        // Check if assignment already exists
        const [existingAssignments] = await connection.query(
            'SELECT * FROM project_contractor_assignments WHERE projectId = ? AND contractorId = ? AND (voided IS NULL OR voided = 0)',
            [projectId, contractorId]
        );
        
        if (existingAssignments.length > 0) {
            console.log('✓ Assignment already exists');
        } else {
            // Create assignment
            try {
                await connection.query(
                    'INSERT INTO project_contractor_assignments (projectId, contractorId, voided) VALUES (?, ?, 0)',
                    [projectId, contractorId]
                );
                console.log('✓ Created contractor assignment');
            } catch (err) {
                console.error('✗ Failed to create assignment:', err.message);
                throw err;
            }
        }
        
        await connection.commit();
        console.log('\n✅ Successfully fixed contractor assignment!');
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error fixing contractor assignment:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

// Run the script
fixContractorAssignment().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});











