/**
 * Test script for ward and subcounty ID extraction
 * Tests various input variations to ensure robust matching
 */

// Try to load from api directory first (when running from api container), then fallback to root
let metadataService;
try {
    metadataService = require('./services/metadataService');
} catch (e) {
    metadataService = require('./api/services/metadataService');
}

// Test cases for ward 36 | AWASI/ONJIKO
const wardTestCases = [
    'AWASI/ONJIKO',      // Exact match with slash
    'AWASI ONJIKO',      // Space instead of slash
    'awasi/onjiko',      // Lowercase
    'AWASI / ONJIKO',    // Slash with spaces
    'AWASI  ONJIKO',     // Multiple spaces
    'ONJIKO AWASI',      // Reversed word order
    'AWASI',             // Just first part
    'ONJIKO',            // Just second part
    'AWASI/ONJIKO Ward', // With "Ward" suffix
];

// Test cases for subcounty 7 | KISUMU CENTRAL
const subcountyTestCases = [
    'KISUMU CENTRAL',    // Exact match
    'KISUMU/CENTRAL',    // Slash instead of space
    'kisumu central',    // Lowercase
    'KISUMU  CENTRAL',   // Multiple spaces
    'CENTRAL KISUMU',    // Reversed word order
    'KISUMU / CENTRAL',  // Slash with spaces
];

// Test cases for quote variations (e.g., Nyalenda A)
const quoteTestCases = [
    'Nyalenda A',
    'Nyalenda "A"',
    "Nyalenda 'A'",
    'Nyalenda  A',       // Multiple spaces
    'nyalenda a',        // Lowercase
];

async function runTests() {
    console.log('='.repeat(80));
    console.log('Testing Ward and Subcounty ID Extraction');
    console.log('='.repeat(80));
    console.log();

    try {
        // Load metadata mappings
        console.log('Loading metadata mappings...');
        const mappings = await metadataService.loadMetadataMappings();
        console.log(`Loaded ${mappings.wards.size} wards and ${mappings.subcounties.size} subcounties`);
        console.log();

        // Test ward extraction
        console.log('─'.repeat(80));
        console.log('TESTING WARD EXTRACTION (Expected: Ward 36 | AWASI/ONJIKO)');
        console.log('─'.repeat(80));
        
        let wardPassed = 0;
        let wardFailed = 0;
        
        for (const testCase of wardTestCases) {
            const result = metadataService.getWardInfo(
                mappings.wards,
                mappings.wardWordSets,
                testCase
            );
            
            if (result && result.wardId === 36) {
                console.log(`✓ PASS: "${testCase}" -> Ward ID: ${result.wardId}, Name: "${result.name}"`);
                wardPassed++;
            } else {
                console.log(`✗ FAIL: "${testCase}" -> ${result ? `Got Ward ID: ${result.wardId}, Name: "${result.name}"` : 'No match found'}`);
                wardFailed++;
            }
        }
        
        console.log();
        console.log(`Ward Tests: ${wardPassed} passed, ${wardFailed} failed`);
        console.log();

        // Test subcounty extraction
        console.log('─'.repeat(80));
        console.log('TESTING SUBCOUNTY EXTRACTION (Expected: Subcounty 7 | KISUMU CENTRAL)');
        console.log('─'.repeat(80));
        
        let subcountyPassed = 0;
        let subcountyFailed = 0;
        
        for (const testCase of subcountyTestCases) {
            const result = metadataService.getSubcountyId(
                mappings.subcounties,
                mappings.subcountyWordSets,
                testCase
            );
            
            if (result === 7) {
                console.log(`✓ PASS: "${testCase}" -> Subcounty ID: ${result}`);
                subcountyPassed++;
            } else {
                console.log(`✗ FAIL: "${testCase}" -> ${result ? `Got Subcounty ID: ${result}` : 'No match found'}`);
                subcountyFailed++;
            }
        }
        
        console.log();
        console.log(`Subcounty Tests: ${subcountyPassed} passed, ${subcountyFailed} failed`);
        console.log();

        // Test quote variations (if Nyalenda A exists in database)
        console.log('─'.repeat(80));
        console.log('TESTING QUOTE VARIATIONS (Nyalenda A variations)');
        console.log('─'.repeat(80));
        
        let quotePassed = 0;
        let quoteFailed = 0;
        let quoteWardId = null;
        
        for (const testCase of quoteTestCases) {
            const result = metadataService.getWardInfo(
                mappings.wards,
                mappings.wardWordSets,
                testCase
            );
            
            if (result) {
                if (quoteWardId === null) {
                    quoteWardId = result.wardId;
                }
                if (result.wardId === quoteWardId) {
                    console.log(`✓ PASS: "${testCase}" -> Ward ID: ${result.wardId}, Name: "${result.name}"`);
                    quotePassed++;
                } else {
                    console.log(`✗ FAIL: "${testCase}" -> Got different Ward ID: ${result.wardId}`);
                    quoteFailed++;
                }
            } else {
                console.log(`✗ FAIL: "${testCase}" -> No match found`);
                quoteFailed++;
            }
        }
        
        console.log();
        console.log(`Quote Variation Tests: ${quotePassed} passed, ${quoteFailed} failed`);
        console.log();

        // Summary
        console.log('='.repeat(80));
        console.log('SUMMARY');
        console.log('='.repeat(80));
        console.log(`Ward Tests:      ${wardPassed}/${wardTestCases.length} passed`);
        console.log(`Subcounty Tests: ${subcountyPassed}/${subcountyTestCases.length} passed`);
        console.log(`Quote Tests:     ${quotePassed}/${quoteTestCases.length} passed`);
        console.log();
        
        const totalPassed = wardPassed + subcountyPassed + quotePassed;
        const totalTests = wardTestCases.length + subcountyTestCases.length + quoteTestCases.length;
        console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
        
        if (totalPassed === totalTests) {
            console.log('🎉 All tests passed!');
            process.exit(0);
        } else {
            console.log('⚠️  Some tests failed. Please review the results above.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('Error running tests:', error);
        process.exit(1);
    }
}

// Run the tests
runTests();
