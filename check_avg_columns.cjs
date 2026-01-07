const XLSX = require('xlsx');

const filePath = './datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- FIRST 5 ROWS (Looking for column structure) ---\n');
rows.slice(0, 5).forEach((row, idx) => {
    console.log(`Row ${idx}:`, row);
});

console.log('\n--- SAMPLE DATA ROWS (15-25) ---\n');
rows.slice(15, 25).forEach((row, idx) => {
    console.log(`Row ${idx + 15}:`, row);
});
