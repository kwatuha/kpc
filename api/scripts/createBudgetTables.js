// Load environment variables from api/.env
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function createBudgetTables() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await pool.getConnection();
    console.log('✓ Database connection established');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create_budget_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolons and execute each statement
    // Remove comments and empty lines
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    console.log(`\nExecuting ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip DELIMITER commands (not needed in programmatic execution)
      if (statement.toUpperCase().includes('DELIMITER')) {
        continue;
      }

      // Handle triggers separately (they contain semicolons)
      if (statement.toUpperCase().includes('CREATE TRIGGER')) {
        // Extract trigger name and body
        const triggerMatch = statement.match(/CREATE TRIGGER\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/i);
        if (triggerMatch) {
          const triggerName = triggerMatch[1];
          console.log(`Creating trigger: ${triggerName}...`);
          
          // For triggers, we need to handle the BEGIN...END block
          // Remove IF NOT EXISTS as it's not supported in all MySQL versions
          let triggerSQL = statement.replace(/IF NOT EXISTS\s+/i, '');
          
          try {
            await connection.query(triggerSQL);
            console.log(`✓ Trigger ${triggerName} created successfully`);
          } catch (err) {
            if (err.code === 'ER_TRG_ALREADY_EXISTS') {
              console.log(`⚠ Trigger ${triggerName} already exists, skipping...`);
            } else {
              throw err;
            }
          }
        }
        continue;
      }

      // Skip empty statements
      if (!statement || statement.length < 10) {
        continue;
      }

      // Extract table name for logging
      const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        console.log(`Creating table: ${tableName}...`);
        
        try {
          await connection.query(statement);
          console.log(`✓ Table ${tableName} created successfully`);
        } catch (err) {
          if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠ Table ${tableName} already exists, skipping...`);
          } else {
            throw err;
          }
        }
      } else {
        // Execute other statements (like ALTER TABLE, etc.)
        try {
          await connection.query(statement);
          console.log(`✓ Statement executed successfully`);
        } catch (err) {
          console.warn(`⚠ Warning executing statement:`, err.message);
        }
      }
    }

    console.log('\n✅ All budget tables created successfully!');
    console.log('\nCreated tables:');
    console.log('  - budgets (budget containers)');
    console.log('  - budget_items (items within containers)');
    console.log('  - budget_changes (change requests)');
    console.log('\nYou can now use the budget management system!');

  } catch (error) {
    console.error('\n❌ Error creating budget tables:', error);
    console.error('Error details:', {
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nDatabase connection released');
    }
    process.exit(0);
  }
}

// Run the script
createBudgetTables();

