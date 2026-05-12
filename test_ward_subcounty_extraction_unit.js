/**
 * Unit test script for ward and subcounty ID extraction logic
 * Tests the matching logic with mock data (no database required)
 */

const { normalizeStr } = require('./api/services/metadataService');

// Mock ward data - simulating what would come from the database
const mockWardData = [
    { wardId: 36, name: 'AWASI/ONJIKO', subcountyId: 7 },
    { wardId: 100, name: 'NYALENDA A', subcountyId: 7 },
    { wardId: 101, name: 'EAST KANO/WAWIDHI', subcountyId: 8 },
];

// Mock subcounty data
const mockSubcountyData = [
    { subcountyId: 7, name: 'KISUMU CENTRAL' },
    { subcountyId: 8, name: 'KISUMU EAST' },
];

// Build ward map (simulating loadMetadataMappings)
function buildWardMap(wardData) {
    const wardMap = new Map();
    const wardWordSetMap = new Map();
    
    wardData.forEach(ward => {
        if (ward.name) {
            const normalized = normalizeStr(ward.name).toLowerCase();
            const wardInfo = { 
                wardId: ward.wardId, 
                subcountyId: ward.subcountyId,
                name: ward.name 
            };
            
            // Store exact normalized name
            wardMap.set(normalized, wardInfo);
            
            // Store variations with slash replaced by space
            const withSpace = normalized.replace(/\//g, ' ');
            if (withSpace !== normalized) {
                wardMap.set(withSpace, wardInfo);
            }
            
            // Store variations with space replaced by slash
            const withSlash = normalized.replace(/\s+/g, '/');
            if (withSlash !== normalized && withSlash !== withSpace) {
                wardMap.set(withSlash, wardInfo);
            }
            
            // Store word set (sorted words) for order-independent matching
            const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
            if (words && words !== normalized) {
                wardWordSetMap.set(words, wardInfo);
            }
            
            // For compound names with slash, also store individual parts
            if (normalized.includes('/')) {
                const parts = normalized.split('/').map(p => p.trim()).filter(p => p.length > 0);
                parts.forEach(part => {
                    if (part && !wardMap.has(part)) {
                        if (part.length >= 3) {
                            wardMap.set(part, wardInfo);
                        }
                    }
                });
            }
        }
    });
    
    return { wardMap, wardWordSetMap };
}

// Build subcounty map
function buildSubcountyMap(subcountyData) {
    const subcountyMap = new Map();
    const subcountyWordSetMap = new Map();
    
    subcountyData.forEach(subcounty => {
        if (subcounty.name) {
            const normalized = normalizeStr(subcounty.name).toLowerCase();
            const subcountyInfo = { 
                subcountyId: subcounty.subcountyId,
                name: subcounty.name 
            };
            
            // Store exact normalized name
            subcountyMap.set(normalized, subcountyInfo);
            
            // Store variations with slash replaced by space
            const withSpace = normalized.replace(/\//g, ' ');
            if (withSpace !== normalized) {
                subcountyMap.set(withSpace, subcountyInfo);
            }
            
            // Store variations with space replaced by slash
            const withSlash = normalized.replace(/\s+/g, '/');
            if (withSlash !== normalized && withSlash !== withSpace) {
                subcountyMap.set(withSlash, subcountyInfo);
            }
            
            // Store word set (sorted words) for order-independent matching
            const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
            if (words && words !== normalized) {
                subcountyWordSetMap.set(words, subcountyInfo);
            }
        }
    });
    
    return { subcountyMap, subcountyWordSetMap };
}

// Enhanced getWardInfo function (same as in metadataService)
function getWardInfo(wardMap, wardWordSetMap, wardName) {
    if (!wardName || wardName === 'unknown' || wardName === 'CountyWide') return null;
    
    // Normalize the input (removes quotes, normalizes spaces/slashes)
    let normalized = normalizeStr(wardName).toLowerCase();
    
    // Remove trailing "ward" suffix if present
    normalized = normalized.replace(/\s+ward\s*$/i, '').trim();
    
    // Try exact match first
    if (wardMap.has(normalized)) {
        return wardMap.get(normalized);
    }
    
    // Try with slash replaced by space
    const withSpace = normalized.replace(/\//g, ' ');
    if (withSpace !== normalized && wardMap.has(withSpace)) {
        return wardMap.get(withSpace);
    }
    
    // Try with space replaced by slash
    const withSlash = normalized.replace(/\s+/g, '/');
    if (withSlash !== normalized && withSlash !== withSpace && wardMap.has(withSlash)) {
        return wardMap.get(withSlash);
    }
    
    // Try word-order independent matching (sorted words)
    const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
    if (words && wardWordSetMap && wardWordSetMap.has(words)) {
        return wardWordSetMap.get(words);
    }
    
    // For compound names, try matching individual parts
    if (normalized.includes('/') || normalized.includes(' ')) {
        const parts = normalized.split(/[\s\/]+/).map(p => p.trim()).filter(p => p.length >= 3);
        for (const part of parts) {
            if (wardMap.has(part)) {
                const match = wardMap.get(part);
                // Verify this match contains the part
                const matchNormalized = normalizeStr(match.name).toLowerCase();
                if (matchNormalized.includes(part) || part.includes(matchNormalized.split(/[\s\/]+/)[0])) {
                    return match;
                }
            }
        }
    }
    
    return null;
}

// Enhanced getSubcountyId function (same as in metadataService)
function getSubcountyId(subcountyMap, subcountyWordSetMap, subcountyName) {
    if (!subcountyName || subcountyName === 'unknown' || subcountyName === 'CountyWide') return null;
    
    // Normalize the input
    let normalized = normalizeStr(subcountyName).toLowerCase();
    
    // Try exact match first
    if (subcountyMap.has(normalized)) {
        return subcountyMap.get(normalized).subcountyId;
    }
    
    // Try with slash replaced by space
    const withSpace = normalized.replace(/\//g, ' ');
    if (withSpace !== normalized && subcountyMap.has(withSpace)) {
        return subcountyMap.get(withSpace).subcountyId;
    }
    
    // Try with space replaced by slash
    const withSlash = normalized.replace(/\s+/g, '/');
    if (withSlash !== normalized && withSlash !== withSpace && subcountyMap.has(withSlash)) {
        return subcountyMap.get(withSlash).subcountyId;
    }
    
    // Try word-order independent matching (sorted words)
    const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
    if (words && subcountyWordSetMap && subcountyWordSetMap.has(words)) {
        return subcountyWordSetMap.get(words).subcountyId;
    }
    
    return null;
}

// Test cases for ward 36 | AWASI/ONJIKO
const wardTestCases = [
    { input: 'AWASI/ONJIKO', expected: 36, description: 'Exact match with slash' },
    { input: 'AWASI ONJIKO', expected: 36, description: 'Space instead of slash' },
    { input: 'awasi/onjiko', expected: 36, description: 'Lowercase' },
    { input: 'AWASI / ONJIKO', expected: 36, description: 'Slash with spaces' },
    { input: 'AWASI  ONJIKO', expected: 36, description: 'Multiple spaces' },
    { input: 'ONJIKO AWASI', expected: 36, description: 'Reversed word order' },
    { input: 'AWASI', expected: 36, description: 'Just first part' },
    { input: 'ONJIKO', expected: 36, description: 'Just second part' },
    { input: 'AWASI/ONJIKO Ward', expected: 36, description: 'With "Ward" suffix' },
];

// Test cases for subcounty 7 | KISUMU CENTRAL
const subcountyTestCases = [
    { input: 'KISUMU CENTRAL', expected: 7, description: 'Exact match' },
    { input: 'KISUMU/CENTRAL', expected: 7, description: 'Slash instead of space' },
    { input: 'kisumu central', expected: 7, description: 'Lowercase' },
    { input: 'KISUMU  CENTRAL', expected: 7, description: 'Multiple spaces' },
    { input: 'CENTRAL KISUMU', expected: 7, description: 'Reversed word order' },
    { input: 'KISUMU / CENTRAL', expected: 7, description: 'Slash with spaces' },
];

// Test cases for quote variations (Nyalenda A)
const quoteTestCases = [
    { input: 'Nyalenda A', expected: 100, description: 'Normal format' },
    { input: 'Nyalenda "A"', expected: 100, description: 'Double quotes' },
    { input: "Nyalenda 'A'", expected: 100, description: 'Single quotes' },
    { input: 'Nyalenda  A', expected: 100, description: 'Multiple spaces' },
    { input: 'nyalenda a', expected: 100, description: 'Lowercase' },
];

// Test cases for EAST KANO/WAWIDHI
const eastKanoTestCases = [
    { input: 'EAST KANO/WAWIDHI', expected: 101, description: 'Exact match' },
    { input: 'EAST KANO WAWIDHI', expected: 101, description: 'Space instead of slash' },
    { input: 'WAWIDHI EAST KANO', expected: 101, description: 'Reversed word order' },
    { input: 'EAST KANO', expected: 101, description: 'First part' },
    { input: 'WAWIDHI', expected: 101, description: 'Second part' },
];

function runTests() {
    console.log('='.repeat(80));
    console.log('Unit Testing Ward and Subcounty ID Extraction Logic');
    console.log('='.repeat(80));
    console.log();

    // Build maps
    const { wardMap, wardWordSetMap } = buildWardMap(mockWardData);
    const { subcountyMap, subcountyWordSetMap } = buildSubcountyMap(mockSubcountyData);
    
    console.log(`Built maps: ${wardMap.size} ward entries, ${subcountyMap.size} subcounty entries`);
    console.log();

    let totalPassed = 0;
    let totalFailed = 0;

    // Test ward extraction
    console.log('─'.repeat(80));
    console.log('TESTING WARD EXTRACTION (Expected: Ward 36 | AWASI/ONJIKO)');
    console.log('─'.repeat(80));
    
    for (const testCase of wardTestCases) {
        const result = getWardInfo(wardMap, wardWordSetMap, testCase.input);
        
        if (result && result.wardId === testCase.expected) {
            console.log(`✓ PASS: "${testCase.input}" (${testCase.description}) -> Ward ID: ${result.wardId}, Name: "${result.name}"`);
            totalPassed++;
        } else {
            console.log(`✗ FAIL: "${testCase.input}" (${testCase.description}) -> ${result ? `Got Ward ID: ${result.wardId}` : 'No match found'}`);
            totalFailed++;
        }
    }
    
    console.log();

    // Test subcounty extraction
    console.log('─'.repeat(80));
    console.log('TESTING SUBCOUNTY EXTRACTION (Expected: Subcounty 7 | KISUMU CENTRAL)');
    console.log('─'.repeat(80));
    
    for (const testCase of subcountyTestCases) {
        const result = getSubcountyId(subcountyMap, subcountyWordSetMap, testCase.input);
        
        if (result === testCase.expected) {
            console.log(`✓ PASS: "${testCase.input}" (${testCase.description}) -> Subcounty ID: ${result}`);
            totalPassed++;
        } else {
            console.log(`✗ FAIL: "${testCase.input}" (${testCase.description}) -> ${result ? `Got Subcounty ID: ${result}` : 'No match found'}`);
            totalFailed++;
        }
    }
    
    console.log();

    // Test quote variations
    console.log('─'.repeat(80));
    console.log('TESTING QUOTE VARIATIONS (Expected: Ward 100 | NYALENDA A)');
    console.log('─'.repeat(80));
    
    for (const testCase of quoteTestCases) {
        const result = getWardInfo(wardMap, wardWordSetMap, testCase.input);
        
        if (result && result.wardId === testCase.expected) {
            console.log(`✓ PASS: "${testCase.input}" (${testCase.description}) -> Ward ID: ${result.wardId}, Name: "${result.name}"`);
            totalPassed++;
        } else {
            console.log(`✗ FAIL: "${testCase.input}" (${testCase.description}) -> ${result ? `Got Ward ID: ${result.wardId}` : 'No match found'}`);
            totalFailed++;
        }
    }
    
    console.log();

    // Test EAST KANO/WAWIDHI
    console.log('─'.repeat(80));
    console.log('TESTING EAST KANO/WAWIDHI VARIATIONS (Expected: Ward 101 | EAST KANO/WAWIDHI)');
    console.log('─'.repeat(80));
    
    for (const testCase of eastKanoTestCases) {
        const result = getWardInfo(wardMap, wardWordSetMap, testCase.input);
        
        if (result && result.wardId === testCase.expected) {
            console.log(`✓ PASS: "${testCase.input}" (${testCase.description}) -> Ward ID: ${result.wardId}, Name: "${result.name}"`);
            totalPassed++;
        } else {
            console.log(`✗ FAIL: "${testCase.input}" (${testCase.description}) -> ${result ? `Got Ward ID: ${result.wardId}` : 'No match found'}`);
            totalFailed++;
        }
    }
    
    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    const totalTests = totalPassed + totalFailed;
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log();
    
    if (totalFailed === 0) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please review the results above.');
        process.exit(1);
    }
}

// Run the tests
runTests();
