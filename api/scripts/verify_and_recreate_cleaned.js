const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const inputPath = '/home/dev/dev/imes_working/v5/projects_import_template_v5.xlsx';
const outputPath = '/home/dev/dev/imes_working/v5/projects_import_template_v5_cleaned.xlsx';

console.log('🔍 Verifying and recreating cleaned file...');
console.log(`Input: ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log('');

try {
    // Read original file
    console.log('📖 Reading original file...');
    const workbook = XLSX.readFile(inputPath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read all data
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`✓ Read ${rawData.length} rows from original file`);
    
    // Filter out empty rows
    console.log('🧹 Filtering empty rows...');
    const cleanedData = rawData.filter((row, index) => {
        // Always keep header row
        if (index === 0) return true;
        
        // Check if row has any non-empty cells
        if (!row || !Array.isArray(row)) return false;
        
        const hasData = row.some(cell => {
            return cell !== undefined && cell !== null && cell !== '' && String(cell).trim() !== '';
        });
        
        return hasData;
    });
    
    console.log(`✓ Filtered to ${cleanedData.length} rows (removed ${rawData.length - cleanedData.length} empty rows)`);
    
    // Verify we have data
    if (cleanedData.length < 2) {
        throw new Error('No data rows found after cleaning!');
    }
    
    // Create new workbook with cleaned data
    console.log('📝 Creating new workbook...');
    const newWorksheet = XLSX.utils.aoa_to_sheet(cleanedData);
    
    // Set column widths for better formatting
    const headers = cleanedData[0];
    const colWidths = headers.map(() => ({ wch: 25 }));
    newWorksheet['!cols'] = colWidths;
    
    // Freeze header row
    newWorksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
    
    // Remove old file if it exists
    if (fs.existsSync(outputPath)) {
        console.log('🗑️  Removing old cleaned file...');
        fs.unlinkSync(outputPath);
    }
    
    // Write cleaned file
    console.log('💾 Writing cleaned file...');
    XLSX.writeFile(newWorkbook, outputPath, { 
        bookType: 'xlsx',
        type: 'buffer'
    });
    
    // Verify file was created
    if (!fs.existsSync(outputPath)) {
        throw new Error('Failed to create output file!');
    }
    
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    if (stats.size === 0) {
        throw new Error('Created file is 0 bytes!');
    }
    
    console.log(`\n✅ Cleaned file created successfully!`);
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${fileSizeKB} KB`);
    console.log(`   Rows: ${cleanedData.length} (${cleanedData.length - 1} data rows)`);
    
    // Verify the file can be read back
    console.log('\n🔍 Verifying file can be read back...');
    const verifyWorkbook = XLSX.readFile(outputPath);
    const verifySheet = verifyWorkbook.Sheets[verifyWorkbook.SheetNames[0]];
    const verifyData = XLSX.utils.sheet_to_json(verifySheet, { header: 1 });
    console.log(`✓ Verified: File contains ${verifyData.length} rows`);
    
    // Show headers and first row
    console.log('\n📋 File contents:');
    console.log(`   Headers (${headers.length}): ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);
    console.log(`   Data rows: ${cleanedData.length - 1}`);
    
    if (cleanedData.length > 1) {
        const firstRow = cleanedData[1];
        console.log('\n   First data row sample:');
        for (let i = 0; i < Math.min(5, headers.length); i++) {
            const value = firstRow[i];
            if (value !== undefined && value !== null && value !== '') {
                console.log(`     ${headers[i]}: ${value}`);
            }
        }
    }
    
    console.log('\n✅ All checks passed! File is ready to use.');
    
} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}













