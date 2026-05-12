const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authenticate');
const privilege = require('../middleware/privilegeMiddleware');
// --- CRUD Operations for Project Warnings (projectwarnings) ---

/**
 * @route GET /api/projects/projectwarnings
 * @description Get all project warnings.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectwarnings');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project warnings:', error);
        res.status(500).json({ message: 'Error fetching project warnings', error: error.message });
    }
});

/**
 * @route GET /api/projects/projectwarnings/:id
 * @description Get a single project warning by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectwarnings WHERE warningId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project warning not found' });
        }
    } catch (error) {
        console.error('Error fetching project warning:', error);
        res.status(500).json({ message: 'Error fetching project warning', error: error.message });
    }
});

/**
 * @route POST /api/projects/projectwarnings
 * @description Create a new project warning.
 */
router.post('/', async (req, res) => {
    const newWarning = {
        warningId: req.body.warningId || `pw${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectwarnings SET ?', newWarning);
        if (result.insertId) {
            newWarning.warningId = result.insertId;
        }
        res.status(201).json(newWarning);
    } catch (error) {
        console.error('Error creating project warning:', error);
        res.status(500).json({ message: 'Error creating project warning', error: error.message });
    }
});

/**
 * @route PUT /api/projects/projectwarnings/:id
 * @description Update an existing project warning.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projectwarnings SET ? WHERE warningId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectwarnings WHERE warningId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project warning not found' });
        }
    } catch (error) {
        console.error('Error updating project warning:', error);
        res.status(500).json({ message: 'Error updating project warning', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/projectwarnings/:id
 * @description Delete a project warning.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectwarnings WHERE warningId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project warning not found' });
        }
    } catch (error) {
        console.error('Error deleting project warning:', error);
        res.status(500).json({ message: 'Error deleting project warning', error: error.message });
    }
});

module.exports = router;
