// src/routes/metadata/subProgramRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Correct path for the new folder structure

// --- Sub-Programs CRUD ---

/**
 * @route GET /api/metadata/subprograms/
 * @description Get all sub-programs that are not soft-deleted.
 * @access Public (can be protected by middleware)
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT subProgramId, subProgramme, programId, createdAt, updatedAt, userId FROM subprograms WHERE voided = 0');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching sub-programs:', error);
        res.status(500).json({ message: 'Error fetching sub-programs', error: error.message });
    }
});

/**
 * @route GET /api/metadata/subprograms/:subProgramId
 * @description Get a single sub-program by ID.
 * @access Public (can be protected by middleware)
 */
router.get('/:subProgramId', async (req, res) => {
    const { subProgramId } = req.params;
    try {
        const [rows] = await pool.query('SELECT subProgramId, subProgramme, programId, createdAt, updatedAt, userId FROM subprograms WHERE subProgramId = ? AND voided = 0', [subProgramId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Sub-program not found' });
        }
    } catch (error) {
        console.error('Error fetching sub-program:', error);
        res.status(500).json({ message: 'Error fetching sub-program', error: error.message });
    }
});

/**
 * @route POST /api/metadata/subprograms/
 * @description Create a new sub-program.
 * @access Private (requires authentication and privilege)
 */
router.post('/', async (req, res) => {
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now
    const { programId, subProgramme, remarks } = req.body;

    if (!programId || !subProgramme) {
        return res.status(400).json({ message: 'Missing required fields: programId, subProgramme' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO subprograms (programId, subProgramme, remarks, userId) VALUES (?, ?, ?, ?)',
            [programId, subProgramme, remarks, userId]
        );
        res.status(201).json({ message: 'Sub-program created successfully', subProgramId: result.insertId });
    } catch (error) {
        console.error('Error creating sub-program:', error);
        res.status(500).json({ message: 'Error creating sub-program', error: error.message });
    }
});

/**
 * @route PUT /api/metadata/subprograms/:subProgramId
 * @description Update an existing sub-program by subProgramId.
 * @access Private (requires authentication and privilege)
 */
router.put('/:subProgramId', async (req, res) => {
    const { subProgramId } = req.params;
    const { programId, subProgramme, remarks } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE subprograms SET programId = ?, subProgramme = ?, remarks = ?, updatedAt = CURRENT_TIMESTAMP WHERE subProgramId = ? AND voided = 0',
            [programId, subProgramme, remarks, subProgramId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-program not found or already deleted' });
        }
        res.status(200).json({ message: 'Sub-program updated successfully' });
    } catch (error) {
        console.error('Error updating sub-program:', error);
        res.status(500).json({ message: 'Error updating sub-program', error: error.message });
    }
});

/**
 * @route DELETE /api/metadata/subprograms/:subProgramId
 * @description Soft delete a sub-program by subProgramId.
 * @access Private (requires authentication and privilege)
 */
router.delete('/:subProgramId', async (req, res) => {
    const { subProgramId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    try {
        const [result] = await pool.query(
            'UPDATE subprograms SET voided = 1, voidedBy = ? WHERE subProgramId = ? AND voided = 0',
            [userId, subProgramId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-program not found or already deleted' });
        }
        res.status(200).json({ message: 'Sub-program soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting sub-program:', error);
        res.status(500).json({ message: 'Error deleting sub-program', error: error.message });
    }
});

module.exports = router;