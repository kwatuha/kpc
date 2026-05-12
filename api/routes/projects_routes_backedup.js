const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// Import individual route files
const taskRoutes = require('./taskRoutes');
const milestoneRoutes = require('./milestoneRoutes');
const taskAssigneeRoutes = require('./taskAssigneeRoutes');
const taskDependencyRoutes = require('./taskDependencyRoutes');
const appointmentScheduleRoutes = require('./appointmentScheduleRoutes');
const projectAttachmentRoutes = require('./projectAttachmentRoutes');
const projectCertificateRoutes = require('./projectCertificateRoutes');
const projectFeedbackRoutes = require('./projectFeedbackRoutes');
const projectMapRoutes = require('./projectMapRoutes');
const projectMonitoringRoutes = require('./projectMonitoringRoutes');
const projectObservationRoutes = require('./projectObservationRoutes');
const projectPaymentRoutes = require('./projectPaymentRoutes'); // Corrected import
const projectSchedulingRoutes = require('./projectSchedulingRoutes');
const projectTypeRoutes = require('./projectTypeRoutes');
const projectWarningRoutes = require('./projectWarningRoutes');
const projectProposalRatingRoutes = require('./projectProposalRatingRoutes');

// Base SQL query for project details with left joins (without GROUP BY, HAVING, ORDER BY)
const BASE_PROJECT_SELECT_JOINS = `
    SELECT
        p.id,
        p.projectName,
        p.directorate,
        p.startDate,
        p.endDate,
        p.costOfProject,
        p.paidOut,
        p.objective,
        p.expectedOutput,
        p.principalInvestigator,
        p.expectedOutcome,
        p.status,
        p.statusReason,
        p.createdOn,
        p.principalInvestigatorStaffId,
        s.first_name AS pi_firstName,
        s.lastName AS pi_lastName,
        s.email AS pi_email,
        p.departmentId,
        cd.name AS departmentName,
        p.sectionId,
        ds.name AS sectionName,
        p.finYearId,
        fy.finYearName AS financialYearName,
        p.programId,
        pr.programme AS programName,
        p.subProgramId,
        spr.subProgramme AS subProgramName,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS countyNames,
        GROUP_CONCAT(DISTINCT sc.name ORDER BY sc.name SEPARATOR ', ') AS subcountyNames,
        GROUP_CONCAT(DISTINCT w.name ORDER BY w.name SEPARATOR ', ') AS wardNames
    FROM
        projects p
    LEFT JOIN
        staff s ON p.principalInvestigatorStaffId = s.staffId
    LEFT JOIN
        departments cd ON p.departmentId = cd.departmentId
    LEFT JOIN
        sections ds ON p.sectionId = ds.sectionId
    LEFT JOIN
        financialyears fy ON p.finYearId = fy.finYearId
    LEFT JOIN
        programs pr ON p.programId = pr.programId
    LEFT JOIN
        subprograms spr ON p.subProgramId = spr.subProgramId
    LEFT JOIN
        project_counties pc ON p.id = pc.projectId
    LEFT JOIN
        counties c ON pc.countyId = c.countyId
    LEFT JOIN
        project_subcounties psc ON p.id = psc.projectId
    LEFT JOIN
        subcounties sc ON psc.subcountyId = sc.subcountyId
    LEFT JOIN
        project_wards pw ON p.id = pw.projectId
    LEFT JOIN
        wards w ON pw.wardId = w.wardId
`;

// Full query for fetching all projects with filtering for complete optional data
const GET_PROJECTS_FULL_QUERY = `
    ${BASE_PROJECT_SELECT_JOINS}
    GROUP BY
        p.id, p.projectName, p.directorate, p.startDate, p.endDate, p.costOfProject, p.paidOut,
        p.objective, p.expectedOutput, p.principalInvestigator, p.expectedOutcome, p.status,
        p.statusReason, p.createdOn, p.principalInvestigatorStaffId, s.first_name, s.lastName, s.email,
        p.departmentId, cd.name, p.sectionId, ds.name, p.finYearId, fy.finYearName, p.programId,
        pr.programme, p.subProgramId, spr.subProgramme
    HAVING
        pi_firstName IS NOT NULL AND
        departmentName IS NOT NULL AND
        sectionName IS NOT NULL AND
        financialYearName IS NOT NULL AND
        programName IS NOT NULL AND
        subProgramName IS NOT NULL AND
        countyNames IS NOT NULL AND
        subcountyNames IS NOT NULL AND
        wardNames IS NOT NULL
    ORDER BY
        p.id;
`;

// Query for fetching a single project by ID with filtering for complete optional data
const GET_SINGLE_PROJECT_QUERY = `
    ${BASE_PROJECT_SELECT_JOINS}
    WHERE p.id = ?
    GROUP BY
        p.id, p.projectName, p.directorate, p.startDate, p.endDate, p.costOfProject, p.paidOut,
        p.objective, p.expectedOutput, p.principalInvestigator, p.expectedOutcome, p.status,
        p.statusReason, p.createdOn, p.principalInvestigatorStaffId, s.first_name, s.lastName, s.email,
        p.departmentId, cd.name, p.sectionId, ds.name, p.finYearId, fy.finYearName, p.programId,
        pr.programme, p.subProgramId, spr.subProgramme
    HAVING
        pi_firstName IS NOT NULL AND
        departmentName IS NOT NULL AND
        sectionName IS NOT NULL AND
        financialYearName IS NOT NULL AND
        programName IS NOT NULL AND
        subProgramName IS NOT NULL AND
        countyNames IS NOT NULL AND
        subcountyNames IS NOT NULL AND
        wardNames IS NOT NULL;
`;


// --- CRUD Operations for Projects (projects) ---

/**
 * @route GET /api/projects/
 * @description Get all projects from the projects table with joined optional foreign key data.
 */
router.get('/', async (req, res) => {
    try {
        console.log('Executing GET_PROJECTS_FULL_QUERY:\n', GET_PROJECTS_FULL_QUERY);
        const [rows] = await pool.query(GET_PROJECTS_FULL_QUERY);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
});

/**
 * @route GET /api/projects/:id
 * @description Get a single project by id from the projects table with joined optional foreign key data.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log('Executing GET_SINGLE_PROJECT_QUERY with ID:', id);
        console.log('Query:\n', GET_SINGLE_PROJECT_QUERY);
        const [rows] = await pool.query(GET_SINGLE_PROJECT_QUERY, [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
});

/**
 * @route POST /api/projects/
 * @description Create a new project in the projects table.
 */
router.post('/', async (req, res) => {
    const newProject = {
        // Ensure 'id' is not manually set if it's AUTO_INCREMENT in DB
        // If 'id' is provided in req.body, it will be used, otherwise MySQL will auto-generate.
        // For auto-increment, it's best to omit 'id' from the object unless you have a specific reason.
        createdOn: new Date(),
        ...req.body
    };

    // Remove id from newProject if it's an empty string or null, to let DB handle auto-increment
    if (newProject.id === null || newProject.id === '') {
        delete newProject.id;
    }

    try {
        console.log('Executing INSERT into projects with data:', newProject);
        const [result] = await pool.query('INSERT INTO projects SET ?', newProject);
        
        // Fetch the newly created project with all joined data
        console.log('Executing GET_SINGLE_PROJECT_QUERY for new project ID:', result.insertId);
        console.log('Query:\n', GET_SINGLE_PROJECT_QUERY);
        const [rows] = await pool.query(GET_SINGLE_PROJECT_QUERY, [result.insertId]);
        
        if (rows.length > 0) {
            res.status(201).json(rows[0]);
        } else {
            // Fallback if fetching the new project fails for some reason
            res.status(201).json({ message: 'Project created, but could not fetch full details.', id: result.insertId });
        }
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});

/**
 * @route PUT /api/projects/:id
 * @description Update an existing project in the projects table.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    // Remove 'id' from updatedFields to prevent trying to update the primary key
    delete updatedFields.id; 
    try {
        console.log('Executing UPDATE projects for ID:', id, 'with data:', updatedFields);
        const [result] = await pool.query('UPDATE projects SET ? WHERE id = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            // Fetch the updated project with all joined data
            console.log('Executing GET_SINGLE_PROJECT_QUERY for updated project ID:', id);
            console.log('Query:\n', GET_SINGLE_PROJECT_QUERY);
            const [rows] = await pool.query(GET_SINGLE_PROJECT_QUERY, [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Error updating project', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/:id
 * @description Delete a project from the projects table.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log('Executing DELETE from projects for ID:', id);
        const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
});

// Mount other route files
// These routes will be prefixed with /api/projects/ as defined in your main app file (e.g., server.js or app.js)
router.use('/tasks', taskRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/task_assignees', taskAssigneeRoutes);
router.use('/task_dependencies', taskDependencyRoutes);
router.use('/appointmentschedules', appointmentScheduleRoutes);
router.use('/project_attachments', projectAttachmentRoutes);
router.use('/project_certificates', projectCertificateRoutes);
router.use('/project_feedback', projectFeedbackRoutes);
router.use('/project_maps', projectMapRoutes);
router.use('/project_monitoring', projectMonitoringRoutes);
router.use('/project_observations', projectObservationRoutes);
router.use('/project_payments', projectPaymentRoutes);
router.use('/projectscheduling', projectSchedulingRoutes);
router.use('/projecttypes', projectTypeRoutes);
router.use('/projectwarnings', projectWarningRoutes);
router.use('/projproposalratings', projectProposalRatingRoutes);

module.exports = router;
