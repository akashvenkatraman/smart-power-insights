const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Finding ALL "power" + "cost" labels ===\n');

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    // Show ALL rows that have both "power" and "cost"
    if (label.includes('power') && label.includes('cost')) {
        console.log(`\nRow ${rowIdx}: "${row[1]}"`);

        // Check all our conditions
        const hasYear = label.includes('/year') || label.includes('/ year') || label.includes(' year');
        const hasSales = label.includes('/sales') || label.includes('/ sales');
        const hasLakh = label.includes('lakh');

        console.log(`  Has year: ${hasYear}`);
        console.log(`  Has sales: ${hasSales}`);
        console.log(`  Has lakh: ${hasLakh}`);

        // Would this match our condition?
        const wouldMatch = label.includes('power') && label.includes('cost') && hasLakh && (hasYear || hasSales);
        console.log(`  → WOULD MATCH: ${wouldMatch ? '✓ YES ✓' : '✗ NO ✗'}`);

        // Show values
        const values = [];
        for (let i = 2; i < row.length; i++) {
            if (typeof row[i] === 'number' && !isNaN(row[i])) {
                values.push(row[i]);
            }
        }
        console.log(`  → First 3 values:`, values.slice(0, 3));
    }
});

console.log('\n\n=== EXACT LABEL WE NEED ===');
console.log('Looking for a label with:');
console.log('1. "power"');
console.log('2. "cost"');
console.log('3. "lakh"');
console.log('4. "/year" OR "/sales" (with variations)');
