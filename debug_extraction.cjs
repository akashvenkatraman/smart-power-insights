const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== DEBUGGING SUMMARY EXTRACTION ===\n');

rows.forEach((row, idx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    // Check for our target labels
    if (label.includes('total sales') && label.includes('lakh')) {
        console.log(`✓ FOUND Total Sales at row ${idx}`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  Values:`, row.slice(2, 15));
        console.log('');
    }

    if (label.includes('total power cost') && label.includes('year')) {
        console.log(`✓ FOUND Total Power Cost at row ${idx}`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  Values:`, row.slice(2, 15));
        console.log('');
    }

    if (label.includes('mfi') && label.includes('power cost') && label.includes('lakh')) {
        console.log(`✓ FOUND MFI Power Cost at row ${idx}`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  Values:`, row.slice(2, 15));
        console.log('');
    }

    if (label.includes('mfi') && label.includes('unit') && label.includes('lac')) {
        console.log(`✓ FOUND MFI Units at row ${idx}`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  Values:`, row.slice(2, 15));
        console.log('');
    }
});

console.log('\n=== DATE COLUMNS ===\n');
rows.slice(0, 50).forEach((row, idx) => {
    const rowStr = JSON.stringify(row).toLowerCase();
    if (rowStr.includes('apr') && rowStr.includes('24')) {
        console.log(`Row ${idx}:`, row.slice(0, 15));
    }
});
