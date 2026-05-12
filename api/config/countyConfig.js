// api/config/countyConfig.js
// County configuration loader for multi-tenant support

const fs = require('fs');
const path = require('path');

/**
 * Load county configuration
 * Priority: COUNTY_CODE env var > default
 */
function loadCountyConfig() {
  const countyCode = process.env.COUNTY_CODE || 'default';
  const configPath = path.join(__dirname, '../../config/counties', `${countyCode.toLowerCase()}.json`);
  
  let config;
  
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configData);
      console.log(`✓ Loaded county configuration: ${config.county.name} (${config.county.code})`);
    } else {
      // Fallback to default
      const defaultPath = path.join(__dirname, '../../config/counties/default.json');
      if (fs.existsSync(defaultPath)) {
        const defaultData = fs.readFileSync(defaultPath, 'utf8');
        config = JSON.parse(defaultData);
        console.log(`⚠ County config not found for ${countyCode}, using default configuration`);
      } else {
        throw new Error('Default county configuration not found');
      }
    }
  } catch (error) {
    console.error('Error loading county configuration:', error);
    throw error;
  }
  
  return config;
}

/**
 * Get current county configuration (singleton)
 */
let countyConfig = null;

function getCountyConfig() {
  if (!countyConfig) {
    countyConfig = loadCountyConfig();
  }
  return countyConfig;
}

/**
 * Reload county configuration (useful for testing or dynamic switching)
 */
function reloadCountyConfig() {
  countyConfig = null;
  return getCountyConfig();
}

module.exports = {
  getCountyConfig,
  reloadCountyConfig,
  loadCountyConfig
};




