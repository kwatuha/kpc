const XLSX = require('xlsx');
const path = require('path');

// Copy the header mapping logic from projectRoutes.js
const normalizeHeader = (h) => {
    if (!h || typeof h !== 'string') return '';
    return String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const projectHeaderMap = {
    projectName: ['projectname', 'name', 'title', 'project', 'project_name', 'project name'],
    ProjectDescription: ['projectdescription', 'description', 'details', 'projectdesc'],
    ProjectRefNum: ['projectrefnum', 'projectrefnumber', 'ref', 'refnum', 'refnumber', 'reference', 'projectreference', 'projectref', 'project ref num', 'project ref number'],
    Status: ['status', 'projectstatus', 'currentstatus'],
    budget: ['budget', 'estimatedcost', 'budgetkes', 'projectcost', 'costofproject'],
    amountPaid: ['amountpaid', 'disbursed', 'expenditure', 'paidout', 'amount paid'],
    financialYear: ['financialyear', 'financial-year', 'financial year', 'fy', 'adp', 'year'],
    department: ['department', 'implementingdepartment'],
    directorate: ['directorate'],
    'sub-county': ['subcounty', 'subcountyname', 'subcountyid', 'sub-county', 'subcounty_', 'sub county'],
    ward: ['ward', 'wardname', 'wardid'],
    Contracted: ['contracted', 'contractamount', 'contractedamount', 'contractsum', 'contract value', 'contract value (kes)'],
    StartDate: ['startdate', 'projectstartdate', 'commencementdate', 'start', 'start date'],
    EndDate: ['enddate', 'projectenddate', 'completiondate', 'end', 'end date']
};

// Reverse lookup: normalized variant -> canonical
const variantToCanonical = (() => {
    const map = {};
    Object.entries(projectHeaderMap).forEach(([canonical, variants]) => {
        variants.forEach(v => { map[normalizeHeader(v)] = canonical; });
        // Also add canonical itself
        map[normalizeHeader(canonical)] = canonical;
    });
    return map;
})();

const filePath = '/home/dev/dev/imes_working/v5/projects_import_template_v4_alpha.xlsx';

console.log('Testing header mapping for:', filePath);
console.log('');

const workbook = XLSX.readFile(filePath, { cellDates: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

if (rawData.length < 2) {
    console.log('❌ File has no data rows');
    process.exit(1);
}

const headers = rawData[0];
console.log('📋 Headers from file:');
headers.forEach((h, idx) => {
    const normalized = normalizeHeader(h);
    const mapped = variantToCanonical[normalized];
    const isKnown = !!mapped || Object.prototype.hasOwnProperty.call(projectHeaderMap, h);
    
    console.log(`  ${idx + 1}. "${h}"`);
    console.log(`     Normalized: "${normalized}"`);
    console.log(`     Mapped to: ${mapped || '(no mapping found)'}`);
    console.log(`     Known: ${isKnown ? '✓' : '✗'}`);
    console.log('');
});

// Test mapping first row
console.log('\n📊 Testing first data row mapping:');
const firstRow = rawData[1];
const mappedRow = {};

for (let i = 0; i < headers.length; i++) {
    const rawHeader = headers[i];
    const normalized = normalizeHeader(rawHeader);
    const canonical = variantToCanonical[normalized] || rawHeader;
    let value = firstRow[i];
    
    mappedRow[canonical] = value === '' ? null : value;
}

console.log('\nMapped row data:');
Object.entries(mappedRow).forEach(([key, value]) => {
    console.log(`  ${key}: ${value !== null && value !== undefined ? value : '(empty)'}`);
});

// Check required fields
console.log('\n🔍 Required field check:');
const projectName = mappedRow.projectName || mappedRow.ProjectName;
const projectRef = mappedRow.ProjectRefNum || mappedRow.projectRefNum;
console.log(`  projectName: ${projectName || '❌ MISSING'}`);
console.log(`  ProjectRefNum: ${projectRef || '❌ MISSING'}`);

if (!projectName && !projectRef) {
    console.log('\n❌ ERROR: Missing both projectName and ProjectRefNum - import will fail!');
}

// Check for potential issues
console.log('\n⚠️  Potential Issues:');
if (rawData.length > 1000) {
    console.log(`  - File has ${rawData.length} rows - many might be empty. Excel files can have max rows.`);
}

// Count empty rows
const dataRows = rawData.slice(1);
const emptyRows = dataRows.filter(row => {
    return !row || row.every(cell => cell === undefined || cell === null || cell === '');
}).length;

const validRows = dataRows.length - emptyRows;
console.log(`  - Valid data rows: ${validRows} out of ${dataRows.length}`);
console.log(`  - Empty rows: ${emptyRows}`);













