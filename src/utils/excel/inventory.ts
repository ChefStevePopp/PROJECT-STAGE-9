import { utils, writeFile } from 'xlsx';

export function generateInventoryTemplate() {
  // Create headers
  const headers = [
    'Item ID',
    'Quantity', 
    'Unit Cost',
    'Location',
    'Notes'
  ];

  // Create example data
  const exampleData = [
    ['BEEF-001', '10', '15.99', 'Walk-in Cooler', 'Weekly count'],
    ['CHIX-001', '20', '8.99', 'Walk-in Freezer', 'Monthly stock'],
    ['PROD-001', '50', '2.99', 'Dry Storage', 'Bi-weekly count']
  ];

  // Create workbook
  const wb = utils.book_new();

  // Create main data sheet
  const ws = utils.aoa_to_sheet([headers, ...exampleData]);

  // Add column widths
  ws['!cols'] = [
    { wch: 15 }, // Item ID
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit Cost
    { wch: 20 }, // Location
    { wch: 30 }, // Notes
  ];

  // Add instructions sheet
  const instructionsWs = utils.aoa_to_sheet([
    ['Food Inventory Import Template Instructions'],
    [''],
    ['Required Fields:'],
    ['- Item ID: Must match an existing master ingredient item code'],
    ['- Quantity: Current count in the ingredient\'s unit of measure'],
    ['- Unit Cost: Current cost per unit'],
    [''],
    ['Optional Fields:'],
    ['- Location: Storage location of the item'],
    ['- Notes: Additional notes about the count'],
    [''],
    ['Tips:'],
    ['- Fill out one complete row as a reference'],
    ['- Verify all item IDs exist in master ingredients'],
    ['- Double-check quantities and costs'],
    ['- Remove any empty rows before importing']
  ]);

  instructionsWs['!cols'] = [{ wch: 80 }];

  // Add sheets to workbook
  utils.book_append_sheet(wb, ws, 'Inventory Data');
  utils.book_append_sheet(wb, instructionsWs, 'Instructions');

  // Save file
  writeFile(wb, 'food-inventory-template.xlsx');
}