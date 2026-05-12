const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../config/db'); // Import the database connection pool

// --- Project Contractor Assignment API Calls (project_contractor_assignments) ---

/**
 * @route GET /api/projects/:projectId/assignments
 * @description Get all contractors assigned to a specific project.
 * @access Private
 */
router.get('/', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT c.contractorId, c.companyName, c.contactPerson, c.email, c.phone
             FROM contractors c
             JOIN project_contractor_assignments pca ON c.contractorId = pca.contractorId
             WHERE pca.projectId = ? AND (pca.voided IS NULL OR pca.voided = 0) AND (c.voided IS NULL OR c.voided = 0)`,
            [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractors for project:', error);
        res.status(500).json({ message: 'Error fetching contractors for project', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/assignments
 * @description Assign a contractor to a project.
 * @access Private
 */
router.post('/', async (req, res) => {
    const { projectId } = req.params;
    const { contractorId } = req.body;
    
    if (!contractorId) {
        return res.status(400).json({ message: 'Contractor ID is required.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO project_contractor_assignments (projectId, contractorId) VALUES (?, ?)',
            [projectId, contractorId]
        );
        res.status(201).json({ message: 'Contractor assigned to project successfully.', assignmentId: result.insertId });
    } catch (error) {
        console.error('Error assigning contractor to project:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'This contractor is already assigned to this project.' });
        }
        res.status(500).json({ message: 'Error assigning contractor to project', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/:projectId/assignments/:contractorId
 * @description Remove a contractor's assignment from a project.
 * @access Private
 */
router.delete('/:contractorId', async (req, res) => {
    const { projectId, contractorId } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM project_contractor_assignments WHERE projectId = ? AND contractorId = ?',
            [projectId, contractorId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error removing contractor assignment:', error);
        res.status(500).json({ message: 'Error removing contractor assignment', error: error.message });
    }
});

module.exports = router;