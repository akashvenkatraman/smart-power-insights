const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Testing NEW Row Scanning Logic ===\n');

const extractNumericValues = (row) => {
    return row.slice(2, 20)
        .map(cell => typeof cell === 'number' ? cell : null)
        .filter(v => v !== null && !isNaN(v));
};

let found = {};

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('total sales') && label.includes('lakh')) {
        const values = extractNumericValues(row);
        found['Total Sales'] = { row: rowIdx, label: row[1], values: values.slice(0, 5) };
        console.log(`✓ Total Sales (Row ${rowIdx})`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  First 5 values:`, values.slice(0, 5));
        console.log(`  Total values found:`, values.length);
    }

    if ((label.includes('total power cost') && label.includes('year')) ||
        (label.includes('total power cost') && label.includes('sales'))) {
        const values = extractNumericValues(row);
        found['Power Cost'] = { row: rowIdx, label: row[1], values: values.slice(0, 5) };
        console.log(`\n✓ Power Cost (Row ${rowIdx})`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  First 5 values:`, values.slice(0, 5));
        console.log(`  Total values found:`, values.length);
    }

    if (label.includes('mfi') && label.includes('power cost') && label.includes('lakh')) {
        const values = extractNumericValues(row);
        found['MFI Power Cost'] = { row: rowIdx, label: row[1], values: values.slice(0, 5) };
        console.log(`\n✓ MFI Power Cost (Row ${rowIdx})`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  First 5 values:`, values.slice(0, 5));
    }
});

console.log('\n=== SUMMARY ===');
console.log('Total Sales found:', found['Total Sales'] ? 'YES' : 'NO');
console.log('Power Cost found:', found['Power Cost'] ? 'YES' : 'NO');
console.log('MFI Power Cost found:', found['MFI Power Cost'] ? 'YES' : 'NO');

if (found['Total Sales']) {
    console.log('\nTotal Sales first value:', found['Total Sales'].values[0], '(Expected: 14.6)');
}
if (found['Power Cost']) {
    console.log('Power Cost first value:', found['Power Cost'].values[0], '(Expected: 164.3)');
}
