const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Observations (projectobservations) ---

/**
 * @route GET /api/projects/project_observations
 * @description Get all project observations.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectobservations');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project observations:', error);
        res.status(500).json({ message: 'Error fetching project observations', error: error.message });
    }
});

/**
 * @route GET /api/projects/project_observations/:id
 * @description Get a single project observation by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectobservations WHERE observationId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project observation not found' });
        }
    } catch (error) {
        console.error('Error fetching project observation:', error);
        res.status(500).json({ message: 'Error fetching project observation', error: error.message });
    }
});

/**
 * @route POST /api/projects/project_observations
 * @description Create a new project observation.
 */
router.post('/', async (req, res) => {
    const newObservation = {
        observationId: req.body.observationId || `po${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        voidedAt: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectobservations SET ?', newObservation);
        if (result.insertId) {
            newObservation.observationId = result.insertId;
        }
        res.status(201).json(newObservation);
    } catch (error) {
        console.error('Error creating project observation:', error);
        res.status(500).json({ message: 'Error creating project observation', error: error.message });
    }
});

/**
 * @route PUT /api/projects/project_observations/:id
 * @description Update an existing project observation.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body, updatedAt: new Date() };
    try {
        const [result] = await pool.query('UPDATE projectobservations SET ? WHERE observationId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectobservations WHERE observationId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project observation not found' });
        }
    } catch (error) {
        console.error('Error updating project observation:', error);
        res.status(500).json({ message: 'Error updating project observation', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/project_observations/:id
 * @description Delete a project observation.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectobservations WHERE observationId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project observation not found' });
        }
    } catch (error) {
        console.error('Error deleting project observation:', error);
        res.status(500).json({ message: 'Error deleting project observation', error: error.message });
    }
});

module.exports = router;
