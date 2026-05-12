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


// --- CRUD Operations for Environmental, Social, OHS, Gender Screening (project_esohsg_screening) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/esohsg-screening
 * @description Get ESOHSG screening details for a specific project.
 */
router.get('/:projectId/esohsg-screening', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_esohsg_screening WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            // Parse JSON fields back to objects before sending the response
            const record = rows[0];
            if (record.worldBankStandards) record.worldBankStandards = JSON.parse(record.worldBankStandards);
            if (record.goKPoliciesLaws) record.goKPoliciesLaws = JSON.parse(record.goKPoliciesLaws);
            if (record.environmentalHealthSafetyImpacts) record.environmentalHealthSafetyImpacts = JSON.parse(record.environmentalHealthSafetyImpacts);
            if (record.socialImpacts) record.socialImpacts = JSON.parse(record.socialImpacts);
            if (record.publicParticipationConsultation) record.publicParticipationConsultation = JSON.parse(record.publicParticipationConsultation);
            res.status(200).json(record);
        } else {
            res.status(404).json({ message: 'ESOHSG screening details not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching ESOHSG screening details:', error);
        res.status(500).json({ message: 'Error fetching ESOHSG screening details', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/esohsg-screening
 * @description Create new ESOHSG screening details for a project. (One-to-one)
 */
router.post('/:projectId/esohsg-screening', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    try {
        const [existing] = await pool.query('SELECT screeningId FROM project_esohsg_screening WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'ESOHSG screening details already exist for this project. Use PUT to update.' });
        }

        const newScreening = {
            projectId: projectId,
            emcaTriggers: formatBooleanForMySQL(clientData.emcaTriggers),
            emcaDescription: clientData.emcaDescription || null,
            worldBankSafeguardApplicable: formatBooleanForMySQL(clientData.worldBankSafeguardApplicable),
            worldBankStandards: clientData.worldBankStandards ? JSON.stringify(clientData.worldBankStandards) : null, // Store JSON as string
            goKPoliciesApplicable: formatBooleanForMySQL(clientData.goKPoliciesApplicable),
            goKPoliciesLaws: clientData.goKPoliciesLaws ? JSON.stringify(clientData.goKPoliciesLaws) : null, // Store JSON as string
            environmentalHealthSafetyImpacts: clientData.environmentalHealthSafetyImpacts ? JSON.stringify(clientData.environmentalHealthSafetyImpacts) : null, // Store JSON as string
            socialImpacts: clientData.socialImpacts ? JSON.stringify(clientData.socialImpacts) : null, // Store JSON as string
            publicParticipationConsultation: clientData.publicParticipationConsultation ? JSON.stringify(clientData.publicParticipationConsultation) : null, // Store JSON as string
            screeningResultOutcome: clientData.screeningResultOutcome || null,
            specialConditions: clientData.specialConditions || null,
            screeningUndertakenBy: clientData.screeningUndertakenBy || null,
            screeningDesignation: clientData.screeningDesignation || null,
        };

        const [result] = await pool.query('INSERT INTO project_esohsg_screening SET ?', newScreening);
        newScreening.screeningId = result.insertId;
        res.status(201).json(newScreening);
    } catch (error) {
        console.error('Error creating ESOHSG screening details:', error);
        res.status(500).json({ message: 'Error creating ESOHSG screening details', error: error.message });
    }
});

/**
 * @route PUT /api/projects/esohsg-screening/:screeningId
 * @description Update existing ESOHSG screening details.
 */
router.put('/esohsg-screening/:screeningId', async (req, res) => {
    const { screeningId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        emcaTriggers: formatBooleanForMySQL(clientData.emcaTriggers),
        emcaDescription: clientData.emcaDescription || null,
        worldBankSafeguardApplicable: formatBooleanForMySQL(clientData.worldBankSafeguardApplicable),
        worldBankStandards: clientData.worldBankStandards ? JSON.stringify(clientData.worldBankStandards) : null,
        goKPoliciesApplicable: formatBooleanForMySQL(clientData.goKPoliciesApplicable),
        goKPoliciesLaws: clientData.goKPoliciesLaws ? JSON.stringify(clientData.goKPoliciesLaws) : null,
        environmentalHealthSafetyImpacts: clientData.environmentalHealthSafetyImpacts ? JSON.stringify(clientData.environmentalHealthSafetyImpacts) : null,
        socialImpacts: clientData.socialImpacts ? JSON.stringify(clientData.socialImpacts) : null,
        publicParticipationConsultation: clientData.publicParticipationConsultation ? JSON.stringify(clientData.publicParticipationConsultation) : null,
        screeningResultOutcome: clientData.screeningResultOutcome || null,
        specialConditions: clientData.specialConditions || null,
        screeningUndertakenBy: clientData.screeningUndertakenBy || null,
        screeningDesignation: clientData.screeningDesignation || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_esohsg_screening SET ? WHERE screeningId = ?', [updatedFields, screeningId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_esohsg_screening WHERE screeningId = ?', [screeningId]);
            // Parse JSON fields back to objects for the response
            if (rows.length > 0) {
                const record = rows[0];
                if (record.worldBankStandards) record.worldBankStandards = JSON.parse(record.worldBankStandards);
                if (record.goKPoliciesLaws) record.goKPoliciesLaws = JSON.parse(record.goKPoliciesLaws);
                if (record.environmentalHealthSafetyImpacts) record.environmentalHealthSafetyImpacts = JSON.parse(record.environmentalHealthSafetyImpacts);
                if (record.socialImpacts) record.socialImpacts = JSON.parse(record.socialImpacts);
                if (record.publicParticipationConsultation) record.publicParticipationConsultation = JSON.parse(record.publicParticipationConsultation);
                res.status(200).json(record);
            } else {
                 res.status(404).json({ message: 'ESOHSG screening details not found.' });
            }
        } else {
            res.status(404).json({ message: 'ESOHSG screening details not found.' });
        }
    } catch (error) {
        console.error('Error updating ESOHSG screening details:', error);
        res.status(500).json({ message: 'Error updating ESOHSG screening details', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/esohsg-screening/:screeningId
 * @description Delete ESOHSG screening details.
 */
router.delete('/esohsg-screening/:screeningId', async (req, res) => {
    const { screeningId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_esohsg_screening WHERE screeningId = ?', [screeningId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'ESOHSG screening details not found.' });
        }
    } catch (error) {
        console.error('Error deleting ESOHSG screening details:', error);
        res.status(500).json({ message: 'Error deleting ESOHSG screening details', error: error.message });
    }
});

module.exports = router;
