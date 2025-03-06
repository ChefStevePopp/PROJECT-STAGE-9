export interface InventoryCount {
  id: string;
  masterIngredientId: string;
  quantity: number; // In inventory units (e.g. cases, bags, etc)
  unitCost: number; // Cost per inventory unit
  totalValue: number;
  location?: string;
  countedBy?: string;
  notes?: string;
  status: "pending" | "completed" | "verified";
  lastUpdated: string;
  ingredient?: {
    itemCode: string;
    product: string;
    category: string;
    subCategory: string;
    unitOfMeasure: string;
    imageUrl?: string;
  };
}

export interface InventoryCountDB {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  master_ingredient_id: string;
  count_date: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  location: string;
  counted_by: string;
  notes: string;
  status: "pending" | "completed" | "verified";
}
