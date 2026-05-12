const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const upload = multer({ dest: 'uploads/temp/' });

// Header mapping for comprehensive project import
const comprehensiveHeaderMap = {
    // Project fields
    'ProjectRefNum': 'ProjectRefNum',
    'Project Ref Num': 'ProjectRefNum',
    'projectRefNum': 'ProjectRefNum',
    'ProjectName': 'ProjectName',
    'Project Name': 'ProjectName',
    'projectName': 'ProjectName',
    'ProjectDescription': 'ProjectDescription',
    'Project Description': 'ProjectDescription',
    'projectDescription': 'ProjectDescription',
    'ProjectType': 'ProjectType',
    'Project Category': 'ProjectCategory',
    'ProjectCategory': 'ProjectCategory',
    'Status': 'Status',
    'status': 'Status',
    
    // Strategic Planning Hierarchy
    'Strategic Plan': 'StrategicPlan',
    'StrategicPlan': 'StrategicPlan',
    'Strategic Plan Code': 'StrategicPlanCode',
    'StrategicPlanCode': 'StrategicPlanCode',
    'Program': 'Program',
    'program': 'Program',
    'Sub Program': 'SubProgram',
    'SubProgram': 'SubProgram',
    'SubProgram_Key Outcome': 'SubProgram_KeyOutcome',
    'SubProgram_KPI': 'SubProgram_KPI',
    'SubProgram_Baseline': 'SubProgram_Baseline',
    'SubProgram_Yr1Targets': 'SubProgram_Yr1Targets',
    'SubProgram_Yr2Targets': 'SubProgram_Yr2Targets',
    'SubProgram_Yr3Targets': 'SubProgram_Yr3Targets',
    'SubProgram_Yr4Targets': 'SubProgram_Yr4Targets',
    'SubProgram_Yr5Targets': 'SubProgram_Yr5Targets',
    'SubProgram_Yr1Budget': 'SubProgram_Yr1Budget',
    'SubProgram_Yr2Budget': 'SubProgram_Yr2Budget',
    'SubProgram_Yr3Budget': 'SubProgram_Yr3Budget',
    'SubProgram_Yr4Budget': 'SubProgram_Yr4Budget',
    'SubProgram_Yr5Budget': 'SubProgram_Yr5Budget',
    'SubProgram_TotalBudget': 'SubProgram_TotalBudget',
    'SubProgram_Remarks': 'SubProgram_Remarks',
    'Workplan': 'Workplan',
    'WorkplanFinancialYear': 'WorkplanFinancialYear',
    'Activity': 'Activity',
    'activity': 'Activity',
    
    // Budget
    'Budget': 'Budget',
    'budget': 'Budget',
    'AmountPaid': 'AmountPaid',
    'Amount Paid': 'AmountPaid',
    'amountPaid': 'AmountPaid',
    'Contracted': 'Contracted',
    'contracted': 'Contracted',
    'ActivityBudget': 'ActivityBudget',
    'Activity Budget': 'ActivityBudget',
    'ActivityActualCost': 'ActivityActualCost',
    'Activity Actual Cost': 'ActivityActualCost',
    
    // Dates
    'StartDate': 'StartDate',
    'Start Date': 'StartDate',
    'startDate': 'StartDate',
    'End Date': 'EndDate',
    'EndDate': 'EndDate',
    'endDate': 'EndDate',
    'Activity Start Date': 'ActivityStartDate',
    'ActivityStartDate': 'ActivityStartDate',
    'Activity End Date': 'ActivityEndDate',
    'ActivityEndDate': 'ActivityEndDate',
    
    // Milestones
    'Milestone Name': 'MilestoneName',
    'MilestoneName': 'MilestoneName',
    'Milestone Description': 'MilestoneDescription',
    'MilestoneDescription': 'MilestoneDescription',
    'Milestone Due Date': 'MilestoneDueDate',
    'MilestoneDueDate': 'MilestoneDueDate',
    'Milestone Status': 'MilestoneStatus',
    'MilestoneStatus': 'MilestoneStatus',
    'Milestone progress percentage (0-100)': 'MilestoneProgress',
    'MilestoneProgress': 'MilestoneProgress',
    'Milestone Weight': 'MilestoneWeight',
    'MilestoneWeight': 'MilestoneWeight',
    'Milestone Sequence Order': 'MilestoneSequenceOrder',
    'MilestoneSequenceOrder': 'MilestoneSequenceOrder',
    
    // Location
    'County': 'County',
    'Sub County': 'SubCounty',
    'SubCounty': 'SubCounty',
    'Ward': 'Ward',
    'ward': 'Ward',
    
    // Organization
    'Department': 'Department',
    'department': 'Department',
    'Directorate': 'Directorate',
    'directorate': 'Directorate',
    'Financial Year': 'FinancialYear',
    'FinancialYear': 'FinancialYear',
    
    // Project Details
    'Objective': 'Objective',
    'objective': 'Objective',
    'Expected Output': 'ExpectedOutput',
    'ExpectedOutput': 'ExpectedOutput',
    'Expected Outcome': 'ExpectedOutcome',
    'ExpectedOutcome': 'ExpectedOutcome',
    'Project Manager': 'ProjectManager',
    'ProjectManager': 'ProjectManager',
    'PrincipalInvestigator': 'ProjectManager',
    'Principal Investigator': 'ProjectManager',
    'Project Manager ID': 'ProjectManagerID',
    'ProjectManagerID': 'ProjectManagerID',
    'PrincipalInvestigatorStaffId': 'ProjectManagerID',
    'Principal Investigator Staff ID': 'ProjectManagerID',
    
    // Activity Details
    'Activity Description': 'ActivityDescription',
    'ActivityDescription': 'ActivityDescription',
    'Activity Status': 'ActivityStatus',
    'ActivityStatus': 'ActivityStatus',
    'Activity Percentage Complete': 'ActivityPercentageComplete',
    'ActivityPercentageComplete': 'ActivityPercentageComplete',
    'Activity Responsible Officer': 'ActivityResponsibleOfficer',
    'ActivityResponsibleOfficer': 'ActivityResponsibleOfficer',
    'Activity Remarks': 'ActivityRemarks',
    'ActivityRemarks': 'ActivityRemarks',
    
    // Additional
    'Overall Progress': 'OverallProgress',
    'OverallProgress': 'OverallProgress',
    'Status Reason': 'StatusReason',
    'StatusReason': 'StatusReason',
    
    // Contractor
    'Contractor': 'Contractor',
    'contractor': 'Contractor',
    'Contractor Name': 'Contractor',
    'ContractorCompany': 'Contractor',
    'ContractorCompanyName': 'Contractor',
    'ContractorContactPerson': 'ContractorContactPerson',
    'Contractor Contact Person': 'ContractorContactPerson',
    'ContractorEmail': 'ContractorEmail',
    'Contractor Email': 'ContractorEmail',
    'ContractorPhone': 'ContractorPhone',
    'Contractor Phone': 'ContractorPhone',
    
    // Monitoring & Observations
    'MonitoringObservationDate': 'MonitoringObservationDate',
    'Monitoring Observation Date': 'MonitoringObservationDate',
    'MonitoringComment': 'MonitoringComment',
    'Monitoring Comment': 'MonitoringComment',
    'MonitoringRecommendations': 'MonitoringRecommendations',
    'Monitoring Recommendations': 'MonitoringRecommendations',
    'MonitoringChallenges': 'MonitoringChallenges',
    'Monitoring Challenges': 'MonitoringChallenges',
    'MonitoringWarningLevel': 'MonitoringWarningLevel',
    'Monitoring Warning Level': 'MonitoringWarningLevel',
    'Warning Level': 'MonitoringWarningLevel',
    'IsRoutineObservation': 'IsRoutineObservation',
    'Is Routine Observation': 'IsRoutineObservation',
    'Routine Observation': 'IsRoutineObservation'
};

// Date parsing function (reuse from projectRoutes)
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
    if (typeof value === 'string') {
        // Try to parse string dates
        const s = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        // Try other formats if needed
    }
    return null;
};

// Normalize string helper
const normalizeStr = (v) => {
    if (typeof v !== 'string') return v;
    return v.trim().replace(/[''"]/g, '');
};

// Parse boolean helper
const parseBool = (v) => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        return ['1', 'true', 'yes', 'y'].includes(s);
    }
    return false;
};

// Map row using header map
const mapRowUsingHeaderMap = (headers, row) => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
        const rawHeader = headers[i];
        const canonical = comprehensiveHeaderMap[rawHeader] || rawHeader;
        let value = row[i];
        
        // Normalize dates
        if (canonical.includes('Date') || canonical.includes('date')) {
            value = parseDateToYMD(value);
        }
        
        obj[canonical] = value === '' || value === undefined ? null : value;
    }
    return obj;
};

/**
 * @route POST /api/comprehensive-projects/preview
 * @description Preview comprehensive project data from uploaded file
 */
router.post('/preview', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    
    const filePath = req.file.path;
    
    try {
        const workbook = xlsx.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawData.length < 2) {
            fs.unlink(filePath, () => {});
            return res.status(400).json({ success: false, message: 'Uploaded Excel file is empty or has no data rows.' });
        }
        
        const headers = rawData[0];
        
        // Filter out empty rows
        const dataRows = rawData.slice(1).filter(row => {
            if (!row || !Array.isArray(row)) return false;
            return row.some(cell => {
                return cell !== undefined && cell !== null && cell !== '' && String(cell).trim() !== '';
            });
        });
        
        const fullData = dataRows.map(r => mapRowUsingHeaderMap(headers, r));
        const previewLimit = 10;
        const previewData = fullData.slice(0, previewLimit);
        
        fs.unlink(filePath, () => {});
        
        return res.status(200).json({
            success: true,
            message: `File parsed successfully. Review ${previewData.length} of ${fullData.length} rows.`,
            previewData,
            headers: Object.keys(previewData[0] || {}),
            fullData,
            totalRows: fullData.length
        });
    } catch (err) {
        fs.unlink(filePath, () => {});
        console.error('Comprehensive project import preview error:', err);
        return res.status(500).json({ success: false, message: `File parsing failed: ${err.message}` });
    }
});

/**
 * @route POST /api/comprehensive-projects/confirm-import
 * @description Import comprehensive project data
 */
router.post('/confirm-import', async (req, res) => {
    const { dataToImport } = req.body || {};
    
    if (!dataToImport || !Array.isArray(dataToImport) || dataToImport.length === 0) {
        return res.status(400).json({ success: false, message: 'No data provided for import.' });
    }
    
    let connection;
    const summary = {
        projectsCreated: 0,
        projectsUpdated: 0,
        strategicPlansCreated: 0,
        programsCreated: 0,
        subprogramsCreated: 0,
        workplansCreated: 0,
        activitiesCreated: 0,
        milestonesCreated: 0,
        contractorsCreated: 0,
        categoriesCreated: 0,
        monitoringRecordsCreated: 0,
        errors: []
    };
    
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // Process each row
        for (let i = 0; i < dataToImport.length; i++) {
            const row = dataToImport[i] || {};
            
            try {
                // 1. Strategic Plan
                let planId = null;
                let planCidpid = null;
                if (row.StrategicPlan || row.StrategicPlanCode) {
                    const planName = normalizeStr(row.StrategicPlan);
                    const planCode = normalizeStr(row.StrategicPlanCode);
                    
                    if (planCode) {
                        planCidpid = planCode;
                        const [existingPlan] = await connection.query(
                            'SELECT id, cidpid FROM strategicplans WHERE cidpid = ? AND (voided IS NULL OR voided = 0)',
                            [planCode]
                        );
                        
                        if (existingPlan.length > 0) {
                            planId = existingPlan[0].id;
                        } else if (planName) {
                            const [insertResult] = await connection.query(
                                'INSERT INTO strategicplans (cidpid, cidpName, voided) VALUES (?, ?, 0)',
                                [planCode, planName]
                            );
                            planId = insertResult.insertId;
                            summary.strategicPlansCreated++;
                        }
                    }
                }
                
                // 2. Program
                let programId = null;
                if (row.Program && planCidpid) {
                    const programName = normalizeStr(row.Program);
                    const [existingProgram] = await connection.query(
                        'SELECT programId FROM programs WHERE programme = ? AND cidpid = ?',
                        [programName, planCidpid]
                    );
                    
                    if (existingProgram.length > 0) {
                        programId = existingProgram[0].programId;
                    } else {
                        // Get department
                        const departmentName = normalizeStr(row.Department);
                        let departmentId = null;
                        if (departmentName) {
                            const [deptRows] = await connection.query(
                                'SELECT departmentId FROM departments WHERE name = ? AND (voided IS NULL OR voided = 0) LIMIT 1',
                                [departmentName]
                            );
                            if (deptRows.length > 0) departmentId = deptRows[0].departmentId;
                        }
                        
                        const [insertResult] = await connection.query(
                            'INSERT INTO programs (cidpid, programme, departmentId, voided) VALUES (?, ?, ?, 0)',
                            [planCidpid, programName, departmentId]
                        );
                        programId = insertResult.insertId;
                        summary.programsCreated++;
                    }
                }
                
                // 3. Sub-program with 5-year budgets and targets
                let subProgramId = null;
                if (row.SubProgram && programId) {
                    const subProgramName = normalizeStr(row.SubProgram);
                    const [existingSubProgram] = await connection.query(
                        'SELECT subProgramId FROM subprograms WHERE subProgramme = ? AND programId = ?',
                        [subProgramName, programId]
                    );
                    
                    // Calculate total budget from yearly budgets
                    const yearlyBudgets = [
                        parseFloat(row.SubProgram_Yr1Budget) || 0,
                        parseFloat(row.SubProgram_Yr2Budget) || 0,
                        parseFloat(row.SubProgram_Yr3Budget) || 0,
                        parseFloat(row.SubProgram_Yr4Budget) || 0,
                        parseFloat(row.SubProgram_Yr5Budget) || 0
                    ];
                    const calculatedTotalBudget = yearlyBudgets.reduce((sum, budget) => sum + budget, 0);
                    
                    if (existingSubProgram.length > 0) {
                        subProgramId = existingSubProgram[0].subProgramId;
                        // Update subprogram with new data
                        await connection.query(
                            `UPDATE subprograms SET 
                                keyOutcome = ?, kpi = ?, baseline = ?,
                                yr1Targets = ?, yr2Targets = ?, yr3Targets = ?, yr4Targets = ?, yr5Targets = ?,
                                yr1Budget = ?, yr2Budget = ?, yr3Budget = ?, yr4Budget = ?, yr5Budget = ?,
                                totalBudget = ?, remarks = ?
                            WHERE subProgramId = ?`,
                            [
                                normalizeStr(row.SubProgram_KeyOutcome),
                                normalizeStr(row.SubProgram_KPI),
                                normalizeStr(row.SubProgram_Baseline),
                                normalizeStr(row.SubProgram_Yr1Targets),
                                normalizeStr(row.SubProgram_Yr2Targets),
                                normalizeStr(row.SubProgram_Yr3Targets),
                                normalizeStr(row.SubProgram_Yr4Targets),
                                normalizeStr(row.SubProgram_Yr5Targets),
                                yearlyBudgets[0],
                                yearlyBudgets[1],
                                yearlyBudgets[2],
                                yearlyBudgets[3],
                                yearlyBudgets[4],
                                calculatedTotalBudget,
                                normalizeStr(row.SubProgram_Remarks),
                                subProgramId
                            ]
                        );
                    } else {
                        const [insertResult] = await connection.query(
                            `INSERT INTO subprograms 
                            (programId, subProgramme, keyOutcome, kpi, baseline,
                             yr1Targets, yr2Targets, yr3Targets, yr4Targets, yr5Targets,
                             yr1Budget, yr2Budget, yr3Budget, yr4Budget, yr5Budget, totalBudget, remarks, voided)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                            [
                                programId,
                                subProgramName,
                                normalizeStr(row.SubProgram_KeyOutcome),
                                normalizeStr(row.SubProgram_KPI),
                                normalizeStr(row.SubProgram_Baseline),
                                normalizeStr(row.SubProgram_Yr1Targets),
                                normalizeStr(row.SubProgram_Yr2Targets),
                                normalizeStr(row.SubProgram_Yr3Targets),
                                normalizeStr(row.SubProgram_Yr4Targets),
                                normalizeStr(row.SubProgram_Yr5Targets),
                                yearlyBudgets[0],
                                yearlyBudgets[1],
                                yearlyBudgets[2],
                                yearlyBudgets[3],
                                yearlyBudgets[4],
                                calculatedTotalBudget,
                                normalizeStr(row.SubProgram_Remarks)
                            ]
                        );
                        subProgramId = insertResult.insertId;
                        summary.subprogramsCreated++;
                    }
                }
                
                // 4. Project
                const projectName = normalizeStr(row.ProjectName);
                const projectRef = normalizeStr(row.ProjectRefNum);
                
                if (!projectName && !projectRef) {
                    throw new Error('Missing ProjectName and ProjectRefNum');
                }
                
                // Resolve metadata
                const departmentName = normalizeStr(row.Department);
                let departmentId = null;
                if (departmentName) {
                    const [deptRows] = await connection.query(
                        'SELECT departmentId FROM departments WHERE name = ? AND (voided IS NULL OR voided = 0) LIMIT 1',
                        [departmentName]
                    );
                    if (deptRows.length > 0) departmentId = deptRows[0].departmentId;
                }
                
                const directorateName = normalizeStr(row.Directorate);
                let sectionId = null;
                if (directorateName) {
                    const [sectionRows] = await connection.query(
                        'SELECT sectionId FROM sections WHERE name = ? AND (voided IS NULL OR voided = 0) LIMIT 1',
                        [directorateName]
                    );
                    if (sectionRows.length > 0) sectionId = sectionRows[0].sectionId;
                }
                
                // Financial Year
                const finYearName = normalizeStr(row.FinancialYear);
                let finYearId = null;
                if (finYearName) {
                    const normalizedFY = finYearName.replace(/^fy\s*/i, '').replace(/[\s\-]/g, '/').toLowerCase();
                    const [fyRows] = await connection.query(
                        'SELECT finYearId, finYearName FROM financialyears WHERE (voided IS NULL OR voided = 0)'
                    );
                    for (const fy of fyRows) {
                        if (fy.finYearName) {
                            const dbNormalized = fy.finYearName.replace(/^fy\s*/i, '').replace(/[\s\-]/g, '/').toLowerCase();
                            if (dbNormalized === normalizedFY) {
                                finYearId = fy.finYearId;
                                break;
                            }
                        }
                    }
                }
                
                // Project Category - Create if doesn't exist
                const categoryName = normalizeStr(row.ProjectCategory);
                let categoryId = null;
                if (categoryName) {
                    const [categoryRows] = await connection.query(
                        'SELECT categoryId FROM project_milestone_implementations WHERE categoryName = ? LIMIT 1',
                        [categoryName]
                    );
                    if (categoryRows.length > 0) {
                        categoryId = categoryRows[0].categoryId;
                    } else {
                        // Create category if it doesn't exist
                        const [insertResult] = await connection.query(
                            'INSERT INTO project_milestone_implementations (categoryName) VALUES (?)',
                            [categoryName]
                        );
                        categoryId = insertResult.insertId;
                        summary.categoriesCreated = (summary.categoriesCreated || 0) + 1;
                    }
                }
                
                // Principal Investigator (from Project Manager fields)
                const principalInvestigatorName = normalizeStr(row.ProjectManager);
                const principalInvestigatorStaffIdValue = normalizeStr(row.ProjectManagerID);
                let principalInvestigatorStaffId = null;
                
                if (principalInvestigatorStaffIdValue) {
                    // Try to find staff by ID
                    const [staffRows] = await connection.query(
                        'SELECT staffId FROM staff WHERE staffId = ? OR email = ? LIMIT 1',
                        [principalInvestigatorStaffIdValue, principalInvestigatorStaffIdValue]
                    );
                    if (staffRows.length > 0) {
                        principalInvestigatorStaffId = staffRows[0].staffId;
                    }
                } else if (principalInvestigatorName) {
                    // Try to find staff by name (first name and last name)
                    const nameParts = principalInvestigatorName.trim().split(/\s+/);
                    if (nameParts.length >= 2) {
                        const firstName = nameParts[0];
                        const lastName = nameParts.slice(1).join(' ');
                        const [staffRows] = await connection.query(
                            'SELECT staffId FROM staff WHERE firstName = ? AND lastName = ? LIMIT 1',
                            [firstName, lastName]
                        );
                        if (staffRows.length > 0) {
                            principalInvestigatorStaffId = staffRows[0].staffId;
                        }
                    }
                }
                
                // Check if project exists
                let projectId = null;
                const [existingProject] = await connection.query(
                    'SELECT id FROM projects WHERE (projectName = ? OR ProjectRefNum = ?) AND voided = 0',
                    [projectName, projectRef]
                );
                
                const projectData = {
                    projectName: projectName || null,
                    ProjectRefNum: projectRef || null,
                    projectDescription: normalizeStr(row.ProjectDescription) || null,
                    status: normalizeStr(row.Status) || null,
                    costOfProject: parseFloat(row.Budget) || null,
                    paidOut: parseFloat(row.AmountPaid) || null,
                    Contracted: parseFloat(row.Contracted) || null,
                    startDate: parseDateToYMD(row.StartDate),
                    endDate: parseDateToYMD(row.EndDate),
                    departmentId: departmentId,
                    sectionId: sectionId,
                    finYearId: finYearId,
                    programId: programId,
                    subProgramId: subProgramId,
                    categoryId: categoryId,
                    principalInvestigator: principalInvestigatorName || null,
                    principalInvestigatorStaffId: principalInvestigatorStaffId,
                    objective: normalizeStr(row.Objective) || null,
                    expectedOutput: normalizeStr(row.ExpectedOutput) || null,
                    expectedOutcome: normalizeStr(row.ExpectedOutcome) || null,
                    overallProgress: parseFloat(row.OverallProgress) || null,
                    statusReason: normalizeStr(row.StatusReason) || null
                };
                
                if (existingProject.length > 0) {
                    projectId = existingProject[0].id;
                    await connection.query('UPDATE projects SET ? WHERE id = ?', [projectData, projectId]);
                    summary.projectsUpdated++;
                } else {
                    const [insertResult] = await connection.query('INSERT INTO projects SET ?', projectData);
                    projectId = insertResult.insertId;
                    summary.projectsCreated++;
                }
                
                // 4.5. Create milestones from category template if category exists and no milestones in Excel
                // This should happen BEFORE activities are created so activities can be linked
                if (categoryId && !row.MilestoneName) {
                    // Check if project already has milestones
                    const [existingMilestones] = await connection.query(
                        'SELECT COUNT(*) as count FROM project_milestones WHERE projectId = ?',
                        [projectId]
                    );
                    
                    // Only auto-create if project has no milestones yet
                    if (existingMilestones[0].count === 0) {
                        const [milestoneTemplates] = await connection.query(
                            'SELECT milestoneName, description, sequenceOrder FROM category_milestones WHERE categoryId = ? AND voided = 0 ORDER BY sequenceOrder',
                            [categoryId]
                        );
                        
                        if (milestoneTemplates.length > 0) {
                            for (const template of milestoneTemplates) {
                                await connection.query(
                                    'INSERT INTO project_milestones (projectId, milestoneName, description, sequenceOrder, status, progress, weight, completed, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                    [projectId, template.milestoneName, template.description, template.sequenceOrder, 'not_started', 0, 1, 0, 1]
                                );
                            }
                            summary.milestonesCreated += milestoneTemplates.length;
                        }
                    }
                }
                
                // 5. Milestone (from Excel data - create before activities)
                if (row.MilestoneName && projectId) {
                    const milestoneName = normalizeStr(row.MilestoneName);
                    
                    const [existingMilestone] = await connection.query(
                        'SELECT milestoneId FROM project_milestones WHERE milestoneName = ? AND projectId = ?',
                        [milestoneName, projectId]
                    );
                    
                    if (existingMilestone.length === 0) {
                        const milestoneData = {
                            projectId: projectId,
                            milestoneName: milestoneName,
                            description: normalizeStr(row.MilestoneDescription) || null,
                            dueDate: parseDateToYMD(row.MilestoneDueDate),
                            status: normalizeStr(row.MilestoneStatus) || 'not_started',
                            progress: parseFloat(row.MilestoneProgress) || 0,
                            weight: parseFloat(row.MilestoneWeight) || 1,
                            sequenceOrder: parseInt(row.MilestoneSequenceOrder) || null,
                            completed: normalizeStr(row.MilestoneStatus) === 'completed' ? 1 : 0,
                            userId: 1 // TODO: Get from authenticated user
                        };
                        
                        await connection.query('INSERT INTO project_milestones SET ?', milestoneData);
                        summary.milestonesCreated++;
                    }
                }
                
                // 6. Workplan
                let workplanId = null;
                if (row.Workplan && subProgramId) {
                    const workplanName = normalizeStr(row.Workplan);
                    const workplanFY = normalizeStr(row.WorkplanFinancialYear);
                    
                    const [existingWorkplan] = await connection.query(
                        'SELECT workplanId FROM annual_workplans WHERE workplanName = ? AND subProgramId = ?',
                        [workplanName, subProgramId]
                    );
                    
                    if (existingWorkplan.length > 0) {
                        workplanId = existingWorkplan[0].workplanId;
                    } else {
                        const [insertResult] = await connection.query(
                            'INSERT INTO annual_workplans (subProgramId, workplanName, financialYear, voided) VALUES (?, ?, ?, 0)',
                            [subProgramId, workplanName, workplanFY]
                        );
                        workplanId = insertResult.insertId;
                        summary.workplansCreated++;
                    }
                }
                
                // 7. Activity
                if (row.Activity && workplanId && projectId) {
                    const activityName = normalizeStr(row.Activity);
                    
                    const [existingActivity] = await connection.query(
                        'SELECT activityId FROM activities WHERE activityName = ? AND workplanId = ? AND projectId = ?',
                        [activityName, workplanId, projectId]
                    );
                    
                    if (existingActivity.length === 0) {
                        const activityData = {
                            workplanId: workplanId,
                            projectId: projectId,
                            activityName: activityName,
                            activityDescription: normalizeStr(row.ActivityDescription) || null,
                            startDate: parseDateToYMD(row.ActivityStartDate),
                            endDate: parseDateToYMD(row.ActivityEndDate),
                            budgetAllocated: parseFloat(row.ActivityBudget) || null,
                            actualCost: parseFloat(row.ActivityActualCost) || null,
                            percentageComplete: parseFloat(row.ActivityPercentageComplete) || null,
                            activityStatus: normalizeStr(row.ActivityStatus) || 'not_started',
                            responsibleOfficer: normalizeStr(row.ActivityResponsibleOfficer) || null
                        };
                        
                        const [insertResult] = await connection.query('INSERT INTO activities SET ?', activityData);
                        const activityId = insertResult.insertId;
                        summary.activitiesCreated++;
                        
                        // Link activity to milestone if present (milestones should exist by now)
                        if (row.MilestoneName) {
                            const [milestoneRows] = await connection.query(
                                'SELECT milestoneId FROM project_milestones WHERE milestoneName = ? AND projectId = ?',
                                [normalizeStr(row.MilestoneName), projectId]
                            );
                            if (milestoneRows.length > 0) {
                                const milestoneId = milestoneRows[0].milestoneId;
                                await connection.query(
                                    'INSERT IGNORE INTO milestone_activities (milestoneId, activityId) VALUES (?, ?)',
                                    [milestoneId, activityId]
                                );
                            }
                        } else if (categoryId) {
                            // If no milestone specified in Excel but category exists, try to match activity name to milestone templates
                            // This helps auto-link activities to relevant milestones
                            const activityLower = activityName.toLowerCase();
                            const [matchingMilestones] = await connection.query(
                                'SELECT milestoneId FROM project_milestones WHERE projectId = ? AND (LOWER(milestoneName) LIKE ? OR LOWER(description) LIKE ?)',
                                [projectId, `%${activityLower}%`, `%${activityLower}%`]
                            );
                            if (matchingMilestones.length > 0) {
                                // Link to first matching milestone
                                await connection.query(
                                    'INSERT IGNORE INTO milestone_activities (milestoneId, activityId) VALUES (?, ?)',
                                    [matchingMilestones[0].milestoneId, activityId]
                                );
                            }
                        }
                    }
                }
                
                // 8. Location (County, Sub-county, Ward)
                if (row.SubCounty || row.Ward) {
                    const subcountyName = normalizeStr(row.SubCounty);
                    const wardName = normalizeStr(row.Ward);
                    
                    // Sub-county
                    if (subcountyName) {
                        const [subcountyRows] = await connection.query(
                            'SELECT subcountyId FROM subcounties WHERE name = ? AND (voided IS NULL OR voided = 0) LIMIT 1',
                            [subcountyName]
                        );
                        if (subcountyRows.length > 0) {
                            const subcountyId = subcountyRows[0].subcountyId;
                            await connection.query(
                                'INSERT IGNORE INTO project_subcounties (projectId, subcountyId, voided) VALUES (?, ?, 0)',
                                [projectId, subcountyId]
                            );
                        }
                    }
                    
                    // Ward
                    if (wardName) {
                        const [wardRows] = await connection.query(
                            'SELECT wardId FROM wards WHERE name = ? AND (voided IS NULL OR voided = 0) LIMIT 1',
                            [wardName]
                        );
                        if (wardRows.length > 0) {
                            const wardId = wardRows[0].wardId;
                            await connection.query(
                                'INSERT IGNORE INTO project_wards (projectId, wardId, voided) VALUES (?, ?, 0)',
                                [projectId, wardId]
                            );
                        }
                    }
                }
                
                // 9. Contractor Assignment
                const contractorName = normalizeStr(row.Contractor);
                if (contractorName && projectId) {
                    // Normalize contractor name for matching
                    const normalizedContractorName = contractorName.trim().replace(/'/g, '').replace(/\s+/g, '');
                    
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
                        
                        // Update existing contractor with additional details if provided
                        const contactPerson = normalizeStr(row.ContractorContactPerson || row['Contractor Contact Person']);
                        const email = normalizeStr(row.ContractorEmail || row['Contractor Email']);
                        const phone = normalizeStr(row.ContractorPhone || row['Contractor Phone']);
                        
                        if (contactPerson || email || phone) {
                            const updateFields = {};
                            if (contactPerson) updateFields.contactPerson = contactPerson;
                            if (email) updateFields.email = email;
                            if (phone) updateFields.phone = phone;
                            
                            try {
                                await connection.query(
                                    'UPDATE contractors SET ? WHERE contractorId = ?',
                                    [updateFields, contractorId]
                                );
                            } catch (err) {
                                console.warn(`Failed to update contractor details:`, err.message);
                            }
                        }
                    } else if (contractorName && contractorName.length >= 2) {
                        // Create new contractor with all provided details
                        const contactPerson = normalizeStr(row.ContractorContactPerson || row['Contractor Contact Person']) || contractorName;
                        const email = normalizeStr(row.ContractorEmail || row['Contractor Email']);
                        const phone = normalizeStr(row.ContractorPhone || row['Contractor Phone']);
                        
                        try {
                            const [insertResult] = await connection.query(
                                'INSERT INTO contractors (companyName, contactPerson, email, phone, userId, voided) VALUES (?, ?, ?, ?, ?, 0)',
                                [contractorName, contactPerson, email || null, phone || null, 1]
                            );
                            contractorId = insertResult.insertId;
                            summary.contractorsCreated = (summary.contractorsCreated || 0) + 1;
                        } catch (err) {
                            console.warn(`Failed to create contractor "${contractorName}":`, err.message);
                        }
                    }
                    
                    // Assign contractor to project
                    if (contractorId) {
                        try {
                            await connection.query(
                                'INSERT IGNORE INTO project_contractor_assignments (projectId, contractorId) VALUES (?, ?)',
                                [projectId, contractorId]
                            );
                        } catch (err) {
                            console.warn(`Failed to assign contractor to project:`, err.message);
                        }
                    }
                }
                
                // 10. Project Monitoring & Observations
                // Check for monitoring comment in multiple possible field names
                const monitoringComment = normalizeStr(row.MonitoringComment || row.Monitoring_Comment || row['Monitoring Comment']);
                if (monitoringComment && monitoringComment.trim() && projectId) {
                    const monitoringData = {
                        projectId: projectId,
                        comment: monitoringComment,
                        recommendations: normalizeStr(row.MonitoringRecommendations || row.Monitoring_Recommendations || row['Monitoring Recommendations']) || null,
                        challenges: normalizeStr(row.MonitoringChallenges || row.Monitoring_Challenges || row['Monitoring Challenges']) || null,
                        warningLevel: normalizeStr(row.MonitoringWarningLevel || row.Monitoring_Warning_Level || row['Monitoring Warning Level'] || row.WarningLevel) || 'None',
                        isRoutineObservation: parseBool(row.IsRoutineObservation || row.Is_Routine_Observation || row['Is Routine Observation'] || row.RoutineObservation) !== false ? 1 : 0,
                        userId: 1 // TODO: Get from authenticated user
                    };
                    
                    // Parse observation date
                    const obsDate = parseDateToYMD(row.MonitoringObservationDate || row.Monitoring_Observation_Date || row['Monitoring Observation Date']);
                    if (obsDate) {
                        monitoringData.observationDate = obsDate;
                    }
                    
                    try {
                        await connection.query('INSERT INTO project_monitoring_records SET ?', monitoringData);
                        summary.monitoringRecordsCreated++;
                    } catch (err) {
                        console.error(`Failed to create monitoring record for project ${projectId}:`, err.message);
                        console.error('Monitoring data:', monitoringData);
                        // Don't throw - continue with other rows
                    }
                }
                
            } catch (rowError) {
                summary.errors.push(`Row ${i + 2}: ${rowError.message}`);
                console.error(`Error processing row ${i + 2}:`, rowError);
            }
        }
        
        await connection.commit();
        
        res.status(200).json({
            success: true,
            message: 'Comprehensive project data imported successfully',
            summary
        });
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Comprehensive project import error:', error);
        res.status(500).json({
            success: false,
            message: 'Import failed',
            error: error.message,
            summary
        });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * @route GET /api/comprehensive-projects/template
 * @description Download comprehensive project import template
 */
router.get('/template', async (req, res) => {
    try {
        const templatePath = path.resolve(__dirname, '..', 'templates', 'comprehensive_project_details_template.xlsx');
        
        // Generate template if it doesn't exist
        if (!fs.existsSync(templatePath)) {
            console.log('Template not found, generating...');
            const { exec } = require('child_process');
            const scriptPath = path.resolve(__dirname, '..', 'scripts', 'generate_comprehensive_project_template.js');
            exec(`node "${scriptPath}"`, (error) => {
                if (error) {
                    console.error('Error generating template:', error);
                    return res.status(500).json({ message: 'Failed to generate template', error: error.message });
                }
            });
        }
        
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ message: 'Comprehensive project template not found on server' });
        }
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="comprehensive_project_details_template.xlsx"');
        return res.sendFile(templatePath);
    } catch (err) {
        console.error('Error serving comprehensive project template:', err);
        return res.status(500).json({ message: 'Failed to serve comprehensive project template', error: err.message });
    }
});

module.exports = router;

