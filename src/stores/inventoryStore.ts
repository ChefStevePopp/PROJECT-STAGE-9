import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { InventoryCount } from '@/types/inventory';
import type { MasterIngredient } from '@/types/master-ingredient';
import toast from 'react-hot-toast';

interface InventoryStore {
  items: InventoryCount[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addCount: (count: Omit<InventoryCount, 'id' | 'lastUpdated'>) => Promise<void>;
  updateCount: (id: string, updates: Partial<InventoryCount>) => Promise<void>;
  deleteCount: (id: string) => Promise<void>;
  importItems: (data: any[]) => Promise<void>;
  clearItems: () => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;
      
      if (!organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('inventory_counts_with_ingredients')
        .select('*')
        .eq('organization_id', organizationId)
        .order('count_date', { ascending: false });

      if (error) throw error;

      const transformedData = data.map(row => ({
        id: row.id,
        masterIngredientId: row.master_ingredient_id,
        quantity: row.quantity,
        unitCost: row.unit_cost,
        totalValue: row.total_value,
        location: row.location,
        countedBy: row.counted_by,
        notes: row.notes,
        status: row.status,
        lastUpdated: row.updated_at,
        ingredient: {
          itemCode: row.item_code,
          product: row.product,
          category: row.category_name,
          subCategory: row.sub_category_name,
          unitOfMeasure: row.unit_of_measure,
          imageUrl: row.image_url
        }
      }));

      set({ items: transformedData, error: null });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      set({ error: 'Failed to load inventory data', items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addCount: async (count) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;
      
      if (!organizationId) {
        throw new Error('No organization ID found');
      }

      // First verify the master ingredient exists
      const { data: ingredient, error: ingredientError } = await supabase
        .from('master_ingredients')
        .select('id, item_code, product')
        .eq('id', count.masterIngredientId)
        .eq('organization_id', organizationId)
        .single();

      if (ingredientError || !ingredient) {
        throw new Error(`Master ingredient not found: ${count.masterIngredientId}`);
      }

      const { error } = await supabase
        .from('inventory_counts')
        .insert({
          organization_id: organizationId,
          master_ingredient_id: count.masterIngredientId,
          quantity: count.quantity,
          unit_cost: count.unitCost,
          location: count.location,
          counted_by: user.id,
          notes: count.notes,
          status: count.status
        });

      if (error) throw error;

      await get().fetchItems();
      toast.success('Inventory count added successfully');
    } catch (error) {
      console.error('Error adding count:', error);
      toast.error('Failed to add inventory count');
    }
  },

  updateCount: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('inventory_counts')
        .update({
          quantity: updates.quantity,
          unit_cost: updates.unitCost,
          location: updates.location,
          notes: updates.notes,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }));

      toast.success('Inventory count updated successfully');
    } catch (error) {
      console.error('Error updating count:', error);
      toast.error('Failed to update inventory count');
    }
  },

  deleteCount: async (id) => {
    try {
      const { error } = await supabase
        .from('inventory_counts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        items: state.items.filter(item => item.id !== id)
      }));

      toast.success('Inventory count deleted successfully');
    } catch (error) {
      console.error('Error deleting count:', error);
      toast.error('Failed to delete inventory count');
    }
  },

  importItems: async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;
      
      if (!organizationId) {
        throw new Error('No organization ID found');
      }

      // First get all master ingredients for reference
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('master_ingredients')
        .select('id, item_code')
        .eq('organization_id', organizationId);

      if (ingredientsError) throw ingredientsError;

      // Create lookup map
      const ingredientMap = new Map(
        ingredients.map(ing => [ing.item_code, ing.id])
      );

      // Process and validate import data
      const validCounts = data
        .filter(row => {
          const itemId = row['Item ID']?.toString().trim();
          if (!itemId) {
            console.warn('Row missing Item ID:', row);
            return false;
          }
          if (!ingredientMap.has(itemId)) {
            console.warn(`Item ID not found in master ingredients: ${itemId}`);
            return false;
          }
          return true;
        })
        .map(row => ({
          organization_id: organizationId,
          master_ingredient_id: ingredientMap.get(row['Item ID']),
          count_date: new Date().toISOString().split('T')[0],
          quantity: parseFloat(row['Quantity']?.toString() || '0') || 0,
          unit_cost: parseFloat(row['Unit Cost']?.toString().replace(/[$,]/g, '') || '0') || 0,
          location: row['Location']?.toString() || null,
          counted_by: user.id,
          notes: row['Notes']?.toString() || null,
          status: 'pending'
        }));

      if (validCounts.length === 0) {
        throw new Error('No valid inventory counts found in import data');
      }

      // Insert counts in batches to avoid conflicts
      const batchSize = 100;
      for (let i = 0; i < validCounts.length; i += batchSize) {
        const batch = validCounts.slice(i, i + batchSize);
        const { error } = await supabase
          .from('inventory_counts')
          .upsert(batch, {
            onConflict: 'organization_id,master_ingredient_id,count_date'
          });

        if (error) throw error;
      }

      await get().fetchItems();
      toast.success('Inventory data imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import inventory data');
      }
      throw error;
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
        .from('inventory_counts')
        .delete()
        .eq('organization_id', organizationId);

      if (error) throw error;
      
      set({ items: [] });
      toast.success('Inventory data cleared successfully');
    } catch (error) {
      console.error('Error clearing inventory:', error);
      toast.error('Failed to clear inventory data');
    }
  }
}));