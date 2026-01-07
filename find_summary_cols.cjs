const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Finding Summary Section ===\n');

let startRow = -1;
let endRow = -1;

rows.forEach((row, idx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('total sales') && label.includes('lakh')) {
        if (startRow === -1) startRow = idx;
        console.log(`\nRow ${idx}: Total Sales`);
        console.log('Full row:', row);
        console.log('Row length:', row.length);

        // Find where the actual numbers start
        row.forEach((cell, colIdx) => {
            if (typeof cell === 'number' && cell > 10 && cell < 20) {
                console.log(`  → Number ${cell} found at column ${colIdx}`);
            }
        });
    }

    if (label.includes('total power cost') && (label.includes('year') || label.includes('sales'))) {
        console.log(`\nRow ${idx}: Total Power Cost/Year in Lakhs`);
        console.log('Full row:', row);

        // Find where the actual numbers start (should be around 164)
        row.forEach((cell, colIdx) => {
            if (typeof cell === 'number' && cell > 140 && cell < 200) {
                console.log(`  → Number ${cell} found at column ${colIdx}`);
            }
        });
    }

    if (label.includes('dg rent split')) {
        endRow = idx + 5;
    }
});

console.log(`\n=== Summary Section: Rows ${startRow} to ${endRow} ===\n`);

if (startRow >= 0) {
    rows.slice(startRow, Math.min(endRow, startRow + 15)).forEach((row, offset) => {
        console.log(`Row ${startRow + offset}:`, row.slice(0, 16));
    });
}
