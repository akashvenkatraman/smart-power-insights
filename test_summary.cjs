const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Simulating Summary Extraction ===\n');

let summaryDateCols = [];
let rowsFound = {};

rows.forEach((row, rowIdx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();

    // Detect summary section
    if (label.includes('total sales') && !summaryDateCols.length) {
        console.log(`\n✓ Found "Total Sales" at row ${rowIdx}`);

        // Look backward for date row
        for (let i = rowIdx - 1; i >= Math.max(0, rowIdx - 5); i--) {
            const dateRow = rows[i];
            const dateRowStr = JSON.stringify(dateRow).toLowerCase();
            if (dateRowStr.includes('apr') && dateRowStr.includes('24')) {
                console.log(`  → Found date row at row ${i}`);
                summaryDateCols = [];
                dateRow.forEach((cell, colIdx) => {
                    const cellStr = String(cell || '').toLowerCase();
                    if (cellStr.includes('24') || cellStr.includes('25')) {
                        summaryDateCols.push(colIdx);
                    }
                });
                console.log(`  → Date columns:`, summaryDateCols.slice(0, 5), '...');
                console.log(`  → Total ${summaryDateCols.length} date columns found`);
                break;
            }
        }
    }

    if (summaryDateCols.length > 0) {
        if (label.includes('total sales') && label.includes('lakh')) {
            const values = summaryDateCols.map(idx => row[idx]).filter(v => v != null);
            rowsFound['Total Sales'] = values.slice(0, 5);
            console.log(`\n✓ Total Sales values:`, values.slice(0, 5), '...');
        }

        if (label.includes('total power cost') && label.includes('year')) {
            const values = summaryDateCols.map(idx => row[idx]).filter(v => v != null);
            rowsFound['Total Power Cost'] = values.slice(0, 5);
            console.log(`\n✓ Total Power Cost values:`, values.slice(0, 5), '...');
        }

        if (label.includes('mfi') && label.includes('power cost') && label.includes('lakh')) {
            const values = summaryDateCols.map(idx => row[idx]).filter(v => v != null);
            rowsFound['MFI Power Cost'] = values.slice(0, 5);
            console.log(`\n✓ MFI Power Cost values:`, values.slice(0, 5), '...');
        }

        if (label.includes('mfi') && label.includes('unit') && label.includes('lac')) {
            const values = summaryDateCols.map(idx => row[idx]).filter(v => v != null);
            rowsFound['MFI Units'] = values.slice(0, 5);
            console.log(`\n✓ MFI Units values:`, values.slice(0, 5), '...');
        }
    }
});

console.log('\n=== Expected vs Extracted ===');
console.log('Total Sales (Expected: 14.6):', rowsFound['Total Sales']?.[0]);
console.log('Total Power Cost (Expected: 164.3):', rowsFound['Total Power Cost']?.[0]);
console.log('MFI Power Cost (Expected: 65.3):', rowsFound['MFI Power Cost']?.[0]);
console.log('MFI Units (Expected: 6.8):', rowsFound['MFI Units']?.[0]);
