// routes/orgRoutes.js
const express = require('express');
const router = express.Router();
// Removed: const { mapKeysToCamelCase, mapKeysToSnakeCase } = require('../utils/fieldFormatter'); // No longer needed
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for County Departments (departments) ---

/**
 * @route GET /api/organization/county_departments
 * @description Get all county departments.
 */
router.get('/county_departments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM departments');
        res.status(200).json(rows); // Directly return rows, assuming DB now returns camelCase
    } catch (error) {
        console.error('Error fetching county departments:', error);
        res.status(500).json({ message: 'Error fetching county departments', error: error.message });
    }
});

/**
 * @route GET /api/organization/county_departments/:id
 * @description Get a single county department by ID.
 */
router.get('/county_departments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM departments WHERE departmentId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'County department not found' });
        }
    } catch (error) {
        console.error('Error fetching county department:', error);
        res.status(500).json({ message: 'Error fetching county department', error: error.message });
    }
});

/**
 * @route POST /api/organization/county_departments
 * @description Create a new county department.
 */
router.post('/county_departments', async (req, res) => {
    // Directly use req.body
    const newDepartment = {
        departmentId: req.body.departmentId || `d${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO departments SET ?', newDepartment);
        if (result.insertId) {
            newDepartment.departmentId = result.insertId;
        }
        res.status(201).json(newDepartment); // Return as is
    } catch (error) {
        console.error('Error creating county department:', error);
        res.status(500).json({ message: 'Error creating county department', error: error.message });
    }
});

/**
 * @route PUT /api/organization/county_departments/:id
 * @description Update an existing county department.
 */
router.put('/county_departments/:id', async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE departments SET ? WHERE departmentId = ?', [fieldsToUpdate, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM departments WHERE departmentId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]); // Return as is
        } else {
            res.status(404).json({ message: 'County department not found' });
        }
    } catch (error) {
        console.error('Error updating county department:', error);
        res.status(500).json({ message: 'Error updating county department', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/county_departments/:id
 * @description Delete a county department.
 */
router.delete('/county_departments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM departments WHERE departmentId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'County department not found' });
        }
    } catch (error) {
        console.error('Error deleting county department:', error);
        res.status(500).json({ message: 'Error deleting county department', error: error.message });
    }
});

// --- CRUD Operations for Department Sections (sections) ---

/**
 * @route GET /api/organization/department_sections
 * @description Get all department sections.
 */
router.get('/department_sections', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sections');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching department sections:', error);
        res.status(500).json({ message: 'Error fetching department sections', error: error.message });
    }
});

/**
 * @route GET /api/organization/department_sections/:id
 * @description Get a single department section by ID.
 */
router.get('/department_sections/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM sections WHERE sectionId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Department section not found' });
        }
    } catch (error) {
        console.error('Error fetching department section:', error);
        res.status(500).json({ message: 'Error fetching department section', error: error.message });
    }
});

/**
 * @route POST /api/organization/department_sections
 * @description Create a new department section.
 */
router.post('/department_sections', async (req, res) => {
    // Directly use req.body
    const newSection = {
        sectionId: req.body.sectionId || `sct${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO sections SET ?', newSection);
        if (result.insertId) {
            newSection.sectionId = result.insertId;
        }
        res.status(201).json(newSection);
    } catch (error) {
        console.error('Error creating department section:', error);
        res.status(500).json({ message: 'Error creating department section', error: error.message });
    }
});

/**
 * @route PUT /api/organization/department_sections/:id
 * @description Update an existing department section.
 */
router.put('/department_sections/:id', async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE sections SET ? WHERE sectionId = ?', [fieldsToUpdate, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM sections WHERE sectionId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Department section not found' });
        }
    } catch (error) {
        console.error('Error updating department section:', error);
        res.status(500).json({ message: 'Error updating department section', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/department_sections/:id
 * @description Delete a department section.
 */
router.delete('/department_sections/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM sections WHERE sectionId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Department section not found' });
        }
    } catch (error) {
        console.error('Error deleting department section:', error);
        res.status(500).json({ message: 'Error deleting department section', error: error.message });
    }
});

// --- CRUD Operations for Subcounties (subcounties) ---

/**
 * @route GET /api/organization/subcounties
 * @description Get all subcounties.
 */
router.get('/subcounties', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subcounties');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching subcounties:', error);
        res.status(500).json({ message: 'Error fetching subcounties', error: error.message });
    }
});

/**
 * @route GET /api/organization/subcounties/:id
 * @description Get a single subcounty by ID.
 */
router.get('/subcounties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM subcounties WHERE subcountyId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Subcounty not found' });
        }
    } catch (error) {
        console.error('Error fetching subcounty:', error);
        res.status(500).json({ message: 'Error fetching subcounty', error: error.message });
    }
});

/**
 * @route POST /api/organization/subcounties
 * @description Create a new subcounty.
 */
router.post('/subcounties', async (req, res) => {
    // Directly use req.body
    const newSubcounty = {
        subcountyId: req.body.subcountyId || `sc${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO subcounties SET ?', newSubcounty);
        if (result.insertId) {
            newSubcounty.subcountyId = result.insertId;
        }
        res.status(201).json(newSubcounty);
    } catch (error) {
        console.error('Error creating subcounty:', error);
        res.status(500).json({ message: 'Error creating subcounty', error: error.message });
    }
});

/**
 * @route PUT /api/organization/subcounties/:id
 * @description Update an existing subcounty.
 */
router.put('/subcounties/:id', async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE subcounties SET ? WHERE subcountyId = ?', [fieldsToUpdate, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM subcounties WHERE subcountyId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Subcounty not found' });
        }
    } catch (error) {
        console.error('Error updating subcounty:', error);
        res.status(500).json({ message: 'Error updating subcounty', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/subcounties/:id
 * @description Delete a subcounty.
 */
router.delete('/subcounties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM subcounties WHERE subcountyId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Subcounty not found' });
        }
    } catch (error) {
        console.error('Error deleting subcounty:', error);
        res.status(500).json({ message: 'Error deleting subcounty', error: error.message });
    }
});

// --- CRUD Operations for Wards ---

/**
 * @route GET /api/organization/wards
 * @description Get all wards.
 */
router.get('/wards', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM wards');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching wards:', error);
        res.status(500).json({ message: 'Error fetching wards', error: error.message });
    }
});

/**
 * @route GET /api/organization/wards/:id
 * @description Get a single ward by ID.
 */
router.get('/wards/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM wards WHERE wardId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Ward not found' });
        }
    } catch (error) {
        console.error('Error fetching ward:', error);
        res.status(500).json({ message: 'Error fetching ward', error: error.message });
    }
});

/**
 * @route POST /api/organization/wards
 * @description Create a new ward.
 */
router.post('/wards', async (req, res) => {
    const newWard = {
        wardId: req.body.wardId || `w${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO wards SET ?', newWard);
        if (result.insertId) {
            newWard.wardId = result.insertId;
        }
        res.status(201).json(newWard);
    } catch (error) {
        console.error('Error creating ward:', error);
        res.status(500).json({ message: 'Error creating ward', error: error.message });
    }
});

/**
 * @route PUT /api/organization/wards/:id
 * @description Update an existing ward.
 */
router.put('/wards/:id', async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE wards SET ? WHERE wardId = ?', [fieldsToUpdate, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM wards WHERE wardId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Ward not found' });
        }
    } catch (error) {
        console.error('Error updating ward:', error);
        res.status(500).json({ message: 'Error updating ward', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/wards/:id
 * @description Delete a ward.
 */
router.delete('/wards/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM wards WHERE wardId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Ward not found' });
        }
    } catch (error) {
        console.error('Error deleting ward:', error);
        res.status(500).json({ message: 'Error deleting ward', error: error.message });
    }
});

// --- CRUD Operations for Categories ---

/**
 * @route GET /api/organization/categories
 * @description Get all categories.
 */
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

/**
 * @route GET /api/organization/categories/:id
 * @description Get a single category by ID.
 */
router.get('/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM categories WHERE categoryId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
});

/**
 * @route POST /api/organization/categories
 * @description Create a new category.
 */
router.post('/categories', async (req, res) => {
    const newCategory = {
        categoryId: req.body.categoryId || `cat${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO categories SET ?', newCategory);
        if (result.insertId) {
            newCategory.categoryId = result.insertId;
        }
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});

/**
 * @route PUT /api/organization/categories/:id
 * @description Update an existing category.
 */
router.put('/categories/:id', async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE categories SET ? WHERE categoryId = ?', [fieldsToUpdate, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM categories WHERE categoryId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/categories/:id
 * @description Delete a category.
 */
router.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM categories WHERE categoryId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});

// --- CRUD Operations for Attachment Types ---

/**
 * @route GET /api/organization/attachment_types
 * @description Get all attachment types.
 */
router.get('/attachment_types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM attachmenttypes');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching attachment types:', error);
        res.status(500).json({ message: 'Error fetching attachment types', error: error.message });
    }
});

/**
 * @route GET /api/organization/attachment_types/:id
 * @description Get a single attachment type by ID.
 */
router.get('/attachment_types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM attachmenttypes WHERE typeId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Attachment type not found' });
        }
    } catch (error) {
        console.error('Error fetching attachment type:', error);
        res.status(500).json({ message: 'Error fetching attachment type', error: error.message });
    }
});

/**
 * @route POST /api/organization/attachment_types
 * @description Create a new attachment type.
 */
router.post('/attachment_types', async (req, res) => {
    const newAttachmentType = {
        typeId: req.body.typeId || `at${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO attachmenttypes SET ?', newAttachmentType);
        if (result.insertId) {
            newAttachmentType.typeId = result.insertId;
        }
        res.status(201).json(newAttachmentType);
    } catch (error) {
        console.error('Error creating attachment type:', error);
        res.status(500).json({ message: 'Error creating attachment type', error: error.message });
    }
});

/**
 * @route PUT /api/organization/attachment_types/:id
 * @description Update an existing attachment type.
 */
router.put('/attachment_types/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE attachmenttypes SET ? WHERE typeId = ?', [updatedFields, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM attachmenttypes WHERE typeId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Attachment type not found' });
        }
    } catch (error) {
        console.error('Error updating attachment type:', error);
        res.status(500).json({ message: 'Error updating attachment type', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/attachment_types/:id
 * @description Delete an attachment type.
 */
router.delete('/attachment_types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM attachmenttypes WHERE typeId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Attachment type not found' });
        }
    } catch (error) {
        console.error('Error deleting attachment type:', error);
        res.status(500).json({ message: 'Error deleting attachment type', error: error.message });
    }
});

// --- CRUD Operations for Financial Years ---

/**
 * @route GET /api/organization/financial_years
 * @description Get all financial years.
 */
router.get('/financial_years', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM financialyears');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching financial years:', error);
        res.status(500).json({ message: 'Error fetching financial years', error: error.message });
    }
});

/**
 * @route GET /api/organization/financial_years/:id
 * @description Get a single financial year by ID.
 */
router.get('/financial_years/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM financialyears WHERE finYearId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Financial year not found' });
        }
    } catch (error) {
        console.error('Error fetching financial year:', error);
        res.status(500).json({ message: 'Error fetching financial year', error: error.message });
    }
});

/**
 * @route POST /api/organization/financial_years
 * @description Create a new financial year.
 */
router.post('/financial_years', async (req, res) => {
    const newFinancialYear = {
        finYearId: req.body.finYearId || `fy${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: 0, // Explicitly set to 0 (not false) for consistency
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    // Ensure voided is explicitly set to 0 (override any value from req.body)
    newFinancialYear.voided = 0;
    try {
        const [result] = await pool.query('INSERT INTO financialyears SET ?', newFinancialYear);
        if (result.insertId) {
            newFinancialYear.finYearId = result.insertId;
        }
        res.status(201).json(newFinancialYear);
    } catch (error) {
        console.error('Error creating financial year:', error);
        res.status(500).json({ message: 'Error creating financial year', error: error.message });
    }
});

/**
 * @route PUT /api/organization/financial_years/:id
 * @description Update an existing financial year.
 */
router.put('/financial_years/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    // If voided is not explicitly set to 1 (deleted), ensure it's 0 (active)
    // This prevents NULL values from being set
    if (updatedFields.voided !== 1) {
        updatedFields.voided = 0;
    }
    try {
        const [result] = await pool.query('UPDATE financialyears SET ? WHERE finYearId = ?', [updatedFields, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM financialyears WHERE finYearId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Financial year not found' });
        }
    } catch (error) {
        console.error('Error updating financial year:', error);
        res.status(500).json({ message: 'Error updating financial year', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/financial_years/:id
 * @description Delete a financial year.
 */
router.delete('/financial_years/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM financialyears WHERE finYearId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Financial year not found' });
        }
    } catch (error) {
        console.error('Error deleting financial year:', error);
        res.status(500).json({ message: 'Error deleting financial year', error: error.message });
    }
});

// --- CRUD Operations for Contractors ---

/**
 * @route GET /api/organization/contractors
 * @description Get all contractors.
 */
router.get('/contractors', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contractors');
        res.status(200).json(rows); // Directly return rows
    } catch (error) {
        console.error('Error fetching contractors:', error);
        res.status(500).json({ message: 'Error fetching contractors', error: error.message });
    }
});

/**
 * @route GET /api/organization/contractors/:id
 * @description Get a single contractor by ID.
 */
router.get('/contractors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM contractors WHERE contractorId = ?', [id]); // Use camelCase column name
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Directly return row
        } else {
            res.status(404).json({ message: 'Contractor not found' });
        }
    } catch (error) {
        console.error('Error fetching contractor:', error);
        res.status(500).json({ message: 'Error fetching contractor', error: error.message });
    }
});

/**
 * @route POST /api/organization/contractors
 * @description Create a new contractor.
 */
router.post('/contractors', async (req, res) => {
    const newContractor = {
        contractorId: req.body.contractorId || `c${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Use camelCase column name
        voided: false,
        voidedBy: null, // Use camelCase column name
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO contractors SET ?', newContractor);
        if (result.insertId) {
            newContractor.contractorId = result.insertId;
        }
        res.status(201).json(newContractor);
    } catch (error) {
        console.error('Error creating contractor:', error);
        res.status(500).json({ message: 'Error creating contractor', error: error.message });
    }
});

/**
 * @route PUT /api/organization/contractors/:id
 * @description Update an existing contractor.
 */
router.put('/contractors/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE contractors SET ? WHERE contractorId = ?', [updatedFields, id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM contractors WHERE contractorId = ?', [id]); // Use camelCase column name
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Contractor not found' });
        }
    } catch (error) {
        console.error('Error updating contractor:', error);
        res.status(500).json({ message: 'Error updating contractor', error: error.message });
    }
});

/**
 * @route DELETE /api/organization/contractors/:id
 * @description Delete a contractor.
 */
router.delete('/contractors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM contractors WHERE contractorId = ?', [id]); // Use camelCase column name
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Contractor not found' });
        }
    } catch (error) {
        console.error('Error deleting contractor:', error);
        res.status(500).json({ message: 'Error deleting contractor', error: error.message });
    }
});

module.exports = router;
