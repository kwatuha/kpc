/**
 * Script to generate and update meaningful aliases for agencies
 * Based on agency names, creates short abbreviations/acronyms
 * 
 * Usage: node scripts/update-agency-aliases.js
 */

const pool = require('../api/config/db');

/**
 * Generate a meaningful alias from agency name
 * Examples:
 * - "Ministry of Health" -> "MOH"
 * - "Kenya Medical Research Institute" -> "KEMRI"
 * - "National Hospital Insurance Fund" -> "NHIF"
 * - "Water and Sanitation Department" -> "WSD"
 */
function generateAlias(agencyName) {
    if (!agencyName || !agencyName.trim()) {
        return '';
    }

    const name = agencyName.trim();
    
    // Common acronyms mapping
    const knownAcronyms = {
        'ministry of health': 'MOH',
        'ministry of education': 'MOE',
        'ministry of finance': 'MOF',
        'ministry of agriculture': 'MOA',
        'ministry of water': 'MOW',
        'ministry of energy': 'MOE',
        'ministry of transport': 'MOT',
        'ministry of infrastructure': 'MOI',
        'kenya medical research institute': 'KEMRI',
        'national hospital insurance fund': 'NHIF',
        'kenya power and lighting company': 'KPLC',
        'kenya electricity generating company': 'KENGEN',
        'kenya ports authority': 'KPA',
        'kenya railways corporation': 'KRC',
        'kenya airways': 'KQ',
        'national social security fund': 'NSSF',
        'kenya revenue authority': 'KRA',
        'central bank of kenya': 'CBK',
        'kenya bureau of standards': 'KEBS',
        'national environment management authority': 'NEMA',
        'water services regulatory board': 'WASREB',
        'rural electrification authority': 'REA',
        'kenya national highways authority': 'KeNHA',
        'kenya urban roads authority': 'KURA',
        'kenya rural roads authority': 'KeRRA',
    };

    // Check if we have a known acronym
    const lowerName = name.toLowerCase();
    for (const [key, acronym] of Object.entries(knownAcronyms)) {
        if (lowerName.includes(key)) {
            return acronym;
        }
    }

    // Extract acronym from name (capital letters)
    const acronymMatch = name.match(/\b([A-Z]{2,})\b/);
    if (acronymMatch && acronymMatch[1].length >= 2 && acronymMatch[1].length <= 6) {
        return acronymMatch[1];
    }

    // Extract first letters of major words
    const words = name.split(/\s+/).filter(w => 
        w.length > 2 && 
        !['of', 'the', 'and', 'for', 'in', 'on', 'at', 'to', 'a', 'an'].includes(w.toLowerCase())
    );
    
    if (words.length >= 2) {
        // Take first 2-4 words and get first letters
        const firstLetters = words.slice(0, Math.min(4, words.length))
            .map(w => w[0].toUpperCase())
            .join('');
        
        if (firstLetters.length >= 2 && firstLetters.length <= 6) {
            return firstLetters;
        }
    }

    // If name is short enough, use it as-is (max 20 chars)
    if (name.length <= 20) {
        return name;
    }

    // Take first word + first letter of second word if available
    const firstWord = words[0];
    if (firstWord && firstWord.length <= 15) {
        if (words.length > 1) {
            return firstWord.substring(0, 12) + words[1][0].toUpperCase();
        }
        return firstWord.substring(0, 15);
    }

    // Last resort: truncate to 15 chars
    return name.substring(0, 15).trim();
}

async function updateAgencyAliases() {
    try {
        console.log('Starting agency alias update...\n');

        // Check if alias column exists
        let aliasColumnExists = false;
        try {
            const checkResult = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'agencies' AND column_name = 'alias'
            `);
            aliasColumnExists = checkResult.rows.length > 0;
        } catch (checkError) {
            console.warn('Could not check for alias column:', checkError.message);
        }

        if (!aliasColumnExists) {
            console.log('⚠️  Alias column does not exist. Creating it...');
            try {
                await pool.query(`
                    ALTER TABLE agencies 
                    ADD COLUMN IF NOT EXISTS alias VARCHAR(255)
                `);
                console.log('✓ Alias column created successfully\n');
            } catch (createError) {
                console.error('❌ Failed to create alias column:', createError.message);
                console.log('\nPlease run this SQL manually:');
                console.log('ALTER TABLE agencies ADD COLUMN alias VARCHAR(255);\n');
                return;
            }
        }

        // Fetch all agencies
        console.log('Fetching agencies...');
        const result = await pool.query(`
            SELECT id, agency_name, COALESCE(alias, '') AS alias
            FROM agencies
            WHERE voided = false
            ORDER BY agency_name
        `);

        const agencies = result.rows || [];
        console.log(`Found ${agencies.length} agencies\n`);

        if (agencies.length === 0) {
            console.log('No agencies found. Exiting.');
            return;
        }

        // Generate and update aliases
        let updated = 0;
        let skipped = 0;
        const updates = [];

        for (const agency of agencies) {
            const currentAlias = (agency.alias || '').trim();
            const generatedAlias = generateAlias(agency.agency_name);

            // Skip if alias already exists and is meaningful
            if (currentAlias && currentAlias.length > 0) {
                console.log(`⏭️  Skipping "${agency.agency_name}" - already has alias: "${currentAlias}"`);
                skipped++;
                continue;
            }

            // Skip if generated alias is empty or same as name
            if (!generatedAlias || generatedAlias === agency.agency_name) {
                console.log(`⏭️  Skipping "${agency.agency_name}" - could not generate meaningful alias`);
                skipped++;
                continue;
            }

            updates.push({
                id: agency.id,
                name: agency.agency_name,
                alias: generatedAlias
            });
        }

        console.log(`\n📝 Generated ${updates.length} aliases to update\n`);

        // Update agencies
        if (updates.length > 0) {
            console.log('Updating agencies...\n');
            
            for (const update of updates) {
                try {
                    await pool.query(
                        `UPDATE agencies 
                        SET alias = $1, updated_at = CURRENT_TIMESTAMP
                        WHERE id = $2`,
                        [update.alias, update.id]
                    );
                    console.log(`✓ "${update.name}" -> "${update.alias}"`);
                    updated++;
                } catch (updateError) {
                    console.error(`❌ Failed to update "${update.name}":`, updateError.message);
                }
            }
        }

        console.log(`\n✅ Update complete!`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${agencies.length}\n`);

    } catch (error) {
        console.error('❌ Error updating agency aliases:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run script
if (require.main === module) {
    updateAgencyAliases()
        .then(() => {
            console.log('Script completed successfully.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { updateAgencyAliases, generateAlias };
