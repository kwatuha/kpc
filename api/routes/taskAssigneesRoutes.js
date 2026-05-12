// src/routes/taskAssigneesRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Helper Function: Format Date for MySQL DATETIME column ---
// This function needs to be defined within this file to be used here.
const formatToMySQLDateTime = (date) => {
    if (!date) return null; // Handle null or undefined dates
    const d = new Date(date);
    if (isNaN(d.getTime())) { // Check for invalid date
        console.warn('Invalid date provided to formatToMySQLDateTime:', date);
        return null;
    }
    // Get components
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


// --- IMPORTANT: No camelToSnakeCase/snakeToCamelCase helpers are needed in this file ---
// Because your DB columns are already camelCase, and frontend sends camelCase.

/**
 * @route GET /api/task_assignees
 * @description Get all task assignees from the task_assignees table.
 * Assumes this router is mounted at /api/task_assignees.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM task_assignees');
        res.status(200).json(rows); // Direct return, as DB columns are camelCase
    } catch (error) {
        console.error('Error fetching all task assignees:', error);
        res.status(500).json({ message: 'Error fetching all task assignees', error: error.message });
    }
});

/**
 * @route GET /api/task_assignees/by-task/:taskId
 * @description Get all task assignees for a specific task from the task_assignees table.
 * Assumes this router is mounted at /api/task_assignees.
 */
router.get('/by-task/:taskId', async (req, res) => {
    const { taskId } = req.params; // taskId is camelCase from URL
    try {
        // Use 'taskId' for the database column, as per your schema
        const [rows] = await pool.query('SELECT * FROM task_assignees WHERE taskId = ?', [taskId]);
        res.status(200).json(rows); // Direct return, as DB columns are camelCase
    } catch (error) {
        console.error(`Error fetching assignees for task ${taskId}:`, error);
        res.status(500).json({ message: `Error fetching assignees for task ${taskId}`, error: error.message });
    }
});

/**
 * @route GET /api/task_assignees/:taskAssigneeId
 * @description Get a single task assignee by taskAssigneeId from the task_assignees table.
 * Assumes this router is mounted at /api/task_assignees.
 */
router.get('/:taskAssigneeId', async (req, res) => { // Changed param name from :id to :taskAssigneeId for clarity
    const { taskAssigneeId } = req.params; // taskAssigneeId is camelCase from URL
    try {
        // Use 'taskAssigneeId' for the database column, as per your schema
        const [rows] = await pool.query('SELECT * FROM task_assignees WHERE taskAssigneeId = ?', [taskAssigneeId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Direct return, as DB columns are camelCase
        } else {
            res.status(404).json({ message: 'Task assignee not found' });
        }
    } catch (error) {
        console.error('Error fetching task assignee:', error);
        res.status(500).json({ message: 'Error fetching task assignee', error: error.message });
    }
});

/**
 * @route POST /api/task_assignees
 * @description Create a new task assignee in the task_assignees table.
 * Assumes this router is mounted at /api/task_assignees.
 */
router.post('/', async (req, res) => {
    // req.body contains camelCase from frontend (taskId, staffId, assignedAt)
    const clientData = req.body;

    const newAssignee = {
        // Since taskAssigneeId is AUTO_INCREMENT, do NOT provide it in the insert data.
        // The DB will assign it.
        ...clientData, // This brings in taskId, staffId
        // FIX: Format assignedAt to MySQL DATETIME format
        assignedAt: formatToMySQLDateTime(clientData.assignedAt || new Date()), // Use client's assignedAt or new Date()
    };

    // Remove taskAssigneeId if client provides it and DB auto-increments
    delete newAssignee.taskAssigneeId; 

    try {
        console.log('Inserting Task Assignee:', newAssignee); // Log data going to DB
        // Query will map camelCase keys in newAssignee directly to camelCase DB columns
        const [result] = await pool.query('INSERT INTO task_assignees SET ?', newAssignee);
        
        // Capture the auto-generated taskAssigneeId for the response
        if (result.insertId) {
            newAssignee.taskAssigneeId = result.insertId;
        }

        res.status(201).json(newAssignee); // Return the created assignee as camelCase
    } catch (error) {
        console.error('Error creating task assignee:', error);
        res.status(500).json({ message: 'Error creating task assignee', error: error.message });
    }
});

/**
 * @route PUT /api/task_assignees/:taskAssigneeId
 * @description Update an existing task assignee in the task_assignees table.
 * Assumes this router is mounted at /api/task_assignees.
 */
router.put('/:taskAssigneeId', async (req, res) => { // Changed param name from :id to :taskAssigneeId
    const { taskAssigneeId } = req.params; // taskAssigneeId is camelCase from URL
    const clientData = req.body; // Use clientData for consistency

    const updatedFields = { 
        ...clientData,
        // FIX: Format assignedAt for update if it's sent, or generate if always updated
        assignedAt: clientData.assignedAt ? formatToMySQLDateTime(clientData.assignedAt) : undefined, // Format if present
    };

    // Remove taskAssigneeId from the body to prevent attempting to update primary key
    delete updatedFields.taskAssigneeId; 

    // Remove undefined properties to avoid setting them in SQL if they were explicitly removed
    const cleanUpdatedFields = Object.fromEntries(
        Object.entries(updatedFields).filter(([_, v]) => v !== undefined)
    );

    try {
        console.log(`Updating Task Assignee ${taskAssigneeId}:`, cleanUpdatedFields);
        // Query will map camelCase keys in cleanUpdatedFields directly to camelCase DB columns
        const [result] = await pool.query('UPDATE task_assignees SET ? WHERE taskAssigneeId = ?', [cleanUpdatedFields, taskAssigneeId]);
        
        if (result.affectedRows > 0) {
            // Fetch and return the updated row as camelCase
            const [rows] = await pool.query('SELECT * FROM task_assignees WHERE taskAssigneeId = ?', [taskAssigneeId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Task assignee not found' });
        }
    } catch (error) {
        console.error('Error updating task assignee:', error);
        res.status(500).json({ message: 'Error updating task assignee', error: error.message });
    }
});

/**
 * @route DELETE /api/task_assignees/:taskAssigneeId
 * @description Delete a task assignee from the task_assignees table.
 * Assumes this router is mounted at /api/task_assignees.
 */
router.delete('/:taskAssigneeId', async (req, res) => { // Changed param name from :id to :taskAssigneeId
    const { taskAssigneeId } = req.params; // taskAssigneeId is camelCase from URL
    try {
        // Use 'taskAssigneeId' for the database column
        const [result] = await pool.query('DELETE FROM task_assignees WHERE taskAssigneeId = ?', [taskAssigneeId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Task assignee not found' });
        }
    } catch (error) {
        console.error(`Error deleting task assignee with ID ${taskAssigneeId}:`, error);
        res.status(500).json({ message: `Error deleting task assignee with ID ${taskAssigneeId}`, error: error.message });
    }
});

module.exports = router;