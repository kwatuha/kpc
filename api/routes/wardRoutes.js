const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Routes for wards ---

/**
 * @route GET /api/wards/
 * @description Get all wards from the wards table.
 * Note: Wards can also be fetched by sub-county via /api/subcounties/:subcountyId/wards
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT wardId, name, subcountyId FROM wards');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching all wards:', error);
        res.status(500).json({ message: 'Error fetching all wards', error: error.message });
    }
});

module.exports = router;
