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


// --- CRUD Operations for Project Risks and Mitigation (project_risks) ---
// One-to-many relationship with projects

/**
 * @route GET /api/projects/:projectId/risks
 * @description Get all risks for a specific project.
 */
router.get('/:projectId/risks', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_risks WHERE projectId = ?', [projectId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching risks:', error);
        res.status(500).json({ message: 'Error fetching risks', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/risks
 * @description Create a new risk for a project.
 */
router.post('/:projectId/risks', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    const newRisk = {
        projectId: projectId,
        riskDescription: clientData.riskDescription || null,
        likelihood: clientData.likelihood || null,
        impact: clientData.impact || null,
        mitigationStrategy: clientData.mitigationStrategy || null,
    };

    try {
        const [result] = await pool.query('INSERT INTO project_risks SET ?', newRisk);
        newRisk.riskId = result.insertId;
        res.status(201).json(newRisk);
    } catch (error) {
        console.error('Error creating risk:', error);
        res.status(500).json({ message: 'Error creating risk', error: error.message });
    }
});

/**
 * @route PUT /api/projects/risks/:riskId
 * @description Update an existing risk.
 */
router.put('/risks/:riskId', async (req, res) => {
    const { riskId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        riskDescription: clientData.riskDescription || null,
        likelihood: clientData.likelihood || null,
        impact: clientData.impact || null,
        mitigationStrategy: clientData.mitigationStrategy || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_risks SET ? WHERE riskId = ?', [updatedFields, riskId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_risks WHERE riskId = ?', [riskId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Risk not found.' });
        }
    } catch (error) {
        console.error('Error updating risk:', error);
        res.status(500).json({ message: 'Error updating risk', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/risks/:riskId
 * @description Delete a risk.
 */
router.delete('/risks/:riskId', async (req, res) => {
    const { riskId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_risks WHERE riskId = ?', [riskId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Risk not found.' });
        }
    } catch (error) {
        console.error('Error deleting risk:', error);
        res.status(500).json({ message: 'Error deleting risk', error: error.message });
    }
});

module.exports = router;
