import { utils, writeFile } from 'xlsx';

export function generateMasterIngredientsTemplate() {
  // Create headers
  const headers = [
    'Item Code',
    'Product Name',
    'Major Group',
    'Category',
    'Sub-Category',
    'Vendor',
    'Case Size',
    'Units/Case',
    'Case Price',
    'Unit of Measure',
    'Recipe Units/Case',
    'Recipe Unit Type',
    'Yield %',
    'Storage Area'
  ];

  // Create example data
  const exampleData = [
    ['BEEF-001', 'Beef Brisket', 'Food', 'Proteins', 'Beef', 'US Foods', '2x5kg', '2', '125.99', 'kg', '10', 'portion', '85', 'Walk-in Cooler'],
    ['CHIX-001', 'Chicken Breast', 'Food', 'Proteins', 'Poultry', 'Sysco', '4x2kg', '4', '89.99', 'kg', '8', 'portion', '90', 'Walk-in Cooler'],
    ['MILK-001', 'Whole Milk', 'Food', 'Dairy', 'Milk', 'GFS', '4L', '1', '6.99', 'L', '16', 'cup', '100', 'Walk-in Cooler']
  ];

  // Create workbook
  const wb = utils.book_new();

  // Create main data sheet
  const ws = utils.aoa_to_sheet([headers, ...exampleData]);

  // Add column widths
  ws['!cols'] = [
    { wch: 12 }, // Item Code
    { wch: 25 }, // Product Name
    { wch: 15 }, // Major Group
    { wch: 15 }, // Category
    { wch: 15 }, // Sub-Category
    { wch: 15 }, // Vendor
    { wch: 12 }, // Case Size
    { wch: 12 }, // Units/Case
    { wch: 12 }, // Case Price
    { wch: 15 }, // Unit of Measure
    { wch: 15 }, // Recipe Units/Case
    { wch: 15 }, // Recipe Unit Type
    { wch: 10 }, // Yield %
    { wch: 15 }, // Storage Area
  ];

  // Add instructions sheet
  const instructionsWs = utils.aoa_to_sheet([
    ['Master Ingredients Import Template Instructions'],
    [''],
    ['Required Fields:'],
    ['- Item Code: Unique identifier for the ingredient'],
    ['- Product Name: Common name of the ingredient'],
    ['- Major Group: Must match an existing food category group'],
    ['- Category: Must match an existing category within the group'],
    ['- Vendor: Supplier name'],
    ['- Case Size: Size of purchase unit'],
    ['- Units/Case: Number of units per case'],
    ['- Case Price: Current price per case'],
    ['- Unit of Measure: Base unit for inventory'],
    [''],
    ['Optional Fields:'],
    ['- Sub-Category: Must match an existing sub-category within the category'],
    ['- Recipe Units/Case: Number of recipe units per case'],
    ['- Recipe Unit Type: Unit used in recipes'],
    ['- Yield %: Usable percentage after waste'],
    ['- Storage Area: Default storage location'],
    [''],
    ['Tips:'],
    ['- Fill out one complete row as a reference'],
    ['- Use consistent units and formatting'],
    ['- Double-check all measurements'],
    ['- Remove any empty rows before importing']
  ]);

  instructionsWs['!cols'] = [{ wch: 80 }];

  // Add sheets to workbook
  utils.book_append_sheet(wb, ws, 'Master Ingredients');
  utils.book_append_sheet(wb, instructionsWs, 'Instructions');

  // Save file
  writeFile(wb, 'master-ingredients-template.xlsx');
}