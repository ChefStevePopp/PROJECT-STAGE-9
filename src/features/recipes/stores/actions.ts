import { supabase } from '@/lib/supabase';
import type { Recipe } from '../types/recipe';
import toast from 'react-hot-toast';

export async function fetchRecipes() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.user_metadata?.organizationId) {
      throw new Error('No organization ID found');
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('organization_id', user.user_metadata.organizationId);

    if (error) throw error;
    return transformRecipeData(data);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    toast.error('Failed to load recipes');
    throw error;
  }
}

export async function updateRecipe(id: string, updates: Partial<Recipe>) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.user_metadata?.organizationId) {
      throw new Error('No organization ID found');
    }

    const updateData = {
      name: updates.name,
      description: updates.description,
      type: updates.type,
      station: updates.station,
      storage: updates.storage,
      prep_time: updates.prepTime,
      cook_time: updates.cookTime,
      rest_time: updates.restTime,
      total_time: updates.totalTime,
      recipe_unit_ratio: updates.recipeUnitRatio,
      unit_type: updates.unitType,
      yield_amount: updates.yield?.amount,
      yield_unit: updates.yield?.unit,
      ingredients: updates.ingredients,
      steps: updates.steps,
      notes: updates.notes,
      cost_per_unit: updates.costPerUnit,
      cost_per_serving: updates.costPerServing,
      allergen_info: updates.allergenInfo,
      image_url: updates.imageUrl,
      video_url: updates.videoUrl,
      modified_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const { error } = await supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', user.user_metadata.organizationId);

    if (error) throw error;
    toast.success('Recipe updated successfully');
  } catch (error) {
    console.error('Error updating recipe:', error);
    toast.error('Failed to update recipe');
    throw error;
  }
}

export async function deleteRecipe(id: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.user_metadata?.organizationId) {
      throw new Error('No organization ID found');
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('organization_id', user.user_metadata.organizationId);

    if (error) throw error;
    toast.success('Recipe deleted successfully');
  } catch (error) {
    console.error('Error deleting recipe:', error);
    toast.error('Failed to delete recipe');
    throw error;
  }
}

function transformRecipeData(data: any[]): Recipe[] {
  return data.map((recipe) => ({
    id: recipe.id,
    type: recipe.type,
    name: recipe.name,
    description: recipe.description || '',
    station: recipe.station || '',
    storage: recipe.storage || {},
    prepTime: recipe.prep_time || 0,
    cookTime: recipe.cook_time || 0,
    restTime: recipe.rest_time || 0,
    totalTime: recipe.total_time || 0,
    recipeUnitRatio: recipe.recipe_unit_ratio || '1',
    unitType: recipe.unit_type || '',
    yield: {
      amount: recipe.yield_amount || 0,
      unit: recipe.yield_unit || '',
    },
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    notes: recipe.notes || '',
    costPerUnit: recipe.cost_per_unit || 0,
    costPerServing: recipe.cost_per_serving || 0,
    lastUpdated: recipe.updated_at || new Date().toISOString(),
    imageUrl: recipe.image_url,
    videoUrl: recipe.video_url,
    allergenInfo: recipe.allergen_info || {
      contains: [],
      mayContain: [],
      crossContactRisk: [],
    },
  }));
}
