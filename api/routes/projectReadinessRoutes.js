const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Helper Functions (copy from a centralized file if available) ---
const formatToMySQLDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        console.warn('Invalid date provided to formatToMySQLDateTime:', date);
        return null;
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatBooleanForMySQL = (value) => {
    if (value === true) return 1;
    if (value === false) return 0;
    return null;
};


// --- CRUD Operations for Project Readiness (project_readiness) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/readiness
 * @description Get project readiness details for a specific project.
 */
router.get('/:projectId/readiness', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_readiness WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project readiness details not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching project readiness details:', error);
        res.status(500).json({ message: 'Error fetching project readiness details', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/readiness
 * @description Create new project readiness details for a project. (One-to-one)
 */
router.post('/:projectId/readiness', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    try {
        const [existing] = await pool.query('SELECT readinessId FROM project_readiness WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Project readiness details already exist for this project. Use PUT to update.' });
        }

        const newReadiness = {
            projectId: projectId,
            designsPreparedApproved: formatBooleanForMySQL(clientData.designsPreparedApproved),
            landAcquiredSiteReady: formatBooleanForMySQL(clientData.landAcquiredSiteReady),
            regulatoryApprovalsObtained: formatBooleanForMySQL(clientData.regulatoryApprovalsObtained),
            governmentAgenciesInvolved: clientData.governmentAgenciesInvolved || null, // Expects JSON string or TEXT
            consultationsUndertaken: formatBooleanForMySQL(clientData.consultationsUndertaken),
            canBePhasedScaledDown: formatBooleanForMySQL(clientData.canBePhasedScaledDown),
        };

        const [result] = await pool.query('INSERT INTO project_readiness SET ?', newReadiness);
        newReadiness.readinessId = result.insertId;
        res.status(201).json(newReadiness);
    } catch (error) {
        console.error('Error creating project readiness details:', error);
        res.status(500).json({ message: 'Error creating project readiness details', error: error.message });
    }
});

/**
 * @route PUT /api/projects/readiness/:readinessId
 * @description Update existing project readiness details.
 */
router.put('/readiness/:readinessId', async (req, res) => {
    const { readinessId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        designsPreparedApproved: formatBooleanForMySQL(clientData.designsPreparedApproved),
        landAcquiredSiteReady: formatBooleanForMySQL(clientData.landAcquiredSiteReady),
        regulatoryApprovalsObtained: formatBooleanForMySQL(clientData.regulatoryApprovalsObtained),
        governmentAgenciesInvolved: clientData.governmentAgenciesInvolved || null,
        consultationsUndertaken: formatBooleanForMySQL(clientData.consultationsUndertaken),
        canBePhasedScaledDown: formatBooleanForMySQL(clientData.canBePhasedScaledDown),
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_readiness SET ? WHERE readinessId = ?', [updatedFields, readinessId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_readiness WHERE readinessId = ?', [readinessId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project readiness details not found.' });
        }
    } catch (error) {
        console.error('Error updating project readiness details:', error);
        res.status(500).json({ message: 'Error updating project readiness details', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/readiness/:readinessId
 * @description Delete project readiness details.
 */
router.delete('/readiness/:readinessId', async (req, res) => {
    const { readinessId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_readiness WHERE readinessId = ?', [readinessId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project readiness details not found.' });
        }
    } catch (error) {
        console.error('Error deleting project readiness details:', error);
        res.status(500).json({ message: 'Error deleting project readiness details', error: error.message });
    }
});

module.exports = router;
