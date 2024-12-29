export interface PreparedItem {
  id: string;
  itemId: string;
  category: string;
  product: string;
  station: string;
  subCategory: string;
  storageArea: string;
  container: string;
  containerType: string;
  shelfLife: string;
  recipeUnitRatio: string;
  costPerRatioUnit: number;
  yieldPercent: number;
  finalCost: number;
  lastUpdated: string;
  allergens: string[];
  excelData: Record<string, string>; // Store all original Excel column values
}

export interface PreparedItemsStore {
  items: PreparedItem[];
  isLoading: boolean;
  isImporting: boolean;
  setItems: (items: PreparedItem[]) => void;
  addItem: (item: PreparedItem) => void;
  updateItem: (id: string, updates: Partial<PreparedItem>) => void;
  deleteItem: (id: string) => void;
  importItems: (data: any[]) => Promise<void>;
  clearItems: () => void;
  saveItems: () => Promise<void>;
}