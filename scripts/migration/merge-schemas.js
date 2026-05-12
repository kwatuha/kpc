#!/usr/bin/env node
/**
 * Merge remote PostgreSQL schema with converted MySQL schema
 * Handles conflicts and creates a unified schema
 */

const fs = require('fs');
const path = require('path');

const remoteSchemaFile = path.join(__dirname, 'schema/remote-postgres-schema.sql');
const mysqlConvertedFile = path.join(__dirname, 'schema/postgres-schema-converted.sql');
const outputFile = path.join(__dirname, 'schema/merged-postgres-schema.sql');

console.log('Merging schemas...');

let remoteSchema = '';
let mysqlSchema = '';

// Read remote PostgreSQL schema
if (fs.existsSync(remoteSchemaFile)) {
    remoteSchema = fs.readFileSync(remoteSchemaFile, 'utf8');
    console.log('✓ Loaded remote PostgreSQL schema');
} else {
    console.warn('⚠ Remote PostgreSQL schema not found. Skipping...');
}

// Read converted MySQL schema
if (fs.existsSync(mysqlConvertedFile)) {
    mysqlSchema = fs.readFileSync(mysqlConvertedFile, 'utf8');
    console.log('✓ Loaded converted MySQL schema');
} else {
    console.error('✗ Converted MySQL schema not found. Please run convert-mysql-to-postgres.js first.');
    process.exit(1);
}

// Extract table names from both schemas
const extractTableNames = (schema) => {
    const tableMatches = schema.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/gi);
    return tableMatches ? tableMatches.map(m => m.replace(/CREATE TABLE (?:IF NOT EXISTS )?/i, '').toLowerCase()) : [];
};

const remoteTables = extractTableNames(remoteSchema);
const mysqlTables = extractTableNames(mysqlSchema);

console.log(`\nRemote PostgreSQL tables: ${remoteTables.length}`);
console.log(`MySQL tables: ${mysqlTables.length}`);

// Find conflicts (tables that exist in both)
const conflicts = remoteTables.filter(t => mysqlTables.includes(t));
const remoteOnly = remoteTables.filter(t => !mysqlTables.includes(t));
const mysqlOnly = mysqlTables.filter(t => !remoteTables.includes(t));

console.log(`\nConflicts (exist in both): ${conflicts.length}`);
console.log(`Remote only: ${remoteOnly.length}`);
console.log(`MySQL only: ${mysqlOnly.length}`);

// Build merged schema
let mergedSchema = `-- Merged PostgreSQL Schema
-- Generated: ${new Date().toISOString()}
-- 
-- Remote PostgreSQL tables: ${remoteTables.length}
-- MySQL tables: ${mysqlTables.length}
-- Conflicts: ${conflicts.length}
-- 
-- Strategy:
-- 1. Use remote PostgreSQL schema as base (preserves existing structure)
-- 2. Add MySQL-only tables
-- 3. For conflicts, use remote version (manual review recommended)
--

`;

// Add remote schema first (as foundation)
if (remoteSchema) {
    mergedSchema += `-- ============================================
-- REMOTE POSTGRESQL SCHEMA (FOUNDATION)
-- ============================================

${remoteSchema}

-- ============================================
-- END REMOTE POSTGRESQL SCHEMA
-- ============================================

`;
}

// Extract and add MySQL-only tables
if (mysqlOnly.length > 0) {
    mergedSchema += `-- ============================================
-- MYSQL-ONLY TABLES (TO BE ADDED)
-- ============================================
-- Tables: ${mysqlOnly.join(', ')}

`;

    // Extract CREATE TABLE statements for MySQL-only tables
    const mysqlOnlyTables = mysqlOnly.map(table => {
        const regex = new RegExp(`CREATE TABLE (?:IF NOT EXISTS )?${table}[\\s\\S]*?;`, 'i');
        const match = mysqlSchema.match(regex);
        return match ? match[0] : null;
    }).filter(Boolean);

    mergedSchema += mysqlOnlyTables.join('\n\n') + '\n\n';
    mergedSchema += `-- ============================================
-- END MYSQL-ONLY TABLES
-- ============================================

`;
}

// Add conflict resolution notes
if (conflicts.length > 0) {
    mergedSchema += `-- ============================================
-- CONFLICT RESOLUTION NOTES
-- ============================================
-- The following tables exist in both schemas:
-- ${conflicts.join(', ')}
-- 
-- Current strategy: Using remote PostgreSQL version
-- Please review these tables manually to ensure all
-- fields from MySQL version are included.
--

`;
}

// Add summary
mergedSchema += `-- ============================================
-- SCHEMA SUMMARY
-- ============================================
-- Total tables: ${remoteTables.length + mysqlOnly.length}
-- Remote tables: ${remoteTables.length}
-- MySQL-only tables: ${mysqlOnly.length}
-- Conflicts: ${conflicts.length}
-- ============================================
`;

fs.writeFileSync(outputFile, mergedSchema, 'utf8');

console.log(`\n✓ Merged schema written to: ${outputFile}`);
console.log('\nNext steps:');
console.log('1. Review the merged schema');
console.log('2. Manually resolve any conflicts');
console.log('3. Apply the schema to your local PostgreSQL database');
