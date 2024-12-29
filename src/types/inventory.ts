export interface InventoryCount {
  id: string;
  masterIngredientId: string;
  countDate: string;
  quantity: number; // In inventory units (e.g. cases, bags, etc)
  unitCost: number; // Cost per inventory unit
  totalValue: number;
  location?: string;
  countedBy?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'verified';
  lastUpdated: string;
  ingredient?: {
    uniqueId: string;
    product: string;
    category: string;
    caseSize: string;
    unitsPerCase: string;
    unitOfMeasure: string;
    recipeUnitPerPurchaseUnit: number;
    imageUrl?: string;
  };
}

export interface InventoryStore {
  counts: InventoryCount[];
  isLoading: boolean;
  error: string | null;
  fetchCounts: () => Promise<void>;
  addCount: (count: Omit<InventoryCount, 'id' | 'lastUpdated'>) => Promise<void>;
  updateCount: (id: string, updates: Partial<InventoryCount>) => Promise<void>;
  deleteCount: (id: string) => Promise<void>;
  importCounts: (data: any[]) => Promise<void>;
  clearCounts: () => Promise<void>;
}