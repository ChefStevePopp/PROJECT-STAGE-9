import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { PreparedItem, PreparedItemsStore } from '../types/prepared-items';
import toast from 'react-hot-toast';

// Allergen mapping from Excel headers to database columns
const ALLERGEN_EXCEL_MAP = {
  'Peanut': 'allergen_peanut',
  'Crustacean': 'allergen_crustacean',
  'Treenut': 'allergen_treenut', 
  'Shellfish': 'allergen_shellfish',
  'Sesame': 'allergen_sesame',
  'Soy': 'allergen_soy',
  'Fish': 'allergen_fish',
  'Wheat': 'allergen_wheat',
  'Milk': 'allergen_milk',
  'Sulphite': 'allergen_sulphite',
  'Egg': 'allergen_egg',
  'Gluten': 'allergen_gluten',
  'Mustard': 'allergen_mustard',
  'Celery': 'allergen_celery',
  'Garlic': 'allergen_garlic',
  'Onion': 'allergen_onion',
  'Nitrite': 'allergen_nitrite',
  'Mushroom': 'allergen_mushroom',
  'Hot Pepper': 'allergen_hot_pepper',
  'Citrus': 'allergen_citrus',
  'Pork': 'allergen_pork'
};

const validatePreparedItemsData = (data: any[]): any[] => {
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
    'FINAL $'
  ];

  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    throw new Error('Invalid data format: No valid rows found');
  }

  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  return data
    .filter(row => {
      const productName = row['PRODUCT']?.toString().trim();
      return productName && productName !== '0';
    })
    .map(row => {
      // Process allergens into database column format
      const allergens = Object.entries(ALLERGEN_EXCEL_MAP).reduce((acc, [excelName, dbColumn]) => {
        const value = row[excelName]?.toString().trim();
        acc[dbColumn] = value === '1' || (parseFloat(value) > 0);
        return acc;
      }, {} as Record<string, boolean>);

      return {
        item_id: row['Item ID']?.toString() || '',
        category: row['CATEGORY']?.toString() || '',
        product: row['PRODUCT']?.toString() || '',
        station: row['STATION']?.toString() || '',
        sub_category: row['SUB CATEGORY']?.toString() || '',
        storage_area: row['STORAGE AREA']?.toString() || '',
        container: row['CONTAINER']?.toString() || '',
        container_type: row['CONTAINER TYPE']?.toString() || '',
        shelf_life: row['SHELF LIFE']?.toString() || '',
        recipe_unit: row['RECIPE UNIT (R/U)']?.toString() || '',
        cost_per_recipe_unit: parseFloat(row['COST PER R/U']?.toString().replace(/[$,]/g, '') || '0'),
        yield_percent: parseFloat(row['YIELD %']?.toString().replace(/%/g, '') || '0'),
        final_cost: parseFloat(row['FINAL $']?.toString().replace(/[$,]/g, '') || '0'),
        ...allergens,
        last_updated: new Date().toISOString()
      };
    });
};

export const usePreparedItemsStore = create<PreparedItemsStore>((set, get) => ({
  items: [],
  isLoading: false,
  isImporting: false,

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;
      
      if (!organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('prepared_items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('product');

      if (error) throw error;

      const transformedData = data.map(row => ({
        id: row.id,
        itemId: row.item_id,
        category: row.category,
        product: row.product,
        station: row.station,
        subCategory: row.sub_category,
        storageArea: row.storage_area,
        container: row.container,
        containerType: row.container_type,
        shelfLife: row.shelf_life,
        recipeUnit: row.recipe_unit,
        costPerRecipeUnit: row.cost_per_recipe_unit,
        yieldPercent: row.yield_percent,
        finalCost: row.final_cost,
        allergens: Object.entries(ALLERGEN_EXCEL_MAP).reduce((acc, [name, dbCol]) => {
          acc[name.toLowerCase().replace(' ', '_')] = row[dbCol];
          return acc;
        }, {} as Record<string, boolean>),
        lastUpdated: row.last_updated
      }));

      set({ items: transformedData });
    } catch (error) {
      console.error('Error fetching prepared items:', error);
      toast.error('Failed to load prepared items');
    } finally {
      set({ isLoading: false });
    }
  },

  importItems: async (data: any[]) => {
    set({ isImporting: true });
    try {
      const validatedData = validatePreparedItemsData(data);
      
      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;
      
      if (!organizationId) {
        throw new Error('No organization ID found');
      }

      const upsertData = validatedData.map(item => ({
        organization_id: organizationId,
        ...item
      }));

      const { error } = await supabase
        .from('prepared_items')
        .upsert(upsertData, {
          onConflict: 'organization_id,item_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Refresh the items list
      await get().fetchItems();
      toast.success('Prepared items updated successfully');
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

  clearItems: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;
      
      if (!organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('prepared_items')
        .delete()
        .eq('organization_id', organizationId);

      if (error) throw error;
      
      set({ items: [] });
      toast.success('Prepared items cleared successfully');
    } catch (error) {
      console.error('Error clearing items:', error);
      toast.error('Failed to clear prepared items');
    }
  },

  saveItems: async () => {
    // No need to implement this since we're saving directly to Supabase
    // during import. This is kept for API compatibility.
    toast.success('Data is automatically saved to the database');
  }
}));