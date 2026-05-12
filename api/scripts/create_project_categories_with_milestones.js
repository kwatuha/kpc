/**
 * Script to create meaningful project categories with milestone templates
 * Run this to set up categories that can be used in comprehensive project imports
 */

const pool = require('../config/db');

const categoriesWithMilestones = [
    {
        categoryName: 'Road Construction',
        milestones: [
            { milestoneName: 'Site Survey Completed', description: 'Complete site survey and mapping', sequenceOrder: 1 },
            { milestoneName: 'Design Approval', description: 'Road design approved by relevant authorities', sequenceOrder: 2 },
            { milestoneName: 'Land Acquisition', description: 'Land acquisition and compensation completed', sequenceOrder: 3 },
            { milestoneName: 'Earthworks Completed', description: 'Earthworks, excavation, and leveling completed', sequenceOrder: 4 },
            { milestoneName: 'Base Course Laid', description: 'Base course and sub-base construction completed', sequenceOrder: 5 },
            { milestoneName: 'Road Surfacing Completed', description: 'Tarmac/bitumen surfacing completed', sequenceOrder: 6 },
            { milestoneName: 'Road Markings and Signage', description: 'Road markings and signage installed', sequenceOrder: 7 },
            { milestoneName: 'Drainage Works Completed', description: 'Drainage systems installed and tested', sequenceOrder: 8 },
            { milestoneName: 'Project Handover', description: 'Project completed and handed over to relevant authority', sequenceOrder: 9 }
        ]
    },
    {
        categoryName: 'Building Construction',
        milestones: [
            { milestoneName: 'Site Preparation', description: 'Site cleared and prepared for construction', sequenceOrder: 1 },
            { milestoneName: 'Foundation Completed', description: 'Foundation works completed', sequenceOrder: 2 },
            { milestoneName: 'Superstructure - Ground Floor', description: 'Ground floor structure completed', sequenceOrder: 3 },
            { milestoneName: 'Superstructure - Upper Floors', description: 'Upper floors structure completed', sequenceOrder: 4 },
            { milestoneName: 'Roofing Completed', description: 'Roofing and waterproofing completed', sequenceOrder: 5 },
            { milestoneName: 'Plumbing and Electrical', description: 'Plumbing and electrical installations completed', sequenceOrder: 6 },
            { milestoneName: 'Finishing Works', description: 'Internal and external finishing completed', sequenceOrder: 7 },
            { milestoneName: 'M&E Systems Installed', description: 'Mechanical and electrical systems installed and tested', sequenceOrder: 8 },
            { milestoneName: 'Project Handover', description: 'Building completed and handed over', sequenceOrder: 9 }
        ]
    },
    {
        categoryName: 'Water Supply',
        milestones: [
            { milestoneName: 'Feasibility Study Completed', description: 'Feasibility study and site assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Design Approval', description: 'Water supply system design approved', sequenceOrder: 2 },
            { milestoneName: 'Pipeline Installation', description: 'Water pipeline installation completed', sequenceOrder: 3 },
            { milestoneName: 'Pump Station Construction', description: 'Water pump station constructed', sequenceOrder: 4 },
            { milestoneName: 'Storage Tanks Installed', description: 'Water storage tanks installed', sequenceOrder: 5 },
            { milestoneName: 'Treatment Plant Completed', description: 'Water treatment plant construction completed', sequenceOrder: 6 },
            { milestoneName: 'System Testing', description: 'Water supply system tested and commissioned', sequenceOrder: 7 },
            { milestoneName: 'Distribution Network', description: 'Water distribution network completed', sequenceOrder: 8 },
            { milestoneName: 'Project Handover', description: 'Water supply system handed over for operation', sequenceOrder: 9 }
        ]
    },
    {
        categoryName: 'Sanitation',
        milestones: [
            { milestoneName: 'Design Approval', description: 'Sanitation system design approved', sequenceOrder: 1 },
            { milestoneName: 'Sewer Line Installation', description: 'Sewer lines installation completed', sequenceOrder: 2 },
            { milestoneName: 'Treatment Plant Construction', description: 'Wastewater treatment plant construction completed', sequenceOrder: 3 },
            { milestoneName: 'Collection Systems', description: 'Waste collection systems installed', sequenceOrder: 4 },
            { milestoneName: 'Infrastructure Completed', description: 'All sanitation infrastructure completed', sequenceOrder: 5 },
            { milestoneName: 'System Testing', description: 'Sanitation system tested and commissioned', sequenceOrder: 6 },
            { milestoneName: 'Project Handover', description: 'Sanitation system handed over for operation', sequenceOrder: 7 }
        ]
    },
    {
        categoryName: 'Energy/Electrification',
        milestones: [
            { milestoneName: 'Feasibility Study', description: 'Feasibility study and site assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Design Approval', description: 'Electrical system design approved', sequenceOrder: 2 },
            { milestoneName: 'Pole Installation', description: 'Electricity poles installed', sequenceOrder: 3 },
            { milestoneName: 'Transformer Installation', description: 'Transformers installed and commissioned', sequenceOrder: 4 },
            { milestoneName: 'Power Line Installation', description: 'Power lines and cables installed', sequenceOrder: 5 },
            { milestoneName: 'Metering Infrastructure', description: 'Electricity metering infrastructure installed', sequenceOrder: 6 },
            { milestoneName: 'System Testing', description: 'Electrical system tested and energized', sequenceOrder: 7 },
            { milestoneName: 'Connection to Grid', description: 'Connection to national grid completed', sequenceOrder: 8 },
            { milestoneName: 'Project Handover', description: 'Electrification project handed over', sequenceOrder: 9 }
        ]
    },
    {
        categoryName: 'Capacity Building',
        milestones: [
            { milestoneName: 'Needs Assessment', description: 'Training needs assessment completed', sequenceOrder: 1 },
            { milestoneName: 'Curriculum Development', description: 'Training curriculum and materials developed', sequenceOrder: 2 },
            { milestoneName: 'Training Sessions Conducted', description: 'Training sessions conducted', sequenceOrder: 3 },
            { milestoneName: 'Assessment Completed', description: 'Participant assessment and evaluation completed', sequenceOrder: 4 },
            { milestoneName: 'Certification Issued', description: 'Certificates issued to participants', sequenceOrder: 5 },
            { milestoneName: 'Project Handover', description: 'Capacity building project completed', sequenceOrder: 6 }
        ]
    },
    {
        categoryName: 'Health Infrastructure',
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
        categoryName: 'Education Infrastructure',
        milestones: [
            { milestoneName: 'Site Preparation', description: 'Education facility site prepared', sequenceOrder: 1 },
            { milestoneName: 'Construction Completed', description: 'Education facility construction completed', sequenceOrder: 2 },
            { milestoneName: 'Furniture and Equipment', description: 'Furniture and equipment installed', sequenceOrder: 3 },
            { milestoneName: 'Facility Commissioned', description: 'Education facility commissioned', sequenceOrder: 4 },
            { milestoneName: 'Project Handover', description: 'Education facility handed over', sequenceOrder: 5 }
        ]
    }
];

async function createCategoriesWithMilestones() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        console.log('Creating project categories with milestone templates...\n');
        
        for (const categoryData of categoriesWithMilestones) {
            const { categoryName, milestones } = categoryData;
            
            // Check if category exists in categories (which category_milestones references)
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
            
            // Also ensure it exists in project_milestone_implementations for project compatibility
            const [existingProjCategory] = await connection.query(
                'SELECT categoryId FROM project_milestone_implementations WHERE categoryName = ?',
                [categoryName]
            );
            
            if (existingProjCategory.length === 0) {
                await connection.query(
                    'INSERT INTO project_milestone_implementations (categoryName, description) VALUES (?, ?)',
                    [categoryName, `Project category for ${categoryName} projects`]
                );
                console.log(`  → Also created in project_milestone_implementations for compatibility`);
            }
            
            // Create/update milestone templates
            let milestonesCreated = 0;
            let milestonesUpdated = 0;
            
            for (const milestone of milestones) {
                // Check if milestone template exists
                const [existingMilestone] = await connection.query(
                    'SELECT milestoneId FROM category_milestones WHERE categoryId = ? AND milestoneName = ? AND voided = 0',
                    [categoryId, milestone.milestoneName]
                );
                
                if (existingMilestone.length > 0) {
                    // Update existing milestone
                    await connection.query(
                        'UPDATE category_milestones SET description = ?, sequenceOrder = ? WHERE milestoneId = ?',
                        [milestone.description, milestone.sequenceOrder, existingMilestone[0].milestoneId]
                    );
                    milestonesUpdated++;
                } else {
                    // Create new milestone template
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
        console.log('✅ Successfully created/updated project categories with milestone templates!');
        
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
createCategoriesWithMilestones().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

