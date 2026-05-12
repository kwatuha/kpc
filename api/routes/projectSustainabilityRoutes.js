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


// --- CRUD Operations for Project Operational Sustainability (project_sustainability) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/sustainability
 * @description Get operational sustainability details for a specific project.
 */
router.get('/:projectId/sustainability', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_sustainability WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Sustainability details not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching sustainability details:', error);
        res.status(500).json({ message: 'Error fetching sustainability details', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/sustainability
 * @description Create new operational sustainability details for a project. (One-to-one)
 */
router.post('/:projectId/sustainability', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    try {
        const [existing] = await pool.query('SELECT sustainabilityId FROM project_sustainability WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Sustainability details already exist for this project. Use PUT to update.' });
        }

        const newSustainability = {
            projectId: projectId,
            description: clientData.description || null,
            owningOrganization: clientData.owningOrganization || null,
            hasAssetRegister: formatBooleanForMySQL(clientData.hasAssetRegister),
            technicalCapacityAdequacy: clientData.technicalCapacityAdequacy || null,
            managerialCapacityAdequacy: clientData.managerialCapacityAdequacy || null,
            financialCapacityAdequacy: clientData.financialCapacityAdequacy || null,
            avgAnnualPersonnelCost: clientData.avgAnnualPersonnelCost || null,
            annualOperationMaintenanceCost: clientData.annualOperationMaintenanceCost || null,
            otherOperatingCosts: clientData.otherOperatingCosts || null,
            revenueSources: clientData.revenueSources || null,
            operationalCostsCoveredByRevenue: formatBooleanForMySQL(clientData.operationalCostsCoveredByRevenue),
        };

        const [result] = await pool.query('INSERT INTO project_sustainability SET ?', newSustainability);
        newSustainability.sustainabilityId = result.insertId;
        res.status(201).json(newSustainability);
    } catch (error) {
        console.error('Error creating sustainability details:', error);
        res.status(500).json({ message: 'Error creating sustainability details', error: error.message });
    }
});

/**
 * @route PUT /api/projects/sustainability/:sustainabilityId
 * @description Update existing operational sustainability details.
 */
router.put('/sustainability/:sustainabilityId', async (req, res) => {
    const { sustainabilityId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        description: clientData.description || null,
        owningOrganization: clientData.owningOrganization || null,
        hasAssetRegister: formatBooleanForMySQL(clientData.hasAssetRegister),
        technicalCapacityAdequacy: clientData.technicalCapacityAdequacy || null,
        managerialCapacityAdequacy: clientData.managerialCapacityAdequacy || null,
        financialCapacityAdequacy: clientData.financialCapacityAdequacy || null,
        avgAnnualPersonnelCost: clientData.avgAnnualPersonnelCost || null,
        annualOperationMaintenanceCost: clientData.annualOperationMaintenanceCost || null,
        otherOperatingCosts: clientData.otherOperatingCosts || null,
        revenueSources: clientData.revenueSources || null,
        operationalCostsCoveredByRevenue: formatBooleanForMySQL(clientData.operationalCostsCoveredByRevenue),
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_sustainability SET ? WHERE sustainabilityId = ?', [updatedFields, sustainabilityId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_sustainability WHERE sustainabilityId = ?', [sustainabilityId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Sustainability details not found.' });
        }
    } catch (error) {
        console.error('Error updating sustainability details:', error);
        res.status(500).json({ message: 'Error updating sustainability details', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/sustainability/:sustainabilityId
 * @description Delete operational sustainability details.
 */
router.delete('/sustainability/:sustainabilityId', async (req, res) => {
    const { sustainabilityId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_sustainability WHERE sustainabilityId = ?', [sustainabilityId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Sustainability details not found.' });
        }
    } catch (error) {
        console.error('Error deleting sustainability details:', error);
        res.status(500).json({ message: 'Error deleting sustainability details', error: error.message });
    }
});

module.exports = router;
