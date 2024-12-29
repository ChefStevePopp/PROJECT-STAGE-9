import { supabase } from './supabase';
import type { Recipe, RecipeIngredient } from '@/types';
import type { Database } from '@/types/supabase';

type RecipeRow = Database['public']['Tables']['recipes']['Row'];
type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];
type IngredientRow = Database['public']['Tables']['recipe_ingredients']['Row'];
type IngredientInsert = Database['public']['Tables']['recipe_ingredients']['Insert'];

export async function getRecipes(organizationId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (*)
    `)
    .eq('organization_id', organizationId)
    .order('name');

  if (error) throw error;
  return data;
}

export async function createRecipe(
  organizationId: string,
  recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
) {
  // Start a transaction
  const { data, error } = await supabase.rpc('create_recipe', {
    recipe_data: {
      organization_id: organizationId,
      type: recipe.type,
      name: recipe.name,
      category: recipe.category,
      sub_category: recipe.subCategory,
      station: recipe.station,
      storage_area: recipe.storageArea,
      container: recipe.container,
      container_type: recipe.containerType,
      shelf_life: recipe.shelfLife,
      description: recipe.description,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      recipe_unit_ratio: recipe.recipeUnitRatio,
      unit_type: recipe.unitType,
      cost_per_ratio_unit: recipe.costPerRatioUnit,
      cost_per_serving: recipe.costPerServing,
      instructions: recipe.instructions,
      notes: recipe.notes,
      image_url: recipe.imageUrl,
      video_url: recipe.videoUrl,
      allergens: recipe.allergens
    },
    ingredients: recipe.ingredients.map(ingredient => ({
      type: ingredient.type,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      cost: ingredient.cost,
      notes: ingredient.notes,
      prepared_item_id: ingredient.preparedItemId
    }))
  });

  if (error) throw error;
  return data;
}

export async function updateRecipe(
  recipeId: string,
  updates: Partial<Recipe>
) {
  const { data, error } = await supabase
    .from('recipes')
    .update({
      type: updates.type,
      name: updates.name,
      category: updates.category,
      sub_category: updates.subCategory,
      station: updates.station,
      storage_area: updates.storageArea,
      container: updates.container,
      container_type: updates.containerType,
      shelf_life: updates.shelfLife,
      description: updates.description,
      prep_time: updates.prepTime,
      cook_time: updates.cookTime,
      recipe_unit_ratio: updates.recipeUnitRatio,
      unit_type: updates.unitType,
      cost_per_ratio_unit: updates.costPerRatioUnit,
      cost_per_serving: updates.costPerServing,
      instructions: updates.instructions,
      notes: updates.notes,
      image_url: updates.imageUrl,
      video_url: updates.videoUrl,
      allergens: updates.allergens,
      updated_at: new Date().toISOString()
    })
    .eq('id', recipeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecipe(recipeId: string) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId);

  if (error) throw error;
}

export async function updateRecipeIngredients(
  recipeId: string,
  ingredients: RecipeIngredient[]
) {
  // First delete existing ingredients
  const { error: deleteError } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', recipeId);

  if (deleteError) throw deleteError;

  // Then insert new ingredients
  const { error: insertError } = await supabase
    .from('recipe_ingredients')
    .insert(
      ingredients.map(ingredient => ({
        recipe_id: recipeId,
        type: ingredient.type,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        cost: ingredient.cost,
        notes: ingredient.notes,
        prepared_item_id: ingredient.preparedItemId
      }))
    );

  if (insertError) throw insertError;
}