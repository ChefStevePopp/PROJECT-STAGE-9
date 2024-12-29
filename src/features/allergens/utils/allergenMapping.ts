import { type AllergenType, type CustomAllergen } from '../types';
import { ALLERGEN_COLUMNS } from '../constants';

export function mapAllergensToColumns(
  allergens: AllergenType[],
  customAllergens?: {
    custom1?: CustomAllergen;
    custom2?: CustomAllergen;
    custom3?: CustomAllergen;
  }
): Record<string, any> {
  const allergenColumns: Record<string, any> = {};
  
  // Initialize all allergen columns to false
  Object.values(ALLERGEN_COLUMNS).forEach(column => {
    allergenColumns[column] = false;
  });

  // Set true for included allergens
  allergens.forEach(allergen => {
    const column = ALLERGEN_COLUMNS[allergen];
    if (column) {
      allergenColumns[column] = true;
    }
  });

  // Add custom allergens if provided
  if (customAllergens?.custom1) {
    allergenColumns.allergen_custom1_name = customAllergens.custom1.name;
    allergenColumns.allergen_custom1_active = customAllergens.custom1.active;
  }
  if (customAllergens?.custom2) {
    allergenColumns.allergen_custom2_name = customAllergens.custom2.name;
    allergenColumns.allergen_custom2_active = customAllergens.custom2.active;
  }
  if (customAllergens?.custom3) {
    allergenColumns.allergen_custom3_name = customAllergens.custom3.name;
    allergenColumns.allergen_custom3_active = customAllergens.custom3.active;
  }

  return allergenColumns;
}

export function mapColumnsToAllergens(columns: Record<string, any>): AllergenType[] {
  const allergens: AllergenType[] = [];
  
  // Map standard allergens
  Object.entries(ALLERGEN_COLUMNS).forEach(([allergen, column]) => {
    if (columns[column]) {
      allergens.push(allergen as AllergenType);
    }
  });

  return allergens;
}