const xlsx = require('xlsx');
const fs = require('fs');

const filePath = 'd:/delphi-TVS/visualize excel/old power/smart-power-insights/datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const workbook = xlsx.readFileSync(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

fs.writeFileSync('excel_dump.json', JSON.stringify(rows.slice(0, 100), null, 2));
console.log('Dumped rows 0-100 of ' + sheetName + ' to excel_dump.json');
