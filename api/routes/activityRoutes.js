const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- Helper Function: Format Date for MySQL DATE column ---
const formatToMySQLDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        console.warn('Invalid date provided to formatToMySQLDate:', date);
        return null;
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Helper Function: Format Date for MySQL DATETIME column ---
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

// GET all activities for a specific work plan
router.get('/by-workplan/:workplanId', async (req, res) => {
    const { workplanId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM activities WHERE workplanId = ? AND voided = 0', [workplanId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities', error: error.message });
    }
});

// GET a single activity by ID
router.get('/:activityId', async (req, res) => {
    const { activityId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM activities WHERE activityId = ? AND voided = 0', [activityId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Error fetching activity', error: error.message });
    }
});

// POST a new activity (CORRECTED)
router.post('/', async (req, res) => {
    const { milestoneIds, ...clientData } = req.body;
    
    const newActivity = {
        ...clientData,
        startDate: formatToMySQLDate(clientData.startDate),
        endDate: formatToMySQLDate(clientData.endDate),
        voided: 0,
        createdAt: formatToMySQLDateTime(new Date()),
        updatedAt: formatToMySQLDateTime(new Date()),
    };
    delete newActivity.activityId;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        console.log('Inserting Activity:', newActivity);
        const [result] = await connection.query('INSERT INTO activities SET ?', newActivity);
        const newActivityId = result.insertId;

        if (milestoneIds && milestoneIds.length > 0) {
            const milestoneLinks = milestoneIds.map(milestoneId => [milestoneId, newActivityId]);
            await connection.query(
                'INSERT INTO milestone_activities (milestoneId, activityId) VALUES ?',
                [milestoneLinks]
            );
        }

        await connection.commit();
        const [rows] = await connection.query('SELECT * FROM activities WHERE activityId = ?', [newActivityId]);
        res.status(201).json({ ...rows[0], milestoneIds });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating activity and linking milestones:', error);
        res.status(500).json({ message: 'Error creating activity and linking milestones', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// PUT an existing activity (CORRECTED)
router.put('/:activityId', async (req, res) => {
    const { activityId } = req.params;
    const { milestoneIds, ...clientData } = req.body;
    
    const updatedFields = {
        ...clientData,
        startDate: clientData.startDate ? formatToMySQLDate(clientData.startDate) : undefined,
        endDate: clientData.endDate ? formatToMySQLDate(clientData.endDate) : undefined,
        updatedAt: formatToMySQLDateTime(new Date()),
    };
    delete updatedFields.activityId;
    delete updatedFields.voided;
    delete updatedFields.createdAt;
    
    // Fix: Explicitly remove milestoneId to prevent the 'Unknown column' error
    delete updatedFields.milestoneId;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        console.log(`Updating Activity ${activityId}:`, updatedFields);
        const [result] = await connection.query('UPDATE activities SET ? WHERE activityId = ?', [updatedFields, activityId]);

        // Handle milestone links
        if (milestoneIds) {
            const [existingLinks] = await connection.query('SELECT * FROM milestone_activities WHERE activityId = ?', [activityId]);
            const existingMilestoneIds = new Set(existingLinks.map(link => link.milestoneId));
            const newMilestoneIds = new Set(milestoneIds);
            
            const toAdd = [...newMilestoneIds].filter(id => !existingMilestoneIds.has(id));
            const toRemove = [...existingMilestoneIds].filter(id => !newMilestoneIds.has(id));
            
            if (toAdd.length > 0) {
                const addValues = toAdd.map(milestoneId => [milestoneId, activityId]);
                await connection.query('INSERT INTO milestone_activities (milestoneId, activityId) VALUES ?', [addValues]);
            }
            if (toRemove.length > 0) {
                await connection.query('DELETE FROM milestone_activities WHERE activityId = ? AND milestoneId IN (?)', [activityId, toRemove]);
            }
        }
        
        await connection.commit();
        
        if (result.affectedRows > 0) {
            const [rows] = await connection.query('SELECT * FROM activities WHERE activityId = ?', [activityId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating activity and milestones:', error);
        res.status(500).json({ message: 'Error updating activity and milestones', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE an activity (soft delete)
router.delete('/:activityId', async (req, res) => {
    const { activityId } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // First, delete links from the junction table
        await connection.query('DELETE FROM milestone_activities WHERE activityId = ?', [activityId]);

        // Then, soft delete the activity itself
        const [result] = await connection.query('UPDATE activities SET voided = 1 WHERE activityId = ?', [activityId]);
        
        await connection.commit();

        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error soft-deleting activity:', error);
        res.status(500).json({ message: 'Error soft-deleting activity', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
