import type { ExcelColumn } from '@/types';

export const masterIngredientColumns: ExcelColumn[] = [
  { 
    key: 'itemCode', 
    name: 'Item Code', 
    type: 'text', 
    width: 120 
  },
  { 
    key: 'product', 
    name: 'Product Name', 
    type: 'text', 
    width: 200 
  },
  { 
    key: 'majorGroupName', 
    name: 'Major Group', 
    type: 'text', 
    width: 120 
  },
  { 
    key: 'categoryName', 
    name: 'Category', 
    type: 'text', 
    width: 120 
  },
  { 
    key: 'subCategoryName', 
    name: 'Sub-Category', 
    type: 'text', 
    width: 120 
  },
  { 
    key: 'vendor', 
    name: 'Vendor', 
    type: 'text', 
    width: 120 
  },
  { 
    key: 'caseSize', 
    name: 'Case Size', 
    type: 'text', 
    width: 100 
  },
  { 
    key: 'unitsPerCase', 
    name: 'Units/Case', 
    type: 'text', 
    width: 100 
  },
  { 
    key: 'currentPrice', 
    name: 'Case Price', 
    type: 'currency', 
    width: 100 
  },
  { 
    key: 'unitOfMeasure', 
    name: 'Inventory Unit', 
    type: 'text', 
    width: 100 
  },
  { 
    key: 'recipeUnitPerPurchaseUnit', 
    name: 'Recipe Units/Case', 
    type: 'number', 
    width: 120 
  },
  { 
    key: 'costPerRecipeUnit', 
    name: 'Cost/Recipe Unit', 
    type: 'currency', 
    width: 120 
  },
  { 
    key: 'yieldPercent', 
    name: 'Yield %', 
    type: 'percent', 
    width: 80 
  },
  { 
    key: 'imageUrl', 
    name: 'Image', 
    type: 'imageUrl', 
    width: 80 
  },
  // Allergen columns
  { key: 'allergenPeanut', name: 'Peanuts', type: 'boolean', width: 80 },
  { key: 'allergenCrustacean', name: 'Crustaceans', type: 'boolean', width: 80 },
  { key: 'allergenTreenut', name: 'Tree Nuts', type: 'boolean', width: 80 },
  { key: 'allergenShellfish', name: 'Shellfish', type: 'boolean', width: 80 },
  { key: 'allergenSesame', name: 'Sesame', type: 'boolean', width: 80 },
  { key: 'allergenSoy', name: 'Soy', type: 'boolean', width: 80 },
  { key: 'allergenFish', name: 'Fish', type: 'boolean', width: 80 },
  { key: 'allergenWheat', name: 'Wheat', type: 'boolean', width: 80 },
  { key: 'allergenMilk', name: 'Milk', type: 'boolean', width: 80 },
  { key: 'allergenSulphite', name: 'Sulphites', type: 'boolean', width: 80 },
  { key: 'allergenEgg', name: 'Eggs', type: 'boolean', width: 80 },
  { key: 'allergenGluten', name: 'Gluten', type: 'boolean', width: 80 },
  { key: 'allergenMustard', name: 'Mustard', type: 'boolean', width: 80 },
  { key: 'allergenCelery', name: 'Celery', type: 'boolean', width: 80 },
  { key: 'allergenGarlic', name: 'Garlic', type: 'boolean', width: 80 },
  { key: 'allergenOnion', name: 'Onion', type: 'boolean', width: 80 },
  { key: 'allergenNitrite', name: 'Nitrites', type: 'boolean', width: 80 },
  { key: 'allergenMushroom', name: 'Mushrooms', type: 'boolean', width: 80 },
  { key: 'allergenHotPepper', name: 'Hot Peppers', type: 'boolean', width: 80 },
  { key: 'allergenCitrus', name: 'Citrus', type: 'boolean', width: 80 }
];