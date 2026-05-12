#!/usr/bin/env python3
import re

file_path = 'api/routes/budgetContainerRoutes.js'

with open(file_path, 'r') as f:
    content = f.read()

# Find the section to replace
pattern = r"(router\.post\('/check-metadata-mapping', upload\.single\('file'\), async \(req, res\) => \{[^}]*const \{ dataToImport \} = req\.body \|\| \{\};[^}]*console\.log\('Data to import length:', dataToImport\?\.length \|\| 0\);)"
replacement = r"""router.post('/check-metadata-mapping', upload.single('file'), async (req, res) => {
    const overallStart = Date.now();
    console.log('=== POST /api/budgets/check-metadata-mapping called ===');
    let dataToImport = req.body?.dataToImport;
    const filePath = req.file?.path;
    
    // If no data provided but file uploaded, parse the file
    if ((!dataToImport || !Array.isArray(dataToImport) || dataToImport.length === 0) && filePath) {
        try {
            console.log('No dataToImport provided, parsing uploaded file for metadata check');
            const workbook = xlsx.readFile(filePath, { 
                cellDates: true,
                cellNF: false,
                cellStyles: false
            });
            const sheetName = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[sheetName];
            
            // Check and limit large column ranges
            const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1');
            const columnCount = range.e.c + 1;
            if (columnCount > 100) {
                console.log(`Large column range detected (${columnCount} columns), limiting to first 200 columns`);
                const limitedRange = {
                    s: { c: 0, r: 0 },
                    e: { c: Math.min(199, columnCount - 1), r: range.e.r }
                };
                const limitedRef = xlsx.utils.encode_range(limitedRange);
                const limitedWorksheet = {};
                Object.keys(worksheet).forEach(key => {
                    if (key.startsWith('!')) {
                        limitedWorksheet[key] = worksheet[key];
                    } else {
                        const cellAddress = xlsx.utils.decode_cell(key);
                        if (cellAddress.c <= limitedRange.e.c) {
                            limitedWorksheet[key] = worksheet[key];
                        }
                    }
                });
                limitedWorksheet['!ref'] = limitedRef;
                worksheet = limitedWorksheet;
            }
            
            const rawData = xlsx.utils.sheet_to_json(worksheet, { 
                header: 1,
                defval: null,
                raw: false
            });
            
            if (rawData.length < 2) {
                fs.unlink(filePath, () => {});
                return res.status(400).json({ success: false, message: 'Uploaded Excel file is empty or has no data rows.' });
            }
            
            const headers = rawData[0];
            const dataRows = rawData.slice(1).filter(row => {
                if (!row || !Array.isArray(row)) return false;
                return row.some(cell => cell !== undefined && cell !== null && cell !== '');
            });
            
            // Use same mapping logic as preview
            const headerMap = {
                'BudgetName': 'budgetName', 'Budget Name': 'budgetName', 'Budget': 'budgetName', 'budget': 'budgetName',
                'Department': 'department', 'db_department': 'dbDepartment',
                'Project Name': 'projectName', 'projectName': 'projectName',
                'ward': 'ward', 'Ward': 'ward', 'db_ward': 'dbWard',
                'Amount': 'amount', 'amount': 'amount',
                'db_subcounty': 'dbSubcounty', 'sub-county': 'subcounty', 'Sub County': 'subcounty',
                'SubCounty': 'subcounty', 'Subcounty': 'subcounty', 'subcounty': 'subcounty',
                'fin_year': 'finYear', 'finYear': 'finYear', 'Financial Year': 'finYear', 'financialYear': 'finYear'
            };
            
            const mapRow = (headers, row) => {
                const obj = {};
                for (let i = 0; i < headers.length; i++) {
                    const rawHeader = headers[i];
                    if (rawHeader === undefined || rawHeader === null) continue;
                    const canonical = headerMap[rawHeader] || rawHeader;
                    let value = row[i];
                    obj[canonical] = (value === undefined || value === null || value === '') ? null : value;
                }
                return obj;
            };
            
            dataToImport = dataRows.map(r => mapRow(headers, r)).filter(row => {
                if (!row) return false;
                const projectName = (row.projectName || row['Project Name'] || '').toString().trim();
                const budgetNameRaw = row.budgetName || row['BudgetName'] || row['Budget Name'] || row['Budget'] || row.budget || '';
                const budgetName = typeof budgetNameRaw === 'string' ? budgetNameRaw.trim() : (budgetNameRaw ? String(budgetNameRaw).trim() : '');
                return (projectName && projectName.length >= 3) || (budgetName && budgetName.length > 0);
            });
            
            // Clean up file after parsing
            fs.unlink(filePath, () => {});
            console.log(`Parsed ${dataToImport.length} rows from uploaded file`);
        } catch (parseErr) {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlink(filePath, () => {});
            }
            console.error('Error parsing file in check-metadata-mapping:', parseErr);
            return res.status(400).json({ success: false, message: `Failed to parse uploaded file: ${parseErr.message}` });
        }
    }
    
    console.log('Data to import length:', dataToImport?.length || 0);"""

# Simple string replacement approach
old_text = """    const overallStart = Date.now();
    console.log('=== POST /api/budgets/check-metadata-mapping called ===');
    const { dataToImport } = req.body || {};
    console.log('Data to import length:', dataToImport?.length || 0);
    console.log('First row sample:', dataToImport?.[0] || 'N/A');
    
    if (!dataToImport || !Array.isArray(dataToImport) || dataToImport.length === 0) {
        console.error('No data provided for metadata mapping check');
        return res.status(400).json({ success: false, message: 'No data provided for metadata mapping check.' });
    }"""

new_text = """    const overallStart = Date.now();
    console.log('=== POST /api/budgets/check-metadata-mapping called ===');
    let dataToImport = req.body?.dataToImport;
    const filePath = req.file?.path;
    
    // If no data provided but file uploaded, parse the file
    if ((!dataToImport || !Array.isArray(dataToImport) || dataToImport.length === 0) && filePath) {
        try {
            console.log('No dataToImport provided, parsing uploaded file for metadata check');
            const workbook = xlsx.readFile(filePath, { 
                cellDates: true,
                cellNF: false,
                cellStyles: false
            });
            const sheetName = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[sheetName];
            
            // Check and limit large column ranges
            const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1');
            const columnCount = range.e.c + 1;
            if (columnCount > 100) {
                console.log(`Large column range detected (${columnCount} columns), limiting to first 200 columns`);
                const limitedRange = {
                    s: { c: 0, r: 0 },
                    e: { c: Math.min(199, columnCount - 1), r: range.e.r }
                };
                const limitedRef = xlsx.utils.encode_range(limitedRange);
                const limitedWorksheet = {};
                Object.keys(worksheet).forEach(key => {
                    if (key.startsWith('!')) {
                        limitedWorksheet[key] = worksheet[key];
                    } else {
                        const cellAddress = xlsx.utils.decode_cell(key);
                        if (cellAddress.c <= limitedRange.e.c) {
                            limitedWorksheet[key] = worksheet[key];
                        }
                    }
                });
                limitedWorksheet['!ref'] = limitedRef;
                worksheet = limitedWorksheet;
            }
            
            const rawData = xlsx.utils.sheet_to_json(worksheet, { 
                header: 1,
                defval: null,
                raw: false
            });
            
            if (rawData.length < 2) {
                fs.unlink(filePath, () => {});
                return res.status(400).json({ success: false, message: 'Uploaded Excel file is empty or has no data rows.' });
            }
            
            const headers = rawData[0];
            const dataRows = rawData.slice(1).filter(row => {
                if (!row || !Array.isArray(row)) return false;
                return row.some(cell => cell !== undefined && cell !== null && cell !== '');
            });
            
            // Use same mapping logic as preview
            const headerMap = {
                'BudgetName': 'budgetName', 'Budget Name': 'budgetName', 'Budget': 'budgetName', 'budget': 'budgetName',
                'Department': 'department', 'db_department': 'dbDepartment',
                'Project Name': 'projectName', 'projectName': 'projectName',
                'ward': 'ward', 'Ward': 'ward', 'db_ward': 'dbWard',
                'Amount': 'amount', 'amount': 'amount',
                'db_subcounty': 'dbSubcounty', 'sub-county': 'subcounty', 'Sub County': 'subcounty',
                'SubCounty': 'subcounty', 'Subcounty': 'subcounty', 'subcounty': 'subcounty',
                'fin_year': 'finYear', 'finYear': 'finYear', 'Financial Year': 'finYear', 'financialYear': 'finYear'
            };
            
            const mapRow = (headers, row) => {
                const obj = {};
                for (let i = 0; i < headers.length; i++) {
                    const rawHeader = headers[i];
                    if (rawHeader === undefined || rawHeader === null) continue;
                    const canonical = headerMap[rawHeader] || rawHeader;
                    let value = row[i];
                    obj[canonical] = (value === undefined || value === null || value === '') ? null : value;
                }
                return obj;
            };
            
            dataToImport = dataRows.map(r => mapRow(headers, r)).filter(row => {
                if (!row) return false;
                const projectName = (row.projectName || row['Project Name'] || '').toString().trim();
                const budgetNameRaw = row.budgetName || row['BudgetName'] || row['Budget Name'] || row['Budget'] || row.budget || '';
                const budgetName = typeof budgetNameRaw === 'string' ? budgetNameRaw.trim() : (budgetNameRaw ? String(budgetNameRaw).trim() : '');
                return (projectName && projectName.length >= 3) || (budgetName && budgetName.length > 0);
            });
            
            // Clean up file after parsing
            fs.unlink(filePath, () => {});
            console.log(`Parsed ${dataToImport.length} rows from uploaded file`);
        } catch (parseErr) {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlink(filePath, () => {});
            }
            console.error('Error parsing file in check-metadata-mapping:', parseErr);
            return res.status(400).json({ success: false, message: `Failed to parse uploaded file: ${parseErr.message}` });
        }
    }
    
    console.log('Data to import length:', dataToImport?.length || 0);
    console.log('First row sample:', dataToImport?.[0] || 'N/A');
    
    if (!dataToImport || !Array.isArray(dataToImport) || dataToImport.length === 0) {
        console.error('No data provided for metadata mapping check');
        return res.status(400).json({ success: false, message: 'No data provided for metadata mapping check.' });
    }"""

if old_text in content:
    content = content.replace(old_text, new_text)
    with open(file_path, 'w') as f:
        f.write(content)
    print("File updated successfully!")
else:
    print("Pattern not found. File may have already been updated or structure is different.")
