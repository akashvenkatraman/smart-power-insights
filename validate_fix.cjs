const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Testing FIXED extractNumericValues Logic ===\n');

// Simulate the NEW function
const extractNumericValues = (row) => {
    const values = [];
    // Start from column 2 (skip label column) and scan entire row
    for (let i = 2; i < row.length; i++) {
        if (typeof row[i] === 'number' && !isNaN(row[i])) {
            values.push(row[i]);
        }
    }
    return values;
};

let results = {};

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    if (label.includes('total sales') && label.includes('lakh')) {
        const values = extractNumericValues(row);
        results['Total Sales'] = { first: values[0], count: values.length };
        console.log(`✓ Total Sales (Row ${rowIdx})`);
        console.log(`  First value: ${values[0]}`);
        console.log(`  Total values extracted: ${values.length}`);
    }

    if ((label.includes('total power cost') && label.includes('year')) ||
        (label.includes('total power cost') && label.includes('sales'))) {
        const values = extractNumericValues(row);
        results['Power Cost'] = { first: values[0], count: values.length };
        console.log(`\n✓ Power Cost/Sales (Row ${rowIdx})`);
        console.log(`  First value: ${values[0]}`);
        console.log(`  Total values extracted: ${values.length}`);
    }

    if (label.includes('mfi') && label.includes('power cost') && label.includes('lakh')) {
        const values = extractNumericValues(row);
        results['MFI Power Cost'] = { first: values[0], count: values.length };
        console.log(`\n✓ MFI Power Cost (Row ${rowIdx})`);
        console.log(`  First value: ${values[0]}`);
        console.log(`  Total values extracted: ${values.length}`);
    }
});

console.log('\n=== VALIDATION ===');
console.log('Total Sales:', results['Total Sales']?.first, '(Expected: ~14.6)');
console.log('Power Cost:', results['Power Cost']?.first, '(Expected: ~164.3)');
console.log('MFI Power Cost:', results['MFI Power Cost']?.first, '(Expected: ~65.3)');

if (!results['Power Cost'] || results['Power Cost'].first === undefined) {
    console.log('\n❌ ERROR: Power Cost not found or has no values!');
    console.log('This means either:');
    console.log('1. Label matching failed');
    console.log('2. Row has no numeric values');
    console.log('3. values array is empty');
}
