/**
 * Script to map counties and constituencies to Kenya wards
 * Uses province, district, division, and ward name to determine county and constituency
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'postgres_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'government_projects',
    port: process.env.DB_PORT || 5432,
});

// Province to County mapping (Kenya's 8 provinces to 47 counties)
const provinceToCounties = {
    'Nyanza': ['Kisumu', 'Siaya', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'],
    'Central': ['Kiambu', 'Murang\'a', 'Nyeri', 'Kirinyaga', 'Nyandarua'],
    'Coast': ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta'],
    'Eastern': ['Machakos', 'Makueni', 'Kitui', 'Embu', 'Meru', 'Tharaka Nithi', 'Isiolo', 'Marsabit'],
    'Nairobi': ['Nairobi'],
    'North Eastern': ['Garissa', 'Wajir', 'Mandera'],
    'Rift Valley': ['Uasin Gishu', 'Trans Nzoia', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Turkana', 'West Pokot', 'Samburu'],
    'Western': ['Kakamega', 'Vihiga', 'Bungoma', 'Busia']
};

// District to County mapping (more specific)
const districtToCounty = {
    // Nyanza Province
    'Migori': 'Migori',
    'Rachuonyo': 'Homa Bay',
    'Nyando': 'Kisumu',
    'Kisumu': 'Kisumu',
    'Siaya': 'Siaya',
    'Bondo': 'Siaya',
    'Kisii': 'Kisii',
    'Nyamira': 'Nyamira',
    'Gucha': 'Kisii',
    'Homa Bay': 'Homa Bay',
    
    // Eastern Province
    'Meru Central': 'Meru',
    'Meru North': 'Meru',
    'Meru South': 'Meru',
    'Tharaka': 'Tharaka Nithi',
    'Embu': 'Embu',
    'Mbeere': 'Embu',
    'Machakos': 'Machakos',
    'Makueni': 'Makueni',
    'Kitui': 'Kitui',
    'Mwingi': 'Kitui',
    
    // Coast Province
    'Malindi': 'Kilifi',
    'Kilifi': 'Kilifi',
    'Mombasa': 'Mombasa',
    'Kwale': 'Kwale',
    'Lamu': 'Lamu',
    'Tana River': 'Tana River',
    'Taita Taveta': 'Taita Taveta',
    
    // North Eastern Province
    'Garissa': 'Garissa',
    'Wajir': 'Wajir',
    'Mandera': 'Mandera',
    
    // Central Province
    'Kiambu': 'Kiambu',
    'Murang\'a': 'Murang\'a',
    'Nyeri': 'Nyeri',
    'Kirinyaga': 'Kirinyaga',
    'Nyandarua': 'Nyandarua',
    
    // Rift Valley Province
    'Uasin Gishu': 'Uasin Gishu',
    'Trans Nzoia': 'Trans Nzoia',
    'Elgeyo Marakwet': 'Elgeyo Marakwet',
    'Nandi': 'Nandi',
    'Baringo': 'Baringo',
    'Laikipia': 'Laikipia',
    'Nakuru': 'Nakuru',
    'Narok': 'Narok',
    'Kajiado': 'Kajiado',
    'Kericho': 'Kericho',
    'Bomet': 'Bomet',
    'Turkana': 'Turkana',
    'West Pokot': 'West Pokot',
    'Samburu': 'Samburu',
    
    // Western Province
    'Kakamega': 'Kakamega',
    'Vihiga': 'Vihiga',
    'Bungoma': 'Bungoma',
    'Busia': 'Busia',
    
    // Nairobi
    'Nairobi': 'Nairobi'
};

// Division to Constituency mapping - comprehensive mapping based on actual IEBC data
const divisionToConstituency = {
    // Migori County (8 constituencies)
    'Nyatike': 'Nyatike',
    'Karungu': 'Nyatike',
    'Uriri': 'Uriri',
    'Rongo': 'Rongo',
    'Awendo': 'Awendo',
    'Suna East': 'Suna East',
    'Suna West': 'Suna West',
    'Kuria East': 'Kuria East',
    'Kuria West': 'Kuria West',
    'Suba East': 'Suba East', // Note: Suba East and West are in Migori, not Homa Bay
    'Suba West': 'Suba West',
    'Muhuru': 'Suna West', // Muhuru division is in Suna West constituency
    
    // Homa Bay County (8 constituencies)
    'East Karachuonyo': 'Karachuonyo',
    'West Karachuonyo': 'Karachuonyo',
    'Rangwe': 'Rangwe',
    'Homa Bay Town': 'Homa Bay Town',
    'Ndhiwa': 'Ndhiwa',
    'Mbita': 'Mbita',
    'Suba': 'Suba',
    'Kabondo': 'Kabondo Kasipul',
    'Kasipul': 'Kabondo Kasipul',
    
    // Meru County (9 constituencies)
    'Abogeta': 'Imenti Central',
    'Abothuguchi Central': 'Imenti Central',
    'Abothuguchi West': 'Imenti Central',
    'Laare': 'Igembe Central',
    'Igembe South West': 'Igembe Central',
    'Imenti North': 'Imenti North',
    'Imenti South': 'Imenti South',
    'Tigania West': 'Tigania West',
    'Tigania East': 'Tigania East',
    'Igembe North': 'Igembe North',
    'Igembe South': 'Igembe South',
    'Buuri': 'Buuri',
    
    // Kilifi County (6 constituencies)
    'Malindi': 'Malindi',
    'Kilifi North': 'Kilifi North',
    'Kilifi South': 'Kilifi South',
    'Kaloleni': 'Kaloleni',
    'Rabai': 'Rabai',
    'Ganze': 'Ganze',
    'Magarini': 'Magarini',
    
    // Garissa County (6 constituencies)
    'Dadaab': 'Dadaab',
    'Shant-abak': 'Fafi',
    'Fafi': 'Fafi',
    'Ijara': 'Ijara',
    'Balambala': 'Balambala',
    'Lagdera': 'Lagdera',
    'Garissa Township': 'Garissa Township',
    
    // Wajir County (6 constituencies)
    'Hadado': 'Wajir South',
    'Wajir North': 'Wajir North',
    'Wajir East': 'Wajir East',
    'Wajir West': 'Wajir West',
    'Wajir South': 'Wajir South',
    'Eldas': 'Eldas',
    'Tarbaj': 'Tarbaj',
    
    // Kisumu County (7 constituencies)
    'Kisumu Central': 'Kisumu Central',
    'Kisumu East': 'Kisumu East',
    'Kisumu West': 'Kisumu West',
    'Muhoroni': 'Muhoroni',
    'Nyakach': 'Nyakach',
    'Nyando': 'Nyando',
    'Seme': 'Seme',
    
    // Siaya County (6 constituencies)
    'Alego Usonga': 'Alego Usonga',
    'Gem': 'Gem',
    'Bondo': 'Bondo',
    'Rarieda': 'Rarieda',
    'Ugenya': 'Ugenya',
    'Ugunja': 'Ugunja',
    
    // Kisii County (9 constituencies)
    'Kitutu Chache North': 'Kitutu Chache North',
    'Kitutu Chache South': 'Kitutu Chache South',
    'Nyaribari Chache': 'Nyaribari Chache',
    'Nyaribari Masaba': 'Nyaribari Masaba',
    'Bobasi': 'Bobasi',
    'Bomachoge Chache': 'Bomachoge Chache',
    'Bomachoge Borabu': 'Bomachoge Borabu',
    'South Mugirango': 'South Mugirango',
    'North Mugirango': 'North Mugirango',
    
    // Nyamira County (4 constituencies)
    'West Mugirango': 'West Mugirango',
    'North Mugirango': 'North Mugirango',
    'Borabu': 'Borabu',
    'Kitutu Masaba': 'Kitutu Masaba',
    
    // Nairobi County (17 constituencies)
    'Westlands': 'Westlands',
    'Dagoretti North': 'Dagoretti North',
    'Dagoretti South': 'Dagoretti South',
    'Langata': 'Langata',
    'Kibra': 'Kibra',
    'Roysambu': 'Roysambu',
    'Kasarani': 'Kasarani',
    'Ruaraka': 'Ruaraka',
    'Embakasi South': 'Embakasi South',
    'Embakasi North': 'Embakasi North',
    'Embakasi Central': 'Embakasi Central',
    'Embakasi East': 'Embakasi East',
    'Embakasi West': 'Embakasi West',
    'Makadara': 'Makadara',
    'Kamukunji': 'Kamukunji',
    'Starehe': 'Starehe',
    'Mathare': 'Mathare',
    'Pumwani': 'Pumwani',
    
    // Kiambu County (12 constituencies)
    'Kiambu': 'Kiambu',
    'Gatundu North': 'Gatundu North',
    'Gatundu South': 'Gatundu South',
    'Githunguri': 'Githunguri',
    'Juja': 'Juja',
    'Ruiru': 'Ruiru',
    'Thika Town': 'Thika Town',
    'Lari': 'Lari',
    'Limuru': 'Limuru',
    'Kabete': 'Kabete',
    'Kikuyu': 'Kikuyu',
    'Kiambaa': 'Kiambaa',
    
    // Add more mappings as needed - this is a partial list
    // The key is to map divisions to their actual constituencies
};

/**
 * Determine county from province and district
 */
function getCounty(province, district) {
    if (!province || !district) return null;
    
    // First try district mapping (more specific)
    if (districtToCounty[district]) {
        return districtToCounty[district];
    }
    
    // Try normalized district name
    const normalizedDistrict = district.trim();
    for (const [key, value] of Object.entries(districtToCounty)) {
        if (key.toLowerCase() === normalizedDistrict.toLowerCase()) {
            return value;
        }
    }
    
    // Fallback: use province mapping (less accurate)
    const counties = provinceToCounties[province];
    if (counties && counties.length === 1) {
        return counties[0];
    }
    
    // If multiple counties in province, try to infer from district name
    if (counties) {
        const districtLower = district.toLowerCase();
        for (const county of counties) {
            if (districtLower.includes(county.toLowerCase()) || county.toLowerCase().includes(districtLower)) {
                return county;
            }
        }
    }
    
    return null;
}

/**
 * Determine constituency from division and district
 * Improved logic to avoid using county name as constituency
 */
function getConstituency(division, district, wardName) {
    if (!division && !district) return null;
    
    // First try division mapping (most accurate)
    if (division) {
        const normalizedDivision = division.trim();
        
        // Exact match
        if (divisionToConstituency[normalizedDivision]) {
            return divisionToConstituency[normalizedDivision];
        }
        
        // Case-insensitive match
        for (const [key, value] of Object.entries(divisionToConstituency)) {
            if (key.toLowerCase() === normalizedDivision.toLowerCase()) {
                return value;
            }
        }
        
        // Partial match (e.g., "East Karachuonyo" matches "Karachuonyo")
        const divisionLower = normalizedDivision.toLowerCase();
        for (const [key, value] of Object.entries(divisionToConstituency)) {
            if (divisionLower.includes(key.toLowerCase()) || key.toLowerCase().includes(divisionLower)) {
                return value;
            }
        }
        
        // Many divisions have the same name as their constituency
        // If division name doesn't match a known county, it might be the constituency name
        const knownCounties = Object.values(districtToCounty).map(c => c.toLowerCase());
        
        // Check if division name could be a constituency (not a county)
        if (!knownCounties.includes(divisionLower)) {
            // Division might be the constituency name itself
            // But verify it's not too generic (like "Central", "East", "West")
            const genericTerms = ['central', 'east', 'west', 'north', 'south', 'town', 'urban', 'rural'];
            const hasGenericOnly = genericTerms.some(term => divisionLower === term);
            
            if (!hasGenericOnly && divisionLower.length > 3) {
                // Likely a constituency name
                return normalizedDivision;
            }
        }
    }
    
    // If division doesn't match, try to infer from district
    // But avoid using district if it matches a county name
    if (district) {
        const districtLower = district.toLowerCase();
        const knownCounties = Object.values(districtToCounty).map(c => c.toLowerCase());
        
        // Only use district if it's clearly not a county
        if (!knownCounties.includes(districtLower) && districtLower.length > 3) {
            // District might be a constituency name
            return district;
        }
    }
    
    // Don't use district as fallback if it matches county
    // Return null instead of incorrect data
    return null;
}

/**
 * Main function to update wards with county and constituency
 */
async function mapCountiesAndConstituencies() {
    try {
        console.log('Starting county and constituency mapping...');
        
        // Get all wards
        const result = await pool.query(`
            SELECT id, province, district, division, iebc_ward_name, county, constituency
            FROM kenya_wards
            WHERE voided = false
            ORDER BY id
        `);
        
        console.log(`Found ${result.rows.length} wards to process`);
        
        let updated = 0;
        let skipped = 0;
        
        for (const ward of result.rows) {
            // Skip if already has county and constituency
            if (ward.county && ward.constituency) {
                skipped++;
                continue;
            }
            
            const county = getCounty(ward.province, ward.district);
            const constituency = getConstituency(ward.division, ward.district, ward.iebc_ward_name);
            
            if (county || constituency) {
                await pool.query(
                    `UPDATE kenya_wards 
                     SET county = COALESCE($1, county), 
                         constituency = COALESCE($2, constituency),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3`,
                    [county, constituency, ward.id]
                );
                updated++;
                
                if (updated % 100 === 0) {
                    console.log(`Updated ${updated} wards...`);
                }
            } else {
                skipped++;
            }
        }
        
        console.log(`\nMapping complete!`);
        console.log(`Updated: ${updated} wards`);
        console.log(`Skipped: ${skipped} wards (already mapped or no match found)`);
        
        // Show statistics
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(county) as with_county,
                COUNT(constituency) as with_constituency,
                COUNT(CASE WHEN county IS NOT NULL AND constituency IS NOT NULL THEN 1 END) as with_both
            FROM kenya_wards
            WHERE voided = false
        `);
        
        console.log('\nStatistics:');
        console.log(`Total wards: ${stats.rows[0].total}`);
        console.log(`With county: ${stats.rows[0].with_county}`);
        console.log(`With constituency: ${stats.rows[0].with_constituency}`);
        console.log(`With both: ${stats.rows[0].with_both}`);
        
    } catch (error) {
        console.error('Error mapping counties and constituencies:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    mapCountiesAndConstituencies()
        .then(() => {
            console.log('Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { mapCountiesAndConstituencies, getCounty, getConstituency };
