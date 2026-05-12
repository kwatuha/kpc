const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Payments (projectpayments) ---

/**
 * @route GET /api/projects/project_payments
 * @description Get all project payments.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectpayments');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project payments:', error);
        res.status(500).json({ message: 'Error fetching project payments', error: error.message });
    }
});

/**
 * @route GET /api/projects/project_payments/:id
 * @description Get a single project payment by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectpayments WHERE paymentId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project payment not found' });
        }
    } catch (error) {
        console.error('Error fetching project payment:', error);
        res.status(500).json({ message: 'Error fetching project payment', error: error.message });
    }
});

/**
 * @route POST /api/projects/project_payments
 * @description Create a new project payment.
 */
router.post('/', async (req, res) => {
    const newPayment = {
        paymentId: req.body.paymentId || `ppay${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectpayments SET ?', newPayment);
        if (result.insertId) {
            newPayment.paymentId = result.insertId;
        }
        res.status(201).json(newPayment);
    } catch (error) {
        console.error('Error creating project payment:', error);
        res.status(500).json({ message: 'Error creating project payment', error: error.message });
    }
});

/**
 * @route PUT /api/projects/project_payments/:id
 * @description Update an existing project payment.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projectpayments SET ? WHERE paymentId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectpayments WHERE paymentId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project payment not found' });
        }
    } catch (error) {
        console.error('Error updating project payment:', error);
        res.status(500).json({ message: 'Error updating project payment', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/project_payments/:id
 * @description Delete a project payment.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectpayments WHERE paymentId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project payment not found' });
        }
    } catch (error) {
        console.error('Error deleting project payment:', error);
        res.status(500).json({ message: 'Error deleting project payment', error: error.message });
    }
});

module.exports = router;
