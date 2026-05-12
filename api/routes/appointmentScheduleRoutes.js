const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Appointment Schedules (appointmentschedule) ---

/**
 * @route GET /api/projects/appointmentschedules
 * @description Get all appointment schedules.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM appointmentschedule');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching appointment schedules:', error);
        res.status(500).json({ message: 'Error fetching appointment schedules', error: error.message });
    }
});

/**
 * @route GET /api/projects/appointmentschedules/:id
 * @description Get a single appointment schedule by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM appointmentschedule WHERE taskId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Appointment schedule not found' });
        }
    } catch (error) {
        console.error('Error fetching appointment schedule:', error);
        res.status(500).json({ message: 'Error fetching appointment schedule', error: error.message });
    }
});

/**
 * @route POST /api/projects/appointmentschedules
 * @description Create a new appointment schedule.
 */
router.post('/', async (req, res) => {
    const newAppSchedule = {
        taskId: req.body.taskId || `app${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO appointmentschedule SET ?', newAppSchedule);
        if (result.insertId) {
            newAppSchedule.taskId = result.insertId;
        }
        res.status(201).json(newAppSchedule);
    } catch (error) {
        console.error('Error creating appointment schedule:', error);
        res.status(500).json({ message: 'Error creating appointment schedule', error: error.message });
    }
});

/**
 * @route PUT /api/projects/appointmentschedules/:id
 * @description Update an existing appointment schedule.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE appointmentschedule SET ? WHERE taskId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM appointmentschedule WHERE taskId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Appointment schedule not found' });
        }
    } catch (error) {
        console.error('Error updating appointment schedule:', error);
        res.status(500).json({ message: 'Error updating appointment schedule', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/appointmentschedules/:id
 * @description Delete an appointment schedule.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM appointmentschedule WHERE taskId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Appointment schedule not found' });
        }
    } catch (error) {
        console.error('Error deleting appointment schedule:', error);
        res.status(500).json({ message: 'Error deleting appointment schedule', error: error.message });
    }
});

module.exports = router;
