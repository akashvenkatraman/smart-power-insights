const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Testing NEW Simplified Logic ===\n');

const extractNumericValues = (row) => {
    const values = [];
    for (let i = 2; i < row.length; i++) {
        if (typeof row[i] === 'number' && !isNaN(row[i])) {
            values.push(row[i]);
        }
    }
    return values;
};

let found = {};

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    // NEW LOGIC: power + cost + lakh + NOT mfi
    if (label.includes('power') && label.includes('cost') && label.includes('lakh') && !label.includes('mfi')) {
        const values = extractNumericValues(row);
        found['Power Cost'] = {
            row: rowIdx,
            label: row[1],
            first: values[0],
            count: values.length
        };
        console.log(`✓✓✓ MATCHED: Row ${rowIdx}`);
        console.log(`  Label: "${row[1]}"`);
        console.log(`  First value: ${values[0]}`);
        console.log(`  Total values: ${values.length}`);
    }

    // Also check MFI for comparison
    if (label.includes('mfi') && label.includes('power cost') && label.includes('lakh')) {
        const values = extractNumericValues(row);
        found['MFI Power Cost'] = {
            row: rowIdx,
            label: row[1],
            first: values[0],
            count: values.length
        };
        console.log(`\n✓ MFI Power Cost: Row ${rowIdx}`);
        console.log(`  First value: ${values[0]}`);
    }
});

console.log('\n=== RESULTS ===');
if (found['Power Cost']) {
    console.log(`Power Cost: ${found['Power Cost'].first} (Expected: ~164.3)`);
} else {
    console.log('❌ Power Cost NOT FOUND!');
}
if (found['MFI Power Cost']) {
    console.log(`MFI Power Cost: ${found['MFI Power Cost'].first} (Expected: ~65.3)`);
}
