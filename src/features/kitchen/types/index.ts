export interface PrepItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  assignedTo?: string;
  dueTime?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

export interface KitchenStats {
  prepStatus: number;
  lowStockItems: number;
  staffOnDuty: number;
}