const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Helper Functions (copy from projectRoutes.js or centralize) ---
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

// --- Helper Function: Convert Boolean to tinyint(1) for MySQL ---
const formatBooleanForMySQL = (value) => {
    if (value === true) return 1;
    if (value === false) return 0;
    return null; // Or handle as needed for undefined/null
};

// --- CRUD Operations for Project Needs Assessment (project_needs_assessment) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/needs-assessment
 * @description Get needs assessment for a specific project.
 */
router.get('/:projectId/needs-assessment', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_needs_assessment WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Needs assessment not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching needs assessment:', error);
        res.status(500).json({ message: 'Error fetching needs assessment', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/needs-assessment
 * @description Create a new needs assessment for a project. (One-to-one)
 */
router.post('/:projectId/needs-assessment', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    try {
        const [existing] = await pool.query('SELECT needsAssessmentId FROM project_needs_assessment WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Needs assessment already exists for this project. Use PUT to update.' });
        }

        const newNeedsAssessment = {
            projectId: projectId,
            targetBeneficiaries: clientData.targetBeneficiaries || null,
            estimateEndUsers: clientData.estimateEndUsers || null,
            physicalDemandCompletion: clientData.physicalDemandCompletion || null,
            proposedPhysicalCapacity: clientData.proposedPhysicalCapacity || null,
            mainBenefitsAsset: clientData.mainBenefitsAsset || null,
            significantExternalBenefitsNegativeEffects: clientData.significantExternalBenefitsNegativeEffects || null,
            significantDifferencesBenefitsAlternatives: clientData.significantDifferencesBenefitsAlternatives || null,
        };

        const [result] = await pool.query('INSERT INTO project_needs_assessment SET ?', newNeedsAssessment);
        newNeedsAssessment.needsAssessmentId = result.insertId;
        res.status(201).json(newNeedsAssessment);
    } catch (error) {
        console.error('Error creating needs assessment:', error);
        res.status(500).json({ message: 'Error creating needs assessment', error: error.message });
    }
});

/**
 * @route PUT /api/projects/needs-assessment/:needsAssessmentId
 * @description Update an existing needs assessment.
 */
router.put('/needs-assessment/:needsAssessmentId', async (req, res) => {
    const { needsAssessmentId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        targetBeneficiaries: clientData.targetBeneficiaries || null,
        estimateEndUsers: clientData.estimateEndUsers || null,
        physicalDemandCompletion: clientData.physicalDemandCompletion || null,
        proposedPhysicalCapacity: clientData.proposedPhysicalCapacity || null,
        mainBenefitsAsset: clientData.mainBenefitsAsset || null,
        significantExternalBenefitsNegativeEffects: clientData.significantExternalBenefitsNegativeEffects || null,
        significantDifferencesBenefitsAlternatives: clientData.significantDifferencesBenefitsAlternatives || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_needs_assessment SET ? WHERE needsAssessmentId = ?', [updatedFields, needsAssessmentId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_needs_assessment WHERE needsAssessmentId = ?', [needsAssessmentId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Needs assessment not found.' });
        }
    } catch (error) {
        console.error('Error updating needs assessment:', error);
        res.status(500).json({ message: 'Error updating needs assessment', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/needs-assessment/:needsAssessmentId
 * @description Delete a needs assessment.
 */
router.delete('/needs-assessment/:needsAssessmentId', async (req, res) => {
    const { needsAssessmentId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_needs_assessment WHERE needsAssessmentId = ?', [needsAssessmentId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Needs assessment not found.' });
        }
    } catch (error) {
        console.error('Error deleting needs assessment:', error);
        res.status(500).json({ message: 'Error deleting needs assessment', error: error.message });
    }
});

module.exports = router;
