const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Comprehensive project template headers with all fields
const headers = [
    // Project Basic Information
    'ProjectRefNum',
    'ProjectName',
    'ProjectDescription',
    'ProjectType',
    'ProjectCategory',
    'Status',
    
    // Strategic Planning Hierarchy
    'StrategicPlan',
    'StrategicPlanCode',
    'Program',
    'SubProgram',
    'SubProgram_KeyOutcome',
    'SubProgram_KPI',
    'SubProgram_Baseline',
    'SubProgram_Yr1Targets',
    'SubProgram_Yr2Targets',
    'SubProgram_Yr3Targets',
    'SubProgram_Yr4Targets',
    'SubProgram_Yr5Targets',
    'SubProgram_Yr1Budget',
    'SubProgram_Yr2Budget',
    'SubProgram_Yr3Budget',
    'SubProgram_Yr4Budget',
    'SubProgram_Yr5Budget',
    'SubProgram_TotalBudget',
    'SubProgram_Remarks',
    'Workplan',
    'WorkplanFinancialYear',
    'Activity',
    
    // Budget Information
    'Budget',
    'AmountPaid',
    'Contracted',
    'ActivityBudget',
    'ActivityActualCost',
    
    // Timeline Information
    'StartDate',
    'EndDate',
    'ActivityStartDate',
    'ActivityEndDate',
    
    // Milestones
    'MilestoneName',
    'MilestoneDescription',
    'MilestoneDueDate',
    'MilestoneStatus',
    'MilestoneProgress',
    'MilestoneWeight',
    'MilestoneSequenceOrder',
    
    // Location Information
    'County',
    'SubCounty',
    'Ward',
    
    // Department/Organizational Information
    'Department',
    'Directorate',
    'FinancialYear',
    
    // Project Details
    'Objective',
    'ExpectedOutput',
    'ExpectedOutcome',
    'ProjectManager',
    'ProjectManagerID',
    
    // Contractor
    'Contractor',
    'ContractorContactPerson',
    'ContractorEmail',
    'ContractorPhone',
    
    // Activity Details
    'ActivityDescription',
    'ActivityStatus',
    'ActivityPercentageComplete',
    'ActivityResponsibleOfficer',
    'ActivityRemarks',
    
    // Additional Fields
    'OverallProgress',
    'StatusReason',
    
    // Monitoring & Observations
    'MonitoringObservationDate',
    'MonitoringComment',
    'MonitoringRecommendations',
    'MonitoringChallenges',
    'MonitoringWarningLevel',
    'IsRoutineObservation'
];

// Create instructions/guide row
const instructionRow = headers.map(header => {
    const instructions = {
        'ProjectRefNum': 'Unique project reference number (e.g., PRJ-2024-001)',
        'ProjectName': 'Full name of the project (Required)',
        'ProjectDescription': 'Detailed description of the project',
        'ProjectType': 'Type of project (e.g., Infrastructure, Capacity Building)',
        'ProjectCategory': 'Project category name from system',
        'Status': 'Project status (e.g., Initiated, In Progress, Completed, Stalled, Delayed, Cancelled)',
        'StrategicPlan': 'Name of the strategic plan (CIDP)',
        'StrategicPlanCode': 'Strategic plan code/ID',
        'Program': 'Program name',
        'SubProgram': 'Sub-program name (Required if importing strategic plan data)',
        'SubProgram_KeyOutcome': 'Key outcome expected from subprogram',
        'SubProgram_KPI': 'Key Performance Indicator for the subprogram',
        'SubProgram_Baseline': 'Baseline value/measurement for the subprogram',
        'SubProgram_Yr1Targets': 'Year 1 target value',
        'SubProgram_Yr2Targets': 'Year 2 target value',
        'SubProgram_Yr3Targets': 'Year 3 target value',
        'SubProgram_Yr4Targets': 'Year 4 target value',
        'SubProgram_Yr5Targets': 'Year 5 target value',
        'SubProgram_Yr1Budget': 'Year 1 budget allocation in KES',
        'SubProgram_Yr2Budget': 'Year 2 budget allocation in KES',
        'SubProgram_Yr3Budget': 'Year 3 budget allocation in KES',
        'SubProgram_Yr4Budget': 'Year 4 budget allocation in KES',
        'SubProgram_Yr5Budget': 'Year 5 budget allocation in KES',
        'SubProgram_TotalBudget': 'Total budget across all 5 years (calculated automatically if yearly budgets provided)',
        'SubProgram_Remarks': 'Additional remarks/notes for the subprogram',
        'Workplan': 'Annual workplan name',
        'WorkplanFinancialYear': 'Financial year for the workplan (e.g., FY2024/2025)',
        'Activity': 'Activity name',
        'Budget': 'Total project budget in KES',
        'AmountPaid': 'Amount already paid/disbursed in KES',
        'Contracted': 'Contracted amount in KES',
        'ActivityBudget': 'Budget allocated to activity in KES',
        'ActivityActualCost': 'Actual cost incurred for activity in KES',
        'StartDate': 'Project start date (YYYY-MM-DD)',
        'EndDate': 'Project end date (YYYY-MM-DD)',
        'ActivityStartDate': 'Activity start date (YYYY-MM-DD)',
        'ActivityEndDate': 'Activity end date (YYYY-MM-DD)',
        'MilestoneName': 'Name of the milestone',
        'MilestoneDescription': 'Description of the milestone',
        'MilestoneDueDate': 'Milestone due date (YYYY-MM-DD)',
        'MilestoneStatus': 'Milestone status (not_started, in_progress, completed)',
        'MilestoneProgress': 'Milestone progress percentage (0-100)',
        'MilestoneWeight': 'Weight of milestone (for progress calculation)',
        'MilestoneSequenceOrder': 'Order/sequence of milestone',
        'County': 'County name',
        'SubCounty': 'Sub-county name (Required if project has location)',
        'Ward': 'Ward name (Required if project has location)',
        'Department': 'Implementing department name (Required)',
        'Directorate': 'Directorate/section name',
        'FinancialYear': 'Financial year (e.g., FY2024/2025)',
        'Objective': 'Project objective',
        'ExpectedOutput': 'Expected output/outcome',
        'ExpectedOutcome': 'Expected outcome',
        'ProjectManager': 'Name of principal investigator (Project Manager)',
        'ProjectManagerID': 'Staff ID or email of principal investigator',
        'Contractor': 'Contractor company name (will be created if doesn\'t exist)',
        'ActivityDescription': 'Detailed activity description',
        'ActivityStatus': 'Activity status (not_started, in_progress, completed, stalled, delayed)',
        'ActivityPercentageComplete': 'Activity completion percentage (0-100)',
        'ActivityResponsibleOfficer': 'Name or ID of responsible officer',
        'ActivityRemarks': 'Additional remarks/notes for activity',
        'OverallProgress': 'Overall project progress percentage (0-100)',
        'StatusReason': 'Reason for current status',
        'MonitoringObservationDate': 'Date of monitoring observation (YYYY-MM-DD)',
        'MonitoringComment': 'Monitoring observation comment/notes',
        'MonitoringRecommendations': 'Recommendations from monitoring (can be multi-line)',
        'MonitoringChallenges': 'Challenges identified during monitoring (can be multi-line)',
        'MonitoringWarningLevel': 'Warning level (None, Low, Medium, High, Critical)',
        'IsRoutineObservation': 'Is this a routine observation? (1 for yes, 0 for no)'
    };
    return instructions[header] || '';
});

// Create sample data rows
const sampleRow1 = [
    'PRJ-2024-001',
    'Road Construction - Main Street',
    'Construction of 5km tarmac road in Main Street',
    'Infrastructure',
    'Road Construction',
    'In Progress',
    'CIDP 2023-2027',
    'CIDP-2023',
    'Transport and Infrastructure',
    'Road Development',
    'Improved road network connectivity', // SubProgram_KeyOutcome
    'Km of roads constructed', // SubProgram_KPI
    '0', // SubProgram_Baseline
    '10', // SubProgram_Yr1Targets
    '15', // SubProgram_Yr2Targets
    '20', // SubProgram_Yr3Targets
    '25', // SubProgram_Yr4Targets
    '30', // SubProgram_Yr5Targets
    '5000000', // SubProgram_Yr1Budget
    '7500000', // SubProgram_Yr2Budget
    '10000000', // SubProgram_Yr3Budget
    '12500000', // SubProgram_Yr4Budget
    '15000000', // SubProgram_Yr5Budget
    '50000000', // SubProgram_TotalBudget
    'Focus on primary and secondary roads', // SubProgram_Remarks
    'Annual Workplan FY2024/2025',
    'FY2024/2025',
    'Site Preparation',
    '50000000',
    '15000000',
    '50000000',
    '10000000',
    '5000000',
    '2024-01-01',
    '2024-12-31',
    '2024-01-01',
    '2024-03-31',
    'Site Survey Completed',
    'Complete site survey and mapping',
    '2024-02-28',
    'completed',
    '100',
    '10',
    '1',
    'Kisumu',
    'Kisumu Central',
    'Market Ward',
    'Department of Public Works',
    'Infrastructure Directorate',
    'FY2024/2025',
    'Improve road infrastructure and connectivity in Main Street area',
    '5km tarmac road completed and operational',
    'Improved connectivity, reduced travel time by 40%, increased economic activity',
    'John Doe',
    'STF001',
    'ABC Construction Ltd',
    'James Mwangi',
    'info@abcconstruction.co.ke',
    '+254 712 345 678',
    'Prepare construction site and conduct surveys',
    'in_progress',
    '50',
    'Eng. Jane Smith',
    'Site preparation in progress',
    '30',
    'Awaiting materials delivery',
    '2024-02-15',
    'Site preparation is progressing well. Equipment and materials have been delivered. Minor delays due to weather conditions but overall timeline remains on track.',
    '1. Ensure proper storage of materials to prevent weather damage\n2. Accelerate procurement of remaining materials\n3. Conduct weekly progress reviews',
    '1. Inconsistent weather affecting earthworks\n2. Delay in material deliveries\n3. Limited storage space at site',
    'Low',
    '1'
];

// Additional sample rows for the same project with different milestones/activities
const sampleRow2 = [
    'PRJ-2024-001', // Same project reference
    'Road Construction - Main Street',
    'Construction of 5km tarmac road in Main Street',
    'Infrastructure',
    'Road Construction',
    'In Progress',
    'CIDP 2023-2027',
    'CIDP-2023',
    'Transport and Infrastructure',
    'Road Development',
    'Improved road network connectivity',
    'Km of roads constructed',
    '0',
    '10', '15', '20', '25', '30',
    '5000000', '7500000', '10000000', '12500000', '15000000',
    '50000000',
    'Focus on primary and secondary roads',
    'Annual Workplan FY2024/2025',
    'FY2024/2025',
    'Earthworks and Excavation',
    '50000000',
    '15000000',
    '50000000',
    '15000000',
    '10000000',
    '2024-01-01',
    '2024-12-31',
    '2024-04-01',
    '2024-06-30',
    'Earthworks Completed',
    'Complete earthworks and excavation works',
    '2024-05-31',
    'in_progress',
    '75',
    '15',
    '2',
    'Kisumu',
    'Kisumu Central',
    'Market Ward',
    'Department of Public Works',
    'Infrastructure Directorate',
    'FY2024/2025',
    'Improve road infrastructure and connectivity in Main Street area',
    '5km tarmac road completed and operational',
    'Improved connectivity, reduced travel time by 40%, increased economic activity',
    'John Doe',
    'STF001',
    'ABC Construction Ltd',
    'James Mwangi',
    'info@abcconstruction.co.ke',
    '+254 712 345 678',
    'Perform earthworks, excavation, and leveling',
    'in_progress',
    '60',
    'Eng. Peter Kamau',
    'Earthworks progressing well',
    '30',
    'Awaiting materials delivery',
    '2024-05-20',
    'Earthworks phase is 60% complete. Excavation depth and width measurements are within specifications. Some areas require additional compaction work.',
    '1. Increase compaction efforts in sections with loose soil\n2. Schedule additional quality tests for subgrade\n3. Ensure proper drainage channels are maintained during excavation',
    '1. Heavy rainfall slowing down excavation work\n2. Encountered rocky terrain requiring additional equipment\n3. Need to coordinate with utility companies for buried cables',
    'Medium',
    '1'
];

const sampleRow3 = [
    'PRJ-2024-001',
    'Road Construction - Main Street',
    'Construction of 5km tarmac road in Main Street',
    'Infrastructure',
    'Road Construction',
    'In Progress',
    'CIDP 2023-2027',
    'CIDP-2023',
    'Transport and Infrastructure',
    'Road Development',
    'Improved road network connectivity',
    'Km of roads constructed',
    '0',
    '10', '15', '20', '25', '30',
    '5000000', '7500000', '10000000', '12500000', '15000000',
    '50000000',
    'Focus on primary and secondary roads',
    'Annual Workplan FY2024/2025',
    'FY2024/2025',
    'Road Surfacing',
    '50000000',
    '15000000',
    '50000000',
    '20000000',
    '8000000',
    '2024-01-01',
    '2024-12-31',
    '2024-07-01',
    '2024-10-31',
    'Road Surfacing Completed',
    'Complete road surfacing with tarmac',
    '2024-09-30',
    'not_started',
    '0',
    '20',
    '3',
    'Kisumu',
    'Kisumu Central',
    'Market Ward',
    'Department of Public Works',
    'Infrastructure Directorate',
    'FY2024/2025',
    'Improve road infrastructure and connectivity in Main Street area',
    '5km tarmac road completed and operational',
    'Improved connectivity, reduced travel time by 40%, increased economic activity',
    'John Doe',
    'STF001',
    'ABC Construction Ltd',
    'James Mwangi',
    'info@abcconstruction.co.ke',
    '+254 712 345 678',
    'Apply tarmac surface and complete road markings',
    'not_started',
    '0',
    'Eng. Mary Wanjiku',
    'Pending completion of earthworks',
    '30',
    'Awaiting materials delivery',
    '2024-08-10',
    'Pre-surfacing inspection completed. Base course quality verified. Ready for tarmac application once earthworks phase is complete. All necessary approvals obtained.',
    '1. Procure tarmac materials well in advance\n2. Coordinate with weather forecast to ensure optimal conditions\n3. Prepare detailed surfacing schedule',
    '1. Dependent on completion of earthworks phase\n2. Need to coordinate road closure with local authorities\n3. Material pricing fluctuations in market',
    'Low',
    '1'
];

// Create workbook
const workbook = XLSX.utils.book_new();

// Create main data sheet
const worksheetData = [
    headers,
    instructionRow,
    sampleRow1,
    sampleRow2,
    sampleRow3
];

const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

// Set column widths for better readability
const colWidths = headers.map(() => ({ wch: 25 }));
worksheet['!cols'] = colWidths;

// Freeze header rows
worksheet['!freeze'] = { xSplit: 0, ySplit: 2 };

// Add the worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects Import');

// Create a guide/info sheet
const guideData = [
    ['COMPREHENSIVE PROJECT IMPORT TEMPLATE - USER GUIDE'],
    [],
    ['IMPORTANT NOTES:'],
    ['1. Each row represents one project with associated data (milestones, activities, etc.)'],
    ['2. You can have multiple rows for the same project with different milestones/activities'],
    ['3. Required fields are marked with (Required) in the instruction row'],
    ['4. Date format: YYYY-MM-DD (e.g., 2024-01-15)'],
    ['5. Budget amounts should be in KES without currency symbols or commas'],
    ['6. Percentage fields should be numbers between 0-100'],
    [],
    ['FIELD GROUPS:'],
    [],
    ['PROJECT BASIC INFORMATION:'],
    ['- ProjectRefNum: Unique reference number for the project'],
    ['- ProjectName: Full name (Required)'],
    ['- ProjectDescription: Detailed description'],
    ['- ProjectType: Type of project'],
    ['- ProjectCategory: Category from system'],
    ['- Status: Current status of project'],
    [],
    ['STRATEGIC PLANNING HIERARCHY:'],
    ['- StrategicPlan: Name of CIDP or strategic plan'],
    ['- StrategicPlanCode: Code/ID of strategic plan'],
    ['- Program: Program name'],
    ['- SubProgram: Sub-program name (Required if importing strategic plan data)'],
    ['- SubProgram_KeyOutcome: Key outcome expected from subprogram'],
    ['- SubProgram_KPI: Key Performance Indicator'],
    ['- SubProgram_Baseline: Baseline value/measurement'],
    ['- SubProgram_Yr1Targets through SubProgram_Yr5Targets: Five-year targets'],
    ['- SubProgram_Yr1Budget through SubProgram_Yr5Budget: Five-year budgets (in KES)'],
    ['- SubProgram_TotalBudget: Total budget (can be calculated from yearly budgets)'],
    ['- SubProgram_Remarks: Additional notes for subprogram'],
    ['- Workplan: Annual workplan name'],
    ['- WorkplanFinancialYear: Financial year for workplan'],
    ['- Activity: Activity name'],
    [],
    ['BUDGET INFORMATION:'],
    ['- Budget: Total project budget'],
    ['- AmountPaid: Amount already disbursed'],
    ['- Contracted: Contracted amount'],
    ['- ActivityBudget: Budget for specific activity'],
    ['- ActivityActualCost: Actual cost for activity'],
    [],
    ['TIMELINE INFORMATION:'],
    ['- StartDate: Project start date'],
    ['- EndDate: Project end date'],
    ['- ActivityStartDate: Activity start date'],
    ['- ActivityEndDate: Activity end date'],
    [],
    ['MILESTONES:'],
    ['- MilestoneName: Name of milestone'],
    ['- MilestoneDescription: Description'],
    ['- MilestoneDueDate: Due date'],
    ['- MilestoneStatus: Status (not_started, in_progress, completed)'],
    ['- MilestoneProgress: Progress percentage'],
    ['- MilestoneWeight: Weight for progress calculation'],
    ['- MilestoneSequenceOrder: Order/sequence'],
    [],
    ['LOCATION:'],
    ['- County: County name'],
    ['- SubCounty: Sub-county name (Required if location specified)'],
    ['- Ward: Ward name (Required if location specified)'],
    [],
    ['DEPARTMENT/ORGANIZATIONAL:'],
    ['- Department: Implementing department (Required)'],
    ['- Directorate: Directorate/section'],
    ['- FinancialYear: Financial year'],
    [],
    ['PROJECT DETAILS:'],
    ['- Objective: Project objective'],
    ['- ExpectedOutput: Expected output/outcome'],
    ['- ExpectedOutcome: Expected outcome'],
    ['- PrincipalInvestigator: Name of principal investigator (Project Manager)'],
    ['- PrincipalInvestigatorStaffId: Staff ID or email of principal investigator'],
    ['- Contractor: Contractor company name (will be created if doesn\'t exist)'],
    [],
    ['ACTIVITY DETAILS:'],
    ['- ActivityDescription: Detailed description'],
    ['- ActivityStatus: Status'],
    ['- ActivityPercentageComplete: Completion percentage'],
    ['- ActivityResponsibleOfficer: Responsible person'],
    ['- ActivityRemarks: Additional notes'],
    [],
    ['IMPORT TIPS:'],
    ['- Metadata (departments, subcounties, wards, etc.) must exist in the system'],
    ['- The system will check metadata mapping before import'],
    ['- Projects can be linked to strategic plans, programs, and subprograms'],
    ['- Multiple activities and milestones can be added per project'],
    ['- Leave fields blank if not applicable'],
];

const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
const guideColWidths = [{ wch: 100 }];
guideSheet['!cols'] = guideColWidths;
XLSX.utils.book_append_sheet(workbook, guideSheet, 'User Guide');

// Ensure templates directory exists
const templatesDir = path.join(__dirname, '..', 'templates');
if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
}

// Write the file
const outputPath = path.join(templatesDir, 'comprehensive_project_details_template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ Comprehensive project import template generated successfully!');
console.log(`📁 File saved to: ${outputPath}`);
console.log(`\n📊 Template includes ${headers.length} fields covering:`);
console.log('   - Project basic information');
console.log('   - Strategic planning hierarchy (Plan, Program, Sub-program, Workplan, Activity)');
console.log('   - Budget information (Project and Activity budgets)');
console.log('   - Timeline information (Project and Activity dates)');
console.log('   - Milestones with progress tracking');
console.log('   - Location information (County, Sub-county, Ward)');
console.log('   - Department and organizational information');
console.log('   - Activity details and status');
console.log('\n📝 A sample row and user guide sheet are included in the template.');

