const mysql = require('mysql2/promise');
const { Pool } = require('pg');

// MySQL connection
const mysqlConfig = {
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'government_projects'
};

// PostgreSQL connection
const pgConfig = {
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'postgres',
  database: 'government_projects'
};

async function migrateCounties() {
  let mysqlConn;
  let pgPool;

  try {
    // Connect to MySQL
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL');

    // Connect to PostgreSQL
    pgPool = new Pool(pgConfig);
    console.log('✅ Connected to PostgreSQL');

    // Fetch counties from MySQL
    const [counties] = await mysqlConn.execute(
      'SELECT countyId, name, geoSpatial, geoCode, geoLat, geoLon, voided, userId, createdAt, updatedAt, voidedBy FROM counties WHERE voided = 0'
    );

    console.log(`📊 Found ${counties.length} counties to migrate`);

    if (counties.length === 0) {
      console.log('⚠️  No counties found in MySQL. Skipping migration.');
      return;
    }

    // Migrate each county
    let migrated = 0;
    let skipped = 0;

    for (const county of counties) {
      try {
        // Check if county already exists
        const checkResult = await pgPool.query(
          'SELECT "countyId" FROM counties WHERE "countyId" = $1',
          [county.countyId]
        );

        if (checkResult.rows.length > 0) {
          console.log(`⏭️  County ${county.countyId} (${county.name}) already exists. Skipping.`);
          skipped++;
          continue;
        }

        // Insert county into PostgreSQL
        await pgPool.query(
          `INSERT INTO counties (
            "countyId", name, "geoSpatial", "geoCode", "geoLat", "geoLon", 
            voided, "userId", "createdAt", "updatedAt", "voidedBy"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            county.countyId,
            county.name,
            county.geoSpatial,
            county.geoCode,
            county.geoLat,
            county.geoLon,
            county.voided === 1 || county.voided === true,
            county.userId,
            county.createdAt,
            county.updatedAt,
            county.voidedBy
          ]
        );

        migrated++;
        console.log(`✅ Migrated county ${county.countyId}: ${county.name}`);
      } catch (error) {
        console.error(`❌ Error migrating county ${county.countyId} (${county.name}):`, error.message);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📊 Total: ${counties.length}`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    if (mysqlConn) {
      await mysqlConn.end();
      console.log('🔌 MySQL connection closed');
    }
    if (pgPool) {
      await pgPool.end();
      console.log('🔌 PostgreSQL connection closed');
    }
  }
}

// Run migration
migrateCounties().catch(console.error);
