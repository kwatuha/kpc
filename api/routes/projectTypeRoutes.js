const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Types (projecttypes) ---

/**
 * @route GET /api/projects/projecttypes
 * @description Get all project types.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projecttypes');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project types:', error);
        res.status(500).json({ message: 'Error fetching project types', error: error.message });
    }
});

/**
 * @route GET /api/projects/projecttypes/:id
 * @description Get a single project type by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projecttypes WHERE typeId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project type not found' });
        }
    } catch (error) {
        console.error('Error fetching project type:', error);
        res.status(500).json({ message: 'Error fetching project type', error: error.message });
    }
});

/**
 * @route POST /api/projects/projecttypes
 * @description Create a new project type.
 */
router.post('/', async (req, res) => {
    const newType = {
        typeId: req.body.typeId || `ptype${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projecttypes SET ?', newType);
        if (result.insertId) {
            newType.typeId = result.insertId;
        }
        res.status(201).json(newType);
    } catch (error) {
        console.error('Error creating project type:', error);
        res.status(500).json({ message: 'Error creating project type', error: error.message });
    }
});

/**
 * @route PUT /api/projects/projecttypes/:id
 * @description Update an existing project type.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projecttypes SET ? WHERE typeId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projecttypes WHERE typeId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project type not found' });
        }
    } catch (error) {
        console.error('Error updating project type:', error);
        res.status(500).json({ message: 'Error updating project type', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/projecttypes/:id
 * @description Delete a project type.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projecttypes WHERE typeId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project type not found' });
        }
    } catch (error) {
        console.error('Error deleting project type:', error);
        res.status(500).json({ message: 'Error deleting project type', error: error.message });
    }
});

module.exports = router;
