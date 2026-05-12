// src/routes/metadata/sectionRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

// --- Sections CRUD ---

/**
 * @route GET /api/metadata/sections/
 * @description Get all sections that are not soft-deleted.
 * @access Public (can be protected by middleware)
 */
router.get('/', async (req, res) => {
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        let query;
        
        if (DB_TYPE === 'postgresql') {
            query = 'SELECT "sectionId", name, alias, "departmentId", "createdAt", "updatedAt", "userId" FROM sections WHERE voided = false';
        } else {
            query = 'SELECT sectionId, name, alias, departmentId, createdAt, updatedAt, userId FROM sections WHERE voided = 0';
        }
        
        const result = await pool.query(query);
        const rows = DB_TYPE === 'postgresql' ? result.rows : (Array.isArray(result) ? result[0] : result);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching all sections:', error);
        res.status(500).json({ message: 'Error fetching all sections', error: error.message });
    }
});

/**
 * @route POST /api/metadata/sections/
 * @description Create a new section.
 * @access Private (requires authentication and privilege)
 */
router.post('/', async (req, res) => {
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now
    const { departmentId, name, alias, location, address, contactPerson, phoneNumber, email, remarks } = req.body;

    if (!departmentId || !name) {
        return res.status(400).json({ message: 'Missing required fields: departmentId, name' });
    }

    try {
        const [result] = await pool.query(
            // CORRECTED: Ensure column count matches value count
            'INSERT INTO sections (departmentId, name, alias, location, address, contactPerson, phoneNumber, email, remarks, userId, voided) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
            [departmentId, name, alias, location, address, contactPerson, phoneNumber, email, remarks, userId]
        );
        res.status(201).json({ message: 'Section created successfully', sectionId: result.insertId });
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({ message: 'Error creating section', error: error.message });
    }
});

/**
 * @route PUT /api/metadata/sections/:sectionId
 * @description Update an existing section by sectionId.
 * @access Private (requires authentication and privilege)
 */
router.put('/:sectionId', async (req, res) => {
    const { sectionId } = req.params;
    const { name, alias, departmentId } = req.body;
    
    console.log(`Attempting to update section with ID: ${sectionId}`);
    console.log('Request body:', req.body);
    console.log('Extracted values:', { name, alias, departmentId });
    
    try {
        // First check if section exists and is not already voided
        const [existingSection] = await pool.query(
            'SELECT sectionId, name, voided FROM sections WHERE sectionId = ?',
            [sectionId]
        );

        if (existingSection.length === 0) {
            console.log(`Section with ID ${sectionId} not found`);
            return res.status(404).json({ message: 'Section not found' });
        }

        if (existingSection[0].voided === 1) {
            console.log(`Section ${existingSection[0].name} is already deleted`);
            return res.status(404).json({ message: 'Section is already deleted' });
        }

        // Perform update
        console.log('SQL update values:', { name, alias, sectionId });
        const [result] = await pool.query(
            'UPDATE sections SET name = ?, alias = ?, updatedAt = CURRENT_TIMESTAMP WHERE sectionId = ? AND voided = 0',
            [name, alias, sectionId]
        );

        console.log(`Update result: ${result.affectedRows} rows affected`);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Section not found or already deleted' });
        }

        // Verify the update by fetching the updated section
        const [updatedSection] = await pool.query(
            'SELECT sectionId, name, alias FROM sections WHERE sectionId = ?',
            [sectionId]
        );
        console.log('Updated section data:', updatedSection[0]);

        res.status(200).json({ 
            message: 'Section updated successfully',
            sectionId: sectionId,
            affectedRows: result.affectedRows,
            updatedData: updatedSection[0]
        });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ message: 'Error updating section', error: error.message });
    }
});

/**
 * @route DELETE /api/metadata/sections/:sectionId
 * @description Soft delete a section by sectionId.
 * @access Private (requires authentication and privilege)
 */
router.delete('/:sectionId', async (req, res) => {
    const { sectionId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    try {
        const [result] = await pool.query(
            'UPDATE sections SET voided = 1, voidedBy = ? WHERE sectionId = ? AND voided = 0',
            [userId, sectionId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Section not found or already deleted' });
        }
        res.status(200).json({ message: 'Section soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ message: 'Error deleting section', error: error.message });
    }
});

module.exports = router;