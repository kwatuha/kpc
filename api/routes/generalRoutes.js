// routes/generalRoutes.js
const express = require('express');
const router = express.Router();
// Removed: const { mapKeysToCamelCase, mapKeysToSnakeCase } = require('../utils/fieldFormatter'); // No longer needed
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Attachments (attachments) ---

/**
 * @route GET /api/general/attachments
 * @description Get all attachments.
 */
router.get('/attachments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM attachments');
        res.status(200).json(rows); // Directly return rows, assuming DB now returns camelCase
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ message: 'Error fetching attachments', error: error.message });
    }
});

/**
 * @route GET /api/general/attachments/:id
 * @description Get a single attachment by ID.
 */
router.get('/attachments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM attachments WHERE attachmentId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Attachment not found' });
        }
    } catch (error) {
        console.error('Error fetching attachment:', error);
        res.status(500).json({ message: 'Error fetching attachment', error: error.message });
    }
});

/**
 * @route POST /api/general/attachments
 * @description Create a new attachment.
 */
router.post('/attachments', async (req, res) => {
    // Directly use req.body
    const newAttachment = {
        attachmentId: req.body.attachmentId || `att${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO attachments SET ?', newAttachment);
        if (result.insertId) {
            newAttachment.attachmentId = result.insertId;
        }
        res.status(201).json(newAttachment); // Return as is
    } catch (error) {
        console.error('Error creating attachment:', error);
        res.status(500).json({ message: 'Error creating attachment', error: error.message });
    }
});

/**
 * @route PUT /api/general/attachments/:id
 * @description Update an existing attachment.
 */
router.put('/attachments/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE attachments SET ? WHERE attachmentId = ?', [updatedFields, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM attachments WHERE attachmentId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]); // Return as is
        } else {
            res.status(404).json({ message: 'Attachment not found' });
        }
    } catch (error) {
        console.error('Error updating attachment:', error);
        res.status(500).json({ message: 'Error updating attachment', error: error.message });
    }
});

/**
 * @route DELETE /api/general/attachments/:id
 * @description Delete an attachment.
 */
router.delete('/attachments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM attachments WHERE attachmentId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Attachment not found' });
        }
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ message: 'Error deleting attachment', error: error.message });
    }
});

// --- CRUD Operations for Sent SMS Status (sentsmsstatus) ---

/**
 * @route GET /api/general/sent_sms_status
 * @description Get all sent SMS statuses.
 */
router.get('/sent_sms_status', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sentsmsstatus');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching sent SMS statuses:', error);
        res.status(500).json({ message: 'Error fetching sent SMS statuses', error: error.message });
    }
});

/**
 * @route GET /api/general/sent_sms_status/:id
 * @description Get a single sent SMS status by ID.
 */
router.get('/sent_sms_status/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM sentsmsstatus WHERE statusId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Sent SMS status not found' });
        }
    } catch (error) {
        console.error('Error fetching sent SMS status:', error);
        res.status(500).json({ message: 'Error fetching sent SMS status', error: error.message });
    }
});

/**
 * @route POST /api/general/sent_sms_status
 * @description Create a new sent SMS status.
 */
router.post('/sent_sms_status', async (req, res) => {
    const newSmsStatus = {
        statusId: req.body.statusId || `sms_stat${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO sentsmsstatus SET ?', newSmsStatus);
        if (result.insertId) {
            newSmsStatus.statusId = result.insertId;
        }
        res.status(201).json(newSmsStatus);
    } catch (error) {
        console.error('Error creating sent SMS status:', error);
        res.status(500).json({ message: 'Error creating sent SMS status', error: error.message });
    }
});

/**
 * @route PUT /api/general/sent_sms_status/:id
 * @description Update an existing sent SMS status.
 */
router.put('/sent_sms_status/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE sentsmsstatus SET ? WHERE statusId = ?', [updatedFields, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM sentsmsstatus WHERE statusId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Sent SMS status not found' });
        }
    } catch (error) {
        console.error('Error updating sent SMS status:', error);
        res.status(500).json({ message: 'Error updating sent SMS status', error: error.message });
    }
});

/**
 * @route DELETE /api/general/sent_sms_status/:id
 * @description Delete a sent SMS status.
 */
router.delete('/sent_sms_status/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM sentsmsstatus WHERE statusId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Sent SMS status not found' });
        }
    } catch (error) {
        console.error('Error deleting sent SMS status:', error);
        res.status(500).json({ message: 'Error deleting sent SMS status', error: error.message });
    }
});

module.exports = router;
