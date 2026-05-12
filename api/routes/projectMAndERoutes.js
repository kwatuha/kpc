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


// --- CRUD Operations for Project Monitoring and Evaluation (project_m_and_e) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/m-and-e
 * @description Get M&E details for a specific project.
 */
router.get('/:projectId/m-and-e', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_m_and_e WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'M&E details not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching M&E details:', error);
        res.status(500).json({ message: 'Error fetching M&E details', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/m-and-e
 * @description Create new M&E details for a project. (One-to-one)
 */
router.post('/:projectId/m-and-e', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body;

    try {
        const [existing] = await pool.query('SELECT mAndEId FROM project_m_and_e WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'M&E details already exist for this project. Use PUT to update.' });
        }

        const newMAndE = {
            projectId: projectId,
            description: clientData.description || null,
            mechanismsInPlace: clientData.mechanismsInPlace || null,
            resourcesBudgetary: clientData.resourcesBudgetary || null,
            resourcesHuman: clientData.resourcesHuman || null,
            dataGatheringMethod: clientData.dataGatheringMethod || null,
            reportingChannels: clientData.reportingChannels || null,
            lessonsLearnedProcess: clientData.lessonsLearnedProcess || null,
        };

        const [result] = await pool.query('INSERT INTO project_m_and_e SET ?', newMAndE);
        newMAndE.mAndEId = result.insertId;
        res.status(201).json(newMAndE);
    } catch (error) {
        console.error('Error creating M&E details:', error);
        res.status(500).json({ message: 'Error creating M&E details', error: error.message });
    }
});

/**
 * @route PUT /api/projects/m-and-e/:mAndEId
 * @description Update existing M&E details.
 */
router.put('/m-and-e/:mAndEId', async (req, res) => {
    const { mAndEId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        description: clientData.description || null,
        mechanismsInPlace: clientData.mechanismsInPlace || null,
        resourcesBudgetary: clientData.resourcesBudgetary || null,
        resourcesHuman: clientData.resourcesHuman || null,
        dataGatheringMethod: clientData.dataGatheringMethod || null,
        reportingChannels: clientData.reportingChannels || null,
        lessonsLearnedProcess: clientData.lessonsLearnedProcess || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_m_and_e SET ? WHERE mAndEId = ?', [updatedFields, mAndEId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_m_and_e WHERE mAndEId = ?', [mAndEId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'M&E details not found.' });
        }
    } catch (error) {
        console.error('Error updating M&E details:', error);
        res.status(500).json({ message: 'Error updating M&E details', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/m-and-e/:mAndEId
 * @description Delete M&E details.
 */
router.delete('/m-and-e/:mAndEId', async (req, res) => {
    const { mAndEId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_m_and_e WHERE mAndEId = ?', [mAndEId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'M&E details not found.' });
        }
    } catch (error) {
        console.error('Error deleting M&E details:', error);
        res.status(500).json({ message: 'Error deleting M&E details', error: error.message });
    }
});

module.exports = router;
