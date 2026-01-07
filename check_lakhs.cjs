const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Finding ALL rows with "power" AND "cost" ===\n');

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('power') && label.includes('cost')) {
        const hasMFI = label.includes('mfi');
        const hasLakh = label.includes('lakh');
        const hasLakhs = label.includes('lakhs');

        console.log(`\nRow ${rowIdx}: "${row[1]}"`);
        console.log(`  Has MFI: ${hasMFI}`);
        console.log(`  Has "lakh": ${hasLakh}`);
        console.log(`  Has "lakhs": ${hasLakhs}`);
        console.log(`  Would match (power+cost+lakh+!mfi): ${label.includes('power') && label.includes('cost') && label.includes('lakh') && !hasMFI ? '✓ YES' : '✗ NO'}`);
        console.log(`  Would match (power+cost+lakhs+!mfi): ${label.includes('power') && label.includes('cost') && label.includes('lakhs') && !hasMFI ? '✓ YES' : '✗ NO'}`);
    }
});
