const XLSX = require('xlsx');
const path = require('path');

const inputFile = '/home/dev/dev/imes_working/v5/NIMES_20_PROJECT_DATA.xlsx';
const outputFile = '/home/dev/dev/imes_working/v5/NIMES_20_PROJECT_DATA.xlsx';

// Helper function to convert Excel date serial to YYYY-MM-DD
const excelSerialToDate = (serial) => {
    if (!serial || serial === '') return '';
    if (typeof serial === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(serial)) return serial; // Already formatted
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch
    const date = new Date(excelEpoch.getTime() + (serial - 1) * 86400000);
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Read the existing file
const workbook = XLSX.readFile(inputFile);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Get headers
const headers = data[0];

// Check if Contractor column exists, add it if not
if (!headers.includes('Contractor')) {
    headers.push('Contractor');
}

// Add monitoring columns if they don't exist
const monitoringColumns = [
    'MonitoringObservationDate',
    'MonitoringComment',
    'MonitoringRecommendations',
    'MonitoringChallenges',
    'MonitoringWarningLevel',
    'IsRoutineObservation'
];

monitoringColumns.forEach(col => {
    if (!headers.includes(col)) {
        headers.push(col);
    }
});

// Add contractor detail columns if they don't exist
const contractorDetailColumns = [
    'ContractorContactPerson',
    'ContractorEmail',
    'ContractorPhone'
];

contractorDetailColumns.forEach(col => {
    if (!headers.includes(col)) {
        headers.push(col);
    }
});

// Clean data rows - remove empty rows
const dataRows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

// Find the "Road Construction - Main Street" row(s) and enhance them
const enhancedRows = dataRows.map((row, index) => {
    // Ensure row has same length as headers
    while (row.length < headers.length) {
        row.push('');
    }
    
    // If this is the Road Construction project, fill in missing data
    const projectName = row[headers.indexOf('Project Name')] || row[headers.indexOf('ProjectName')] || '';
    
    if (projectName && projectName.toString().includes('Road Construction')) {
        // Fill in missing fields with realistic data
        const headerIndex = (colName) => {
            const idx = headers.indexOf(colName);
            return idx !== -1 ? idx : null;
        };
        
        const setValue = (colName, value, force = false) => {
            const idx = headerIndex(colName);
            if (idx !== null) {
                if (force || !row[idx] || row[idx] === '') {
                    row[idx] = value;
                }
            }
        };
        
        // Ensure all fields are populated - force update for key fields
        setValue('Project Ref Num', row[headerIndex('Project Ref Num')] || 'PRJ-2024-001', true);
        setValue('Project Name', 'Road Construction - Main Street', true);
        setValue('Project Description', 'Construction of 5km tarmac road in Main Street area to improve connectivity and reduce travel time. This project will enhance transportation infrastructure, reduce travel time by 40%, and boost economic activity in the region.', true);
        setValue('ProjectType', 'Infrastructure');
        setValue('Project Category', 'Road Construction');
        setValue('Status', 'In Progress');
        setValue('Strategic Plan', 'CIDP 2023-2027');
        setValue('Strategic Plan Code', 'CIDP-2023');
        setValue('Program', 'Transport and Infrastructure');
        setValue('Sub Program', 'Road Development');
        setValue('SubProgram_Key Outcome', 'Improved road network connectivity');
        setValue('SubProgram_KPI', 'Km of roads constructed');
        setValue('SubProgram_Baseline', '0');
        setValue('SubProgram_Yr1Targets', '10');
        setValue('SubProgram_Yr2Targets', '15');
        setValue('SubProgram_Yr3Targets', '20');
        setValue('SubProgram_Yr4Targets', '25');
        setValue('SubProgram_Yr5Targets', '30');
        setValue('SubProgram_Yr1Budget', '5000000');
        setValue('SubProgram_Yr2Budget', '7500000');
        setValue('SubProgram_Yr3Budget', '10000000');
        setValue('SubProgram_Yr4Budget', '12500000');
        setValue('SubProgram_Yr5Budget', '15000000');
        setValue('SubProgram_TotalBudget', '50000000');
        setValue('SubProgram_Remarks', 'Focus on primary and secondary roads');
        setValue('Workplan', 'Annual Workplan FY2024/2025');
        setValue('WorkplanFinancialYear', 'FY2024/2025');
        setValue('Activity', row[headerIndex('Activity')] || 'Site Preparation');
        setValue('Budget', '50000000');
        setValue('AmountPaid', '15000000');
        setValue('Contracted', '50000000');
        setValue('ActivityBudget', row[headerIndex('ActivityBudget')] || '10000000');
        setValue('ActivityActualCost', row[headerIndex('ActivityActualCost')] || '5000000');
        // Convert dates if they're Excel serial numbers - force update
        const startDateVal = row[headerIndex('StartDate')];
        setValue('StartDate', typeof startDateVal === 'number' ? excelSerialToDate(startDateVal) : (startDateVal || '2024-01-01'), true);
        const endDateVal = row[headerIndex('End Date')];
        setValue('End Date', typeof endDateVal === 'number' ? excelSerialToDate(endDateVal) : (endDateVal || '2024-12-31'), true);
        const actStartDateVal = row[headerIndex('Activity Start Date')];
        setValue('Activity Start Date', typeof actStartDateVal === 'number' ? excelSerialToDate(actStartDateVal) : (actStartDateVal || '2024-01-01'), true);
        const actEndDateVal = row[headerIndex('Activity End Date')];
        setValue('Activity End Date', typeof actEndDateVal === 'number' ? excelSerialToDate(actEndDateVal) : (actEndDateVal || '2024-03-31'), true);
        setValue('Milestone Name', row[headerIndex('Milestone Name')] || 'Site Survey Completed');
        setValue('Milestone Description', row[headerIndex('Milestone Description')] || 'Complete site survey and mapping');
        const milestoneDateVal = row[headerIndex('Milestone Due Date')];
        setValue('Milestone Due Date', typeof milestoneDateVal === 'number' ? excelSerialToDate(milestoneDateVal) : (milestoneDateVal || '2024-02-28'), true);
        setValue('Milestone Status', row[headerIndex('Milestone Status')] || 'completed');
        setValue('Milestone progress percentage (0-100)', row[headerIndex('Milestone progress percentage (0-100)')] || '100');
        setValue('Milestone Weight', row[headerIndex('Milestone Weight')] || '10');
        setValue('Milestone Sequence Order', row[headerIndex('Milestone Sequence Order')] || '1');
        setValue('County', 'Kisumu');
        setValue('Sub County', 'Kisumu Central');
        setValue('Ward', 'Market Ward');
        setValue('Department', 'Department of Public Works');
        setValue('Directorate', 'Infrastructure Directorate');
        setValue('Financial Year', 'FY2024/2025');
        setValue('Objective', 'Improve road infrastructure and connectivity in Main Street area to enhance transportation efficiency and support economic development', true);
        setValue('Expected Output', '5km tarmac road completed and operational with proper drainage, road markings, and safety features', true);
        setValue('Expected Outcome', 'Improved connectivity, reduced travel time by 40%, increased economic activity, enhanced access to markets and services for local communities', true);
        setValue('Project Manager', 'John Doe');
        setValue('Project Manager ID', 'STF001');
        setValue('Contractor', 'ABC Construction Ltd');
        setValue('ContractorContactPerson', 'James Mwangi');
        setValue('ContractorEmail', 'info@abcconstruction.co.ke');
        setValue('ContractorPhone', '+254 712 345 678');
        setValue('Activity Description', row[headerIndex('Activity Description')] || 'Prepare construction site and conduct surveys');
        setValue('Activity Status', row[headerIndex('Activity Status')] || 'in_progress');
        setValue('Activity Percentage Complete', row[headerIndex('Activity Percentage Complete')] || '50');
        setValue('Activity Responsible Officer', row[headerIndex('Activity Responsible Officer')] || 'Eng. Jane Smith');
        setValue('Activity Remarks', row[headerIndex('Activity Remarks')] || 'Site preparation in progress');
        setValue('Overall Progress', '30');
        setValue('Status Reason', 'Awaiting materials delivery');
        
        // Monitoring & Observations
        const monitorDate1 = typeof row[headerIndex('MonitoringObservationDate')] === 'number' 
            ? excelSerialToDate(row[headerIndex('MonitoringObservationDate')]) 
            : (row[headerIndex('MonitoringObservationDate')] || '2024-02-15');
        setValue('MonitoringObservationDate', monitorDate1, true);
        setValue('MonitoringComment', 'Site preparation is progressing well. Equipment and materials have been delivered. Minor delays due to weather conditions but overall timeline remains on track.', true);
        setValue('MonitoringRecommendations', '1. Ensure proper storage of materials to prevent weather damage\n2. Accelerate procurement of remaining materials\n3. Conduct weekly progress reviews', true);
        setValue('MonitoringChallenges', '1. Inconsistent weather affecting earthworks\n2. Delay in material deliveries\n3. Limited storage space at site', true);
        setValue('MonitoringWarningLevel', 'Low', true);
        setValue('IsRoutineObservation', '1', true);
    }
    
    return row;
});

// Helper to pad array to match headers length and add monitoring data
const createRowWithMonitoring = (baseRow, monitoringData = null) => {
    while (baseRow.length < headers.length) {
        baseRow.push('');
    }
    
    // Add monitoring data if provided
    if (monitoringData) {
        const monDateIdx = headers.indexOf('MonitoringObservationDate');
        const monCommentIdx = headers.indexOf('MonitoringComment');
        const monRecIdx = headers.indexOf('MonitoringRecommendations');
        const monChalIdx = headers.indexOf('MonitoringChallenges');
        const monWarnIdx = headers.indexOf('MonitoringWarningLevel');
        const monRoutineIdx = headers.indexOf('IsRoutineObservation');
        
        if (monDateIdx >= 0) baseRow[monDateIdx] = monitoringData.date || '';
        if (monCommentIdx >= 0) baseRow[monCommentIdx] = monitoringData.comment || '';
        if (monRecIdx >= 0) baseRow[monRecIdx] = monitoringData.recommendations || '';
        if (monChalIdx >= 0) baseRow[monChalIdx] = monitoringData.challenges || '';
        if (monWarnIdx >= 0) baseRow[monWarnIdx] = monitoringData.warningLevel || 'None';
        if (monRoutineIdx >= 0) baseRow[monRoutineIdx] = monitoringData.isRoutine !== undefined ? monitoringData.isRoutine : '1';
    }
    
    return baseRow;
};

// Create additional sample rows for different activities/milestones
const additionalRows = [
    // Row 2: Earthworks activity with monitoring
    createRowWithMonitoring([
        'PRJ-2024-001', 'Road Construction - Main Street', 'Construction of 5km tarmac road in Main Street area to improve connectivity and reduce travel time',
        'Infrastructure', 'Road Construction', 'In Progress',
        'CIDP 2023-2027', 'CIDP-2023', 'Transport and Infrastructure', 'Road Development',
        'Improved road network connectivity', 'Km of roads constructed', '0',
        '10', '15', '20', '25', '30',
        '5000000', '7500000', '10000000', '12500000', '15000000', '50000000',
        'Focus on primary and secondary roads',
        'Annual Workplan FY2024/2025', 'FY2024/2025',
        'Earthworks and Excavation',
        '50000000', '15000000', '50000000', '15000000', '10000000',
        '2024-01-01', '2024-12-31', '2024-04-01', '2024-06-30',
        'Earthworks Completed', 'Complete earthworks and excavation works', '2024-05-31', 'in_progress', '75', '15', '2',
        'Kisumu', 'Kisumu Central', 'Market Ward',
        'Department of Public Works', 'Infrastructure Directorate', 'FY2024/2025',
        'Improve road infrastructure and connectivity in Main Street area',
        '5km tarmac road completed and operational',
        'Improved connectivity, reduced travel time by 40%, increased economic activity',
        'John Doe', 'STF001', 'ABC Construction Ltd', 'James Mwangi', 'info@abcconstruction.co.ke', '+254 712 345 678',
        'Perform earthworks, excavation, and leveling', 'in_progress', '60', 'Eng. Peter Kamau', 'Earthworks progressing well',
        '30', 'Awaiting materials delivery'
    ], {
        date: '2024-05-20',
        comment: 'Earthworks phase is 60% complete. Excavation depth and width measurements are within specifications. Some areas require additional compaction work.',
        recommendations: '1. Increase compaction efforts in sections with loose soil\n2. Schedule additional quality tests for subgrade\n3. Ensure proper drainage channels are maintained during excavation',
        challenges: '1. Heavy rainfall slowing down excavation work\n2. Encountered rocky terrain requiring additional equipment\n3. Need to coordinate with utility companies for buried cables',
        warningLevel: 'Medium',
        isRoutine: '1'
    }),
    // Row 3: Road Surfacing activity with monitoring
    createRowWithMonitoring([
        'PRJ-2024-001', 'Road Construction - Main Street', 'Construction of 5km tarmac road in Main Street area to improve connectivity and reduce travel time',
        'Infrastructure', 'Road Construction', 'In Progress',
        'CIDP 2023-2027', 'CIDP-2023', 'Transport and Infrastructure', 'Road Development',
        'Improved road network connectivity', 'Km of roads constructed', '0',
        '10', '15', '20', '25', '30',
        '5000000', '7500000', '10000000', '12500000', '15000000', '50000000',
        'Focus on primary and secondary roads',
        'Annual Workplan FY2024/2025', 'FY2024/2025',
        'Road Surfacing',
        '50000000', '15000000', '50000000', '20000000', '8000000',
        '2024-01-01', '2024-12-31', '2024-07-01', '2024-10-31',
        'Road Surfacing Completed', 'Complete road surfacing with tarmac', '2024-09-30', 'not_started', '0', '20', '3',
        'Kisumu', 'Kisumu Central', 'Market Ward',
        'Department of Public Works', 'Infrastructure Directorate', 'FY2024/2025',
        'Improve road infrastructure and connectivity in Main Street area',
        '5km tarmac road completed and operational',
        'Improved connectivity, reduced travel time by 40%, increased economic activity',
        'John Doe', 'STF001', 'ABC Construction Ltd', 'James Mwangi', 'info@abcconstruction.co.ke', '+254 712 345 678',
        'Apply tarmac surface and complete road markings', 'not_started', '0', 'Eng. Mary Wanjiku', 'Pending completion of earthworks',
        '30', 'Awaiting materials delivery'
    ], {
        date: '2024-08-10',
        comment: 'Pre-surfacing inspection completed. Base course quality verified. Ready for tarmac application once earthworks phase is complete. All necessary approvals obtained.',
        recommendations: '1. Procure tarmac materials well in advance\n2. Coordinate with weather forecast to ensure optimal conditions\n3. Prepare detailed surfacing schedule',
        challenges: '1. Dependent on completion of earthworks phase\n2. Need to coordinate road closure with local authorities\n3. Material pricing fluctuations in market',
        warningLevel: 'Low',
        isRoutine: '1'
    })
];

// Combine all rows
const allRows = [headers, ...enhancedRows, ...additionalRows];

// Create new worksheet with date format handling
const newWorksheet = XLSX.utils.aoa_to_sheet(allRows, { cellDates: false, raw: false });

// Format date columns as text to preserve YYYY-MM-DD format
const dateColumns = [];
headers.forEach((h, i) => {
    if (h && (h.toLowerCase().includes('date') || h.toLowerCase().includes('due'))) {
        dateColumns.push(i);
    }
});

// Set date columns to text format
dateColumns.forEach(colIdx => {
    for (let rowIdx = 1; rowIdx < allRows.length; rowIdx++) {
        const cellAddress = XLSX.utils.encode_cell({ c: colIdx, r: rowIdx });
        if (newWorksheet[cellAddress]) {
            // Keep as string, don't convert to date
            newWorksheet[cellAddress].t = 's'; // type: string
        }
    }
});

// Set column widths
const colWidths = headers.map(() => ({ wch: 25 }));
newWorksheet['!cols'] = colWidths;

// Freeze header row
newWorksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

// Replace the worksheet
workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;

// Write the file
XLSX.writeFile(workbook, outputFile);

console.log('✅ NIMES file cleaned and enhanced successfully!');
console.log(`📁 File saved to: ${outputFile}`);
console.log(`📊 Total rows: ${allRows.length - 1} data rows + 1 header row`);
console.log(`📝 Added Contractor field and complete sample data for Road Construction project`);

