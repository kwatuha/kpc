/**
 * Script to add "FY" prefix to financial years that don't have it
 * This ensures all financial years follow the uniform naming convention
 * 
 * Usage:
 *   From host: docker exec -it node_api node /app/scripts/fix_financial_year_names.js
 */

const pool = require('../config/db');

async function fixFinancialYearNames() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    console.log('Fixing financial year names to include FY prefix...\n');
    
    // Get all financial years that don't start with FY (case-insensitive)
    const [records] = await connection.query(
      `SELECT finYearId, finYearName, startDate, endDate 
       FROM financialyears 
       WHERE voided = 0 
       AND finYearName NOT REGEXP '^FY'`
    );
    
    if (records.length === 0) {
      console.log('✓ All financial years already have FY prefix.');
      return;
    }
    
    console.log(`Found ${records.length} financial year(s) without FY prefix:\n`);
    
    let updatedCount = 0;
    
    for (const record of records) {
      const oldName = record.finYearName;
      // Add FY prefix if it doesn't have it
      let newName = oldName;
      if (!newName.match(/^FY/i)) {
        newName = `FY${newName}`;
      }
      
      // Normalize separators to slash
      newName = newName.replace(/[- ]/g, '/');
      
      // Check if the new name already exists
      const [existing] = await connection.query(
        'SELECT finYearId FROM financialyears WHERE finYearName = ? AND finYearId != ? AND voided = 0',
        [newName, record.finYearId]
      );
      
      if (existing.length > 0) {
        console.log(`⊘ Skipped: ${oldName} → ${newName} (duplicate exists)`);
      } else {
        try {
          await connection.query(
            `UPDATE financialyears 
             SET finYearName = ?, updatedAt = CURRENT_TIMESTAMP 
             WHERE finYearId = ? AND voided = 0`,
            [newName, record.finYearId]
          );
          updatedCount++;
          console.log(`✓ Updated: ${oldName} → ${newName}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⊘ Skipped: ${oldName} → ${newName} (duplicate constraint)`);
          } else {
            console.error(`✗ Error updating ${oldName}:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updatedCount} financial year(s)`);
    console.log(`Skipped: ${records.length - updatedCount} (duplicates or errors)`);
    console.log(`\nCompleted!`);
    
  } catch (error) {
    console.error('Error fixing financial year names:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

// Run the script
fixFinancialYearNames().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


