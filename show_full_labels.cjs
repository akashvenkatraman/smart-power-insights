const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== ALL rows with "power" AND "cost" - FULL LABELS ===\n');

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('power') && label.includes('cost')) {
        console.log(`\nRow ${rowIdx}:`);
        console.log(`  Original: "${row[1]}"`);
        console.log(`  Lowercase: "${label}"`);
        console.log(`  Character array:`, label.split(''));

        // Extract values
        const values = [];
        for (let i = 2; i < row.length; i++) {
            if (typeof row[i] === 'number' && !isNaN(row[i])) {
                values.push(row[i]);
            }
        }
        console.log(`  First value: ${values[0]}`);
    }
});
