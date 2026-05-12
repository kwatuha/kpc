#!/usr/bin/env node
/**
 * Fix common issues in converted MySQL to PostgreSQL schema
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'schema/postgres-schema-converted.sql');
const outputFile = path.join(__dirname, 'schema/postgres-schema-fixed.sql');

if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
}

console.log('Reading converted schema...');
let schema = fs.readFileSync(inputFile, 'utf8');

console.log('Fixing schema issues...');

// Remove empty commas (where INDEX was removed)
schema = schema.replace(/,\s*,/g, ',');
schema = schema.replace(/,\s*\)/g, ')');
schema = schema.replace(/\(\s*,/g, '(');

// Fix UNIQUE constraints without column names
schema = schema.replace(/UNIQUE\s*,/g, '');
schema = schema.replace(/UNIQUE\s*\)/g, ')');

// Fix invalid CHECK constraints from ENUM conversion
// The previous conversion created CHECK (value IN ...) but should be column-specific
schema = schema.replace(/CHECK\s*\(value\s+IN\s*\(([^)]+)\)\)/g, (match, values) => {
    // This is a placeholder - we need to know the column name
    // For now, remove invalid CHECK and note it needs manual review
    return '-- CHECK constraint removed (needs manual review)';
});

// Better approach: find ENUM columns and fix them properly
schema = schema.replace(/(\w+)\s+VARCHAR\(50\)\s+CHECK\s*\(value\s+IN\s*\(([^)]+)\)\)/g, (match, colName, values) => {
    return `${colName} VARCHAR(50) -- ENUM values: ${values} (consider using CHECK constraint or PostgreSQL ENUM)`;
});

// Remove COLLATE clauses (PostgreSQL handles this differently)
schema = schema.replace(/\s+COLLATE\s+\w+(_\w+)*/gi, '');

// Fix DEFAULT '0' for BOOLEAN (should be FALSE)
schema = schema.replace(/BOOLEAN\s+DEFAULT\s+'0'/gi, 'BOOLEAN DEFAULT FALSE');
schema = schema.replace(/BOOLEAN\s+DEFAULT\s+0/gi, 'BOOLEAN DEFAULT FALSE');
schema = schema.replace(/BOOLEAN\s+DEFAULT\s+'1'/gi, 'BOOLEAN DEFAULT TRUE');
schema = schema.replace(/BOOLEAN\s+DEFAULT\s+1/gi, 'BOOLEAN DEFAULT TRUE');

// Remove trailing commas before closing parenthesis
schema = schema.replace(/,\s*\)/g, ')');

// Fix multiple consecutive commas
schema = schema.replace(/,\s*,+/g, ',');

// Add SET search_path at the beginning
if (!schema.includes('SET search_path')) {
    schema = 'SET search_path = public;\n\n' + schema;
}

// Clean up multiple blank lines
schema = schema.replace(/\n{4,}/g, '\n\n\n');

fs.writeFileSync(outputFile, schema, 'utf8');

console.log(`✓ Fixed schema written to: ${outputFile}`);
console.log('⚠ Please review the fixed schema for any remaining issues.');
