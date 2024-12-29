import type { ExcelColumn } from '@/types';

export const inventoryColumns: ExcelColumn[] = [
  { key: 'ingredient.uniqueId', name: 'Item ID', type: 'text', width: 100 },
  { key: 'ingredient.product', name: 'Product Name', type: 'text', width: 200 },
  { key: 'ingredient.category', name: 'Category', type: 'text', width: 120 },
  { key: 'ingredient.unitOfMeasure', name: 'Unit', type: 'text', width: 80 },
  { key: 'quantity', name: 'Quantity', type: 'number', width: 100 },
  { key: 'unitCost', name: 'Unit Cost', type: 'currency', width: 120 },
  { key: 'totalValue', name: 'Total Value', type: 'currency', width: 120 },
  { key: 'location', name: 'Location', type: 'text', width: 120 },
  { key: 'countDate', name: 'Count Date', type: 'text', width: 120 },
  { key: 'status', name: 'Status', type: 'text', width: 100 },
  { key: 'ingredient.imageUrl', name: 'Image', type: 'imageUrl', width: 80 }
];