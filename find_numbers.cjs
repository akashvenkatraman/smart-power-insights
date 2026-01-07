const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Finding Where Numbers Actually Are ===\n');

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('total sales') && label.includes('lakh')) {
        console.log(`\n✓✓✓ FOUND "Total Sales in Lakhs" at Row ${rowIdx} ✓✓✓`);
        console.log(`Full row length: ${row.length}`);
        console.log('\nColumn-by-column analysis:');
        row.forEach((cell, colIdx) => {
            if (cell != null && cell !== '') {
                const type = typeof cell;
                console.log(`  Col ${colIdx}: ${cell} (type: ${type})`);
            }
        });
    }
});
