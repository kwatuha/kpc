const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Feedback (projectfeedback) ---

/**
 * @route GET /api/projects/project_feedback
 * @description Get all project feedback.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectfeedback');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project feedback:', error);
        res.status(500).json({ message: 'Error fetching project feedback', error: error.message });
    }
});

/**
 * @route GET /api/projects/project_feedback/:id
 * @description Get a single project feedback by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectfeedback WHERE feedbackId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project feedback not found' });
        }
    } catch (error) {
        console.error('Error fetching project feedback:', error);
        res.status(500).json({ message: 'Error fetching project feedback', error: error.message });
    }
});

/**
 * @route POST /api/projects/project_feedback
 * @description Create new project feedback.
 */
router.post('/', async (req, res) => {
    const newFeedback = {
        feedbackId: req.body.feedbackId || `pfb${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        voidedAt: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectfeedback SET ?', newFeedback);
        if (result.insertId) {
            newFeedback.feedbackId = result.insertId;
        }
        res.status(201).json(newFeedback);
    } catch (error) {
        console.error('Error creating project feedback:', error);
        res.status(500).json({ message: 'Error creating project feedback', error: error.message });
    }
});

/**
 * @route PUT /api/projects/project_feedback/:id
 * @description Update existing project feedback.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body, updatedAt: new Date() };
    try {
        const [result] = await pool.query('UPDATE projectfeedback SET ? WHERE feedbackId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectfeedback WHERE feedbackId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project feedback not found' });
        }
    } catch (error) {
        console.error('Error updating project feedback:', error);
        res.status(500).json({ message: 'Error updating project feedback', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/project_feedback/:id
 * @description Delete project feedback.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectfeedback WHERE feedbackId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project feedback not found' });
        }
    } catch (error) {
        console.error('Error deleting project feedback:', error);
        res.status(500).json({ message: 'Error deleting project feedback', error: error.message });
    }
});

module.exports = router;
