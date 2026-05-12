#!/usr/bin/env node
/**
 * Convert MySQL schema to PostgreSQL schema
 * Handles data type conversions, syntax differences, etc.
 */

const fs = require('fs');
const path = require('path');

const mysqlSchemaFile = path.join(__dirname, 'schema/mysql-schema.sql');
const outputFile = path.join(__dirname, 'schema/postgres-schema-converted.sql');

if (!fs.existsSync(mysqlSchemaFile)) {
    console.error(`MySQL schema file not found: ${mysqlSchemaFile}`);
    console.error('Please run export-mysql-schema.sh first');
    process.exit(1);
}

console.log('Reading MySQL schema...');
let mysqlSchema = fs.readFileSync(mysqlSchemaFile, 'utf8');

console.log('Converting MySQL to PostgreSQL...');

// Remove MySQL-specific comments and commands
mysqlSchema = mysqlSchema.replace(/^\/\*!.*?\*\/;?$/gm, '');
mysqlSchema = mysqlSchema.replace(/^SET.*?;$/gm, '');
mysqlSchema = mysqlSchema.replace(/^LOCK TABLES.*?;$/gm, '');
mysqlSchema = mysqlSchema.replace(/^UNLOCK TABLES;$/gm, '');

// Convert data types
const typeConversions = [
    // Integer types
    [/\bTINYINT\(1\)/gi, 'BOOLEAN'],
    [/\bTINYINT\b/gi, 'SMALLINT'],
    [/\bSMALLINT\([^)]+\)/gi, 'SMALLINT'],
    [/\bMEDIUMINT\b/gi, 'INTEGER'],
    [/\bINT\([^)]+\)/gi, 'INTEGER'],
    [/\bINT\b/gi, 'INTEGER'],
    [/\bBIGINT\([^)]+\)/gi, 'BIGINT'],
    [/\bBIGINT\b/gi, 'BIGINT'],
    
    // String types
    [/\bVARCHAR\(([^)]+)\)/gi, 'VARCHAR($1)'],
    [/\bCHAR\(([^)]+)\)/gi, 'CHAR($1)'],
    [/\bTEXT\b/gi, 'TEXT'],
    [/\bLONGTEXT\b/gi, 'TEXT'],
    [/\bMEDIUMTEXT\b/gi, 'TEXT'],
    
    // Numeric types
    [/\bDECIMAL\(([^,]+),([^)]+)\)/gi, 'NUMERIC($1,$2)'],
    [/\bDOUBLE\b/gi, 'DOUBLE PRECISION'],
    [/\bFLOAT\(([^,]+),([^)]+)\)/gi, 'REAL'],
    [/\bFLOAT\b/gi, 'REAL'],
    
    // Date/Time types
    [/\bDATETIME\b/gi, 'TIMESTAMP'],
    [/\bTIMESTAMP\b/gi, 'TIMESTAMP'],
    [/\bDATE\b/gi, 'DATE'],
    [/\bTIME\b/gi, 'TIME'],
    [/\bYEAR\b/gi, 'INTEGER'],
    
    // Binary types
    [/\bBLOB\b/gi, 'BYTEA'],
    [/\bLONGBLOB\b/gi, 'BYTEA'],
    
    // JSON (MySQL 5.7+)
    [/\bJSON\b/gi, 'JSONB'],
];

for (const [pattern, replacement] of typeConversions) {
    mysqlSchema = mysqlSchema.replace(pattern, replacement);
}

// Convert AUTO_INCREMENT to SERIAL/BIGSERIAL
mysqlSchema = mysqlSchema.replace(
    /(\w+)\s+INTEGER\s+NOT\s+NULL\s+AUTO_INCREMENT/gi,
    '$1 SERIAL PRIMARY KEY'
);
mysqlSchema = mysqlSchema.replace(
    /(\w+)\s+BIGINT\s+NOT\s+NULL\s+AUTO_INCREMENT/gi,
    '$1 BIGSERIAL PRIMARY KEY'
);

// Remove AUTO_INCREMENT from column definitions (already handled above)
mysqlSchema = mysqlSchema.replace(/\s+AUTO_INCREMENT/gi, '');

// Convert DEFAULT CURRENT_TIMESTAMP
mysqlSchema = mysqlSchema.replace(
    /DEFAULT\s+CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi,
    'DEFAULT CURRENT_TIMESTAMP'
);
mysqlSchema = mysqlSchema.replace(
    /DEFAULT\s+CURRENT_TIMESTAMP/gi,
    'DEFAULT CURRENT_TIMESTAMP'
);

// Convert ENUM to CHECK constraint or use PostgreSQL ENUM
// For now, we'll convert to VARCHAR with CHECK constraint
mysqlSchema = mysqlSchema.replace(
    /ENUM\(([^)]+)\)/gi,
    (match, values) => {
        const enumValues = values.split(',').map(v => v.trim().replace(/^'|'$/g, ''));
        const checkValues = enumValues.map(v => `'${v}'`).join(',');
        return `VARCHAR(50) CHECK (value IN (${checkValues}))`;
    }
);

// Convert table creation syntax
mysqlSchema = mysqlSchema.replace(/CREATE TABLE\s+`?(\w+)`?\s*\(/gi, 'CREATE TABLE IF NOT EXISTS $1 (');
mysqlSchema = mysqlSchema.replace(/`/g, ''); // Remove backticks

// Convert ENGINE and CHARSET
mysqlSchema = mysqlSchema.replace(/\s+ENGINE=\w+.*$/gm, '');
mysqlSchema = mysqlSchema.replace(/\s+DEFAULT\s+CHARSET=\w+.*$/gm, '');
mysqlSchema = mysqlSchema.replace(/\s+COLLATE=\w+.*$/gm, '');

// Convert KEY to separate CREATE INDEX statements (PostgreSQL doesn't support inline INDEX in CREATE TABLE)
// We'll collect these and add them after the table creation
const indexStatements = [];
mysqlSchema = mysqlSchema.replace(/\bKEY\s+(\w+)\s*\(([^)]+)\)/gi, (match, indexName, columns) => {
    indexStatements.push({ name: indexName, columns, table: 'TEMP_TABLE_NAME' });
    return ''; // Remove from CREATE TABLE
});

// Convert PRIMARY KEY syntax
mysqlSchema = mysqlSchema.replace(/,\s*PRIMARY\s+KEY\s*\(([^)]+)\)/gi, '');

// Handle foreign keys - update syntax
mysqlSchema = mysqlSchema.replace(
    /CONSTRAINT\s+(\w+)\s+FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(\w+)\s*\(([^)]+)\)\s+(ON\s+DELETE\s+\w+)?/gi,
    'CONSTRAINT $1 FOREIGN KEY ($2) REFERENCES $3 ($4) $5'
);

// Remove MySQL-specific index types
mysqlSchema = mysqlSchema.replace(/\s+USING\s+\w+/gi, '');

// Convert COMMENT syntax
mysqlSchema = mysqlSchema.replace(/\s+COMMENT\s+'([^']+)'/gi, ''); // Remove comments for now

// Add semicolons where missing
mysqlSchema = mysqlSchema.replace(/\n\)\s*$/gm, '\n);');

// Clean up multiple blank lines
mysqlSchema = mysqlSchema.replace(/\n{3,}/g, '\n\n');

// Add header
const header = `-- PostgreSQL Schema Converted from MySQL
-- Generated: ${new Date().toISOString()}
-- Original: mysql-schema.sql
-- 
-- Note: This is an automated conversion. Please review and test thoroughly.
-- Some MySQL-specific features may need manual adjustment.

`;

fs.writeFileSync(outputFile, header + mysqlSchema, 'utf8');

console.log(`✓ Converted schema written to: ${outputFile}`);
console.log('⚠ Please review the converted schema for any manual adjustments needed.');
