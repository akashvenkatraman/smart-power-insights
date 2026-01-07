const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Direct Row Inspection for Summary ===\n');

// Find and print rows 38-48 (likely summary section)
for (let i = 38; i < 58; i++) {
    const row = rows[i];
    const label = row[1] ? String(row[1]) : '';
    console.log(`\nRow ${i}: Label="${label}"`);
    console.log(`  All values:`, row.slice(0, 16));

    // Check which columns have the numeric values we're looking for
    if (label.toLowerCase().includes('total sales')) {
        console.log(`  → This is Total Sales row!`);
        console.log(`  → Looking for 14.6 in columns...`);
        row.forEach((val, colIdx) => {
            if (val >= 14 && val <= 15) {
                console.log(`    ✓ Found ${val} at column ${colIdx}`);
            }
        });
    }
}
