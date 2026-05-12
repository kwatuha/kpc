/**
 * Script to add monitoring data to all projects in NIMES file
 * This ensures all projects have monitoring observations for testing
 */

const XLSX = require('xlsx');
const path = require('path');

const inputFile = '/home/dev/dev/imes_working/v5/NIMES_20_PROJECT_DATA.xlsx';
const outputFile = '/home/dev/dev/imes_working/v5/NIMES_20_PROJECT_DATA.xlsx';

// Read the existing file
const workbook = XLSX.readFile(inputFile);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const headers = data[0];

// Find monitoring column indices
const getColIdx = (colName) => headers.indexOf(colName);

// Generate contractor details based on category
const generateContractorDetails = (category) => {
    const contractors = {
        'Road Construction': {
            company: 'ABC Construction Ltd',
            contactPerson: 'James Mwangi',
            email: 'info@abcconstruction.co.ke',
            phone: '+254 712 345 678'
        },
        'Building Construction': {
            company: 'Kenya Builders Ltd',
            contactPerson: 'Sarah Kamau',
            email: 'contact@kenyabuilders.co.ke',
            phone: '+254 723 456 789'
        },
        'Water Supply': {
            company: 'Aqua Systems Kenya',
            contactPerson: 'Peter Ochieng',
            email: 'info@aquasystems.co.ke',
            phone: '+254 734 567 890'
        },
        'default': {
            company: 'General Contractors Ltd',
            contactPerson: 'Mary Wanjiru',
            email: 'info@generalcontractors.co.ke',
            phone: '+254 745 678 901'
        }
    };
    
    return contractors[category] || contractors['default'];
};

// Generate monitoring data based on project type/status
const generateMonitoringData = (projectName, category, status, rowIndex) => {
    const monitoringTemplates = {
        'Road Construction': [
            {
                comment: 'Site survey completed successfully. All measurements within specifications. Environmental impact assessment approved.',
                recommendations: '1. Proceed with earthworks phase\n2. Ensure proper environmental compliance\n3. Maintain safety protocols',
                challenges: '1. Weather dependency for earthworks\n2. Traffic management during construction',
                warningLevel: 'Low',
                date: '2024-02-15'
            },
            {
                comment: 'Progress is on track. Equipment mobilization completed. Contractor has adequate resources on site.',
                recommendations: '1. Accelerate material procurement\n2. Conduct weekly progress reviews\n3. Maintain quality standards',
                challenges: '1. Material price fluctuations\n2. Coordination with utility companies',
                warningLevel: 'Medium',
                date: '2024-03-20'
            }
        ],
        'default': [
            {
                comment: `Project ${status.toLowerCase()}. Initial assessment completed. Project team mobilized and ready to commence work.`,
                recommendations: '1. Ensure all approvals are in place\n2. Establish communication protocols\n3. Set up monitoring mechanisms',
                challenges: '1. Resource allocation\n2. Stakeholder coordination\n3. Budget management',
                warningLevel: 'Low',
                date: '2024-02-01'
            }
        ]
    };
    
    const templates = monitoringTemplates[category] || monitoringTemplates['default'];
    const selected = templates[rowIndex % templates.length];
    
    return {
        date: selected.date,
        comment: selected.comment,
        recommendations: selected.recommendations,
        challenges: selected.challenges,
        warningLevel: selected.warningLevel,
        isRoutine: '1'
    };
};

// Process all data rows (skip header)
const enhancedRows = data.slice(1).map((row, index) => {
    // Ensure row has same length as headers
    while (row.length < headers.length) {
        row.push('');
    }
    
    // Get project info
    const projectName = row[getColIdx('Project Name')] || '';
    const category = row[getColIdx('Project Category')] || '';
    const status = row[getColIdx('Status')] || 'In Progress';
    
    // Add contractor details if not present
    const existingContractor = row[getColIdx('Contractor')];
    if (!existingContractor || existingContractor.trim() === '') {
        const contractorDetails = generateContractorDetails(category);
        row[getColIdx('Contractor')] = contractorDetails.company;
        row[getColIdx('ContractorContactPerson')] = contractorDetails.contactPerson;
        row[getColIdx('ContractorEmail')] = contractorDetails.email;
        row[getColIdx('ContractorPhone')] = contractorDetails.phone;
    } else {
        // If contractor exists but details are missing, add them
        if (!row[getColIdx('ContractorContactPerson')]) {
            const contractorDetails = generateContractorDetails(category);
            row[getColIdx('ContractorContactPerson')] = contractorDetails.contactPerson;
            row[getColIdx('ContractorEmail')] = contractorDetails.email;
            row[getColIdx('ContractorPhone')] = contractorDetails.phone;
        }
    }
    
    // Only add monitoring if not already present
    const existingComment = row[getColIdx('MonitoringComment')];
    if (!existingComment || existingComment.trim() === '') {
        const monitoring = generateMonitoringData(projectName, category, status, index);
        
        row[getColIdx('MonitoringObservationDate')] = monitoring.date;
        row[getColIdx('MonitoringComment')] = monitoring.comment;
        row[getColIdx('MonitoringRecommendations')] = monitoring.recommendations;
        row[getColIdx('MonitoringChallenges')] = monitoring.challenges;
        row[getColIdx('MonitoringWarningLevel')] = monitoring.warningLevel;
        row[getColIdx('IsRoutineObservation')] = monitoring.isRoutine;
    }
    
    return row;
});

// Recreate worksheet
const allRows = [headers, ...enhancedRows];
const newWorksheet = XLSX.utils.aoa_to_sheet(allRows, { cellDates: false, raw: false });

// Format date columns
const dateColumns = [];
headers.forEach((h, i) => {
    if (h && (h.toLowerCase().includes('date') || h.toLowerCase().includes('due') || h.toLowerCase().includes('observation'))) {
        dateColumns.push(i);
    }
});

dateColumns.forEach(colIdx => {
    for (let rowIdx = 1; rowIdx < allRows.length; rowIdx++) {
        const cellAddress = XLSX.utils.encode_cell({ c: colIdx, r: rowIdx });
        if (newWorksheet[cellAddress]) {
            newWorksheet[cellAddress].t = 's'; // type: string
        }
    }
});

// Set column widths and freeze header
const colWidths = headers.map(() => ({ wch: 25 }));
newWorksheet['!cols'] = colWidths;
newWorksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

// Save
workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
XLSX.writeFile(workbook, outputFile);

console.log('✅ Added monitoring data to all projects in NIMES file!');
console.log(`📁 File saved to: ${outputFile}`);
console.log(`📊 Total rows: ${allRows.length - 1} data rows + 1 header row`);
console.log(`📝 Monitoring observations added to projects`);

