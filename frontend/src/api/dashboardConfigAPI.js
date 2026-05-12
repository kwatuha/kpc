// Backend API Implementation for Database-Driven Dashboard Configuration
// This file contains the backend API endpoints that should be implemented in your backend

// ==============================================
// API ENDPOINTS TO IMPLEMENT IN YOUR BACKEND
// ==============================================

/*
BACKEND IMPLEMENTATION GUIDE:

1. Create these API endpoints in your backend (Node.js/Express, Python/Django, etc.)
2. Use the provided SQL queries for database operations
3. Implement proper authentication and authorization
4. Add caching for performance optimization

API ENDPOINTS TO CREATE:

GET /api/dashboard/config/role/{roleName}
GET /api/dashboard/config/user/{userId}
GET /api/dashboard/components
GET /api/dashboard/tabs
GET /api/dashboard/permissions/user/{userId}
GET /api/dashboard/permissions/component/{userId}/{componentKey}
GET /api/dashboard/permissions/tab/{userId}/{tabKey}
GET /api/dashboard/layout/{userId}
PUT /api/dashboard/preferences/user/{userId}
POST /api/dashboard/admin/components
PUT /api/dashboard/admin/components/{componentKey}
DELETE /api/dashboard/admin/components/{componentKey}
PUT /api/dashboard/admin/roles/{roleName}
PUT /api/dashboard/admin/roles/{roleName}/permissions

*/

// ==============================================
// SAMPLE BACKEND IMPLEMENTATION (Node.js/Express)
// ==============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Your database connection

// GET /api/dashboard/config/role/{roleName}
router.get('/config/role/:roleName', async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const query = `
      SELECT 
        dt.tab_key,
        dt.tab_name,
        dt.tab_icon,
        dt.tab_order,
        rdc.component_key,
        dc.component_name,
        dc.component_type,
        dc.component_file,
        rdc.component_order,
        rdc.is_required,
        rdc.permissions
      FROM role_dashboard_config rdc
      JOIN dashboard_tabs dt ON rdc.tab_key = dt.tab_key
      JOIN dashboard_components dc ON rdc.component_key = dc.component_key
      WHERE rdc.role_name = $1 
        AND dt.is_active = true 
        AND dc.is_active = true
      ORDER BY dt.tab_order, rdc.component_order
    `;
    
    const result = await db.query(query, [roleName]);
    
    // Group by tabs
    const tabs = {};
    result.rows.forEach(row => {
      if (!tabs[row.tab_key]) {
        tabs[row.tab_key] = {
          tab_key: row.tab_key,
          tab_name: row.tab_name,
          tab_icon: row.tab_icon,
          tab_order: row.tab_order,
          components: []
        };
      }
      
      tabs[row.tab_key].components.push({
        component_key: row.component_key,
        component_name: row.component_name,
        component_type: row.component_type,
        component_file: row.component_file,
        component_order: row.component_order,
        is_required: row.is_required,
        permissions: row.permissions
      });
    });
    
    res.json({
      role: roleName,
      tabs: Object.values(tabs)
    });
  } catch (error) {
    console.error('Error fetching role dashboard config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/config/user/{userId}
router.get('/config/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user role
    const userQuery = 'SELECT role FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userRole = userResult.rows[0].role;
    
    // Get role-based configuration
    const roleConfigQuery = `
      SELECT 
        dt.tab_key,
        dt.tab_name,
        dt.tab_icon,
        dt.tab_order,
        rdc.component_key,
        dc.component_name,
        dc.component_type,
        dc.component_file,
        rdc.component_order,
        rdc.is_required,
        rdc.permissions
      FROM role_dashboard_config rdc
      JOIN dashboard_tabs dt ON rdc.tab_key = dt.tab_key
      JOIN dashboard_components dc ON rdc.component_key = dc.component_key
      WHERE rdc.role_name = $1 
        AND dt.is_active = true 
        AND dc.is_active = true
      ORDER BY dt.tab_order, rdc.component_order
    `;
    
    const roleResult = await db.query(roleConfigQuery, [userRole]);
    
    // Get user preferences
    const preferencesQuery = `
      SELECT 
        tab_key,
        component_key,
        is_enabled,
        component_order,
        custom_settings
      FROM user_dashboard_preferences
      WHERE user_id = $1
    `;
    
    const preferencesResult = await db.query(preferencesQuery, [userId]);
    
    // Merge role config with user preferences
    const tabs = {};
    roleResult.rows.forEach(row => {
      if (!tabs[row.tab_key]) {
        tabs[row.tab_key] = {
          tab_key: row.tab_key,
          tab_name: row.tab_name,
          tab_icon: row.tab_icon,
          tab_order: row.tab_order,
          components: []
        };
      }
      
      // Check if user has overridden this component
      const userPreference = preferencesResult.rows.find(
        pref => pref.tab_key === row.tab_key && pref.component_key === row.component_key
      );
      
      if (!userPreference || userPreference.is_enabled) {
        tabs[row.tab_key].components.push({
          component_key: row.component_key,
          component_name: row.component_name,
          component_type: row.component_type,
          component_file: row.component_file,
          component_order: userPreference?.component_order || row.component_order,
          is_required: row.is_required,
          permissions: row.permissions,
          custom_settings: userPreference?.custom_settings
        });
      }
    });
    
    res.json({
      user_id: userId,
      role: userRole,
      tabs: Object.values(tabs)
    });
  } catch (error) {
    console.error('Error fetching user dashboard config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/layout/{userId}
router.get('/layout/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user dashboard layout
    const layoutQuery = `
      SELECT 
        dt.tab_key,
        dt.tab_name,
        dt.tab_icon,
        dt.tab_order,
        rdc.component_key,
        dc.component_name,
        dc.component_type,
        dc.component_file,
        rdc.component_order,
        rdc.is_required
      FROM users u
      JOIN role_dashboard_config rdc ON u.role = rdc.role_name
      JOIN dashboard_tabs dt ON rdc.tab_key = dt.tab_key
      JOIN dashboard_components dc ON rdc.component_key = dc.component_key
      WHERE u.id = $1 
        AND dt.is_active = true 
        AND dc.is_active = true
      ORDER BY dt.tab_order, rdc.component_order
    `;
    
    const result = await db.query(layoutQuery, [userId]);
    
    // Group by tabs
    const tabs = {};
    const components = {};
    
    result.rows.forEach(row => {
      if (!tabs[row.tab_key]) {
        tabs[row.tab_key] = {
          tab_key: row.tab_key,
          tab_name: row.tab_name,
          tab_icon: row.tab_icon,
          tab_order: row.tab_order
        };
      }
      
      if (!components[row.tab_key]) {
        components[row.tab_key] = [];
      }
      
      components[row.tab_key].push({
        component_key: row.component_key,
        component_name: row.component_name,
        component_type: row.component_type,
        component_file: row.component_file,
        component_order: row.component_order,
        is_required: row.is_required
      });
    });
    
    res.json({
      user_id: userId,
      tabs: Object.values(tabs),
      components: components
    });
  } catch (error) {
    console.error('Error fetching dashboard layout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/permissions/user/{userId}
router.get('/permissions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        dp.permission_key,
        dp.permission_name,
        dp.description,
        rdp.granted
      FROM users u
      JOIN role_dashboard_permissions rdp ON u.role = rdp.role_name
      JOIN dashboard_permissions dp ON rdp.permission_key = dp.permission_key
      WHERE u.id = $1 AND dp.is_active = true
    `;
    
    const result = await db.query(query, [userId]);
    
    const permissions = {};
    result.rows.forEach(row => {
      permissions[row.permission_key] = {
        permission_name: row.permission_name,
        description: row.description,
        granted: row.granted
      };
    });
    
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/permissions/component/{userId}/{componentKey}
router.get('/permissions/component/:userId/:componentKey', async (req, res) => {
  try {
    const { userId, componentKey } = req.params;
    
    // Check if user can access this component
    const query = `
      SELECT 
        dc.component_key,
        dc.component_name,
        rdp.granted
      FROM users u
      JOIN role_dashboard_config rdc ON u.role = rdc.role_name
      JOIN dashboard_components dc ON rdc.component_key = dc.component_key
      JOIN role_dashboard_permissions rdp ON u.role = rdp.role_name
      JOIN dashboard_permissions dp ON rdp.permission_key = dp.permission_key
      WHERE u.id = $1 
        AND rdc.component_key = $2
        AND dp.component_key = $2
        AND dc.is_active = true
    `;
    
    const result = await db.query(query, [userId, componentKey]);
    
    const canAccess = result.rows.length > 0 && result.rows.every(row => row.granted);
    
    res.json({
      component_key: componentKey,
      canAccess: canAccess,
      permissions: result.rows
    });
  } catch (error) {
    console.error('Error checking component access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/permissions/tab/{userId}/{tabKey}
router.get('/permissions/tab/:userId/:tabKey', async (req, res) => {
  try {
    const { userId, tabKey } = req.params;
    
    // Check if user can access this tab
    const query = `
      SELECT 
        dt.tab_key,
        dt.tab_name,
        COUNT(rdc.component_key) as component_count
      FROM users u
      JOIN role_dashboard_config rdc ON u.role = rdc.role_name
      JOIN dashboard_tabs dt ON rdc.tab_key = dt.tab_key
      WHERE u.id = $1 
        AND rdc.tab_key = $2
        AND dt.is_active = true
      GROUP BY dt.tab_key, dt.tab_name
    `;
    
    const result = await db.query(query, [userId, tabKey]);
    
    const canAccess = result.rows.length > 0 && result.rows[0].component_count > 0;
    
    res.json({
      tab_key: tabKey,
      canAccess: canAccess,
      component_count: result.rows[0]?.component_count || 0
    });
  } catch (error) {
    console.error('Error checking tab access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/dashboard/preferences/user/{userId}
router.put('/preferences/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    // Update user dashboard preferences
    const updateQuery = `
      INSERT INTO user_dashboard_preferences 
      (user_id, tab_key, component_key, is_enabled, component_order, custom_settings)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, tab_key, component_key)
      DO UPDATE SET
        is_enabled = EXCLUDED.is_enabled,
        component_order = EXCLUDED.component_order,
        custom_settings = EXCLUDED.custom_settings,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    for (const preference of preferences) {
      await db.query(updateQuery, [
        userId,
        preference.tab_key,
        preference.component_key,
        preference.is_enabled,
        preference.component_order,
        JSON.stringify(preference.custom_settings)
      ]);
    }
    
    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoints for managing dashboard configuration
// GET /api/dashboard/admin/components
router.get('/admin/components', async (req, res) => {
  try {
    const query = `
      SELECT 
        component_key,
        component_name,
        component_type,
        component_file,
        description,
        is_active,
        created_at,
        updated_at
      FROM dashboard_components
      ORDER BY component_name
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/dashboard/admin/components
router.post('/admin/components', async (req, res) => {
  try {
    const { component_key, component_name, component_type, component_file, description } = req.body;
    
    const query = `
      INSERT INTO dashboard_components 
      (component_key, component_name, component_type, component_file, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [component_key, component_name, component_type, component_file, description]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/dashboard/admin/components/{componentKey}
router.put('/admin/components/:componentKey', async (req, res) => {
  try {
    const { componentKey } = req.params;
    const { component_name, component_type, component_file, description, is_active } = req.body;
    
    const query = `
      UPDATE dashboard_components 
      SET 
        component_name = $1,
        component_type = $2,
        component_file = $3,
        description = $4,
        is_active = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE component_key = $6
      RETURNING *
    `;
    
    const result = await db.query(query, [component_name, component_type, component_file, description, is_active, componentKey]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating component:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/dashboard/admin/components/{componentKey}
router.delete('/admin/components/:componentKey', async (req, res) => {
  try {
    const { componentKey } = req.params;
    
    const query = 'DELETE FROM dashboard_components WHERE component_key = $1';
    await db.query(query, [componentKey]);
    
    res.json({ success: true, message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting component:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;











