import { utils, writeFile } from 'xlsx';

export function generateFoodRelationshipsTemplate() {
  // Create headers
  const headers = [
    'Major Group',
    'Category',
    'Sub Category',
    'Description'
  ];

  // Create example data showing hierarchy
  const exampleData = [
    // Food Group
    ['Food', 'Proteins', 'Beef', 'All beef products'],
    ['Food', 'Proteins', 'Pork', 'All pork products'],
    ['Food', 'Proteins', 'Poultry', 'Chicken and turkey products'],
    ['Food', 'Produce', 'Fresh Vegetables', 'Fresh cut vegetables'],
    ['Food', 'Produce', 'Fresh Fruits', 'Fresh whole fruits'],
    ['Food', 'Dairy', 'Milk', 'Fresh milk products'],
    ['Food', 'Dairy', 'Cheese', 'All cheese varieties'],
    
    // Beverage Group
    ['Beverage', 'Hot Beverages', 'Coffee', 'Coffee drinks and beans'],
    ['Beverage', 'Hot Beverages', 'Tea', 'Tea varieties'],
    ['Beverage', 'Cold Beverages', 'Soft Drinks', 'Carbonated beverages'],
    ['Beverage', 'Cold Beverages', 'Juices', 'Fresh and bottled juices'],
    
    // Alcohol Group
    ['Alcohol', 'Beer', 'Draft Beer', 'Kegged beer products'],
    ['Alcohol', 'Beer', 'Craft Beer', 'Specialty craft beers'],
    ['Alcohol', 'Wine', 'Red Wine', 'Red wine varieties'],
    ['Alcohol', 'Wine', 'White Wine', 'White wine varieties'],
    ['Alcohol', 'Spirits', 'Whiskey', 'Whiskey and bourbon'],
    ['Alcohol', 'Spirits', 'Vodka', 'Vodka products'],
    
    // Supplies Group
    ['Supplies', 'Packaging', 'To-Go Containers', 'Takeout containers'],
    ['Supplies', 'Packaging', 'Bags', 'Paper and plastic bags'],
    ['Supplies', 'Cleaning', 'Chemicals', 'Cleaning chemicals'],
    ['Supplies', 'Cleaning', 'Tools', 'Cleaning tools and equipment']
  ];

  // Create workbook
  const wb = utils.book_new();

  // Create main data sheet
  const ws = utils.aoa_to_sheet([headers, ...exampleData]);

  // Add column widths
  ws['!cols'] = [
    { wch: 20 }, // Major Group
    { wch: 25 }, // Category
    { wch: 25 }, // Sub Category
    { wch: 40 }, // Description
  ];

  // Add instructions sheet
  const instructionsWs = utils.aoa_to_sheet([
    ['Food Relationships Import Template Instructions'],
    [''],
    ['Column Descriptions:'],
    ['1. Major Group:'],
    ['   - Top-level classification (e.g., Food, Beverage, Alcohol, Supplies)'],
    ['   - Must be unique and consistent'],
    ['   - Each major group will be assigned a unique color and icon'],
    [''],
    ['2. Category:'],
    ['   - Second-level classification within a Major Group'],
    ['   - Must be unique within its Major Group'],
    ['   - Examples: Proteins, Produce, Hot Beverages, Beer'],
    [''],
    ['3. Sub Category:'],
    ['   - Third-level classification within a Category'],
    ['   - Must be unique within its Category'],
    ['   - Examples: Beef, Fresh Vegetables, Coffee, Draft Beer'],
    [''],
    ['4. Description:'],
    ['   - Detailed description of the sub-category'],
    ['   - Used for clarity and documentation'],
    ['   - Should be clear and specific'],
    [''],
    ['Import Process:'],
    ['1. Major Groups are created first with assigned colors and icons'],
    ['2. Categories are created and linked to their Major Groups'],
    ['3. Sub Categories are created and linked to their Categories'],
    [''],
    ['Tips:'],
    ['- Use consistent naming across all levels'],
    ['- Ensure proper hierarchy is maintained'],
    ['- Check for typos and duplicates'],
    ['- Remove any empty rows before importing'],
    [''],
    ['Color Assignments:'],
    ['- Food: primary (blue)'],
    ['- Beverage: amber'],
    ['- Alcohol: rose'],
    ['- Supplies: purple'],
    [''],
    ['Icon Assignments:'],
    ['- Food: Package'],
    ['- Beverage: Coffee'],
    ['- Alcohol: Wine'],
    ['- Supplies: Box']
  ]);

  instructionsWs['!cols'] = [{ wch: 80 }];

  // Add sheets to workbook
  utils.book_append_sheet(wb, ws, 'Food Relationships');
  utils.book_append_sheet(wb, instructionsWs, 'Instructions');

  // Save file
  writeFile(wb, 'food-relationships-template.xlsx');
}