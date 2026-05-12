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

// --- CRUD Operations for Project Concept Notes (project_concept_notes) ---
// One-to-one relationship with projects

/**
 * @route GET /api/projects/:projectId/concept-notes
 * @description Get concept note for a specific project.
 */
router.get('/:projectId/concept-notes', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM project_concept_notes WHERE projectId = ?', [projectId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Concept note not found for this project.' });
        }
    } catch (error) {
        console.error('Error fetching concept note:', error);
        res.status(500).json({ message: 'Error fetching concept note', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/concept-notes
 * @description Create a new concept note for a project. (One-to-one)
 */
router.post('/:projectId/concept-notes', async (req, res) => {
    const { projectId } = req.params;
    const clientData = req.body; // situationAnalysis, problemStatement, etc.

    try {
        const [existing] = await pool.query('SELECT conceptNoteId FROM project_concept_notes WHERE projectId = ?', [projectId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Concept note already exists for this project. Use PUT to update.' });
        }

        const newConceptNote = {
            projectId: projectId,
            situationAnalysis: clientData.situationAnalysis || null,
            problemStatement: clientData.problemStatement || null,
            relevanceProjectIdea: clientData.relevanceProjectIdea || null,
            scopeOfProject: clientData.scopeOfProject || null,
            projectGoal: clientData.projectGoal || null,
            goalIndicator: clientData.goalIndicator || null,
            goalMeansVerification: clientData.goalMeansVerification || null,
            goalAssumptions: clientData.goalAssumptions || null,
        };

        const [result] = await pool.query('INSERT INTO project_concept_notes SET ?', newConceptNote);
        newConceptNote.conceptNoteId = result.insertId;
        res.status(201).json(newConceptNote);
    } catch (error) {
        console.error('Error creating concept note:', error);
        res.status(500).json({ message: 'Error creating concept note', error: error.message });
    }
});

/**
 * @route PUT /api/projects/concept-notes/:conceptNoteId
 * @description Update an existing concept note.
 */
router.put('/concept-notes/:conceptNoteId', async (req, res) => {
    const { conceptNoteId } = req.params;
    const clientData = req.body;

    const updatedFields = {
        situationAnalysis: clientData.situationAnalysis || null,
        problemStatement: clientData.problemStatement || null,
        relevanceProjectIdea: clientData.relevanceProjectIdea || null,
        scopeOfProject: clientData.scopeOfProject || null,
        projectGoal: clientData.projectGoal || null,
        goalIndicator: clientData.goalIndicator || null,
        goalMeansVerification: clientData.goalMeansVerification || null,
        goalAssumptions: clientData.goalAssumptions || null,
        updatedAt: formatToMySQLDateTime(new Date()),
    };

    try {
        const [result] = await pool.query('UPDATE project_concept_notes SET ? WHERE conceptNoteId = ?', [updatedFields, conceptNoteId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_concept_notes WHERE conceptNoteId = ?', [conceptNoteId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Concept note not found.' });
        }
    } catch (error) {
        console.error('Error updating concept note:', error);
        res.status(500).json({ message: 'Error updating concept note', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/concept-notes/:conceptNoteId
 * @description Delete a concept note.
 */
router.delete('/concept-notes/:conceptNoteId', async (req, res) => {
    const { conceptNoteId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_concept_notes WHERE conceptNoteId = ?', [conceptNoteId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Concept note not found.' });
        }
    } catch (error) {
        console.error('Error deleting concept note:', error);
        res.status(500).json({ message: 'Error deleting concept note', error: error.message });
    }
});

module.exports = router;
