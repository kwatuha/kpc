const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    database: process.env.DB_NAME || 'government_projects',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

const filePath = '/home/dev/dev/imes_working/government_projects/adp/agencies.csv';

async function importAgencies() {
    const agencies = [];
    let imported = 0;
    let skipped = 0;
    let errors = [];

    console.log('Reading CSV file...');
    
    // Read and parse CSV
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const ministry = row['Ministry'] || row['ministry'] || '';
                const stateDepartment = row['State Department'] || row['state_department'] || '';
                const agencyName = row['Agency / Institution'] || row['agency_name'] || '';

                if (agencyName && ministry && stateDepartment) {
                    agencies.push({
                        ministry: ministry.trim(),
                        state_department: stateDepartment.trim(),
                        agency_name: agencyName.trim()
                    });
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${agencies.length} agencies to import`);

    // Get existing agencies
    console.log('Checking existing agencies...');
    const existingResult = await pool.query(
        'SELECT agency_name FROM agencies WHERE voided = false'
    );
    const existingAgencyNames = new Set(
        existingResult.rows.map(row => row.agency_name.toLowerCase().trim())
    );

    // Filter out existing agencies
    const agenciesToImport = agencies.filter(agency => {
        const agencyNameLower = agency.agency_name.toLowerCase().trim();
        if (existingAgencyNames.has(agencyNameLower)) {
            skipped++;
            return false;
        }
        existingAgencyNames.add(agencyNameLower);
        return true;
    });

    console.log(`${agenciesToImport.length} new agencies to import, ${skipped} already exist`);

    // Import agencies
    console.log('Importing agencies...');
    for (let i = 0; i < agenciesToImport.length; i++) {
        const agency = agenciesToImport[i];
        try {
            await pool.query(
                'INSERT INTO agencies (ministry, state_department, agency_name) VALUES ($1, $2, $3)',
                [agency.ministry, agency.state_department, agency.agency_name]
            );
            imported++;
            if ((i + 1) % 10 === 0) {
                console.log(`Imported ${i + 1}/${agenciesToImport.length}...`);
            }
        } catch (err) {
            if (err.code === '23505' || err.message.includes('duplicate') || err.message.includes('unique')) {
                skipped++;
            } else {
                errors.push(`Error importing ${agency.agency_name}: ${err.message}`);
                console.error(`Error importing ${agency.agency_name}:`, err.message);
            }
        }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total rows in CSV: ${agencies.length}`);
    console.log(`Imported: ${imported}`);
    console.log(`Skipped (duplicates): ${skipped}`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(err => console.log(`  - ${err}`));
    }

    await pool.end();
}

importAgencies().catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
});
