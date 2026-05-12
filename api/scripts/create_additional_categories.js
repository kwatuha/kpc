/**
 * Script to create additional project categories found in NIMES file
 * This ensures all categories from the import file have proper milestone templates
 */

const pool = require('../config/db');

const additionalCategoriesWithMilestones = [
    {
        categoryName: 'Agriculture',
        milestones: [
            { milestoneName: 'Planning and Design', description: 'Agricultural project planning and design completed', sequenceOrder: 1 },
            { milestoneName: 'Land Preparation', description: 'Land clearing and preparation completed', sequenceOrder: 2 },
            { milestoneName: 'Seed/Input Distribution', description: 'Seeds and agricultural inputs distributed', sequenceOrder: 3 },
            { milestoneName: 'Planting/Harvesting Completed', description: 'Planting and/or harvesting activities completed', sequenceOrder: 4 },
            { milestoneName: 'Training Conducted', description: 'Farmer training sessions conducted', sequenceOrder: 5 },
            { milestoneName: 'Project Handover', description: 'Agricultural project handed over to beneficiaries', sequenceOrder: 6 }
        ]
    },
    {
        categoryName: 'Education Facilities',
        milestones: [
            { milestoneName: 'Site Preparation', description: 'Education facility site prepared', sequenceOrder: 1 },
            { milestoneName: 'Foundation Completed', description: 'Foundation works completed', sequenceOrder: 2 },
            { milestoneName: 'Construction Completed', description: 'Education facility construction completed', sequenceOrder: 3 },
            { milestoneName: 'Furniture and Equipment', description: 'Furniture and equipment installed', sequenceOrder: 4 },
            { milestoneName: 'Facility Commissioned', description: 'Education facility commissioned', sequenceOrder: 5 },
            { milestoneName: 'Project Handover', description: 'Education facility handed over', sequenceOrder: 6 }
        ]
    },
    {
        categoryName: 'Education Support',
        milestones: [
            { milestoneName: 'Needs Assessment', description: 'Educational needs assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Materials Development', description: 'Educational materials and curriculum developed', sequenceOrder: 2 },
            { milestoneName: 'Training Sessions Conducted', description: 'Training sessions for educators conducted', sequenceOrder: 3 },
            { milestoneName: 'Resources Distributed', description: 'Educational resources distributed', sequenceOrder: 4 },
            { milestoneName: 'Project Handover', description: 'Education support project completed', sequenceOrder: 5 }
        ]
    },
    {
        categoryName: 'Energy',
        milestones: [
            { milestoneName: 'Feasibility Study', description: 'Energy project feasibility study completed', sequenceOrder: 1 },
            { milestoneName: 'Design Approval', description: 'Energy system design approved', sequenceOrder: 2 },
            { milestoneName: 'Infrastructure Installation', description: 'Energy infrastructure installed', sequenceOrder: 3 },
            { milestoneName: 'System Testing', description: 'Energy system tested and commissioned', sequenceOrder: 4 },
            { milestoneName: 'Connection to Grid', description: 'Connection to power grid completed', sequenceOrder: 5 },
            { milestoneName: 'Project Handover', description: 'Energy project handed over', sequenceOrder: 6 }
        ]
    },
    {
        categoryName: 'Environment',
        milestones: [
            { milestoneName: 'Assessment Completed', description: 'Environmental assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Conservation Activities', description: 'Environmental conservation activities implemented', sequenceOrder: 2 },
            { milestoneName: 'Restoration Works', description: 'Environmental restoration works completed', sequenceOrder: 3 },
            { milestoneName: 'Monitoring System', description: 'Environmental monitoring system established', sequenceOrder: 4 },
            { milestoneName: 'Project Handover', description: 'Environmental project completed', sequenceOrder: 5 }
        ]
    },
    {
        categoryName: 'Fisheries',
        milestones: [
            { milestoneName: 'Feasibility Study', description: 'Fisheries project feasibility study completed', sequenceOrder: 1 },
            { milestoneName: 'Infrastructure Development', description: 'Fisheries infrastructure developed', sequenceOrder: 2 },
            { milestoneName: 'Equipment Distribution', description: 'Fishing equipment distributed to beneficiaries', sequenceOrder: 3 },
            { milestoneName: 'Training Conducted', description: 'Fishermen training conducted', sequenceOrder: 4 },
            { milestoneName: 'Project Handover', description: 'Fisheries project handed over', sequenceOrder: 5 }
        ]
    },
    {
        categoryName: 'Health',
        milestones: [
            { milestoneName: 'Needs Assessment', description: 'Health needs assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Program Implementation', description: 'Health program activities implemented', sequenceOrder: 2 },
            { milestoneName: 'Service Delivery', description: 'Health services delivered to target population', sequenceOrder: 3 },
            { milestoneName: 'Monitoring and Evaluation', description: 'Health program monitoring and evaluation completed', sequenceOrder: 4 },
            { milestoneName: 'Project Completion', description: 'Health project completed', sequenceOrder: 5 }
        ]
    },
    {
        categoryName: 'Health Facilities',
        milestones: [
            { milestoneName: 'Site Preparation', description: 'Health facility site prepared', sequenceOrder: 1 },
            { milestoneName: 'Construction Completed', description: 'Health facility construction completed', sequenceOrder: 2 },
            { milestoneName: 'Medical Equipment Installed', description: 'Medical equipment installed and tested', sequenceOrder: 3 },
            { milestoneName: 'Facility Commissioned', description: 'Health facility commissioned', sequenceOrder: 4 },
            { milestoneName: 'Staff Trained', description: 'Health facility staff trained', sequenceOrder: 5 },
            { milestoneName: 'Operations Started', description: 'Health facility operations started', sequenceOrder: 6 },
            { milestoneName: 'Project Handover', description: 'Health facility handed over', sequenceOrder: 7 }
        ]
    },
    {
        categoryName: 'ICT',
        milestones: [
            { milestoneName: 'Needs Assessment', description: 'ICT needs assessment completed', sequenceOrder: 1 },
            { milestoneName: 'System Design', description: 'ICT system design completed', sequenceOrder: 2 },
            { milestoneName: 'Infrastructure Installation', description: 'ICT infrastructure installed', sequenceOrder: 3 },
            { milestoneName: 'System Configuration', description: 'ICT systems configured and tested', sequenceOrder: 4 },
            { milestoneName: 'Training Conducted', description: 'ICT training conducted for users', sequenceOrder: 5 },
            { milestoneName: 'System Go-Live', description: 'ICT system goes live', sequenceOrder: 6 },
            { milestoneName: 'Project Handover', description: 'ICT project handed over', sequenceOrder: 7 }
        ]
    },
    {
        categoryName: 'Livestock',
        milestones: [
            { milestoneName: 'Feasibility Study', description: 'Livestock project feasibility study completed', sequenceOrder: 1 },
            { milestoneName: 'Infrastructure Development', description: 'Livestock infrastructure developed', sequenceOrder: 2 },
            { milestoneName: 'Livestock Distribution', description: 'Livestock distributed to beneficiaries', sequenceOrder: 3 },
            { milestoneName: 'Training Conducted', description: 'Livestock management training conducted', sequenceOrder: 4 },
            { milestoneName: 'Veterinary Services', description: 'Veterinary services established', sequenceOrder: 5 },
            { milestoneName: 'Project Handover', description: 'Livestock project handed over', sequenceOrder: 6 }
        ]
    },
    {
        categoryName: 'Mining',
        milestones: [
            { milestoneName: 'Feasibility Study', description: 'Mining project feasibility study completed', sequenceOrder: 1 },
            { milestoneName: 'Environmental Clearance', description: 'Environmental impact assessment and clearance obtained', sequenceOrder: 2 },
            { milestoneName: 'Infrastructure Development', description: 'Mining infrastructure developed', sequenceOrder: 3 },
            { milestoneName: 'Operations Started', description: 'Mining operations started', sequenceOrder: 4 },
            { milestoneName: 'Project Handover', description: 'Mining project operational', sequenceOrder: 5 }
        ]
    },
    {
        categoryName: 'Trade and Markets',
        milestones: [
            { milestoneName: 'Market Assessment', description: 'Market assessment and analysis completed', sequenceOrder: 1 },
            { milestoneName: 'Infrastructure Development', description: 'Market infrastructure developed', sequenceOrder: 2 },
            { milestoneName: 'Market Operational', description: 'Market facility operational', sequenceOrder: 3 },
            { milestoneName: 'Trader Training', description: 'Trader training conducted', sequenceOrder: 4 },
            { milestoneName: 'Project Handover', description: 'Market facility handed over', sequenceOrder: 5 }
        ]
    },
    {
        categoryName: 'Water Resources',
        milestones: [
            { milestoneName: 'Resource Assessment', description: 'Water resource assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Infrastructure Development', description: 'Water resource infrastructure developed', sequenceOrder: 2 },
            { milestoneName: 'Distribution System', description: 'Water distribution system completed', sequenceOrder: 3 },
            { milestoneName: 'System Operational', description: 'Water resource system operational', sequenceOrder: 4 },
            { milestoneName: 'Project Handover', description: 'Water resource project handed over', sequenceOrder: 5 }
        ]
    },
    {
        categoryName: 'Youth Affairs',
        milestones: [
            { milestoneName: 'Needs Assessment', description: 'Youth needs assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Program Design', description: 'Youth program designed', sequenceOrder: 2 },
            { milestoneName: 'Training Conducted', description: 'Youth training programs conducted', sequenceOrder: 3 },
            { milestoneName: 'Skills Development', description: 'Youth skills development activities completed', sequenceOrder: 4 },
            { milestoneName: 'Employment Support', description: 'Youth employment support provided', sequenceOrder: 5 },
            { milestoneName: 'Project Completion', description: 'Youth affairs project completed', sequenceOrder: 6 }
        ]
    }
];

async function createAdditionalCategories() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        console.log('Creating additional project categories with milestone templates...\n');
        
        for (const categoryData of additionalCategoriesWithMilestones) {
            const { categoryName, milestones } = categoryData;
            
            // Check if category exists in categories
            const [existingCategory] = await connection.query(
                'SELECT categoryId FROM categories WHERE categoryName = ? AND voided = 0',
                [categoryName]
            );
            
            let categoryId;
            if (existingCategory.length > 0) {
                categoryId = existingCategory[0].categoryId;
                console.log(`✓ Category "${categoryName}" already exists in categories (ID: ${categoryId})`);
            } else {
                // Create category in categories
                const [insertResult] = await connection.query(
                    'INSERT INTO categories (categoryName, description, voided) VALUES (?, ?, 0)',
                    [categoryName, `Project category for ${categoryName} projects`]
                );
                categoryId = insertResult.insertId;
                console.log(`✓ Created category "${categoryName}" in categories (ID: ${categoryId})`);
            }
            
            // Also ensure it exists in project_milestone_implementations
            const [existingProjCategory] = await connection.query(
                'SELECT categoryId FROM project_milestone_implementations WHERE categoryName = ?',
                [categoryName]
            );
            
            if (existingProjCategory.length === 0) {
                await connection.query(
                    'INSERT INTO project_milestone_implementations (categoryName, description) VALUES (?, ?)',
                    [categoryName, `Project category for ${categoryName} projects`]
                );
                console.log(`  → Also created in project_milestone_implementations`);
            }
            
            // Create/update milestone templates
            let milestonesCreated = 0;
            let milestonesUpdated = 0;
            
            for (const milestone of milestones) {
                const [existingMilestone] = await connection.query(
                    'SELECT milestoneId FROM category_milestones WHERE categoryId = ? AND milestoneName = ? AND voided = 0',
                    [categoryId, milestone.milestoneName]
                );
                
                if (existingMilestone.length > 0) {
                    await connection.query(
                        'UPDATE category_milestones SET description = ?, sequenceOrder = ? WHERE milestoneId = ?',
                        [milestone.description, milestone.sequenceOrder, existingMilestone[0].milestoneId]
                    );
                    milestonesUpdated++;
                } else {
                    await connection.query(
                        'INSERT INTO category_milestones (categoryId, milestoneName, description, sequenceOrder, userId, voided) VALUES (?, ?, ?, ?, ?, 0)',
                        [categoryId, milestone.milestoneName, milestone.description, milestone.sequenceOrder, 1]
                    );
                    milestonesCreated++;
                }
            }
            
            console.log(`  → ${milestonesCreated} milestones created, ${milestonesUpdated} milestones updated\n`);
        }
        
        await connection.commit();
        console.log('✅ Successfully created/updated additional project categories with milestone templates!');
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error creating categories:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

// Run the script
createAdditionalCategories().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});











