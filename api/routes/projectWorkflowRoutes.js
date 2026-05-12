const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authenticate');
const privilege = require('../middleware/privilegeMiddleware');

// --- Project Stages Routes ---
// A project stage is a universal definition (e.g., 'Proposal', 'Approved')

// GET all available project stages
router.get('/stages', auth, privilege(['project_stage.read']), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM project_stages');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch project stages', error: error.message });
    }
});

// POST a new project stage
router.post('/stages', auth, privilege(['project_stage.create']), async (req, res) => {
    const { stageName, description } = req.body;
    if (!stageName) {
        return res.status(400).json({ message: 'Stage name is required.' });
    }
    try {
        const [result] = await pool.query('INSERT INTO project_stages (stageName, description) VALUES (?, ?)', [stageName, description]);
        res.status(201).json({ message: 'Project stage created successfully.', stageId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create project stage', error: error.message });
    }
});

// PUT to update an existing project stage
router.put('/stages/:stageId', auth, privilege(['project_stage.update']), async (req, res) => {
    const { stageId } = req.params;
    const { stageName, description } = req.body;
    if (!stageName) {
        return res.status(400).json({ message: 'Stage name is required.' });
    }
    try {
        const [result] = await pool.query('UPDATE project_stages SET stageName = ?, description = ? WHERE stageId = ?', [stageName, description, stageId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project stage not found.' });
        }
        res.json({ message: 'Project stage updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update project stage', error: error.message });
    }
});

// DELETE a project stage
router.delete('/stages/:stageId', auth, privilege(['project_stage.delete']), async (req, res) => {
    const { stageId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_stages WHERE stageId = ?', [stageId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project stage not found.' });
        }
        res.json({ message: 'Project stage deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete project stage', error: error.message });
    }
});

// --- Project Workflows Routes ---
// A project workflow is a custom sequence of stages

// GET all available project workflows
router.get('/workflows', auth, privilege(['project_workflow.read']), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM project_workflows');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch project workflows', error: error.message });
    }
});

// GET a specific workflow with all its steps
router.get('/workflows/:workflowId', auth, privilege(['project_workflow.read']), async (req, res) => {
    const { workflowId } = req.params;
    try {
        const [workflow] = await pool.query('SELECT * FROM project_workflows WHERE workflowId = ?', [workflowId]);
        if (workflow.length === 0) {
            return res.status(404).json({ message: 'Workflow not found.' });
        }

        const [steps] = await pool.query(
            `SELECT p.stepId, p.stepOrder, s.stageId, s.stageName
             FROM project_stages s
             JOIN project_workflow_steps p ON p.stageId = s.stageId
             WHERE p.workflowId = ? ORDER BY p.stepOrder`,
            [workflowId]
        );
        res.json({ ...workflow[0], steps });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch workflow details', error: error.message });
    }
});

// POST to create a new project workflow
router.post('/workflows', auth, privilege(['project_workflow.create']), async (req, res) => {
    const { workflowName, description } = req.body;
    if (!workflowName) {
        return res.status(400).json({ message: 'Workflow name is required.' });
    }
    try {
        const [result] = await pool.query('INSERT INTO project_workflows (workflowName, description) VALUES (?, ?)', [workflowName, description]);
        res.status(201).json({ message: 'Project workflow created successfully.', workflowId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create project workflow', error: error.message });
    }
});

// PUT to update an existing workflow's name and description
router.put('/workflows/:workflowId', auth, privilege(['project_workflow.update']), async (req, res) => {
    const { workflowId } = req.params;
    const { workflowName, description } = req.body;
    if (!workflowName) {
        return res.status(400).json({ message: 'Workflow name is required.' });
    }
    try {
        const [result] = await pool.query('UPDATE project_workflows SET workflowName = ?, description = ? WHERE workflowId = ?', [workflowName, description, workflowId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project workflow not found.' });
        }
        res.json({ message: 'Project workflow updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update project workflow', error: error.message });
    }
});

// DELETE a project workflow and its steps
router.delete('/workflows/:workflowId', auth, privilege(['project_workflow.delete']), async (req, res) => {
    const { workflowId } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Delete workflow steps first
        await connection.query('DELETE FROM project_workflow_steps WHERE workflowId = ?', [workflowId]);
        
        // Then delete the workflow
        const [result] = await connection.query('DELETE FROM project_workflows WHERE workflowId = ?', [workflowId]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Project workflow not found.' });
        }

        await connection.commit();
        res.json({ message: 'Project workflow and all its steps deleted successfully.' });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: 'Failed to delete project workflow', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// --- Workflow Steps Routes (linking a workflow to a stage) ---
// POST to add a new step (stage) to a workflow
router.post('/workflows/:workflowId/steps', auth, privilege(['project_workflow.create']), async (req, res) => {
    const { workflowId } = req.params;
    const { stageId, stepOrder } = req.body;
    if (!stageId || stepOrder === undefined) {
        return res.status(400).json({ message: 'Stage ID and step order are required.' });
    }
    try {
        const [result] = await pool.query('INSERT INTO project_workflow_steps (workflowId, stageId, stepOrder) VALUES (?, ?, ?)', [workflowId, stageId, stepOrder]);
        res.status(201).json({ message: 'Workflow step added successfully.', stepId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add workflow step', error: error.message });
    }
});

// PUT to update a workflow step (e.g., change the order)
router.put('/workflows/:workflowId/steps/:stepId', auth, privilege(['project_workflow.update']), async (req, res) => {
    const { stepId } = req.params;
    const { stepOrder } = req.body;
    if (stepOrder === undefined) {
        return res.status(400).json({ message: 'Step order is required.' });
    }
    try {
        const [result] = await pool.query('UPDATE project_workflow_steps SET stepOrder = ? WHERE stepId = ?', [stepOrder, stepId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Workflow step not found.' });
        }
        res.json({ message: 'Workflow step updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update workflow step', error: error.message });
    }
});

// DELETE a step from a workflow
router.delete('/workflows/:workflowId/steps/:stepId', auth, privilege(['project_workflow.delete']), async (req, res) => {
    const { stepId } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project_workflow_steps WHERE stepId = ?', [stepId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Workflow step not found.' });
        }
        res.json({ message: 'Workflow step deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete workflow step', error: error.message });
    }
});

module.exports = router;