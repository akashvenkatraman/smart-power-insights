const XLSX = require('xlsx');
const fs = require('fs');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Total rows: ${rows.length}`);
console.log('\n--- LAST 30 ROWS (Summary Section) ---\n');

const lastRows = rows.slice(-30);
lastRows.forEach((row, idx) => {
    const actualIdx = rows.length - 30 + idx;
    console.log(`Row ${actualIdx}:`, JSON.stringify(row));
});

fs.writeFileSync('summary_dump.json', JSON.stringify(lastRows, null, 2));
console.log('\nSaved to summary_dump.json');
