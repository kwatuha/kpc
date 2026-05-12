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


// --- CRUD Operations for Project Financial Year Breakdown (project_fy_breakdown) ---
// One-to-many relationship with projects

/**
 * @route GET /api/projects/:projectId/fy-breakdown
 * @description Get financial year breakdown entries for a specific project.
 */
router.get('/:projectId/fy-breakdown', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_fy_breakdown WHERE projectId = ?', [projectId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching FY breakdown:', error);
        res.status(500).json({ message: 'Error fetching FY breakdown', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/fy-breakdown
 * @description Create a new financial year breakdown entry for a project.
 */
router.post('/:projectId/fy-breakdown', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    // Check for uniqueness if trying to add for an existing financialYear for this project
    try {
        const [existing] = await pool.query('SELECT fyBreakdownId FROM project_fy_breakdown WHERE projectId = ? AND financialYear = ?', [projectId, clientData.financialYear]);
        if (existing.length > 0) {
            return res.status(409).json({ message: `FY breakdown for ${clientData.financialYear} already exists for this project. Use PUT to update.` });
        }

        const newFyBreakdown = {
            projectId: projectId,
            financialYear: clientData.financialYear || null,
            totalCost: clientData.totalCost || null,
        };

        const [result] = await pool.query('INSERT INTO project_fy_breakdown SET ?', newFyBreakdown);
        newFyBreakdown.fyBreakdownId = result.insertId;
        res.status(201).json(newFyBreakdown);
    } catch (error) {
        console.error('Error creating FY breakdown:', error);
        res.status(500).json({ message: 'Error creating FY breakdown', error: error.message });
    }
});

/**
 * @route PUT /api/projects/fy-breakdown/:fyBreakdownId
 * @description Update an existing financial year breakdown entry.
 */
router.put('/fy-breakdown/:fyBreakdownId', async (req, res) => {
    const { fyBreakdownId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        financialYear: clientData.financialYear || null,
        totalCost: clientData.totalCost || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_fy_breakdown SET ? WHERE fyBreakdownId = ?', [updatedFields, fyBreakdownId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_fy_breakdown WHERE fyBreakdownId = ?', [fyBreakdownId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'FY breakdown not found.' });
        }
    } catch (error) {
        console.error('Error updating FY breakdown:', error);
        res.status(500).json({ message: 'Error updating FY breakdown', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/fy-breakdown/:fyBreakdownId
 * @description Delete a financial year breakdown entry.
 */
router.delete('/fy-breakdown/:fyBreakdownId', async (req, res) => {
    const { fyBreakdownId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_fy_breakdown WHERE fyBreakdownId = ?', [fyBreakdownId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'FY breakdown not found.' });
        }
    } catch (error) {
        console.error('Error deleting FY breakdown:', error);
        res.status(500).json({ message: 'Error deleting FY breakdown', error: error.message });
    }
});

module.exports = router;
