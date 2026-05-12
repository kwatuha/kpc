const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * @route GET /api/budgets
 * @description Get all approved budgets with optional filters
 * @access Private
 */
router.get('/', async (req, res) => {
    try {
        const { 
            finYearId, 
            departmentId, 
            subcountyId, 
            wardId, 
            projectId,
            status,
            page = 1,
            limit = 50,
            search
        } = req.query;

        let whereConditions = ['b.voided = 0'];
        const queryParams = [];
        const offset = (page - 1) * limit;

        if (finYearId) {
            whereConditions.push('b.finYearId = ?');
            queryParams.push(finYearId);
        }

        if (departmentId) {
            whereConditions.push('b.departmentId = ?');
            queryParams.push(departmentId);
        }

        if (subcountyId) {
            whereConditions.push('b.subcountyId = ?');
            queryParams.push(subcountyId);
        }

        if (wardId) {
            whereConditions.push('b.wardId = ?');
            queryParams.push(wardId);
        }

        if (projectId) {
            whereConditions.push('b.projectId = ?');
            queryParams.push(projectId);
        }

        if (status) {
            whereConditions.push('b.status = ?');
            queryParams.push(status);
        }

        if (search) {
            whereConditions.push('(b.projectName LIKE ? OR p.projectName LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM approved_budgets b
            LEFT JOIN projects p ON b.projectId = p.id
            WHERE ${whereClause}
        `;
        const [countResult] = await pool.query(countQuery, queryParams);
        const total = countResult[0].total;

        // Get budgets with related data
        const query = `
            SELECT 
                b.budgetId,
                b.finYearId,
                b.projectId,
                b.projectName,
                b.departmentId,
                b.subcountyId,
                b.wardId,
                b.amount,
                b.remarks,
                b.approvedBy,
                b.approvedAt,
                b.status,
                b.userId,
                b.createdAt,
                b.updatedAt,
                fy.finYearName as financialYearName,
                d.name as departmentName,
                sc.name as subcountyName,
                w.name as wardName,
                p.projectName as linkedProjectName,
                u.firstName as createdByFirstName,
                u.lastName as createdByLastName,
                approver.firstName as approvedByFirstName,
                approver.lastName as approvedByLastName
            FROM approved_budgets b
            LEFT JOIN financialyears fy ON b.finYearId = fy.finYearId
            LEFT JOIN departments d ON b.departmentId = d.departmentId
            LEFT JOIN subcounties sc ON b.subcountyId = sc.subcountyId
            LEFT JOIN wards w ON b.wardId = w.wardId
            LEFT JOIN projects p ON b.projectId = p.id
            LEFT JOIN users u ON b.userId = u.userId
            LEFT JOIN users approver ON b.approvedBy = approver.userId
            WHERE ${whereClause}
            ORDER BY b.createdAt DESC
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), offset);
        const [budgets] = await pool.query(query, queryParams);

        res.json({
            budgets,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
});

/**
 * @route GET /api/budgets/:budgetId
 * @description Get a single budget by ID
 * @access Private
 */
router.get('/:budgetId', async (req, res) => {
    try {
        const { budgetId } = req.params;

        const query = `
            SELECT 
                b.*,
                fy.finYearName as financialYearName,
                d.name as departmentName,
                sc.name as subcountyName,
                w.name as wardName,
                p.projectName as linkedProjectName,
                u.firstName as createdByFirstName,
                u.lastName as createdByLastName,
                approver.firstName as approvedByFirstName,
                approver.lastName as approvedByLastName
            FROM approved_budgets b
            LEFT JOIN financialyears fy ON b.finYearId = fy.finYearId
            LEFT JOIN departments d ON b.departmentId = d.departmentId
            LEFT JOIN subcounties sc ON b.subcountyId = sc.subcountyId
            LEFT JOIN wards w ON b.wardId = w.wardId
            LEFT JOIN projects p ON b.projectId = p.id
            LEFT JOIN users u ON b.userId = u.userId
            LEFT JOIN users approver ON b.approvedBy = approver.userId
            WHERE b.budgetId = ? AND b.voided = 0
        `;

        const [budgets] = await pool.query(query, [budgetId]);

        if (budgets.length === 0) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.json(budgets[0]);
    } catch (error) {
        console.error('Error fetching budget:', error);
        res.status(500).json({ message: 'Error fetching budget', error: error.message });
    }
});

/**
 * @route POST /api/budgets
 * @description Create a new approved budget
 * @access Private
 */
router.post('/', async (req, res) => {
    try {
        const {
            finYearId,
            projectId,
            projectName,
            departmentId,
            subcountyId,
            wardId,
            amount,
            remarks,
            status = 'Draft'
        } = req.body;

        // Validation
        if (!finYearId || !projectName || !departmentId || !amount) {
            return res.status(400).json({ 
                message: 'Missing required fields: finYearId, projectName, departmentId, and amount are required' 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // TODO: Get userId from authenticated user (e.g., req.user.userId)
        const userId = req.user?.userId || 1;

        const query = `
            INSERT INTO approved_budgets 
            (finYearId, projectId, projectName, departmentId, subcountyId, wardId, amount, remarks, status, userId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            finYearId,
            projectId || null,
            projectName,
            departmentId,
            subcountyId || null,
            wardId || null,
            amount,
            remarks || null,
            status,
            userId
        ]);

        // Fetch the created budget
        const [createdBudget] = await pool.query(
            'SELECT * FROM approved_budgets WHERE budgetId = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Budget created successfully',
            budget: createdBudget[0]
        });
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ message: 'Error creating budget', error: error.message });
    }
});

/**
 * @route PUT /api/budgets/:budgetId
 * @description Update an approved budget
 * @access Private
 */
router.put('/:budgetId', async (req, res) => {
    try {
        const { budgetId } = req.params;
        const {
            finYearId,
            projectId,
            projectName,
            departmentId,
            subcountyId,
            wardId,
            amount,
            remarks,
            status
        } = req.body;

        // Check if budget exists
        const [existing] = await pool.query(
            'SELECT * FROM approved_budgets WHERE budgetId = ? AND voided = 0',
            [budgetId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (finYearId !== undefined) {
            updates.push('finYearId = ?');
            values.push(finYearId);
        }
        if (projectId !== undefined) {
            updates.push('projectId = ?');
            values.push(projectId || null);
        }
        if (projectName !== undefined) {
            updates.push('projectName = ?');
            values.push(projectName);
        }
        if (departmentId !== undefined) {
            updates.push('departmentId = ?');
            values.push(departmentId);
        }
        if (subcountyId !== undefined) {
            updates.push('subcountyId = ?');
            values.push(subcountyId || null);
        }
        if (wardId !== undefined) {
            updates.push('wardId = ?');
            values.push(wardId || null);
        }
        if (amount !== undefined) {
            if (amount <= 0) {
                return res.status(400).json({ message: 'Amount must be greater than 0' });
            }
            updates.push('amount = ?');
            values.push(amount);
        }
        if (remarks !== undefined) {
            updates.push('remarks = ?');
            values.push(remarks || null);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);
            // If status is being set to 'Approved', set approvedBy and approvedAt
            if (status === 'Approved') {
                const approverId = req.user?.userId || 1;
                updates.push('approvedBy = ?');
                updates.push('approvedAt = NOW()');
                values.push(approverId);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(budgetId);

        const query = `
            UPDATE approved_budgets 
            SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP
            WHERE budgetId = ? AND voided = 0
        `;

        await pool.query(query, values);

        // Fetch updated budget
        const [updated] = await pool.query(
            'SELECT * FROM approved_budgets WHERE budgetId = ?',
            [budgetId]
        );

        res.json({
            message: 'Budget updated successfully',
            budget: updated[0]
        });
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ message: 'Error updating budget', error: error.message });
    }
});

/**
 * @route DELETE /api/budgets/:budgetId
 * @description Soft delete an approved budget
 * @access Private
 */
router.delete('/:budgetId', async (req, res) => {
    try {
        const { budgetId } = req.params;
        // TODO: Get userId from authenticated user
        const userId = req.user?.userId || 1;

        const [result] = await pool.query(
            'UPDATE approved_budgets SET voided = 1, voidedBy = ?, voidedAt = NOW() WHERE budgetId = ? AND voided = 0',
            [userId, budgetId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Budget not found or already deleted' });
        }

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ message: 'Error deleting budget', error: error.message });
    }
});

/**
 * @route GET /api/budgets/stats/summary
 * @description Get budget summary statistics
 * @access Private
 */
router.get('/stats/summary', async (req, res) => {
    try {
        const { finYearId, departmentId, subcountyId, wardId } = req.query;

        let whereConditions = ['b.voided = 0', "b.status = 'Approved'"];
        const queryParams = [];

        if (finYearId) {
            whereConditions.push('b.finYearId = ?');
            queryParams.push(finYearId);
        }
        if (departmentId) {
            whereConditions.push('b.departmentId = ?');
            queryParams.push(departmentId);
        }
        if (subcountyId) {
            whereConditions.push('b.subcountyId = ?');
            queryParams.push(subcountyId);
        }
        if (wardId) {
            whereConditions.push('b.wardId = ?');
            queryParams.push(wardId);
        }

        const whereClause = whereConditions.join(' AND ');

        const query = `
            SELECT 
                COUNT(*) as totalBudgets,
                SUM(b.amount) as totalAmount,
                COUNT(DISTINCT b.finYearId) as totalFinancialYears,
                COUNT(DISTINCT b.departmentId) as totalDepartments,
                COUNT(DISTINCT b.subcountyId) as totalSubcounties,
                COUNT(DISTINCT b.wardId) as totalWards
            FROM approved_budgets b
            WHERE ${whereClause}
        `;

        const [stats] = await pool.query(query, queryParams);

        res.json(stats[0] || {
            totalBudgets: 0,
            totalAmount: 0,
            totalFinancialYears: 0,
            totalDepartments: 0,
            totalSubcounties: 0,
            totalWards: 0
        });
    } catch (error) {
        console.error('Error fetching budget stats:', error);
        res.status(500).json({ message: 'Error fetching budget stats', error: error.message });
    }
});

module.exports = router;










