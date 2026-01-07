const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('total sales') && label.includes('lakh')) {
        console.log(`\n✓✓✓ Total Sales Row ${rowIdx} ✓✓✓`);
        console.log('Checking ALL columns (0-40):');
        for (let i = 0; i < Math.min(40, row.length); i++) {
            const cell = row[i];
            if (typeof cell === 'number') {
                console.log(`  Col ${i}: ${cell} ← NUMBER!!!!`);
            }
        }
    }
});
