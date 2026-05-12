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


// --- CRUD Operations for Project Stakeholders (project_stakeholders) ---
// One-to-many relationship with projects

/**
 * @route GET /api/projects/:projectId/stakeholders
 * @description Get all stakeholders for a specific project.
 */
router.get('/:projectId/stakeholders', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_stakeholders WHERE projectId = ?', [projectId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching stakeholders:', error);
        res.status(500).json({ message: 'Error fetching stakeholders', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/stakeholders
 * @description Create a new stakeholder for a project.
 */
router.post('/:projectId/stakeholders', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    const newStakeholder = {
        projectId: projectId,
        stakeholderName: clientData.stakeholderName || null,
        levelInfluence: clientData.levelInfluence || null,
        engagementStrategy: clientData.engagementStrategy || null,
    };

    try {
        const [result] = await pool.query('INSERT INTO project_stakeholders SET ?', newStakeholder);
        newStakeholder.stakeholderId = result.insertId;
        res.status(201).json(newStakeholder);
    } catch (error) {
        console.error('Error creating stakeholder:', error);
        res.status(500).json({ message: 'Error creating stakeholder', error: error.message });
    }
});

/**
 * @route PUT /api/projects/stakeholders/:stakeholderId
 * @description Update an existing stakeholder.
 */
router.put('/stakeholders/:stakeholderId', async (req, res) => {
    const { stakeholderId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        stakeholderName: clientData.stakeholderName || null,
        levelInfluence: clientData.levelInfluence || null,
        engagementStrategy: clientData.engagementStrategy || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_stakeholders SET ? WHERE stakeholderId = ?', [updatedFields, stakeholderId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_stakeholders WHERE stakeholderId = ?', [stakeholderId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Stakeholder not found.' });
        }
    } catch (error) {
        console.error('Error updating stakeholder:', error);
        res.status(500).json({ message: 'Error updating stakeholder', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/stakeholders/:stakeholderId
 * @description Delete a stakeholder.
 */
router.delete('/stakeholders/:stakeholderId', async (req, res) => {
    const { stakeholderId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_stakeholders WHERE stakeholderId = ?', [stakeholderId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Stakeholder not found.' });
        }
    } catch (error) {
        console.error('Error deleting stakeholder:', error);
        res.status(500).json({ message: 'Error deleting stakeholder', error: error.message });
    }
});

module.exports = router;
