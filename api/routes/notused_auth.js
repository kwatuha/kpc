// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Your database connection

/**
 * Helper function to fetch privileges for a given role name.
 * This function queries the roles, privileges, and role_privileges tables.
 * @param {string} roleName - The name of the role (e.g., 'admin', 'user').
 * @returns {Promise<string[]>} An array of privilege names.
 */
async function getPrivilegesByRole(roleName) {
    try {
        const [rows] = await db.query(
            `SELECT kp.privilege_name
             FROM roles kr
             JOIN role_privileges krp ON kr.role_id = krp.role_id
             JOIN privileges kp ON krp.privilege_id = kp.privilege_id
             WHERE kr.role_name = ?`,
            [roleName]
        );
        return rows.map(row => row.privilege_name);
    } catch (error) {
        console.error(`Error fetching privileges for role '${roleName}':`, error);
        return []; // Return empty array on error
    }
}

// @route   POST /register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password, first_name, last_name, role } = req.body;

    // Basic validation
    if (!username || !email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: 'Please enter all required fields: username, email, password, first name, last name.' });
    }

    // Default role if not provided, or ensure it's a valid role
    const userRole = role || 'user'; // Default to 'user' if no role is provided

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

        // Insert into users table
        const [userResult] = await connection.execute(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, first_name, last_name, userRole]
        );
        const userId = userResult.insertId;

        // NEW: Fetch privileges for the newly registered user's role
        const userPrivileges = await getPrivilegesByRole(userRole);

        // Create a JWT token
        const payload = {
            user: {
                id: userId,
                username: username,
                email: email,
                role: userRole, // Keep role for general checks
                privileges: userPrivileges // NEW: Include the fetched privileges
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey', // Use environment variable for secret
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    // If JWT signing fails, rollback transaction and send error
                    connection.rollback(); // Ensure rollback on JWT error
                    console.error('Error signing JWT during registration:', err);
                    return res.status(500).json({ error: 'Server error during token generation.' });
                }
                res.status(201).json({ message: 'User registered successfully!', token });
            }
        );

        await connection.commit();

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error during user registration:', err);
        // Check for specific MySQL duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'User with that username or email already exists.' });
        }
        res.status(500).json({ error: 'Server error during registration.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// @route   POST /login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // NEW: Fetch privileges for the logged-in user's role
        const userPrivileges = await getPrivilegesByRole(user.role);

        // Create JWT payload
        const payload = {
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role, // Keep role for general checks
                privileges: userPrivileges // NEW: Include the fetched privileges
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey', // Use environment variable for secret
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT during login:', err);
                    return res.status(500).json({ error: 'Server error during token generation.' });
                }
                res.json({ token, message: 'Logged in successfully!' });
            }
        );

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;
