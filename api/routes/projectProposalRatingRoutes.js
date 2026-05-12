const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Proposal Ratings (projproposalratings) ---

/**
 * @route GET /api/projects/projproposalratings
 * @description Get all project proposal ratings.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projproposalratings');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project proposal ratings:', error);
        res.status(500).json({ message: 'Error fetching project proposal ratings', error: error.message });
    }
});

/**
 * @route GET /api/projects/projproposalratings/:id
 * @description Get a single project proposal rating by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projproposalratings WHERE proposalId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project proposal rating not found' });
        }
    } catch (error) {
        console.error('Error fetching project proposal rating:', error);
        res.status(500).json({ message: 'Error fetching project proposal rating', error: error.message });
    }
});

/**
 * @route POST /api/projects/projproposalratings
 * @description Create a new project proposal rating.
 */
router.post('/', async (req, res) => {
    const newRating = {
        proposalId: req.body.proposalId || `prp${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projproposalratings SET ?', newRating);
        if (result.insertId) {
            newRating.proposalId = result.insertId;
        }
        res.status(201).json(newRating);
    } catch (error) {
        console.error('Error creating project proposal rating:', error);
        res.status(500).json({ message: 'Error creating project proposal rating', error: error.message });
    }
});

/**
 * @route PUT /api/projects/projproposalratings/:id
 * @description Update an existing project proposal rating.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projproposalratings SET ? WHERE proposalId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projproposalratings WHERE proposalId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project proposal rating not found' });
        }
    } catch (error) {
        console.error('Error updating project proposal rating:', error);
        res.status(500).json({ message: 'Error updating project proposal rating', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/projproposalratings/:id
 * @description Delete a project proposal rating.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projproposalratings WHERE proposalId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project proposal rating not found' });
        }
    } catch (error) {
        console.error('Error deleting project proposal rating:', error);
        res.status(500).json({ message: 'Error deleting project proposal rating', error: error.message });
    }
});

module.exports = router;
