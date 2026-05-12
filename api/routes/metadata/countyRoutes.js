// src/routes/metadata/countyRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Correct path for the new folder structure

// --- Counties CRUD ---

/**
 * @route GET /api/metadata/counties/
 * @description Get all counties that are not soft-deleted.
 * @access Public (can be protected by middleware)
 */
router.get('/', async (req, res) => {
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        
        if (DB_TYPE === 'postgresql') {
            // PostgreSQL: Use quoted column names to preserve case
            query = 'SELECT "countyId", name, "geoLat", "geoLon", "createdAt", "updatedAt", "userId" FROM counties WHERE voided = false';
        } else {
            // MySQL: Use camelCase column names
            query = 'SELECT countyId, name, geoLat, geoLon, createdAt, updatedAt, userId FROM counties WHERE voided = 0';
        }
        
        const result = await pool.query(query);
        const rows = DB_TYPE === 'postgresql' ? result.rows : (Array.isArray(result) ? result[0] : result);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching counties:', error);
        res.status(500).json({ message: 'Error fetching counties', error: error.message });
    }
});

/**
 * @route GET /api/metadata/counties/:countyId
 * @description Get a single county by ID.
 * @access Public (can be protected by middleware)
 */
router.get('/:countyId', async (req, res) => {
    const { countyId } = req.params;
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        let params;
        
        if (DB_TYPE === 'postgresql') {
            query = 'SELECT "countyId", name, "geoLat", "geoLon", "createdAt", "updatedAt", "userId" FROM counties WHERE "countyId" = $1 AND voided = false';
            params = [countyId];
        } else {
            query = 'SELECT countyId, name, geoLat, geoLon, createdAt, updatedAt, userId FROM counties WHERE countyId = ? AND voided = 0';
            params = [countyId];
        }
        
        const result = await pool.query(query, params);
        const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
        
        if (Array.isArray(rows) ? rows.length > 0 : rows) {
            res.status(200).json(Array.isArray(rows) ? rows[0] : rows);
        } else {
            res.status(404).json({ message: 'County not found' });
        }
    } catch (error) {
        console.error('Error fetching county:', error);
        res.status(500).json({ message: 'Error fetching county', error: error.message });
    }
});

/**
 * @route POST /api/metadata/counties/
 * @description Create a new county.
 * @access Private (requires authentication and privilege)
 */
router.post('/', async (req, res) => {
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now
    const { name, geoLat, geoLon, remarks } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Missing required field: name' });
    }

    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        let params;
        
        if (DB_TYPE === 'postgresql') {
            query = 'INSERT INTO counties (name, "geoLat", "geoLon", remarks, "userId") VALUES ($1, $2, $3, $4, $5) RETURNING "countyId"';
            params = [name, geoLat || null, geoLon || null, remarks || null, userId];
        } else {
            query = 'INSERT INTO counties (name, geoLat, geoLon, remarks, userId) VALUES (?, ?, ?, ?, ?)';
            params = [name, geoLat, geoLon, remarks, userId];
        }
        
        const result = await pool.query(query, params);
        const countyId = DB_TYPE === 'postgresql' ? (result.rows?.[0]?.countyId || result.rows?.[0]?.countyid) : result.insertId;
        res.status(201).json({ message: 'County created successfully', countyId });
    } catch (error) {
        console.error('Error creating county:', error);
        res.status(500).json({ message: 'Error creating county', error: error.message });
    }
});

/**
 * @route PUT /api/metadata/counties/:countyId
 * @description Update an existing county by countyId.
 * @access Private (requires authentication and privilege)
 */
router.put('/:countyId', async (req, res) => {
    const { countyId } = req.params;
    const { name, geoLat, geoLon, remarks } = req.body;

    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        let params;
        
        if (DB_TYPE === 'postgresql') {
            query = 'UPDATE counties SET name = $1, "geoLat" = $2, "geoLon" = $3, remarks = $4, "updatedAt" = CURRENT_TIMESTAMP WHERE "countyId" = $5 AND voided = false RETURNING "countyId"';
            params = [name, geoLat || null, geoLon || null, remarks || null, countyId];
        } else {
            query = 'UPDATE counties SET name = ?, geoLat = ?, geoLon = ?, remarks = ?, updatedAt = CURRENT_TIMESTAMP WHERE countyId = ? AND voided = 0';
            params = [name, geoLat, geoLon, remarks, countyId];
        }
        
        const result = await pool.query(query, params);
        const affectedRows = DB_TYPE === 'postgresql' ? (result.rows?.length || 0) : result.affectedRows;
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'County not found or already deleted' });
        }
        res.status(200).json({ message: 'County updated successfully' });
    } catch (error) {
        console.error('Error updating county:', error);
        res.status(500).json({ message: 'Error updating county', error: error.message });
    }
});

/**
 * @route DELETE /api/metadata/counties/:countyId
 * @description Soft delete a county by countyId.
 * @access Private (requires authentication and privilege)
 */
router.delete('/:countyId', async (req, res) => {
    const { countyId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        let params;
        
        if (DB_TYPE === 'postgresql') {
            query = 'UPDATE counties SET voided = true, "voidedBy" = $1 WHERE "countyId" = $2 AND voided = false RETURNING "countyId"';
            params = [userId, countyId];
        } else {
            query = 'UPDATE counties SET voided = 1, voidedBy = ? WHERE countyId = ? AND voided = 0';
            params = [userId, countyId];
        }
        
        const result = await pool.query(query, params);
        const affectedRows = DB_TYPE === 'postgresql' ? (result.rows?.length || 0) : result.affectedRows;
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'County not found or already deleted' });
        }
        res.status(200).json({ message: 'County soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting county:', error);
        res.status(500).json({ message: 'Error deleting county', error: error.message });
    }
});

// --- Hierarchical Routes ---

/**
 * @route GET /api/metadata/counties/:countyId/subcounties
 * @description Get all sub-counties belonging to a specific county.
 * @access Public (can be protected by middleware)
 */
router.get('/:countyId/subcounties', async (req, res) => {
    const { countyId } = req.params;
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        let params;
        
        if (DB_TYPE === 'postgresql') {
            query = 'SELECT "subcountyId", name, "geoLat", "geoLon" FROM subcounties WHERE "countyId" = $1 AND voided = false';
            params = [countyId];
        } else {
            query = 'SELECT subcountyId, name, geoLat, geoLon FROM subcounties WHERE countyId = ? AND voided = 0';
            params = [countyId];
        }
        
        const result = await pool.query(query, params);
        const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
        res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching sub-counties for county ${countyId}:`, error);
        res.status(500).json({ message: `Error fetching sub-counties for county ${countyId}`, error: error.message });
    }
});

module.exports = router;