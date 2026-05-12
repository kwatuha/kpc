const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Routes for programs ---

/**
 * @route GET /api/programs/
 * @description Get all programs from the programs table.
 */
router.get('/', async (req, res) => {
    try {
        // Select strategyId as programId for consistency with API service suggestion
        const [rows] = await pool.query('SELECT strategyId AS programId, programme FROM programs');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ message: 'Error fetching programs', error: error.message });
    }
});

/**
 * @route GET /api/programs/:programId/subprograms
 * @description Get all sub-programs belonging to a specific program from the subprograms table.
 */
router.get('/:programId/subprograms', async (req, res) => {
    const { programId } = req.params;
    try {
        // Select subProgramId for consistency with API service suggestion
        const [rows] = await pool.query('SELECT subProgramId, subProgramme FROM subprograms WHERE strategyId = ?', [programId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching sub-programs for program ${programId}:`, error);
        res.status(500).json({ message: `Error fetching sub-programs for program ${programId}`, error: error.message });
    }
});

module.exports = router;
