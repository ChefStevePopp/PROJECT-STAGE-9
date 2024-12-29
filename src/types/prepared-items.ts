export interface PreparedItem {
  id?: string;
  itemId: string;
  category: string;
  product: string;
  station: string;
  subCategory: string;
  storageArea: string;
  container: string;
  containerType: string;
  shelfLife: string;
  recipeUnit: string;
  costPerRecipeUnit: number;
  yieldPercent: number;
  finalCost: number;
  allergens: Record<string, boolean>;
  lastUpdated: string;
}

export interface PreparedItemsStore {
  items: PreparedItem[];
  isLoading: boolean;
  isImporting: boolean;
  fetchItems: () => Promise<void>;
  importItems: (data: any[]) => Promise<void>;
  clearItems: () => Promise<void>;
  saveItems: () => Promise<void>;
}