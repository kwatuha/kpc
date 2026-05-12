const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Routes for departments ---

/**
 * @route GET /api/departments/
 * @description Get all departments from the departments table.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT departmentId, name FROM departments');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
});

/**
 * @route GET /api/departments/:departmentId/sections
 * @description Get all sections belonging to a specific department from the sections table.
 */
router.get('/:departmentId/sections', async (req, res) => {
    const { departmentId } = req.params;
    try {
        const [rows] = await pool.query('SELECT sectionId, name, alias FROM sections WHERE departmentId = ?', [departmentId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching sections for department ${departmentId}:`, error);
        res.status(500).json({ message: `Error fetching sections for department ${departmentId}`, error: error.message });
    }
});

module.exports = router;
