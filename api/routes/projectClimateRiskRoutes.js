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


// --- CRUD Operations for Project Climate and Disaster Risk Screening (project_climate_risk) ---
// One-to-many relationship with projects

/**
 * @route GET /api/projects/:projectId/climate-risk
 * @description Get all climate risk entries for a specific project.
 */
router.get('/:projectId/climate-risk', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_climate_risk WHERE projectId = ?', [projectId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching climate risks:', error);
        res.status(500).json({ message: 'Error fetching climate risks', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/climate-risk
 * @description Create a new climate risk entry for a project.
 */
router.post('/:projectId/climate-risk', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    // Check for uniqueness based on projectId and hazardName
    try {
        const [existing] = await pool.query('SELECT climateRiskId FROM project_climate_risk WHERE projectId = ? AND hazardName = ?', [projectId, clientData.hazardName]);
        if (existing.length > 0) {
            return res.status(409).json({ message: `Climate risk for '${clientData.hazardName}' already exists for this project. Use PUT to update.` });
        }

        const newClimateRisk = {
            projectId: projectId,
            hazardName: clientData.hazardName || null,
            hazardExposure: clientData.hazardExposure || null,
            vulnerability: clientData.vulnerability || null,
            riskLevel: clientData.riskLevel || null,
            riskReductionStrategies: clientData.riskReductionStrategies || null,
            riskReductionCosts: clientData.riskReductionCosts || null,
            resourcesRequired: clientData.resourcesRequired || null,
        };

        const [result] = await pool.query('INSERT INTO project_climate_risk SET ?', newClimateRisk);
        newClimateRisk.climateRiskId = result.insertId;
        res.status(201).json(newClimateRisk);
    } catch (error) {
        console.error('Error creating climate risk:', error);
        res.status(500).json({ message: 'Error creating climate risk', error: error.message });
    }
});

/**
 * @route PUT /api/projects/climate-risk/:climateRiskId
 * @description Update an existing climate risk entry.
 */
router.put('/climate-risk/:climateRiskId', async (req, res) => {
    const { climateRiskId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        hazardName: clientData.hazardName || null,
        hazardExposure: clientData.hazardExposure || null,
        vulnerability: clientData.vulnerability || null,
        riskLevel: clientData.riskLevel || null,
        riskReductionStrategies: clientData.riskReductionStrategies || null,
        riskReductionCosts: clientData.riskReductionCosts || null,
        resourcesRequired: clientData.resourcesRequired || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_climate_risk SET ? WHERE climateRiskId = ?', [updatedFields, climateRiskId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_climate_risk WHERE climateRiskId = ?', [climateRiskId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Climate risk not found.' });
        }
    } catch (error) {
        console.error('Error updating climate risk:', error);
        res.status(500).json({ message: 'Error updating climate risk', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/climate-risk/:climateRiskId
 * @description Delete a climate risk entry.
 */
router.delete('/climate-risk/:climateRiskId', async (req, res) => {
    const { climateRiskId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_climate_risk WHERE climateRiskId = ?', [climateRiskId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Climate risk not found.' });
        }
    } catch (error) {
        console.error('Error deleting climate risk:', error);
        res.status(500).json({ message: 'Error deleting climate risk', error: error.message });
    }
});

module.exports = router;
