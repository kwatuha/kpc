// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware'); // Import the authentication middleware
const privilege = require('../middleware/privilegeMiddleware'); // NEW: Import the privilege middleware

// @route   GET /users
// @desc    Get all users (requires 'user.read_all' privilege)
// @access  Private
router.get('/users', auth, privilege(['user.read_all']), async (req, res) => {
    try {
        // Select all users, but exclude password_hash for security
        const [users] = await db.query('SELECT user_id, username, email, first_name, last_name, role FROM users ORDER BY username ASC');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error while fetching users.' });
    }
});

// @route   GET /users/roles
// @desc    Get available user roles (can be public or require a basic privilege like 'role.read')
// @access  Public (for now, can be restricted later)
router.get('/users/roles', async (req, res) => {
    // In a real application, roles might be fetched from a database table
    // or defined in a config. For simplicity, we'll hardcode common roles.
    // These roles should correspond to entries in your 'roles' database table.
    const roles = ['user', 'admin', 'manager', 'data_entry', 'viewer', 'project_lead']; // Example roles
    res.json(roles);
});


// @route   POST /users
// @desc    Create a new user (requires 'user.create' privilege)
// @access  Private
router.post('/users', auth, privilege(['user.create']), async (req, res) => {
    const { username, email, password, first_name, last_name, role } = req.body;

    // Basic validation
    if (!username || !email || !password || !first_name || !last_name || !role) {
        return res.status(400).json({ error: 'Please provide all required fields: username, email, password, first name, last name, and role.' });
    }

    let connection;
    try {
        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT user_id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with that username or email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        connection = await db.getConnection();
        await connection.beginTransaction();

        let userId;
        // Insert into users
        const [userResult] = await connection.execute(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, first_name, last_name, role]
        );
        userId = userResult.insertId;

        // Optional: link to staff if applicable (assuming user_id is foreign key)
        // This part needs to be carefully considered based on your schema.
        // For now, let's assume `staff` is only for actual staff members,
        // and we might not automatically create a staff entry for every user.
        // If `user_id` in `staff` is nullable, this is fine.
        // If it's not nullable and every user must be a staff, then this insert is needed.
        // For simplicity, we'll just create the user for now.
        // If you need to create a staff entry, you'd do it here:
        /*
        await connection.execute(
            'INSERT INTO staff (first_name, last_name, email, user_id) VALUES (?, ?, ?, ?)',
            [first_name, last_name, email, userId]
        );
        */

        await connection.commit();
        res.status(201).json({ message: 'User created successfully!', user_id: userId });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'User with that username or email already exists.' });
        }
        res.status(500).json({ error: 'Server error while creating user.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// @route   PUT /users/:id
// @desc    Update a user (requires 'user.update' privilege)
// @access  Private
router.put('/users/:id', auth, privilege(['user.update']), async (req, res) => {
    const { id } = req.params;
    const { username, email, password, first_name, last_name, role } = req.body;

    // Note: If you allow username/email updates, you need to ensure uniqueness.
    // For simplicity, this example requires all fields for update,
    // but in a real app, you'd update only provided fields.
    if (!username || !email || !first_name || !last_name || !role) {
        return res.status(400).json({ error: 'Please provide all required fields: username, email, first name, last name, and role.' });
    }

    let password_hash = null;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        password_hash = await bcrypt.hash(password, salt);
    }

    try {
        // Check for duplicate username/email excluding the current user being updated
        const [existingUsers] = await db.execute(
            'SELECT user_id FROM users WHERE (username = ? OR email = ?) AND user_id != ?',
            [username, email, id]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Another user with that username or email already exists.' });
        }

        const updateFields = { username, email, first_name, last_name, role };
        if (password_hash) {
            updateFields.password_hash = password_hash;
        }

        const [result] = await db.query('UPDATE users SET ? WHERE user_id = ?', [updateFields, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ message: 'User updated successfully!' });

    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error while updating user.' });
    }
});

// @route   DELETE /users/:id
// @desc    Delete a user (requires 'user.delete' privilege)
// @access  Private
router.delete('/users/:id', auth, privilege(['user.delete']), async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Optional: Delete related staff entry if it exists and is linked
        // This depends on your foreign key constraints and business logic.
        // If staff.user_id has ON DELETE CASCADE, this is not strictly needed.
        // If not, you might need to handle it here.
        // await connection.execute('DELETE FROM staff WHERE user_id = ?', [id]);

        const [result] = await connection.execute('DELETE FROM users WHERE user_id = ?', [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'User not found.' });
        }

        await connection.commit();
        res.json({ message: 'User deleted successfully!' });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error while deleting user.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
