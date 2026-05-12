/**
 * Script to fix department assignments for projects imported with budgetId 7
 * Reads the original Excel file and matches projects to correct departments
 * 
 * Usage: node api/scripts/fixBudgetProjectsDepartments.js
 */

require('dotenv').config();
const xlsx = require('xlsx');
const pool = require('../config/db');
const fs = require('fs');

async function fixBudgetProjectsDepartments() {
    const budgetId = 7;
    const excelFilePath = '/home/dev/DELL/DELL/hillary/2025_2026_budget_import_file.xlsx';
    
    try {
        console.log('\n=== Fixing Department Assignments for Budget Projects ===\n');
        
        // Step 1: Load departments from database
        console.log('Loading departments from database...');
        const [departmentsRows] = await pool.query(
            'SELECT departmentId, name, alias FROM departments WHERE voided = 0'
        );
        
        const departments = new Map();
        const departmentAliases = new Map();
        
        departmentsRows.forEach(dept => {
            if (dept.name) {
                departments.set(dept.departmentId, { id: dept.departmentId, name: dept.name, alias: dept.alias });
                departmentAliases.set(dept.name.trim().toLowerCase(), dept.departmentId);
                if (dept.alias) {
                    departmentAliases.set(dept.alias.trim().toLowerCase(), dept.departmentId);
                    // Also add individual aliases if comma-separated
                    dept.alias.split(',').forEach(alias => {
                        const normAlias = alias.trim().toLowerCase();
                        if (normAlias) {
                            departmentAliases.set(normAlias, dept.departmentId);
                        }
                    });
                }
            }
        });
        
        console.log(`✓ Loaded ${departments.size} departments\n`);
        
        // Helper function to find department ID
        const getDepartmentId = (deptName) => {
            if (!deptName) return null;
            const normalized = deptName.trim().toLowerCase();
            return departmentAliases.get(normalized) || null;
        };
        
        // Step 2: Read Excel file
        console.log(`Reading Excel file: ${excelFilePath}`);
        if (!require('fs').existsSync(excelFilePath)) {
            console.error(`❌ Error: File not found: ${excelFilePath}`);
            return;
        }
        
        const workbook = xlsx.readFile(excelFilePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawData.length < 2) {
            console.error('❌ Error: Excel file is empty or has no data rows');
            return;
        }
        
        const headers = rawData[0];
        console.log(`✓ Found ${rawData.length - 1} data rows\n`);
        
        // Step 3: Extract project-department mappings from Excel
        console.log('Extracting project-department mappings from Excel...');
        const projectDepartmentMap = new Map();
        let currentDepartment = null;
        
        const headerMap = {
            'budgetname': 'budgetName',
            'budget name': 'budgetName',
            'department': 'department',
            'db_department': 'dbDepartment',
            'project name': 'projectName',
            'projectname': 'projectName',
            'ward': 'ward',
            'amount': 'amount',
            'db_subcounty': 'dbSubcounty',
            'db_ward': 'dbWard'
        };
        
        const normalizeHeader = (header) => {
            if (!header || typeof header !== 'string') return '';
            return header.trim().toLowerCase();
        };
        
        const mapRow = (headers, row) => {
            const obj = {};
            for (let i = 0; i < headers.length; i++) {
                const rawHeader = headers[i];
                if (rawHeader === undefined || rawHeader === null) continue;
                const normalizedHeader = normalizeHeader(rawHeader);
                const canonical = headerMap[normalizedHeader] || normalizedHeader;
                let value = row[i];
                if (value === undefined || value === null) value = '';
                obj[canonical] = value;
                obj[rawHeader] = value;
            }
            return obj;
        };
        
        // Process each row
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || !Array.isArray(row)) continue;
            
            const mappedRow = mapRow(headers, row);
            
            // Extract department (check multiple possible fields)
            const department = mappedRow.department || mappedRow.dbDepartment || 
                              mappedRow.Department || mappedRow.db_department || '';
            
            // Extract project name
            const projectName = mappedRow.projectName || mappedRow['Project Name'] || 
                               mappedRow['project name'] || '';
            
            // Update current department if found
            if (department && department.trim()) {
                currentDepartment = department.trim();
            }
            
            // If we have a project name and department, store the mapping
            if (projectName && projectName.trim() && currentDepartment) {
                // Normalize project name: remove extra spaces, trim
                const normalizedProjectName = projectName.trim().replace(/\s+/g, ' ').toLowerCase();
                const normalizedDept = currentDepartment.trim();
                
                // Store mapping (normalized project name -> department)
                // Also store original for reference
                if (!projectDepartmentMap.has(normalizedProjectName)) {
                    projectDepartmentMap.set(normalizedProjectName, normalizedDept);
                }
            }
        }
        
        console.log(`✓ Extracted ${projectDepartmentMap.size} project-department mappings\n`);
        
        // Step 4: Get projects from database with budgetId 7
        console.log('Fetching projects from database...');
        const [projects] = await pool.query(
            `SELECT id, projectName, departmentId, status 
             FROM projects 
             WHERE budgetId = ? AND voided = 0 
             AND (LOWER(status) LIKE '%procurement%' OR LOWER(status) LIKE '%under procurement%')
             ORDER BY id`,
            [budgetId]
        );
        
        console.log(`✓ Found ${projects.length} projects with budgetId ${budgetId} and procurement status\n`);
        
        // Step 5: Match and update departments
        console.log('Matching projects and updating departments...\n');
        const updates = [];
        const notFound = [];
        const alreadyCorrect = [];
        
        for (const project of projects) {
            const projectName = project.projectName ? project.projectName.trim() : '';
            
            if (!projectName) {
                notFound.push({ id: project.id, reason: 'No project name' });
                continue;
            }
            
            // Normalize project name for matching (remove extra spaces, lowercase)
            const normalizedProjectName = projectName.replace(/\s+/g, ' ').toLowerCase();
            
            // Try to find matching department in Excel data
            let matchedDepartment = projectDepartmentMap.get(normalizedProjectName);
            
            // If exact match not found, try fuzzy matching
            if (!matchedDepartment) {
                // Try substring matching (at least 10 characters overlap)
                for (const [excelProjectName, excelDept] of projectDepartmentMap.entries()) {
                    const dbName = normalizedProjectName;
                    const excelName = excelProjectName;
                    
                    // Exact match (already checked above)
                    if (dbName === excelName) {
                        matchedDepartment = excelDept;
                        break;
                    }
                    
                    // One contains the other (if significant length)
                    if (dbName.length >= 10 && excelName.length >= 10) {
                        if (dbName.includes(excelName) || excelName.includes(dbName)) {
                            matchedDepartment = excelDept;
                            break;
                        }
                    }
                    
                    // Check if they share significant words (at least 3 words match)
                    const dbWords = dbName.split(/\s+/).filter(w => w.length > 3);
                    const excelWords = excelName.split(/\s+/).filter(w => w.length > 3);
                    const commonWords = dbWords.filter(w => excelWords.includes(w));
                    if (commonWords.length >= 3) {
                        matchedDepartment = excelDept;
                        break;
                    }
                }
            }
            
            if (!matchedDepartment) {
                notFound.push({ id: project.id, projectName: projectName });
                continue;
            }
            
            // Find department ID
            const departmentId = getDepartmentId(matchedDepartment);
            
            if (!departmentId) {
                notFound.push({ 
                    id: project.id, 
                    projectName: projectName, 
                    reason: `Department "${matchedDepartment}" not found in database` 
                });
                continue;
            }
            
            // Check if department is already correct
            if (project.departmentId === departmentId) {
                alreadyCorrect.push({ 
                    id: project.id, 
                    projectName: projectName, 
                    department: matchedDepartment 
                });
                continue;
            }
            
            // Add to updates list
            updates.push({
                id: project.id,
                projectName: projectName,
                oldDepartmentId: project.departmentId,
                newDepartmentId: departmentId,
                departmentName: matchedDepartment
            });
        }
        
        console.log(`Projects to update: ${updates.length}`);
        console.log(`Projects already correct: ${alreadyCorrect.length}`);
        console.log(`Projects not found in Excel: ${notFound.length}\n`);
        
        // Step 6: Show preview
        if (updates.length > 0) {
            console.log('Preview of updates (first 10):');
            updates.slice(0, 10).forEach(update => {
                console.log(`  ID ${update.id}: "${update.projectName}" -> Department: ${update.departmentName} (ID: ${update.newDepartmentId})`);
            });
            if (updates.length > 10) {
                console.log(`  ... and ${updates.length - 10} more\n`);
            }
        }
        
        if (notFound.length > 0) {
            console.log('\nProjects not found in Excel (first 10):');
            notFound.slice(0, 10).forEach(item => {
                console.log(`  ID ${item.id}: "${item.projectName}" - ${item.reason || 'Not in Excel file'}`);
            });
            if (notFound.length > 10) {
                console.log(`  ... and ${notFound.length - 10} more\n`);
            }
        }
        
        // Step 7: Confirm and apply updates
        if (updates.length > 0) {
            console.log(`\n⚠️  Ready to update ${updates.length} projects.`);
            console.log('Applying updates...\n');
            
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();
                
                for (const update of updates) {
                    await connection.query(
                        'UPDATE projects SET departmentId = ? WHERE id = ?',
                        [update.newDepartmentId, update.id]
                    );
                }
                
                await connection.commit();
                console.log(`✅ Successfully updated ${updates.length} projects!\n`);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } else {
            console.log('\n✅ No updates needed - all departments are already correct!\n');
        }
        
        // Step 8: Verification
        console.log('Verifying updates...');
        const [verification] = await pool.query(
            `SELECT d.name as departmentName, COUNT(*) as count
             FROM projects p
             LEFT JOIN departments d ON p.departmentId = d.departmentId
             WHERE p.budgetId = ? AND p.voided = 0
             AND (LOWER(p.status) LIKE '%procurement%' OR LOWER(p.status) LIKE '%under procurement%')
             GROUP BY d.name
             ORDER BY count DESC`,
            [budgetId]
        );
        
        console.log('\nDepartment distribution after update:');
        verification.forEach(row => {
            console.log(`  ${row.departmentName || '(NULL)'}: ${row.count} projects`);
        });
        
        console.log('\n✅ Department fix complete!\n');
        
    } catch (error) {
        console.error('❌ Error fixing departments:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the script
fixBudgetProjectsDepartments()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
