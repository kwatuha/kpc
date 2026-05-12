// src/routes/metadataRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Import sub-routers from the new /metadata folder
const departmentRouter = require('./metadata/departmentRoutes');
const financialYearRouter = require('./metadata/financialYearRoutes');
const programRouter = require('./metadata/programRoutes');
const subProgramRouter = require('./metadata/subProgramRoutes');
const countyRouter = require('./metadata/countyRoutes');
const subcountyRouter = require('./metadata/subcountyRoutes');
const wardRouter = require('./metadata/wardRoutes');
const projectCategoryRouter = require('./metadata/projectCategoryRoutes');
const sectionRouter = require('./metadata/sectionRoutes'); // <-- CORRECTED: Added this import

// Mount sub-routers under their respective paths
router.use('/departments', departmentRouter);
router.use('/financialyears', financialYearRouter);
router.use('/programs', programRouter);
router.use('/subprograms', subProgramRouter);
router.use('/counties', countyRouter);
router.use('/subcounties', subcountyRouter);
router.use('/wards', wardRouter);
router.use('/projectcategories', projectCategoryRouter);
router.use('/sections', sectionRouter); // <-- CORRECTED: Mounted the sectionRouter

/**
 * @route GET /api/metadata/import-cache
 * @description Get all metadata needed for import validation (optimized, names only)
 * @access Private
 * This endpoint returns lightweight metadata for client-side caching and comparison
 */
router.get('/import-cache', async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Fetch all metadata in parallel (optimized queries - only names)
        const [departments] = await pool.query(
            'SELECT name, alias FROM departments WHERE (voided IS NULL OR voided = 0)'
        );
        const [wards] = await pool.query(
            'SELECT name FROM wards WHERE (voided IS NULL OR voided = 0)'
        );
        const [subcounties] = await pool.query(
            'SELECT name FROM subcounties WHERE (voided IS NULL OR voided = 0)'
        );
        const [financialYears] = await pool.query(
            'SELECT finYearName FROM financialyears WHERE (voided IS NULL OR voided = 0)'
        );
        const [budgets] = await pool.query(
            'SELECT budgetName FROM budgets WHERE voided = 0'
        );
        
        const queryTime = Date.now() - startTime;
        console.log(`Metadata cache query took ${queryTime}ms`);
        
        res.json({
            departments: departments.map(d => ({ name: d.name, alias: d.alias || '' })),
            wards: wards.map(w => w.name),
            subcounties: subcounties.map(s => s.name),
            financialYears: financialYears.map(fy => fy.finYearName),
            budgets: budgets.map(b => b.budgetName),
            cachedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching metadata cache:', error);
        res.status(500).json({ message: 'Error fetching metadata cache', error: error.message });
    }
});

module.exports = router;