const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Attachments (projectattachments) ---

/**
 * @route GET /api/projects/project_attachments
 * @description Get all project attachments.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectattachments');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project attachments:', error);
        res.status(500).json({ message: 'Error fetching project attachments', error: error.message });
    }
});

/**
 * @route GET /api/projects/project_attachments/:id
 * @description Get a single project attachment by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectattachments WHERE attachmentId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project attachment not found' });
        }
    } catch (error) {
        console.error('Error fetching project attachment:', error);
        res.status(500).json({ message: 'Error fetching project attachment', error: error.message });
    }
});

/**
 * @route POST /api/projects/project_attachments
 * @description Create a new project attachment.
 */
router.post('/', async (req, res) => {
    const newAttachment = {
        attachmentId: req.body.attachmentId || `pa_att${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectattachments SET ?', newAttachment);
        if (result.insertId) {
            newAttachment.attachmentId = result.insertId;
        }
        res.status(201).json(newAttachment);
    } catch (error) {
        console.error('Error creating project attachment:', error);
        res.status(500).json({ message: 'Error creating project attachment', error: error.message });
    }
});

/**
 * @route PUT /api/projects/project_attachments/:id
 * @description Update an existing project attachment.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projectattachments SET ? WHERE attachmentId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectattachments WHERE attachmentId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project attachment not found' });
        }
    } catch (error) {
        console.error('Error updating project attachment:', error);
        res.status(500).json({ message: 'Error updating project attachment', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/project_attachments/:id
 * @description Delete a project attachment.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectattachments WHERE attachmentId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project attachment not found' });
        }
    } catch (error) {
        console.error('Error deleting project attachment:', error);
        res.status(500).json({ message: 'Error deleting project attachment', error: error.message });
    }
});

module.exports = router;
