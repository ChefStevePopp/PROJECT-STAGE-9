export * from './excel';
export * from './inventory';

export interface MasterIngredient {
  id?: string;
  uniqueId: string;
  category: string;
  product: string;
  vendor: string;
  subCategory: string;
  itemCode: string;
  caseSize: string;
  unitsPerCase: string;
  currentPrice: number;
  unitOfMeasure: string;
  recipeUnitPerPurchaseUnit: number;
  yieldPercent: number;
  costPerRecipeUnit: number;
  imageUrl?: string;
  storageArea?: string;
  allergens?: string[];
  allergenNotes?: string;
  lastUpdated: string;
}

export interface MasterIngredientsStore {
  ingredients: MasterIngredient[];
  isLoading: boolean;
  isImporting: boolean;
  fetchIngredients: () => Promise<void>;
  addIngredient: (ingredient: Omit<MasterIngredient, 'id' | 'lastUpdated'>) => Promise<void>;
  updateIngredient: (id: string, updates: Partial<MasterIngredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  importIngredients: (data: any[]) => Promise<void>;
  clearIngredients: () => Promise<void>;
  saveIngredients: () => Promise<void>;
}