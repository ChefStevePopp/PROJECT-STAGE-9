import { type Recipe, type RecipeIngredient, type AllergenType } from '../types';

interface RawRecipeRow {
  CATEGORY?: string;
  'SUB - CAT'?: string;
  ITEM?: string;
  'RECIPE ITEM'?: string;
  MEASURE?: string;
  PROCEDURE?: string;
  'RECIPE UNITS'?: string;
  'RECIPE UNIT $'?: string;
  'SHELF LIFE'?: string;
  'STORAGE AREA'?: string;
  'STORAGE CONTAINER'?: string;
  'CONTAINER TYPE'?: string;
  'PRIORITY ALLERGENS'?: string;
  [key: string]: string | undefined;
}

export function parseRecipeCSV(csvData: RawRecipeRow[]): Recipe {
  try {
    // Find the recipe header - it's usually in the first row with an ITEM ID
    const recipeRow = csvData.find(row => row['ITEM']?.startsWith('ITEM-'));
    if (!recipeRow) {
      throw new Error('Could not find recipe identifier');
    }

    // Get recipe name from the RECIPE ITEM column
    const recipeName = recipeRow['RECIPE ITEM']?.trim();
    if (!recipeName) {
      throw new Error('Recipe name not found');
    }

    // Find storage info - usually after ingredients
    const storageRow = csvData.find(row => 
      row['STORAGE AREA'] && 
      row['STORAGE CONTAINER'] && 
      row['CONTAINER TYPE']
    );

    // Get shelf life info
    const shelfLifeRow = csvData.find(row => row['SHELF LIFE']?.trim());

    // Parse ingredients
    const ingredients: RecipeIngredient[] = csvData
      .filter(row => {
        // Valid ingredient rows have both ITEM and MEASURE
        const hasItem = row['ITEM']?.trim();
        const hasMeasure = row['MEASURE']?.trim();
        // Exclude header rows and label items
        return hasItem && hasMeasure && 
               !row['ITEM'].includes('LABEL') &&
               !row['ITEM'].startsWith('ITEM-');
      })
      .map((row, index) => {
        const measureParts = row['MEASURE']?.trim().split('|')[0].trim().split(' ') || [];
        const quantity = measureParts[0]?.replace(/[^0-9.]/g, '') || '0';
        const unit = measureParts[1]?.toLowerCase() || 'unit';

        return {
          id: `${Date.now()}-${index}`,
          type: 'raw',
          name: row['ITEM']?.trim() || '',
          quantity,
          unit,
          notes: `${row['CATEGORY'] || ''} ${row['SUB - CAT'] || ''}`.trim(),
          cost: 0
        };
      });

    // Parse allergens
    const allergens = new Set<AllergenType>();
    
    // Look for allergen rows - they're usually marked with "PRIORITY ALLERGENS"
    csvData.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        if (!value) return;
        const lowerValue = value.toLowerCase();

        // Map common allergen terms to our types
        if (lowerValue.includes('wheat')) allergens.add('wheat');
        if (lowerValue.includes('fish')) allergens.add('fish');
        if (lowerValue.includes('egg')) allergens.add('eggs');
        if (lowerValue.includes('milk') || lowerValue.includes('dairy')) allergens.add('milk');
        if (lowerValue.includes('peanut')) allergens.add('peanuts');
        if (lowerValue.includes('tree nut')) allergens.add('treenuts');
        if (lowerValue.includes('soy')) allergens.add('soy');
        if (lowerValue.includes('shell')) allergens.add('shellfish');
        if (lowerValue.includes('sesame')) allergens.add('sesame');
        if (lowerValue.includes('sulphite')) allergens.add('sulphites');
        if (lowerValue.includes('mustard')) allergens.add('mustard');
        if (lowerValue.includes('celery')) allergens.add('celery');
        if (lowerValue.includes('garlic')) allergens.add('garlic');
        if (lowerValue.includes('onion')) allergens.add('onion');
        if (lowerValue.includes('nitrite')) allergens.add('nitrites');
        if (lowerValue.includes('mushroom')) allergens.add('mushroom');
        if (lowerValue.includes('pepper')) allergens.add('hot_peppers');
        if (lowerValue.includes('citrus')) allergens.add('citrus');
      });
    });

    // Parse instructions from PROCEDURE column
    const instructions = csvData
      .filter(row => {
        const procedure = row['PROCEDURE']?.trim();
        return procedure && 
               !procedure.toLowerCase().includes('equipment') &&
               !procedure.toLowerCase().includes('required');
      })
      .map(row => row['PROCEDURE']?.trim())
      .filter((proc): proc is string => !!proc);

    // Get recipe unit info
    const recipeUnitRow = csvData.find(row => row['RECIPE UNIT $']?.trim());
    const costPerRatioUnit = parseFloat(
      recipeUnitRow?.['RECIPE UNIT $']?.replace(/[$,]/g, '').trim() || '0'
    );

    // Build the recipe object
    return {
      id: `recipe-${Date.now()}`,
      type: 'prepared',
      name: recipeName,
      category: recipeRow['CATEGORY']?.trim() || '',
      subCategory: recipeRow['SUB - CAT']?.trim() || '',
      station: '',
      storageArea: storageRow?.['STORAGE AREA']?.trim() || '',
      container: storageRow?.['STORAGE CONTAINER']?.trim() || '',
      containerType: storageRow?.['CONTAINER TYPE']?.trim() || '',
      shelfLife: shelfLifeRow?.['SHELF LIFE']?.trim() || '',
      description: `${recipeRow['SUB - CAT'] || ''} - ${storageRow?.['STORAGE AREA'] || ''}`.trim(),
      prepTime: 0,
      cookTime: 0,
      recipeUnitRatio: recipeUnitRow?.['RECIPE UNITS']?.trim() || '',
      unitType: recipeUnitRow?.['RECIPE UNITS']?.split(' ')[1] || 'unit',
      costPerRatioUnit,
      ingredients,
      instructions,
      notes: `Storage: ${storageRow?.['STORAGE CONTAINER'] || ''} (${storageRow?.['CONTAINER TYPE'] || ''})
Shelf Life: ${shelfLifeRow?.['SHELF LIFE'] || ''}`,
      costPerServing: costPerRatioUnit,
      lastUpdated: new Date().toISOString(),
      allergens: Array.from(allergens)
    };
  } catch (error) {
    console.error('Error processing recipe:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process recipe data');
  }
}