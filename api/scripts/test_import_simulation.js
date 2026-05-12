const XLSX = require('xlsx');
const path = require('path');

// Simulate the import process to catch any issues
const filePath = '/home/dev/dev/imes_working/v5/projects_import_template_fixed_dates.xlsx';

console.log('🧪 Simulating import process for:', filePath);
console.log('');

try {
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`✓ Read ${rawData.length} rows`);
    
    if (rawData.length < 2) {
        console.error('❌ File has no data rows');
        process.exit(1);
    }
    
    const headers = rawData[0];
    
    // Filter out empty rows
    const dataRows = rawData.slice(1).filter(row => {
        if (!row || !Array.isArray(row)) return false;
        return row.some(cell => {
            return cell !== undefined && cell !== null && cell !== '' && String(cell).trim() !== '';
        });
    });
    
    console.log(`✓ Filtered to ${dataRows.length} data rows`);
    
    // Simulate date parsing
    const parseDateToYMD = (value) => {
        if (!value) return null;
        if (value instanceof Date && !isNaN(value.getTime())) {
            const yyyy = value.getFullYear();
            const mm = value.getMonth() + 1;
            const dd = value.getDate();
            
            // Validate date
            const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (mm === 2 && ((yyyy % 4 === 0 && yyyy % 100 !== 0) || (yyyy % 400 === 0))) {
                daysInMonth[1] = 29;
            }
            const maxDays = daysInMonth[mm - 1];
            const fixedDay = dd > maxDays ? maxDays : dd;
            
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(fixedDay).padStart(2, '0')}`;
        }
        return null;
    };
    
    // Map headers
    const normalizeHeader = (h) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
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
    
    const variantToCanonical = (() => {
        const map = {};
        Object.entries(projectHeaderMap).forEach(([canonical, variants]) => {
            variants.forEach(v => { map[normalizeHeader(v)] = canonical; });
            map[normalizeHeader(canonical)] = canonical;
        });
        return map;
    })();
    
    const mapRowUsingHeaderMap = (headers, row) => {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            const rawHeader = headers[i];
            const normalized = normalizeHeader(rawHeader);
            const canonical = variantToCanonical[normalized] || rawHeader;
            let value = row[i];
            
            // Normalize dates
            if (canonical === 'StartDate' || canonical === 'EndDate' || /date/i.test(String(canonical))) {
                value = parseDateToYMD(value);
            }
            obj[canonical] = value === '' ? null : value;
        }
        return obj;
    };
    
    console.log('\n📊 Processing rows...');
    const errors = [];
    const processedRows = [];
    
    for (let i = 0; i < dataRows.length; i++) {
        try {
            const row = dataRows[i];
            const mapped = mapRowUsingHeaderMap(headers, row);
            
            // Validate required fields
            const projectName = mapped.projectName || mapped.ProjectName;
            const projectRef = mapped.ProjectRefNum || mapped.projectRefNum;
            
            if (!projectName && !projectRef) {
                errors.push(`Row ${i + 2}: Missing both projectName and ProjectRefNum`);
                continue;
            }
            
            // Check dates
            if (mapped.StartDate && !/^\d{4}-\d{2}-\d{2}$/.test(mapped.StartDate)) {
                errors.push(`Row ${i + 2}: Invalid StartDate format: ${mapped.StartDate}`);
            }
            if (mapped.EndDate && !/^\d{4}-\d{2}-\d{2}$/.test(mapped.EndDate)) {
                errors.push(`Row ${i + 2}: Invalid EndDate format: ${mapped.EndDate}`);
            }
            
            processedRows.push(mapped);
            
        } catch (err) {
            errors.push(`Row ${i + 2}: ${err.message}`);
        }
    }
    
    console.log(`✓ Processed ${processedRows.length} rows`);
    
    if (errors.length > 0) {
        console.log(`\n❌ Found ${errors.length} errors:`);
        errors.forEach(err => console.log(`   ${err}`));
    } else {
        console.log(`\n✅ No errors found!`);
    }
    
    // Show sample of processed data
    if (processedRows.length > 0) {
        console.log('\n📋 Sample processed row:');
        const sample = processedRows[0];
        Object.entries(sample).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                console.log(`   ${key}: ${value}`);
            }
        });
    }
    
} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}












