const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== ALL "Total Sales" Rows ===\n');

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('sales') && label.includes('lakh')) {
        console.log(`\nRow ${rowIdx}: "${row[1]}"`);
        console.log('Numeric values in cols 2-20:');
        row.slice(2, 20).forEach((cell, offset) => {
            if (typeof cell === 'number') {
                console.log(`  Col ${offset + 2}: ${cell}`);
            }
        });

        // Show first value found in any column
        const firstNum = row.find(c => typeof c === 'number');
        console.log(`First number in entire row: ${firstNum}`);
    }
});
