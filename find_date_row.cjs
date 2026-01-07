const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n=== Looking for Summary Date Row ===\n');

let totalSalesRow = -1;

// Find total sales row first
rows.forEach((row, idx) => {
    const label = (row[1] || '').toString().toLowerCase().trim();
    if (label.includes('total sales') && label.includes('lakh') && totalSalesRow === -1) {
        totalSalesRow = idx;
        console.log(`Found "Total sales in Lakhs" at row ${idx}`);
        console.log(`Full row:`, row);
    }
});

if (totalSalesRow >= 0) {
    console.log(`\n=== Examining 10 rows before Total Sales (rows ${totalSalesRow - 10} to ${totalSalesRow}) ===\n`);
    for (let i = Math.max(0, totalSalesRow - 10); i < totalSalesRow; i++) {
        const row = rows[i];
        console.log(`Row ${i}:`, row.slice(0, 15));
    }
}
