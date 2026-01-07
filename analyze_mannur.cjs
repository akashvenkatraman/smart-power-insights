const XLSX = require('xlsx');
const fs = require('fs');

// Read the Mannur 25-26 file
const filePath = './datas/Power cost & Units update Orag Format 25-26 Mannur plant.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', rows.length);
console.log('\n--- Looking for Summary Rows ---\n');

rows.forEach((row, idx) => {
    const label = (row[1] || '').toString().toLowerCase();
    if (label.includes('total sales') ||
        label.includes('power cost') ||
        label.includes('mfi') ||
        label.includes('% of sales') ||
        label.includes('dg rent') ||
        label.includes('crnhb') ||
        label.includes('e&d') ||
        label.includes('finance')) {
        console.log(`Row ${idx}:`, row.slice(0, 10));
    }
});
