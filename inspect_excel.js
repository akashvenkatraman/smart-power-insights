import { readFile, writeFile } from 'fs/promises';
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const filePath = 'd:/delphi-TVS/visualize excel/old power/smart-power-insights/datas/7  Power cost & Units update Orag Format Feb-25.xlsx';
const outputPath = 'inspect_output.txt';

async function analyze() {
    try {
        const buf = await readFile(filePath);
        const workbook = XLSX.read(buf, { type: 'buffer' });

        let output = 'Workbook Sheet Names: ' + JSON.stringify(workbook.SheetNames) + '\n';

        workbook.SheetNames.forEach(sheetName => {
            output += `\n--- Sheet: ${sheetName} ---\n`;
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (data.length > 0) {
                output += 'Row 1 (Headers): ' + JSON.stringify(data[0]) + '\n';
                output += 'Row 2: ' + JSON.stringify(data[1]) + '\n';
                output += 'Row 3: ' + JSON.stringify(data[2]) + '\n';
                // Check for specific columns if possible, but for now just raw dump
            } else {
                output += 'Empty Sheet\n';
            }
        });

        await writeFile(outputPath, output);
        console.log('Analysis written to ' + outputPath);

    } catch (error) {
        console.error('Error reading file:', error);
    }
}

analyze();
