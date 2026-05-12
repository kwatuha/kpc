const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Scheduling (projectscheduling) ---

/**
 * @route GET /api/projects/projectscheduling
 * @description Get all project schedules.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectscheduling');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project schedules:', error);
        res.status(500).json({ message: 'Error fetching project schedules', error: error.message });
    }
});

/**
 * @route GET /api/projects/projectscheduling/:id
 * @description Get a single project schedule by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectscheduling WHERE scheduleId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project schedule not found' });
        }
    } catch (error) {
        console.error('Error fetching project schedule:', error);
        res.status(500).json({ message: 'Error fetching project schedule', error: error.message });
    }
});

/**
 * @route POST /api/projects/projectscheduling
 * @description Create a new project schedule.
 */
router.post('/', async (req, res) => {
    const newSchedule = {
        scheduleId: req.body.scheduleId || `psched${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectscheduling SET ?', newSchedule);
        if (result.insertId) {
            newSchedule.scheduleId = result.insertId;
        }
        res.status(201).json(newSchedule);
    } catch (error) {
        console.error('Error creating project schedule:', error);
        res.status(500).json({ message: 'Error creating project schedule', error: error.message });
    }
});

/**
 * @route PUT /api/projects/projectscheduling/:id
 * @description Update an existing project schedule.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projectscheduling SET ? WHERE scheduleId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectscheduling WHERE scheduleId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project schedule not found' });
        }
    } catch (error) {
        console.error('Error updating project schedule:', error);
        res.status(500).json({ message: 'Error updating project schedule', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/projectscheduling/:id
 * @description Delete a project schedule.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectscheduling WHERE scheduleId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project schedule not found' });
        }
    } catch (error) {
        console.error('Error deleting project schedule:', error);
        res.status(500).json({ message: 'Error deleting project schedule', error: error.message });
    }
});

module.exports = router;
