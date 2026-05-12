// src/routes/metadata/subcountyRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Correct path for the new folder structure

// --- Sub-Counties CRUD ---

/**
 * @route GET /api/metadata/subcounties/
 * @description Get all sub-counties that are not soft-deleted.
 * @access Public (can be protected by middleware)
 */
router.get('/', async (req, res) => {
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        
        if (DB_TYPE === 'postgresql') {
            query = 'SELECT "subcountyId", name, "countyId", "geoLat", "geoLon", "createdAt", "updatedAt", "userId" FROM subcounties WHERE voided = false';
        } else {
            query = 'SELECT subcountyId, name, countyId, geoLat, geoLon, createdAt, updatedAt, userId FROM subcounties WHERE voided = 0';
        }
        
        const result = await pool.query(query);
        const rows = DB_TYPE === 'postgresql' ? result.rows : (Array.isArray(result) ? result[0] : result);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching sub-counties:', error);
        res.status(500).json({ message: 'Error fetching sub-counties', error: error.message });
    }
});

/**
 * @route GET /api/metadata/subcounties/:subcountyId
 * @description Get a single sub-county by ID.
 * @access Public (can be protected by middleware)
 */
router.get('/:subcountyId', async (req, res) => {
    const { subcountyId } = req.params;
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        let params;
        
        if (DB_TYPE === 'postgresql') {
            query = 'SELECT "subcountyId", name, "countyId", "geoLat", "geoLon", "createdAt", "updatedAt", "userId" FROM subcounties WHERE "subcountyId" = $1 AND voided = false';
            params = [subcountyId];
        } else {
            query = 'SELECT subcountyId, name, countyId, geoLat, geoLon, createdAt, updatedAt, userId FROM subcounties WHERE subcountyId = ? AND voided = 0';
            params = [subcountyId];
        }
        
        const result = await pool.query(query, params);
        const rows = DB_TYPE === 'postgresql' ? result.rows : (Array.isArray(result) ? result[0] : result);
        const rowArray = Array.isArray(rows) ? rows : [rows];
        
        if (rowArray.length > 0) {
            res.status(200).json(rowArray[0]);
        } else {
            res.status(404).json({ message: 'Sub-county not found' });
        }
    } catch (error) {
        console.error('Error fetching sub-county:', error);
        res.status(500).json({ message: 'Error fetching sub-county', error: error.message });
    }
});

/**
 * @route POST /api/metadata/subcounties/
 * @description Create a new sub-county.
 * @access Private (requires authentication and privilege)
 */
router.post('/', async (req, res) => {
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now
    const { name, countyId, geoLat, geoLon } = req.body;

    if (!name || !countyId) {
        return res.status(400).json({ message: 'Missing required fields: name, countyId' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO subcounties (name, countyId, geoLat, geoLon, userId, voided) VALUES (?, ?, ?, ?, ?, 0)',
            [name, countyId, geoLat, geoLon, userId]
        );
        res.status(201).json({ message: 'Sub-county created successfully', subcountyId: result.insertId });
    } catch (error) {
        console.error('Error creating sub-county:', error);
        res.status(500).json({ message: 'Error creating sub-county', error: error.message });
    }
});

/**
 * @route PUT /api/metadata/subcounties/:subcountyId
 * @description Update an existing sub-county by subcountyId.
 * @access Private (requires authentication and privilege)
 */
router.put('/:subcountyId', async (req, res) => {
    const { subcountyId } = req.params;
    const { name, countyId, geoLat, geoLon } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE subcounties SET name = ?, countyId = ?, geoLat = ?, geoLon = ?, updatedAt = CURRENT_TIMESTAMP WHERE subcountyId = ? AND voided = 0',
            [name, countyId, geoLat, geoLon, subcountyId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-county not found or already deleted' });
        }
        res.status(200).json({ message: 'Sub-county updated successfully' });
    } catch (error) {
        console.error('Error updating sub-county:', error);
        res.status(500).json({ message: 'Error updating sub-county', error: error.message });
    }
});

/**
 * @route DELETE /api/metadata/subcounties/:subcountyId
 * @description Soft delete a sub-county by subcountyId.
 * @access Private (requires authentication and privilege)
 */
router.delete('/:subcountyId', async (req, res) => {
    const { subcountyId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    try {
        const [result] = await pool.query(
            'UPDATE subcounties SET voided = 1, voidedBy = ? WHERE subcountyId = ? AND voided = 0',
            [userId, subcountyId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-county not found or already deleted' });
        }
        res.status(200).json({ message: 'Sub-county soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting sub-county:', error);
        res.status(500).json({ message: 'Error deleting sub-county', error: error.message });
    }
});

// --- Hierarchical Routes ---

/**
 * @route GET /api/metadata/subcounties/:subcountyId/wards
 * @description Get all wards belonging to a specific sub-county.
 * @access Public (can be protected by middleware)
 */
router.get('/:subcountyId/wards', async (req, res) => {
    const { subcountyId } = req.params;
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        let params;
        
        if (DB_TYPE === 'postgresql') {
            query = 'SELECT "wardId", name, "geoLat", "geoLon" FROM wards WHERE "subcountyId" = $1 AND voided = false';
            params = [subcountyId];
        } else {
            query = 'SELECT wardId, name, geoLat, geoLon FROM wards WHERE subcountyId = ? AND voided = 0';
            params = [subcountyId];
        }
        
        const result = await pool.query(query, params);
        const rows = DB_TYPE === 'postgresql' ? result.rows : (Array.isArray(result) ? result[0] : result);
        res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching wards for sub-county ${subcountyId}:`, error);
        res.status(500).json({ message: `Error fetching wards for sub-county ${subcountyId}`, error: error.message });
    }
});

module.exports = router;