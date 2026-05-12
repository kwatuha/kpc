// src/routes/contractorPhotoRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/db');

// Multer storage for contractor photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/contractor-photos/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

/**
 * @route POST /api/contractors/:contractorId/photos
 * @description A contractor uploads a new photo to a project.
 * @access Private (contractor only)
 */
router.post('/:contractorId/photos', upload.single('file'), async (req, res) => {
    const { contractorId } = req.params;
    const { projectId, caption } = req.body;
    const file = req.file;
    if (!file || !projectId) {
        return res.status(400).json({ message: 'File and projectId are required.' });
    }
    const newPhoto = {
        projectId,
        contractorId,
        filePath: file.path,
        caption: caption || `Photo submitted by contractor ${contractorId}`,
        status: 'Pending Review'
    };
    try {
        const [result] = await pool.query('INSERT INTO contractor_photos SET ?', newPhoto);
        res.status(201).json({ message: 'Photo uploaded successfully', photoId: result.insertId });
    } catch (error) {
        console.error('Error uploading contractor photo:', error);
        res.status(500).json({ message: 'Error uploading contractor photo', error: error.message });
    }
});

/**
 * @route GET /api/projects/:projectId/contractor-photos
 * @description Get all photos submitted by contractors for a specific project.
 * @access Private (project manager only)
 */
router.get('/projects/:projectId/contractor-photos', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM contractor_photos WHERE projectId = ? ORDER BY submittedAt DESC',
            [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractor photos:', error);
        res.status(500).json({ message: 'Error fetching contractor photos', error: error.message });
    }
});

/**
 * @route PUT /api/contractor-photos/:photoId/status
 * @description A project manager updates the status of a contractor's photo.
 * @access Private (project manager only)
 */
router.put('/:photoId/status', async (req, res) => {
    const { photoId } = req.params;
    const { status } = req.body; // e.g., 'Approved', 'Rejected'
    if (!status) {
        return res.status(400).json({ message: 'New status is required.' });
    }
    try {
        const [result] = await pool.query('UPDATE contractor_photos SET status = ? WHERE photoId = ?', [status, photoId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Photo not found.' });
        }
        res.status(200).json({ message: 'Photo status updated successfully.' });
    } catch (error) {
        console.error('Error updating photo status:', error);
        res.status(500).json({ message: 'Error updating photo status', error: error.message });
    }
});

module.exports = router;