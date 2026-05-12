const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Helper Functions (copy from a centralized file if available) ---
const formatToMySQLDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        console.warn('Invalid date provided to formatToMySQLDateTime:', date);
        return null;
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatBooleanForMySQL = (value) => {
    if (value === true) return 1;
    if (value === false) return 0;
    return null;
};


// --- CRUD Operations for Project Hazard Assessment (project_hazard_assessment) ---
// One-to-many relationship with projects

/**
 * @route GET /api/projects/:projectId/hazard-assessment
 * @description Get all hazard assessments for a specific project.
 */
router.get('/:projectId/hazard-assessment', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_hazard_assessment WHERE projectId = ?', [projectId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching hazard assessments:', error);
        res.status(500).json({ message: 'Error fetching hazard assessments', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/hazard-assessment
 * @description Create a new hazard assessment entry for a project.
 */
router.post('/:projectId/hazard-assessment', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    // Check for uniqueness based on projectId and hazardName
    try {
        const [existing] = await pool.query('SELECT hazardId FROM project_hazard_assessment WHERE projectId = ? AND hazardName = ?', [projectId, clientData.hazardName]);
        if (existing.length > 0) {
            return res.status(409).json({ message: `Hazard assessment for '${clientData.hazardName}' already exists for this project. Use PUT to update.` });
        }

        const newHazardAssessment = {
            projectId: projectId,
            hazardName: clientData.hazardName || null,
            question: clientData.question || null,
            answerYesNo: formatBooleanForMySQL(clientData.answerYesNo),
            remarks: clientData.remarks || null,
        };

        const [result] = await pool.query('INSERT INTO project_hazard_assessment SET ?', newHazardAssessment);
        newHazardAssessment.hazardId = result.insertId;
        res.status(201).json(newHazardAssessment);
    } catch (error) {
        console.error('Error creating hazard assessment:', error);
        res.status(500).json({ message: 'Error creating hazard assessment', error: error.message });
    }
});

/**
 * @route PUT /api/projects/hazard-assessment/:hazardId
 * @description Update an existing hazard assessment entry.
 */
router.put('/hazard-assessment/:hazardId', async (req, res) => {
    const { hazardId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        hazardName: clientData.hazardName || null,
        question: clientData.question || null,
        answerYesNo: formatBooleanForMySQL(clientData.answerYesNo),
        remarks: clientData.remarks || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_hazard_assessment SET ? WHERE hazardId = ?', [updatedFields, hazardId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_hazard_assessment WHERE hazardId = ?', [hazardId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Hazard assessment not found.' });
        }
    } catch (error) {
        console.error('Error updating hazard assessment:', error);
        res.status(500).json({ message: 'Error updating hazard assessment', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/hazard-assessment/:hazardId
 * @description Delete a hazard assessment entry.
 */
router.delete('/hazard-assessment/:hazardId', async (req, res) => {
    const { hazardId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_hazard_assessment WHERE hazardId = ?', [hazardId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Hazard assessment not found.' });
        }
    } catch (error) {
        console.error('Error deleting hazard assessment:', error);
        res.status(500).json({ message: 'Error deleting hazard assessment', error: error.message });
    }
});

module.exports = router;
