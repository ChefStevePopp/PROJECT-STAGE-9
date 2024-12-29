import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { MasterIngredient } from '@/types/master-ingredient';
import toast from 'react-hot-toast';

interface MasterIngredientsStore {
  ingredients: MasterIngredient[];
  isLoading: boolean;
  error: string | null;
  fetchIngredients: () => Promise<void>;
  addIngredient: (ingredient: Partial<MasterIngredient>) => Promise<void>;
  updateIngredient: (id: string, updates: Partial<MasterIngredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  importIngredients: (data: any[]) => Promise<void>;
  clearIngredients: () => Promise<void>;
  saveIngredients: () => Promise<void>;
}

export const useMasterIngredientsStore = create<MasterIngredientsStore>((set, get) => ({
  ingredients: [],
  isLoading: false,
  error: null,

  fetchIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('master_ingredients_with_categories')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('product');

      if (error) throw error;

      const transformedData = data.map(item => ({
        id: item.id,
        itemCode: item.item_code,
        majorGroup: item.major_group,
        category: item.category,
        subCategory: item.sub_category,
        majorGroupName: item.major_group_name,
        categoryName: item.category_name,
        subCategoryName: item.sub_category_name,
        product: item.product,
        vendor: item.vendor,
        caseSize: item.case_size,
        unitsPerCase: item.units_per_case,
        currentPrice: item.current_price,
        unitOfMeasure: item.unit_of_measure,
        recipeUnitPerPurchaseUnit: item.recipe_unit_per_purchase_unit,
        recipeUnitType: item.recipe_unit_type,
        yieldPercent: item.yield_percent,
        costPerRecipeUnit: item.cost_per_recipe_unit,
        imageUrl: item.image_url,
        storageArea: item.storage_area,
        allergenPeanut: item.allergen_peanut,
        allergenCrustacean: item.allergen_crustacean,
        allergenTreenut: item.allergen_treenut,
        allergenShellfish: item.allergen_shellfish,
        allergenSesame: item.allergen_sesame,
        allergenSoy: item.allergen_soy,
        allergenFish: item.allergen_fish,
        allergenWheat: item.allergen_wheat,
        allergenMilk: item.allergen_milk,
        allergenSulphite: item.allergen_sulphite,
        allergenEgg: item.allergen_egg,
        allergenGluten: item.allergen_gluten,
        allergenMustard: item.allergen_mustard,
        allergenCelery: item.allergen_celery,
        allergenGarlic: item.allergen_garlic,
        allergenOnion: item.allergen_onion,
        allergenNitrite: item.allergen_nitrite,
        allergenMushroom: item.allergen_mushroom,
        allergenHotPepper: item.allergen_hot_pepper,
        allergenCitrus: item.allergen_citrus,
        allergenPork: item.allergen_pork,
        allergenCustom1Name: item.allergen_custom1_name,
        allergenCustom1Active: item.allergen_custom1_active,
        allergenCustom2Name: item.allergen_custom2_name,
        allergenCustom2Active: item.allergen_custom2_active,
        allergenCustom3Name: item.allergen_custom3_name,
        allergenCustom3Active: item.allergen_custom3_active,
        allergenNotes: item.allergen_notes,
        lastUpdated: item.updated_at
      }));

      set({ ingredients: transformedData, error: null });
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      set({ error: 'Failed to load ingredients', ingredients: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  updateIngredient: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // Convert camelCase to snake_case for database
      const dbUpdates = {
        item_code: updates.itemCode,
        major_group: updates.majorGroup,
        category: updates.category,
        sub_category: updates.subCategory,
        product: updates.product,
        vendor: updates.vendor,
        case_size: updates.caseSize,
        units_per_case: updates.unitsPerCase,
        current_price: updates.currentPrice,
        unit_of_measure: updates.unitOfMeasure,
        recipe_unit_per_purchase_unit: updates.recipeUnitPerPurchaseUnit,
        recipe_unit_type: updates.recipeUnitType,
        yield_percent: updates.yieldPercent,
        cost_per_recipe_unit: updates.costPerRecipeUnit,
        image_url: updates.imageUrl,
        storage_area: updates.storageArea,
        allergen_peanut: updates.allergenPeanut,
        allergen_crustacean: updates.allergenCrustacean,
        allergen_treenut: updates.allergenTreenut,
        allergen_shellfish: updates.allergenShellfish,
        allergen_sesame: updates.allergenSesame,
        allergen_soy: updates.allergenSoy,
        allergen_fish: updates.allergenFish,
        allergen_wheat: updates.allergenWheat,
        allergen_milk: updates.allergenMilk,
        allergen_sulphite: updates.allergenSulphite,
        allergen_egg: updates.allergenEgg,
        allergen_gluten: updates.allergenGluten,
        allergen_mustard: updates.allergenMustard,
        allergen_celery: updates.allergenCelery,
        allergen_garlic: updates.allergenGarlic,
        allergen_onion: updates.allergenOnion,
        allergen_nitrite: updates.allergenNitrite,
        allergen_mushroom: updates.allergenMushroom,
        allergen_hot_pepper: updates.allergenHotPepper,
        allergen_citrus: updates.allergenCitrus,
        allergen_pork: updates.allergenPork,
        allergen_custom1_name: updates.allergenCustom1Name,
        allergen_custom1_active: updates.allergenCustom1Active,
        allergen_custom2_name: updates.allergenCustom2Name,
        allergen_custom2_active: updates.allergenCustom2Active,
        allergen_custom3_name: updates.allergenCustom3Name,
        allergen_custom3_active: updates.allergenCustom3Active,
        allergen_notes: updates.allergenNotes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('master_ingredients')
        .update(dbUpdates)
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      // Refresh ingredients to get updated data with category names
      await get().fetchIngredients();
      toast.success('Ingredient updated successfully');
    } catch (error) {
      console.error('Error updating ingredient:', error);
      toast.error('Failed to update ingredient');
      throw error;
    }
  },

  addIngredient: async (ingredient) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('master_ingredients')
        .insert({
          organization_id: user.user_metadata.organizationId,
          item_code: ingredient.itemCode,
          major_group: ingredient.majorGroup,
          category: ingredient.category,
          sub_category: ingredient.subCategory,
          product: ingredient.product,
          vendor: ingredient.vendor,
          case_size: ingredient.caseSize,
          units_per_case: ingredient.unitsPerCase,
          current_price: ingredient.currentPrice,
          unit_of_measure: ingredient.unitOfMeasure,
          recipe_unit_per_purchase_unit: ingredient.recipeUnitPerPurchaseUnit,
          recipe_unit_type: ingredient.recipeUnitType,
          yield_percent: ingredient.yieldPercent,
          cost_per_recipe_unit: ingredient.costPerRecipeUnit,
          image_url: ingredient.imageUrl,
          storage_area: ingredient.storageArea,
          allergen_peanut: ingredient.allergenPeanut,
          allergen_crustacean: ingredient.allergenCrustacean,
          allergen_treenut: ingredient.allergenTreenut,
          allergen_shellfish: ingredient.allergenShellfish,
          allergen_sesame: ingredient.allergenSesame,
          allergen_soy: ingredient.allergenSoy,
          allergen_fish: ingredient.allergenFish,
          allergen_wheat: ingredient.allergenWheat,
          allergen_milk: ingredient.allergenMilk,
          allergen_sulphite: ingredient.allergenSulphite,
          allergen_egg: ingredient.allergenEgg,
          allergen_gluten: ingredient.allergenGluten,
          allergen_mustard: ingredient.allergenMustard,
          allergen_celery: ingredient.allergenCelery,
          allergen_garlic: ingredient.allergenGarlic,
          allergen_onion: ingredient.allergenOnion,
          allergen_nitrite: ingredient.allergenNitrite,
          allergen_mushroom: ingredient.allergenMushroom,
          allergen_hot_pepper: ingredient.allergenHotPepper,
          allergen_citrus: ingredient.allergenCitrus,
          allergen_pork: ingredient.allergenPork,
          allergen_custom1_name: ingredient.allergenCustom1Name,
          allergen_custom1_active: ingredient.allergenCustom1Active,
          allergen_custom2_name: ingredient.allergenCustom2Name,
          allergen_custom2_active: ingredient.allergenCustom2Active,
          allergen_custom3_name: ingredient.allergenCustom3Name,
          allergen_custom3_active: ingredient.allergenCustom3Active,
          allergen_notes: ingredient.allergenNotes,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        ingredients: [...state.ingredients, data]
      }));

      toast.success('Ingredient added successfully');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast.error('Failed to add ingredient');
      throw error;
    }
  },

  deleteIngredient: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('master_ingredients')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        ingredients: state.ingredients.filter(ingredient => ingredient.id !== id)
      }));

      toast.success('Ingredient deleted successfully');
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient');
      throw error;
    }
  },

  importIngredients: async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const importData = data.map(row => ({
        organization_id: user.user_metadata.organizationId,
        item_code: row['Item Code'] || row['Vendor Code'] || row['Bar Code'],
        product: row['Product Name'] || row['Common Name'],
        vendor: row['Vendor'],
        case_size: row['Case Size'],
        units_per_case: row['Units/Case'],
        current_price: parseFloat(row['Case Price']?.toString().replace(/[$,]/g, '') || '0'),
        unit_of_measure: row['Unit of Measure'] || row['Inventory Unit'],
        recipe_unit_per_purchase_unit: parseFloat(row['Recipe Units/Case']?.toString() || '0'),
        recipe_unit_type: row['Recipe Unit Type'],
        yield_percent: parseFloat(row['Yield %']?.toString().replace(/%/g, '') || '100'),
        cost_per_recipe_unit: parseFloat(row['Cost/Recipe Unit']?.toString().replace(/[$,]/g, '') || '0'),
        storage_area: row['Storage Area'],
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('master_ingredients')
        .upsert(importData, {
          onConflict: 'organization_id,item_code',
          ignoreDuplicates: false
        });

      if (error) throw error;

      await get().fetchIngredients();
      toast.success('Ingredients imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import data');
      }
      throw error;
    }
  },

  clearIngredients: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('master_ingredients')
        .delete()
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;
      
      set({ ingredients: [] });
      toast.success('Ingredients cleared successfully');
    } catch (error) {
      console.error('Error clearing ingredients:', error);
      toast.error('Failed to clear ingredients');
    }
  },

  saveIngredients: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { ingredients } = get();
      
      // Process ingredients sequentially to avoid conflicts
      for (const ingredient of ingredients) {
        const { error } = await supabase
          .from('master_ingredients')
          .upsert({
            ...ingredient,
            organization_id: user.user_metadata.organizationId,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'organization_id,item_code'
          });

        if (error) throw error;
      }
      
      toast.success('Ingredients saved successfully');
    } catch (error) {
      console.error('Error saving ingredients:', error);
      toast.error('Failed to save ingredients');
    }
  }
}));