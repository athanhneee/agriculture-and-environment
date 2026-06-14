import ExcelJS from 'exceljs';
import path from 'path';

async function processExcel() {
  try {
    const sourcePath = '/home/na/Downloads/farm_zones_template.xlsx';
    const destPath = '/home/na/Downloads/farm_zones_template (1).xlsx';

    console.log(`Reading source file: ${sourcePath}`);
    const sourceWorkbook = new ExcelJS.Workbook();
    await sourceWorkbook.xlsx.readFile(sourcePath);
    const sourceSheet = sourceWorkbook.worksheets[0];

    // Find the column containing "cây trồng"
    let plantColIndex = -1;
    const headerRow = sourceSheet.getRow(1);
    
    headerRow.eachCell((cell, colNumber) => {
      const value = cell.value?.toString().toLowerCase().trim();
      if (value && (value.includes('cây') || value.includes('plant'))) {
        plantColIndex = colNumber;
      }
    });

    if (plantColIndex === -1) {
      console.log('Could not find column header with "cây trồng" or "plant". Falling back to column 2.');
      plantColIndex = 2; // Fallback
    }

    const plantsData: any[] = [];
    sourceSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const plantName = row.getCell(plantColIndex).value;
        if (plantName) {
          plantsData.push(plantName.toString());
        }
      }
    });

    console.log(`Extracted ${plantsData.length} plants from source.`);

    console.log(`Reading destination file: ${destPath}`);
    const destWorkbook = new ExcelJS.Workbook();
    
    try {
      await destWorkbook.xlsx.readFile(destPath);
    } catch (err) {
      console.log('Destination file not found, creating a new one.');
      destWorkbook.addWorksheet('Sheet1');
    }

    const destSheet = destWorkbook.worksheets[0] || destWorkbook.addWorksheet('Sheet1');

    // Find column in destination file to write to
    let destPlantColIndex = -1;
    const destHeaderRow = destSheet.getRow(1);
    
    destHeaderRow.eachCell((cell, colNumber) => {
      const value = cell.value?.toString().toLowerCase().trim();
      if (value && (value.includes('cây') || value.includes('plant'))) {
        destPlantColIndex = colNumber;
      }
    });

    if (destPlantColIndex === -1) {
      destPlantColIndex = 2; // Fallback
      destSheet.getCell(1, destPlantColIndex).value = 'Cây trồng';
    }

    // Write plants to destination
    plantsData.forEach((plant, index) => {
      destSheet.getCell(index + 2, destPlantColIndex).value = plant;
    });

    await destWorkbook.xlsx.writeFile(destPath);
    console.log(`Successfully written to ${destPath}`);

  } catch (error) {
    console.error('Error processing Excel files:', error);
  }
}

processExcel();
