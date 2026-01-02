const { readFile } = require('fs/promises');
const XLSX = require('xlsx');

const filePath = 'd:/delphi-TVS/visualize excel/old power/smart-power-insights/datas/7  Power cost & Units update Orag Format Feb-25.xlsx';

async function searchKeywords() {
    try {
        const buf = await readFile(filePath);
        const workbook = XLSX.read(buf, { type: 'buffer' });

        console.log('Searching for "Rent", "Price", "Rate"...');

        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            data.forEach((row, rowIndex) => {
                const rowStr = JSON.stringify(row).toLowerCase();
                if (rowStr.includes('rent') || rowStr.includes('fixed') || rowStr.includes('demand')) {
                    console.log(`Found match in ${sheetName} Row ${rowIndex + 1}:`, row);
                }
            });
        });

    } catch (error) {
        console.error(error);
    }
}

searchKeywords();
