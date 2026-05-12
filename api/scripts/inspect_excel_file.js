const XLSX = require('xlsx');
const path = require('path');

const filePath = process.argv[2] || '/home/dev/dev/imes_working/v5/projects_import_template_v4_alpha.xlsx';

try {
    console.log('Reading file:', filePath);
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    
    console.log('\n📊 Workbook Sheets:');
    workbook.SheetNames.forEach((name, idx) => {
        console.log(`  ${idx + 1}. ${name}`);
    });
    
    // Read first sheet
    const sheetName = workbook.SheetNames[0];
    console.log(`\n📄 Reading sheet: "${sheetName}"`);
    
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\n📏 Total rows: ${rawData.length}`);
    
    if (rawData.length === 0) {
        console.log('❌ File is empty!');
        process.exit(1);
    }
    
    // Show headers
    const headers = rawData[0];
    console.log(`\n📋 Headers (${headers.length} columns):`);
    headers.forEach((header, idx) => {
        console.log(`  ${idx + 1}. "${header}"`);
    });
    
    // Show first few data rows
    console.log(`\n📝 First ${Math.min(3, rawData.length - 1)} data rows:`);
    for (let i = 1; i < Math.min(4, rawData.length); i++) {
        console.log(`\n  Row ${i}:`);
        rawData[i].forEach((cell, idx) => {
            if (cell !== undefined && cell !== null && cell !== '') {
                console.log(`    ${headers[idx]}: ${cell}`);
            }
        });
    }
    
    // Check for common issues
    console.log(`\n🔍 Validation:`);
    console.log(`  ✓ Has headers: ${headers && headers.length > 0 ? 'Yes' : 'No'}`);
    console.log(`  ✓ Has data rows: ${rawData.length > 1 ? 'Yes' : 'No'}`);
    console.log(`  ✓ Empty headers: ${headers.filter(h => !h || h.trim() === '').length}`);
    
    // Check against expected project headers
    const expectedHeaders = [
        'projectName', 'ProjectRefNum', 'ProjectDescription', 'Status',
        'budget', 'amountPaid', 'financialYear', 'department', 'sub-county',
        'ward', 'Contracted', 'StartDate', 'EndDate', 'directorate'
    ];
    
    console.log(`\n📊 Expected vs Actual Headers:`);
    console.log(`  Expected headers (${expectedHeaders.length}): ${expectedHeaders.join(', ')}`);
    
    // Normalize headers for comparison
    const normalizeHeader = (h) => {
        if (!h || typeof h !== 'string') return '';
        return h.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    };
    
    const normalizedHeaders = headers.map(h => normalizeHeader(h));
    const normalizedExpected = expectedHeaders.map(h => normalizeHeader(h));
    
    const missingExpected = expectedHeaders.filter((exp, idx) => {
        const normalized = normalizeHeader(exp);
        return !normalizedHeaders.some(h => h === normalized || h.includes(normalized) || normalized.includes(h));
    });
    
    if (missingExpected.length > 0) {
        console.log(`\n⚠️  Missing expected headers: ${missingExpected.join(', ')}`);
    } else {
        console.log(`\n✓ All expected headers found`);
    }
    
    // Show unrecognized headers
    const recognizedHeaders = [
        ...expectedHeaders,
        'ProjectName', 'Project_Name', 'Project Name',
        'ProjectRefNum', 'Project_Ref_Num', 'Project Ref Num',
        'budget', 'Budget', 'estimatedCost', 'costOfProject',
        'financialYear', 'FinancialYear', 'Financial Year', 'FY', 'Year',
        'department', 'Department',
        'sub-county', 'SubCounty', 'Sub-County', 'Sub County',
        'ward', 'Ward', 'Ward Name',
        'directorate', 'Directorate',
        'StartDate', 'Start Date', 'projectStartDate',
        'EndDate', 'End Date', 'projectEndDate',
        'Status', 'status', 'projectStatus'
    ];
    
    const normalizedRecognized = recognizedHeaders.map(h => normalizeHeader(h));
    const unrecognized = headers.filter(h => {
        const normalized = normalizeHeader(h);
        return !normalizedRecognized.some(r => normalized === r || normalized.includes(r) || r.includes(normalized));
    });
    
    if (unrecognized.length > 0) {
        console.log(`\n❓ Unrecognized headers: ${unrecognized.join(', ')}`);
    }
    
} catch (error) {
    console.error('❌ Error reading file:', error.message);
    console.error(error.stack);
    process.exit(1);
}













