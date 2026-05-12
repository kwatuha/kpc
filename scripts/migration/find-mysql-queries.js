#!/usr/bin/env node
/**
 * Find all MySQL-specific queries in the codebase
 * Helps identify code that needs to be updated for PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = path.join(__dirname, '../../api');

// Patterns to search for
const patterns = [
    {
        name: 'MySQL ? placeholders',
        pattern: /\?/g,
        description: 'MySQL uses ? for parameterized queries, PostgreSQL uses $1, $2, etc.'
    },
    {
        name: 'LIMIT/OFFSET syntax',
        pattern: /LIMIT\s+\d+\s+OFFSET\s+\d+/gi,
        description: 'Check LIMIT/OFFSET syntax (should work in both, but verify)'
    },
    {
        name: 'MySQL functions',
        pattern: /\b(IFNULL|ISNULL|CONCAT_WS|DATE_FORMAT|NOW\(\)|CURDATE|CURTIME)\b/gi,
        description: 'MySQL-specific functions that need PostgreSQL equivalents'
    },
    {
        name: 'Backticks',
        pattern: /`[^`]+`/g,
        description: 'MySQL uses backticks for identifiers, PostgreSQL uses double quotes'
    },
    {
        name: 'AUTO_INCREMENT',
        pattern: /AUTO_INCREMENT/gi,
        description: 'MySQL AUTO_INCREMENT, PostgreSQL uses SERIAL'
    },
    {
        name: 'ENGINE=InnoDB',
        pattern: /ENGINE\s*=\s*InnoDB/gi,
        description: 'MySQL table engine specification (not needed in PostgreSQL)'
    }
];

function findFiles(dir, extensions = ['.js']) {
    const files = [];
    
    function walkDir(currentPath) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            
            // Skip node_modules and other directories
            if (entry.isDirectory()) {
                if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
                    walkDir(fullPath);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    walkDir(dir);
    return files;
}

function searchInFile(filePath, pattern) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = [];
        let match;
        
        const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
        
        while ((match = regex.exec(content)) !== null) {
            const lines = content.substring(0, match.index).split('\n');
            const lineNumber = lines.length;
            const lineContent = lines[lines.length - 1];
            
            matches.push({
                line: lineNumber,
                match: match[0],
                context: lineContent.trim().substring(0, 100)
            });
        }
        
        return matches;
    } catch (error) {
        return [];
    }
}

function main() {
    console.log('Searching for MySQL-specific code patterns...\n');
    
    const files = findFiles(apiDir, ['.js']);
    console.log(`Found ${files.length} JavaScript files to analyze\n`);
    
    const results = {};
    
    for (const pattern of patterns) {
        results[pattern.name] = [];
        
        for (const file of files) {
            const matches = searchInFile(file, pattern);
            if (matches.length > 0) {
                results[pattern.name].push({
                    file: path.relative(apiDir, file),
                    matches: matches
                });
            }
        }
    }
    
    // Print results
    for (const [patternName, files] of Object.entries(results)) {
        if (files.length > 0) {
            const pattern = patterns.find(p => p.name === patternName);
            console.log(`\n${'='.repeat(80)}`);
            console.log(`${patternName}`);
            console.log(`${pattern.description}`);
            console.log(`${'='.repeat(80)}`);
            
            for (const fileResult of files) {
                console.log(`\n  File: ${fileResult.file}`);
                for (const match of fileResult.matches) {
                    console.log(`    Line ${match.line}: ${match.match}`);
                    console.log(`    Context: ${match.context}`);
                }
            }
        }
    }
    
    // Summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('Summary');
    console.log(`${'='.repeat(80)}`);
    
    for (const [patternName, files] of Object.entries(results)) {
        const totalMatches = files.reduce((sum, f) => sum + f.matches.length, 0);
        if (totalMatches > 0) {
            console.log(`${patternName}: ${totalMatches} matches in ${files.length} files`);
        }
    }
    
    // Write results to file
    const outputFile = path.join(__dirname, 'mysql-queries-report.json');
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\nDetailed report written to: ${outputFile}`);
}

if (require.main === module) {
    main();
}

module.exports = { findFiles, searchInFile };
