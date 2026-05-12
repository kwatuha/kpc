const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Monitoring (projectmonitoring) ---

/**
 * @route GET /api/projects/project_monitoring
 * @description Get all project monitoring records.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectmonitoring');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project monitoring records:', error);
        res.status(500).json({ message: 'Error fetching project monitoring records', error: error.message });
    }
});

/**
 * @route GET /api/projects/project_monitoring/:id
 * @description Get a single project monitoring record by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectmonitoring WHERE monitoringId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project monitoring record not found' });
        }
    } catch (error) {
        console.error('Error fetching project monitoring record:', error);
        res.status(500).json({ message: 'Error fetching project monitoring record', error: error.message });
    }
});

/**
 * @route POST /api/projects/project_monitoring
 * @description Create a new project monitoring record.
 */
router.post('/', async (req, res) => {
    const newMonitoring = {
        monitoringId: req.body.monitoringId || `pm_mon${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectmonitoring SET ?', newMonitoring);
        if (result.insertId) {
            newMonitoring.monitoringId = result.insertId;
        }
        res.status(201).json(newMonitoring);
    } catch (error) {
        console.error('Error creating project monitoring record:', error);
        res.status(500).json({ message: 'Error creating project monitoring record', error: error.message });
    }
});

/**
 * @route PUT /api/projects/project_monitoring/:id
 * @description Update an existing project monitoring record.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projectmonitoring SET ? WHERE monitoringId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectmonitoring WHERE monitoringId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project monitoring record not found' });
        }
    } catch (error) {
        console.error('Error updating project monitoring record:', error);
        res.status(500).json({ message: 'Error updating project monitoring record', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/project_monitoring/:id
 * @description Delete a project monitoring record.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectmonitoring WHERE monitoringId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project monitoring record not found' });
        }
    } catch (error) {
        console.error('Error deleting project monitoring record:', error);
        res.status(500).json({ message: 'Error deleting project monitoring record', error: error.message });
    }
});

module.exports = router;
