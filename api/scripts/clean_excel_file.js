const XLSX = require('xlsx');
const path = require('path');

// Get file path from command line argument or use default
const inputPath = process.argv[2] || '/home/dev/dev/imes_working/v5/projects_import_template_v5.xlsx';

// Generate output path based on input
const pathParts = inputPath.split('.xlsx');
const outputPath = pathParts[0] + '_cleaned.xlsx';

console.log('🧹 Cleaning Excel file...');
console.log(`Input: ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log('');

try {
    const workbook = XLSX.readFile(inputPath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read all data
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Original file: ${rawData.length} rows`);
    
    // Filter out empty rows
    const cleanedData = rawData.filter((row, index) => {
        // Always keep header row
        if (index === 0) return true;
        
        // Check if row has any non-empty cells
        if (!row || !Array.isArray(row)) return false;
        
        const hasData = row.some(cell => {
            return cell !== undefined && cell !== null && cell !== '';
        });
        
        return hasData;
    });
    
    console.log(`✨ Cleaned file: ${cleanedData.length} rows`);
    console.log(`🗑️  Removed: ${rawData.length - cleanedData.length} empty rows`);
    
    // Create new workbook with cleaned data
    const newWorksheet = XLSX.utils.aoa_to_sheet(cleanedData);
    
    // Set column widths for better formatting (optional)
    const headers = cleanedData[0];
    const colWidths = headers.map(() => ({ wch: 20 }));
    newWorksheet['!cols'] = colWidths;
    
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
    
    // Write cleaned file
    XLSX.writeFile(newWorkbook, outputPath);
    
    console.log(`\n✅ Cleaned file saved to: ${outputPath}`);
    console.log('\n📋 Summary:');
    
    if (cleanedData.length > 0) {
        const headers = cleanedData[0];
        console.log(`  Headers: ${headers.length} columns`);
        console.log(`  Data rows: ${cleanedData.length - 1}`);
        
        // Show first few data rows
        console.log('\n📝 First few rows:');
        console.log('Headers:', headers.slice(0, 10).join(', ') + (headers.length > 10 ? '...' : ''));
        
        for (let i = 1; i < Math.min(4, cleanedData.length); i++) {
            console.log(`\n  Row ${i}:`);
            const row = cleanedData[i];
            let shownCount = 0;
            row.forEach((cell, idx) => {
                if (cell !== undefined && cell !== null && cell !== '' && shownCount < 5) {
                    console.log(`    ${headers[idx]}: ${cell}`);
                    shownCount++;
                }
            });
            if (shownCount < row.filter(c => c !== undefined && c !== null && c !== '').length) {
                console.log(`    ... and ${row.filter(c => c !== undefined && c !== null && c !== '').length - shownCount} more fields`);
            }
        }
    }
    
    // File size comparison
    const fs = require('fs');
    try {
        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        console.log(`\n💾 File size:`);
        console.log(`  Original: ${(inputStats.size / 1024).toFixed(2)} KB`);
        console.log(`  Cleaned:  ${(outputStats.size / 1024).toFixed(2)} KB`);
    } catch (e) {
        // Ignore file size check errors
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOENT') {
        console.error(`   File not found: ${inputPath}`);
    }
    console.error(error.stack);
    process.exit(1);
}
