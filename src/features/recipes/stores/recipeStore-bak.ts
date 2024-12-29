import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { transformRecipeFromApi, transformRecipeForApi } from '../transformers/recipeTransformers';
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

      // Fetch recipes and all related data in parallel
      const [
        { data: recipes, error: recipesError },
        { data: ingredients },
        { data: steps },
        { data: media },
        { data: qualityStandards },
        { data: training },
        { data: allergens },
        { data: versions }
      ] = await Promise.all([
        supabase.from('recipes').select('*').eq('organization_id', user.user_metadata.organizationId),
        supabase.from('recipe_ingredients').select('*'),
        supabase.from('recipe_steps').select('*'),
        supabase.from('recipe_media').select('*'),
        supabase.from('recipe_quality_standards').select('*'),
        supabase.from('recipe_training').select('*'),
        supabase.from('recipe_allergens').select('*'),
        supabase.from('recipe_versions').select('*')
      ]);

      if (recipesError) throw recipesError;

      // Combine recipes with their related data
      const fullRecipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: ingredients?.filter(i => i.recipe_id === recipe.id) || [],
        steps: steps?.filter(s => s.recipe_id === recipe.id) || [],
        media: media?.filter(m => m.recipe_id === recipe.id) || [],
        qualityStandards: qualityStandards?.find(qs => qs.recipe_id === recipe.id) || null,
        training: training?.find(t => t.recipe_id === recipe.id) || null,
        allergens: allergens?.filter(a => a.recipe_id === recipe.id) || [],
        versions: versions?.filter(v => v.recipe_id === recipe.id) || [],
      }));

      set({ recipes: fullRecipes, error: null });
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

      // First, create the base recipe without relations
      const baseRecipe = {
        organization_id: user.user_metadata.organizationId,
        type: recipeInput.type || 'prepared',
        name: recipeInput.name || '',
        description: recipeInput.description || '',
        status: recipeInput.status || 'draft',
        station: recipeInput.station || '',
        // Updated storage fields to match database schema
        storage_area: recipeInput.storage_area || '',
        container: recipeInput.container || '',
        container_type: recipeInput.container_type || '',
        shelf_life: recipeInput.shelf_life || '',
        prep_time: recipeInput.prep_time || 0,
        cook_time: recipeInput.cook_time || 0,
        rest_time: recipeInput.rest_time || 0,
        recipe_unit_ratio: recipeInput.recipe_unit_ratio || '1',
        unit_type: recipeInput.unit_type || '',
        yield_amount: recipeInput.yield?.amount || 0,
        yield_unit: recipeInput.yield?.unit || '',
        cost_per_unit: recipeInput.cost_per_unit || 0,
        labor_cost_per_hour: recipeInput.laborCostPerHour || 0,
        total_cost: recipeInput.totalCost || 0,
        target_cost_percent: recipeInput.targetCostPercent || 0,
        version: '1.0',
        created_by: user.id,
        modified_by: user.id
      };

      // Insert base recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([baseRecipe])
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Then create relations if recipe was created successfully
      if (recipe?.id) {
        const relationPromises = [];

        // Handle ingredients
        if (recipeInput.ingredients?.length) {
          relationPromises.push(
            supabase.from('recipe_ingredients').insert(
              recipeInput.ingredients.map((ing, index) => ({
                recipe_id: recipe.id,
                type: ing.type || 'raw',
                master_ingredient_id: ing.master_ingredient_id,
                prepared_recipe_id: ing.prepared_recipe_id,
                quantity: ing.quantity || 0,
                unit: ing.unit || '',
                cost: ing.cost || 0,
                notes: ing.notes || '',
                sort_order: index,
              }))
            )
          );
        }

        // Handle steps
        if (recipeInput.steps?.length) {
          relationPromises.push(
            supabase.from('recipe_steps').insert(
              recipeInput.steps.map((step, index) => ({
                recipe_id: recipe.id,
                instruction: step.instruction || '',
                notes: step.notes || '',
                warning_level: step.warning_level,
                time_in_minutes: step.time_in_minutes || 0,
                temperature_value: step.temperature?.value,
                temperature_unit: step.temperature?.unit,
                is_quality_control_point: step.is_quality_control_point || false,
                is_critical_control_point: step.is_critical_control_point || false,
                sort_order: index,
              }))
            )
          );
        }

        // Handle quality standards if present
        if (recipeInput.qualityStandards) {
          relationPromises.push(
            supabase.from('recipe_quality_standards').insert([{
              recipe_id: recipe.id,
              appearance_description: recipeInput.qualityStandards.appearance_description,
              appearance_image_urls: recipeInput.qualityStandards.appearance_image_urls,
              texture_points: recipeInput.qualityStandards.texture_points,
              taste_points: recipeInput.qualityStandards.taste_points,
              aroma_points: recipeInput.qualityStandards.aroma_points,
              plating_instructions: recipeInput.qualityStandards.plating_instructions,
              plating_image_url: recipeInput.qualityStandards.plating_image_url,
              temperature_value: recipeInput.qualityStandards.temperature?.value,
              temperature_unit: recipeInput.qualityStandards.temperature?.unit,
              temperature_tolerance: recipeInput.qualityStandards.temperature?.tolerance
            }])
          );
        }

        // Handle allergens
        if (recipeInput.allergenInfo) {
          const allergens = [
            ...recipeInput.allergenInfo.contains.map(type => ({
              recipe_id: recipe.id,
              allergen_type: type,
              severity: 'contains' as const,
            })),
            ...recipeInput.allergenInfo.mayContain.map(type => ({
              recipe_id: recipe.id,
              allergen_type: type,
              severity: 'may_contain' as const,
            })),
            ...recipeInput.allergenInfo.crossContactRisk.map(type => ({
              recipe_id: recipe.id,
              allergen_type: type,
              severity: 'cross_contact' as const,
            }))
          ];

          if (allergens.length) {
            relationPromises.push(
              supabase.from('recipe_allergens').insert(allergens)
            );
          }
        }

        // Wait for all relations to be created
        await Promise.all(relationPromises);
      }

      // Fetch the complete recipe with all relations
      await get().fetchRecipes();
      const newRecipe = get().recipes.find(r => r.id === recipe.id);
      
      return newRecipe || recipe;
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

      // First update the main recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          name: updates.name,
          description: updates.description,
          type: updates.type,
          status: updates.status,
          station: updates.station,
          // Updated storage fields
          storage_area: updates.storage_area,
          container: updates.container,
          container_type: updates.container_type,
          shelf_life: updates.shelf_life,
          prep_time: updates.prep_time,
          cook_time: updates.cook_time,
          rest_time: updates.rest_time,
          recipe_unit_ratio: updates.recipe_unit_ratio,
          unit_type: updates.unit_type,
          yield_amount: updates.yield?.amount,
          yield_unit: updates.yield?.unit,
          cost_per_unit: updates.costPerUnit,
          labor_cost_per_hour: updates.laborCostPerHour,
          total_cost: updates.totalCost,
          target_cost_percent: updates.targetCostPercent,
          modified_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (recipeError) throw recipeError;

      // Update relations if they exist in the updates
      const relationPromises = [];

      if (updates.ingredients) {
        relationPromises.push(
          (async () => {
            await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
            if (updates.ingredients.length) {
              await supabase.from('recipe_ingredients').insert(
                updates.ingredients.map((ing, index) => ({
                  recipe_id: id,
                  type: ing.type || 'raw',
                  master_ingredient_id: ing.master_ingredient_id,
                  prepared_recipe_id: ing.prepared_recipe_id,
                  quantity: ing.quantity || 0,
                  unit: ing.unit || '',
                  cost: ing.cost || 0,
                  notes: ing.notes || '',
                  sort_order: index,
                }))
              );
            }
          })()
        );
      }

      if (updates.steps) {
        relationPromises.push(
          (async () => {
            await supabase.from('recipe_steps').delete().eq('recipe_id', id);
            if (updates.steps.length) {
              await supabase.from('recipe_steps').insert(
                updates.steps.map((step, index) => ({
                  recipe_id: id,
                  instruction: step.instruction || '',
                  notes: step.notes || '',
                  warning_level: step.warning_level,
                  time_in_minutes: step.time_in_minutes || 0,
                  temperature_value: step.temperature?.value,
                  temperature_unit: step.temperature?.unit,
                  is_quality_control_point: step.is_quality_control_point || false,
                  is_critical_control_point: step.is_critical_control_point || false,
                  sort_order: index,
                }))
              );
            }
          })()
        );
      }

      // Wait for all updates to complete
      await Promise.all(relationPromises);

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
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

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
      // Delete all related records first
      await Promise.all([
        supabase.from('recipe_ingredients').delete().eq('recipe_id', id),
        supabase.from('recipe_steps').delete().eq('recipe_id', id),
        supabase.from('recipe_media').delete().eq('recipe_id', id),
        supabase.from('recipe_quality_standards').delete().eq('recipe_id', id),
        supabase.from('recipe_training').delete().eq('recipe_id', id),
        supabase.from('recipe_allergens').delete().eq('recipe_id', id),
        supabase.from('recipe_versions').delete().eq('recipe_id', id),
      ]);

      // Then delete the main recipe
      const { error } = await supabase.from('recipes').delete().eq('id', id);

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