const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Finding EXACT row with Total Sales = 14.6 ===\n');

// Scan ALL rows for a cell containing exactly 14.6
rows.forEach((row, rowIdx) => {
    const label = row[1] ? String(row[1]).toLowerCase() : '';

    // Check if any cell in this row contains 14.6
    const has14_6 = row.some(cell => cell === 14.6 || cell === '14.6');

    if (has14_6 && label.includes('sales')) {
        console.log(`\n✓✓✓ FOUND IT! Row ${rowIdx} ✓✓✓`);
        console.log(`Label (row[1]): "${row[1]}"`);
        console.log(`Full row:`, row);
        console.log(`\nColumn-by-column:`);
        row.forEach((cell, colIdx) => {
            if (cell != null && cell !== '') {
                console.log(`  Col ${colIdx}: ${cell}`);
            }
        });
    }
});

console.log('\n=== Finding row with Power Cost = 164.3 ===\n');
rows.forEach((row, rowIdx) => {
    const has164 = row.some(cell => cell >= 164 && cell <= 165);
    const label = row[1] ? String(row[1]).toLowerCase() : '';

    if (has164 && label.includes('power')) {
        console.log(`\n✓✓✓ FOUND IT! Row ${rowIdx} ✓✓✓`);
        console.log(`Label (row[1]): "${row[1]}"`);
        row.forEach((cell, colIdx) => {
            if (cell != null && cell !== '' && colIdx < 20) {
                console.log(`  Col ${colIdx}: ${cell}`);
            }
        });
    }
});
