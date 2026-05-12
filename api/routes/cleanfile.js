const fs = require('fs');

function cleanJavaScriptFile(filePath) {
        console.log(filePath)
    let contents = fs.readFileSync(filePath, 'utf8');
    console.log(contents)

    try {
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        
        console.log('Original file size:', content.length);
        
        // Remove BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
            console.log('Removed BOM (Byte Order Mark)');
        }
        
        // Track changes
        let changesMade = [];
        
        // Replace common problematic characters
        const replacements = [
            // Smart quotes to regular quotes
            [/[\u201C\u201D]/g, '"', 'Smart double quotes'],
            [/[\u2018\u2019]/g, "'", 'Smart single quotes'],
            
            // Different types of dashes
            [/[\u2013\u2014]/g, '-', 'Em/En dashes'],
            
            // Non-breaking spaces to regular spaces
            [/\u00A0/g, ' ', 'Non-breaking spaces'],
            
            // Zero-width characters
            [/[\u200B\u200C\u200D\uFEFF]/g, '', 'Zero-width characters'],
            
            // Other invisible characters
            [/[\u2060\u2061\u2062\u2063]/g, '', 'Word joiner and invisible operators'],
            
            // Replace multiple spaces with single space (except in strings)
            // This is more complex, so we'll do a simple version
            [/  +/g, ' ', 'Multiple consecutive spaces']
        ];
        
        replacements.forEach(([regex, replacement, description]) => {
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, replacement);
                changesMade.push(`${description}: ${matches.length} occurrences`);
            }
        });
        
        // Normalize line endings to Unix style
        const originalLineEndings = content.match(/\r\n|\r|\n/g);
        if (originalLineEndings) {
            const crlfCount = (content.match(/\r\n/g) || []).length;
            const crCount = (content.match(/\r(?!\n)/g) || []).length;
            
            if (crlfCount > 0 || crCount > 0) {
                content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                changesMade.push(`Normalized line endings: ${crlfCount} CRLF, ${crCount} CR to LF`);
            }
        }
        
        // Check for characters that might cause issues in SQL
        const problematicChars = content.match(/[^\x20-\x7E\n\t]/g);
        if (problematicChars) {
            console.log('Remaining non-standard characters found:');
            const uniqueChars = [...new Set(problematicChars)];
            uniqueChars.forEach(char => {
                const code = char.charCodeAt(0);
                console.log(`  "${char}" (U+${code.toString(16).toUpperCase().padStart(4, '0')})`);
            });
        }
        
        console.log('Changes made:', changesMade.length > 0 ? changesMade : ['None']);
        console.log('Cleaned file size:', content.length);
        
        // Create backup
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        console.log(`Backup created: ${backupPath}`);
        
        // Write cleaned content
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`File cleaned successfully: ${filePath}`);
        
        return content;
        
    } catch (error) {
        console.error('Error cleaning file:', error);
        throw error;
    }
}

// Usage
if (process.argv.length < 3) {
    console.log('Usage: node cleanup.js <filepath>');
    process.exit(1);
}

const filePath = process.argv[2];
filePath='./humanResourceRoutes.js';
cleanJavaScriptFile(filePath);