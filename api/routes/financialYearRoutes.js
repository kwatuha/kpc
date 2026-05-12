const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Routes for financialyears ---

/**
 * @route GET /api/financialyears/
 * @description Get all financial years from the financialyears table.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT finYearId, finYearName FROM financialyears');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching financial years:', error);
        res.status(500).json({ message: 'Error fetching financial years', error: error.message });
    }
});

module.exports = router;
