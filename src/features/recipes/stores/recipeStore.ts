import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Recipe, RecipeInput } from '../types/recipe';

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  currentRecipe: Recipe | null;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  createRecipe: (recipe: RecipeInput) => Promise<Recipe>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  filterRecipes: (type: Recipe['type'], searchTerm: string) => Recipe[];
  updateRecipeStatus: (id: string, status: 'draft' | 'review' | 'approved' | 'archived') => Promise<void>;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  isLoading: false,
  currentRecipe: null,
  error: null,

  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }
  
      // Simplified query - no more joins needed
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId);
  
      if (error) throw error;
  
      // No need to transform data since it's all in one table now
      set({ recipes: recipes || [], error: null });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createRecipe: async (recipeInput: RecipeInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found.');
      }

      const newRecipe = {
        organization_id: user.user_metadata.organizationId,
        created_by: user.id,
        modified_by: user.id,
        type: recipeInput.type || 'prepared',
        name: recipeInput.name || '',
        description: recipeInput.description || '',
        status: recipeInput.status || 'draft',
        station: recipeInput.station || '',
        // Storage fields
        storage_area: recipeInput.storage_area || '',
        container: recipeInput.container || '',
        container_type: recipeInput.container_type || '',
        shelf_life: recipeInput.shelf_life || '',
        // Timing
        prep_time: recipeInput.prep_time || 0,
        cook_time: recipeInput.cook_time || 0,
        rest_time: recipeInput.rest_time || 0,
        total_time: recipeInput.total_time || 0,
        // Units and Yield
        recipe_unit_ratio: recipeInput.recipe_unit_ratio || '',
        unit_type: recipeInput.unit_type || '',
        yield_amount: recipeInput.yield_amount || 0,
        yield_unit: recipeInput.yield_unit || '',
        // JSONB fields
        ingredients: recipeInput.ingredients || [],
        steps: recipeInput.steps || [],
        equipment: recipeInput.equipment || [],
        quality_standards: recipeInput.quality_standards || {},
        allergenInfo: recipeInput.allergenInfo || {
          contains: [],
          mayContain: [],
          crossContactRisk: []
        },
        media: recipeInput.media || [],
        training: recipeInput.training || {},
        versions: recipeInput.versions || [],
        // Costing fields - matching exact database column names
        labor_cost_per_hour: recipeInput.labor_cost_per_hour || 0,
        total_cost: recipeInput.total_cost || 0,
        target_cost_percent: recipeInput.target_cost_percent || 0
      };

      const { data: recipe, error } = await supabase
        .from('recipes')
        .insert([newRecipe])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      await get().fetchRecipes();
      
      return recipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipe: async (id: string, updates: Partial<Recipe>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('recipes')
        .update({
          ...updates,
          modified_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh recipes
      await get().fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipeStatus: async (id: string, status: 'draft' | 'review' | 'approved' | 'archived') => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('recipes')
        .update({ 
          status,
          modified_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set(state => ({
        recipes: state.recipes.map(recipe =>
          recipe.id === id ? { ...recipe, status } : recipe
        )
      }));
    } catch (error) {
      console.error('Error updating recipe status:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update store state
      set(state => ({
        recipes: state.recipes.filter(r => r.id !== id),
        currentRecipe: state.currentRecipe?.id === id ? null : state.currentRecipe,
        error: null
      }));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentRecipe: (recipe) => {
    set({ currentRecipe: recipe });
  },

  filterRecipes: (type, searchTerm) => {
    const { recipes } = get();
    return recipes.filter(recipe => {
      const matchesType = recipe.type === type;
      const matchesSearch = searchTerm
        ? recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.station?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesType && matchesSearch;
    });
  },
}));