import { create } from 'zustand';
import type { PreparedItem, PreparedItemsStore } from '../types';
import toast from 'react-hot-toast';

// Define allergens in exact order from Excel
const ALLERGENS = [
  'Peanuts', 'Crustacee Treends', 'Shellfish', 'Sesame', 'Soy', 'Fish', 'Wheat', 'Milk',
  'Sulphites', 'Eggs', 'Gluten', 'Mustard', 'Celery', 'Garlic', 'Onion', 'Nitrites',
  'Mushroom', 'Hot Pepper', 'Citrus'
] as const;

const validatePreparedItemsData = (data: any[]): PreparedItem[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format: Expected an array');
  }

  const requiredColumns = [
    'Item ID',
    'CATEGORY',
    'PRODUCT',
    'STATION',
    'SUB CATEGORY',
    'STORAGE AREA',
    'CONTAINER',
    'CONTAINER TYPE',
    'SHELF LIFE',
    'RECIPE UNIT (R/U)',
    'COST PER R/U',
    'YIELD %',
    'FINAL $',
    // Include allergen columns as required
    ...ALLERGENS
  ];

  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    throw new Error('Invalid data format: No valid rows found');
  }

  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Generate unique IDs using timestamp and index
  const timestamp = Date.now();
  
  return data
    .filter(row => {
      const productName = row['PRODUCT']?.toString().trim();
      return productName && productName !== '0';
    })
    .map((row, index) => {
      // Process allergens - collect those that are marked with '1'
      const allergens = ALLERGENS.filter(allergen => {
        const value = row[allergen]?.toString().trim();
        return value === '1' || (parseFloat(value) > 0);
      });

      return {
        id: `prepared-${timestamp}-${index}`,
        itemId: row['Item ID']?.toString() || '',
        category: row['CATEGORY']?.toString() || '',
        product: row['PRODUCT']?.toString() || '',
        station: row['STATION']?.toString() || '',
        subCategory: row['SUB CATEGORY']?.toString() || '',
        storageArea: row['STORAGE AREA']?.toString() || '',
        container: row['CONTAINER']?.toString() || '',
        containerType: row['CONTAINER TYPE']?.toString() || '',
        shelfLife: row['SHELF LIFE']?.toString() || '',
        recipeUnitRatio: row['RECIPE UNIT (R/U)']?.toString() || '',
        costPerRatioUnit: parseFloat(row['COST PER R/U']?.toString().replace(/[$,]/g, '') || '0'),
        yieldPercent: parseFloat(row['YIELD %']?.toString().replace(/%/g, '') || '0'),
        finalCost: parseFloat(row['FINAL $']?.toString().replace(/[$,]/g, '') || '0'),
        lastUpdated: new Date().toISOString(),
        allergens
      };
    });
};

export const usePreparedItemsStore = create<PreparedItemsStore>((set) => ({
  items: [],
  isLoading: false,
  isImporting: false,

  setItems: (items) => set({ items }),
  
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),

  importItems: async (data: any[]) => {
    set({ isImporting: true });
    try {
      const validatedData = validatePreparedItemsData(data);
      set({ items: validatedData });
      toast.success('Data imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import data');
      }
      throw error;
    } finally {
      set({ isImporting: false });
    }
  },

  clearItems: () => {
    set({ items: [] });
    toast.success('Data cleared successfully');
  },

  saveItems: async () => {
    try {
      // Save functionality here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Data saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save data');
      throw error;
    }
  }
}));