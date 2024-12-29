export interface InventoryItem {
  id: string;
  masterIngredientId: string;
  quantity: number;
  unitCost: number;
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
    unitOfMeasure: string;
    imageUrl?: string;
  };
}

export interface InventoryStore {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  importItems: (data: any[]) => Promise<void>;
  clearItems: () => Promise<void>;
}