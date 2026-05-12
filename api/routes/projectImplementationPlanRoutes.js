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


// --- CRUD Operations for Project Implementation Plan (project_implementation_plan) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/implementation-plan
 * @description Get implementation plan for a specific project.
 */
router.get('/:projectId/implementation-plan', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_implementation_plan WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Implementation plan not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching implementation plan:', error);
        res.status(500).json({ message: 'Error fetching implementation plan', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/implementation-plan
 * @description Create a new implementation plan for a project. (One-to-one)
 */
router.post('/:projectId/implementation-plan', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    try {
        const [existing] = await pool.query('SELECT planId FROM project_implementation_plan WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Implementation plan already exists for this project. Use PUT to update.' });
        }

        const newImplementationPlan = {
            projectId: projectId,
            description: clientData.description || null,
            keyPerformanceIndicators: clientData.keyPerformanceIndicators || null, // Expects JSON string or TEXT
            responsiblePersons: clientData.responsiblePersons || null, // Expects JSON string or TEXT
        };

        const [result] = await pool.query('INSERT INTO project_implementation_plan SET ?', newImplementationPlan);
        newImplementationPlan.planId = result.insertId;
        res.status(201).json(newImplementationPlan);
    } catch (error) {
        console.error('Error creating implementation plan:', error);
        res.status(500).json({ message: 'Error creating implementation plan', error: error.message });
    }
});

/**
 * @route PUT /api/projects/implementation-plan/:planId
 * @description Update an existing implementation plan.
 */
router.put('/implementation-plan/:planId', async (req, res) => {
    const { planId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        description: clientData.description || null,
        keyPerformanceIndicators: clientData.keyPerformanceIndicators || null,
        responsiblePersons: clientData.responsiblePersons || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_implementation_plan SET ? WHERE planId = ?', [updatedFields, planId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_implementation_plan WHERE planId = ?', [planId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Implementation plan not found.' });
        }
    } catch (error) {
        console.error('Error updating implementation plan:', error);
        res.status(500).json({ message: 'Error updating implementation plan', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/implementation-plan/:planId
 * @description Delete an implementation plan.
 */
router.delete('/implementation-plan/:planId', async (req, res) => {
    const { planId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_implementation_plan WHERE planId = ?', [planId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Implementation plan not found.' });
        }
    } catch (error) {
        console.error('Error deleting implementation plan:', error);
        res.status(500).json({ message: 'Error deleting implementation plan', error: error.message });
    }
});

module.exports = router;
