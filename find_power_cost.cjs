const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Finding ALL rows with "power" and "cost" ===\n');

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('power') && label.includes('cost')) {
        console.log(`\nRow ${rowIdx}: "${row[1]}"`);
        console.log(`  Lowercase: "${label}"`);

        // Check all our conditions
        console.log(`  ✓ Has 'power': ${label.includes('power')}`);
        console.log(`  ✓ Has 'cost': ${label.includes('cost')}`);
        console.log(`  ✓ Has 'year': ${label.includes('year')}`);
        console.log(`  ✓ Has 'sales': ${label.includes('sales')}`);
        console.log(`  ✓ Has 'lakh': ${label.includes('lakh')}`);

        // Extract values
        const values = [];
        for (let i = 2; i < row.length; i++) {
            if (typeof row[i] === 'number' && !isNaN(row[i])) {
                values.push(row[i]);
            }
        }
        console.log(`  → First 3 values:`, values.slice(0, 3));
        console.log(`  → Total values: ${values.length}`);
    }
});
