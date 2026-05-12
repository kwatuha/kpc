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


// --- CRUD Operations for Project Financial Information (project_financials) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/financials
 * @description Get financial information for a specific project.
 */
router.get('/:projectId/financials', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_financials WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Financial information not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching financial information:', error);
        res.status(500).json({ message: 'Error fetching financial information', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/financials
 * @description Create new financial information for a project. (One-to-one)
 */
router.post('/:projectId/financials', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    try {
        const [existing] = await pool.query('SELECT financialsId FROM project_financials WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Financial information already exists for this project. Use PUT to update.' });
        }

        const newFinancials = {
            projectId: projectId,
            capitalCostConsultancy: clientData.capitalCostConsultancy || null,
            capitalCostLandAcquisition: clientData.capitalCostLandAcquisition || null,
            capitalCostSitePrep: clientData.capitalCostSitePrep || null,
            capitalCostConstruction: clientData.capitalCostConstruction || null,
            capitalCostPlantEquipment: clientData.capitalCostPlantEquipment || null,
            capitalCostFixturesFittings: clientData.capitalCostFixturesFittings || null,
            capitalCostOther: clientData.capitalCostOther || null,
            recurrentCostLabor: clientData.recurrentCostLabor || null,
            recurrentCostOperating: clientData.recurrentCostOperating || null,
            recurrentCostMaintenance: clientData.recurrentCostMaintenance || null,
            recurrentCostOther: clientData.recurrentCostOther || null,
            proposedSourceFinancing: clientData.proposedSourceFinancing || null,
            costImplicationsRelatedProjects: clientData.costImplicationsRelatedProjects || null,
            landExpropriationRequired: formatBooleanForMySQL(clientData.landExpropriationRequired),
            landExpropriationExpenses: clientData.landExpropriationExpenses || null,
            compensationRequired: formatBooleanForMySQL(clientData.compensationRequired),
            otherAttendantCosts: clientData.otherAttendantCosts || null,
        };

        const [result] = await pool.query('INSERT INTO project_financials SET ?', newFinancials);
        newFinancials.financialsId = result.insertId;
        res.status(201).json(newFinancials);
    } catch (error) {
        console.error('Error creating financial information:', error);
        res.status(500).json({ message: 'Error creating financial information', error: error.message });
    }
});

/**
 * @route PUT /api/projects/financials/:financialsId
 * @description Update an existing financial information record.
 */
router.put('/financials/:financialsId', async (req, res) => {
    const { financialsId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        capitalCostConsultancy: clientData.capitalCostConsultancy || null,
        capitalCostLandAcquisition: clientData.capitalCostLandAcquisition || null,
        capitalCostSitePrep: clientData.capitalCostSitePrep || null,
        capitalCostConstruction: clientData.capitalCostConstruction || null,
        capitalCostPlantEquipment: clientData.capitalCostPlantEquipment || null,
        capitalCostFixturesFittings: clientData.capitalCostFixturesFittings || null,
        capitalCostOther: clientData.capitalCostOther || null,
        recurrentCostLabor: clientData.recurrentCostLabor || null,
        recurrentCostOperating: clientData.recurrentCostOperating || null,
        recurrentCostMaintenance: clientData.recurrentCostMaintenance || null,
        recurrentCostOther: clientData.recurrentCostOther || null,
        proposedSourceFinancing: clientData.proposedSourceFinancing || null,
        costImplicationsRelatedProjects: clientData.costImplicationsRelatedProjects || null,
        landExpropriationRequired: formatBooleanForMySQL(clientData.landExpropriationRequired),
        landExpropriationExpenses: clientData.landExpropriationExpenses || null,
        compensationRequired: formatBooleanForMySQL(clientData.compensationRequired),
        otherAttendantCosts: clientData.otherAttendantCosts || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_financials SET ? WHERE financialsId = ?', [updatedFields, financialsId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_financials WHERE financialsId = ?', [financialsId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Financial information not found.' });
        }
    } catch (error) {
        console.error('Error updating financial information:', error);
        res.status(500).json({ message: 'Error updating financial information', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/financials/:financialsId
 * @description Delete financial information.
 */
router.delete('/financials/:financialsId', async (req, res) => {
    const { financialsId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_financials WHERE financialsId = ?', [financialsId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Financial information not found.' });
        }
    } catch (error) {
        console.error('Error deleting financial information:', error);
        res.status(500).json({ message: 'Error deleting financial information', error: error.message });
    }
});

module.exports = router;
