import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '../types/recipe';
import toast from 'react-hot-toast';

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  currentRecipe: Recipe | null;
  fetchRecipes: () => Promise<void>;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'lastModified'>) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  filterRecipes: (type: 'prepared' | 'final', searchTerm: string) => Recipe[];
  addRecipe: (recipe: Recipe) => Promise<void>;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  isLoading: false,
  currentRecipe: null,

  fetchRecipes: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            id, type, master_ingredient_id, prepared_recipe_id, 
            quantity, unit, cost, notes, sort_order
          ),
          recipe_steps (
            id, instruction, notes, warning_level, time_in_minutes,
            temperature_value, temperature_unit, is_quality_control_point,
            is_critical_control_point, sort_order
          ),
          recipe_media (
            id, type, url, title, description, step_id, is_primary,
            tags, sort_order
          ),
          recipe_quality_standards (
            id, appearance_description, appearance_image_urls,
            texture_points, taste_points, aroma_points,
            plating_instructions, plating_image_url,
            temperature_value, temperature_unit, temperature_tolerance
          ),
          recipe_training (
            id, required_skill_level, certification_required,
            common_errors, key_techniques, safety_protocols,
            quality_standards, notes
          ),
          recipe_versions (
            id, version, changes, reverted_from, approved_by,
            approved_at, approval_notes
          ),
          recipe_allergens (
            id, allergen_type, severity, notes
          )
        `)
        .eq('organization_id', user.user_metadata.organizationId)
        .order('name');

      if (error) throw error;

      const transformedRecipes = data.map(recipe => ({
        id: recipe.id,
        type: recipe.type,
        name: recipe.name,
        description: recipe.description || '',
        majorGroup: recipe.major_group,
        category: recipe.category,
        subCategory: recipe.sub_category,
        station: recipe.station,
        storage: {
          location: recipe.storage_area,
          container: recipe.container,
          containerType: recipe.container_type,
          shelfLife: recipe.shelf_life
        },
        prepTime: recipe.prep_time || 0,
        cookTime: recipe.cook_time || 0,
        restTime: recipe.rest_time || 0,
        totalTime: recipe.total_time || 0,
        recipeUnitRatio: recipe.recipe_unit_ratio,
        unitType: recipe.unit_type,
        yield: {
          amount: recipe.yield_amount,
          unit: recipe.yield_unit
        },
        ingredients: recipe.recipe_ingredients,
        steps: recipe.recipe_steps,
        media: recipe.recipe_media,
        qualityStandards: recipe.recipe_quality_standards?.[0] || null,
        training: recipe.recipe_training?.[0] || null,
        allergenInfo: {
          allergens: recipe.recipe_allergens || [],
          info: recipe.allergen_info || {}
        },
        costPerUnit: recipe.cost_per_unit || 0,
        laborCostPerHour: recipe.labor_cost_per_hour || 30,
        totalCost: recipe.total_cost || 0,
        targetCostPercent: recipe.target_cost_percent || 25,
        imageUrl: recipe.image_url,
        videoUrl: recipe.video_url,
        version: recipe.version,
        versions: recipe.recipe_versions || [],
        lastUpdated: recipe.updated_at,
        modifiedBy: recipe.modified_by
      }));

      set({ recipes: transformedRecipes });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipe: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // Start a transaction
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          name: updates.name,
          description: updates.description,
          type: updates.type,
          major_group: updates.majorGroup,
          category: updates.category,
          sub_category: updates.subCategory,
          station: updates.station,
          storage_area: updates.storage?.location,
          container: updates.storage?.container,
          container_type: updates.storage?.containerType,
          shelf_life: updates.storage?.shelfLife,
          prep_time: updates.prepTime,
          cook_time: updates.cookTime,
          rest_time: updates.restTime,
          total_time: updates.totalTime,
          recipe_unit_ratio: updates.recipeUnitRatio,
          unit_type: updates.unitType,
          yield_amount: updates.yield?.amount,
          yield_unit: updates.yield?.unit,
          cost_per_unit: updates.costPerUnit,
          labor_cost_per_hour: updates.laborCostPerHour,
          total_cost: updates.totalCost,
          target_cost_percent: updates.targetCostPercent,
          image_url: updates.imageUrl,
          video_url: updates.videoUrl,
          version: updates.version,
          modified_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (recipeError) throw recipeError;

      // Update related tables if data is provided
      if (updates.ingredients) {
        const { error } = await supabase
          .from('recipe_ingredients')
          .upsert(
            updates.ingredients.map(ing => ({
              recipe_id: id,
              ...ing
            }))
          );
        if (error) throw error;
      }

      if (updates.steps) {
        const { error } = await supabase
          .from('recipe_steps')
          .upsert(
            updates.steps.map(step => ({
              recipe_id: id,
              ...step
            }))
          );
        if (error) throw error;
      }

      if (updates.media) {
        const { error } = await supabase
          .from('recipe_media')
          .upsert(
            updates.media.map(media => ({
              recipe_id: id,
              ...media
            }))
          );
        if (error) throw error;
      }

      if (updates.qualityStandards) {
        const { error } = await supabase
          .from('recipe_quality_standards')
          .upsert({
            recipe_id: id,
            ...updates.qualityStandards
          });
        if (error) throw error;
      }

      if (updates.training) {
        const { error } = await supabase
          .from('recipe_training')
          .upsert({
            recipe_id: id,
            ...updates.training
          });
        if (error) throw error;
      }

      // Refresh the recipes list
      await get().fetchRecipes();
      toast.success('Recipe updated successfully');
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Failed to update recipe');
      throw error;
    }
  },

  deleteRecipe: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // Delete from all related tables first
      const tables = [
        'recipe_ingredients',
        'recipe_steps',
        'recipe_media',
        'recipe_quality_standards',
        'recipe_training',
        'recipe_versions',
        'recipe_allergens'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('recipe_id', id);
        if (error) throw error;
      }

      // Finally delete the recipe
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        recipes: state.recipes.filter(recipe => recipe.id !== id)
      }));

      toast.success('Recipe deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
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

  addRecipe: async (recipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // Insert main recipe first
      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          organization_id: user.user_metadata.organizationId,
          name: recipe.name,
          description: recipe.description,
          type: recipe.type,
          major_group: recipe.majorGroup,
          category: recipe.category,
          sub_category: recipe.subCategory,
          station: recipe.station,
          storage_area: recipe.storage?.location,
          container: recipe.storage?.container,
          container_type: recipe.storage?.containerType,
          shelf_life: recipe.storage?.shelfLife,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          rest_time: recipe.restTime,
          total_time: recipe.totalTime,
          recipe_unit_ratio: recipe.recipeUnitRatio,
          unit_type: recipe.unitType,
          yield_amount: recipe.yield?.amount,
          yield_unit: recipe.yield?.unit,
          cost_per_unit: recipe.costPerUnit,
          labor_cost_per_hour: recipe.laborCostPerHour,
          total_cost: recipe.totalCost,
          target_cost_percent: recipe.targetCostPercent,
          image_url: recipe.imageUrl,
          video_url: recipe.videoUrl,
          version: recipe.version,
          created_by: user.id,
          modified_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const recipeId = data.id;

      // Insert related data
      if (recipe.ingredients?.length) {
        await supabase
          .from('recipe_ingredients')
          .insert(recipe.ingredients.map(ing => ({
            recipe_id: recipeId,
            ...ing
          })));
      }

      if (recipe.steps?.length) {
        await supabase
          .from('recipe_steps')
          .insert(recipe.steps.map(step => ({
            recipe_id: recipeId,
            ...step
          })));
      }

      if (recipe.media?.length) {
        await supabase
          .from('recipe_media')
          .insert(recipe.media.map(media => ({
            recipe_id: recipeId,
            ...media
          })));
      }

      if (recipe.qualityStandards) {
        await supabase
          .from('recipe_quality_standards')
          .insert({
            recipe_id: recipeId,
            ...recipe.qualityStandards
          });
      }

      if (recipe.training) {
        await supabase
          .from('recipe_training')
          .insert({
            recipe_id: recipeId,
            ...recipe.training
          });
      }

      // Refresh the recipes list
      await get().fetchRecipes();
      toast.success('Recipe added successfully');
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast.error('Failed to add recipe');
    }
  }
}));