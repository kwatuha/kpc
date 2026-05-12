// api/routes/countyConfigRoutes.js
// API routes for accessing county configuration

const express = require('express');
const router = express.Router();
const { getCountyConfig } = require('../config/countyConfig');

/**
 * @route GET /api/county-config
 * @description Get current county configuration (public info only)
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    const config = getCountyConfig();
    
    // Return only public configuration (exclude sensitive data like DB passwords)
    const publicConfig = {
      county: config.county,
      organization: config.organization,
      labels: config.labels,
      features: config.features
    };
    
    res.status(200).json(publicConfig);
  } catch (error) {
    console.error('Error fetching county configuration:', error);
    res.status(500).json({ message: 'Error fetching county configuration', error: error.message });
  }
});

module.exports = router;




