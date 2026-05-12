// src/routes/taskDependenciesRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- IMPORTANT: No camelToSnakeCase/snakeToCamelCase helpers are needed in this file ---
// Because your DB columns are already camelCase, and frontend sends camelCase.
// This table also doesn't have createdAt/updatedAt, simplifying POST/PUT.

/**
 * @route GET /api/task_dependencies
 * @description Get all task dependencies from the task_dependencies table.
 * Assumes this router is mounted at /api/task_dependencies.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM task_dependencies');
        res.status(200).json(rows); // Direct return, as DB columns are camelCase
    } catch (error) {
        console.error('Error fetching all task dependencies:', error);
        res.status(500).json({ message: 'Error fetching all task dependencies', error: error.message });
    }
});

/**
 * @route GET /api/task_dependencies/by-task/:taskId
 * @description Get all task dependencies for a specific task from the task_dependencies table.
 * Assumes this router is mounted at /api/task_dependencies.
 */
router.get('/by-task/:taskId', async (req, res) => {
    const { taskId } = req.params; // taskId is camelCase from URL
    try {
        // Use 'taskId' for the database column, as per your schema
        const [rows] = await pool.query('SELECT * FROM task_dependencies WHERE taskId = ?', [taskId]);
        res.status(200).json(rows); // Direct return, as DB columns are camelCase
    } catch (error) {
        console.error(`Error fetching dependencies for task ${taskId}:`, error);
        res.status(500).json({ message: `Error fetching dependencies for task ${taskId}`, error: error.message });
    }
});

/**
 * @route GET /api/task_dependencies/:dependencyId
 * @description Get a single task dependency by dependencyId from the task_dependencies table.
 * Assumes this router is mounted at /api/task_dependencies.
 */
router.get('/:dependencyId', async (req, res) => { // Changed param name from :id to :dependencyId for clarity
    const { dependencyId } = req.params; // dependencyId is camelCase from URL
    try {
        // Use 'dependencyId' for the database column, as per your schema
        const [rows] = await pool.query('SELECT * FROM task_dependencies WHERE dependencyId = ?', [dependencyId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Direct return, as DB columns are camelCase
        } else {
            res.status(404).json({ message: 'Task dependency not found' });
        }
    } catch (error) {
        console.error('Error fetching task dependency:', error);
        res.status(500).json({ message: 'Error fetching task dependency', error: error.message });
    }
});

/**
 * @route POST /api/task_dependencies
 * @description Create a new task dependency in the task_dependencies table.
 * Assumes this router is mounted at /api/task_dependencies.
 */
router.post('/', async (req, res) => {
    // req.body contains camelCase from frontend (taskId, dependsOnTaskId)
    const clientData = req.body;

    const newDependency = {
        // Since dependencyId is AUTO_INCREMENT, do NOT provide it in the insert data.
        // The DB will assign it.
        ...clientData // This brings in taskId, dependsOnTaskId
    };

    // Remove dependencyId if client provides it and DB auto-increments
    // This prevents "Cannot add value to AUTO_INCREMENT column" errors.
    delete newDependency.dependencyId;

    try {
        console.log('Inserting Task Dependency:', newDependency); // Log data going to DB
        // Query will map camelCase keys in newDependency directly to camelCase DB columns
        const [result] = await pool.query('INSERT INTO task_dependencies SET ?', newDependency);
        
        // Capture the auto-generated dependencyId for the response
        if (result.insertId) {
            newDependency.dependencyId = result.insertId;
        }

        res.status(201).json(newDependency); // Return the created dependency as camelCase
    } catch (error) {
        console.error('Error creating task dependency:', error);
        res.status(500).json({ message: 'Error creating task dependency', error: error.message });
    }
});

/**
 * @route PUT /api/task_dependencies/:dependencyId
 * @description Update an existing task dependency in the task_dependencies table.
 * Assumes this router is mounted at /api/task_dependencies.
 */
router.put('/:dependencyId', async (req, res) => { // Changed param name from :id to :dependencyId
    const { dependencyId } = req.params; // dependencyId is camelCase from URL
    const updatedFields = { ...req.body };

    // Remove dependencyId from the body to prevent attempting to update primary key
    delete updatedFields.dependencyId; 

    try {
        console.log(`Updating Task Dependency ${dependencyId}:`, updatedFields); // Log data going to DB
        // Query will map camelCase keys in updatedFields directly to camelCase DB columns
        const [result] = await pool.query('UPDATE task_dependencies SET ? WHERE dependencyId = ?', [updatedFields, dependencyId]);
        
        if (result.affectedRows > 0) {
            // Fetch and return the updated row as camelCase
            const [rows] = await pool.query('SELECT * FROM task_dependencies WHERE dependencyId = ?', [dependencyId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Task dependency not found' });
        }
    } catch (error) {
        console.error('Error updating task dependency:', error);
        res.status(500).json({ message: 'Error updating task dependency', error: error.message });
    }
});

/**
 * @route DELETE /api/task_dependencies/:dependencyId
 * @description Delete a task dependency from the task_dependencies table.
 * Assumes this router is mounted at /api/task_dependencies.
 */
router.delete('/:dependencyId', async (req, res) => { // Changed param name from :id to :dependencyId
    const { dependencyId } = req.params; // dependencyId is camelCase from URL
    try {
        // Use 'dependencyId' for the database column
        const [result] = await pool.query('DELETE FROM task_dependencies WHERE dependencyId = ?', [dependencyId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Task dependency not found' });
        }
    } catch (error) {
        console.error(`Error deleting task dependency with ID ${dependencyId}:`, error);
        res.status(500).json({ message: `Error deleting task dependency with ID ${dependencyId}`, error: error.message });
    }
});

module.exports = router;