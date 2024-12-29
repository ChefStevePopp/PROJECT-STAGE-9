// Path: src/features/recipes/api/recipeRelations.ts

import { supabase } from '@/lib/supabase';
import type { Recipe } from '../types/recipe';

export async function updateRecipeRelations(recipeId: string, updates: Partial<Recipe>) {
  const updatePromises = [];

  // Update ingredients
  if (updates.ingredients) {
    updatePromises.push(
      (async () => {
        await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipeId);
        
        if (updates.ingredients.length > 0) {
          await supabase
            .from('recipe_ingredients')
            .insert(
              updates.ingredients.map((ing, index) => ({
                ...ing,
                recipe_id: recipeId,
                sort_order: index,
              }))
            );
        }
      })()
    );
  }

  // Update steps
  if (updates.steps) {
    updatePromises.push(
      (async () => {
        await supabase
          .from('recipe_steps')
          .delete()
          .eq('recipe_id', recipeId);
        
        if (updates.steps.length > 0) {
          await supabase
            .from('recipe_steps')
            .insert(
              updates.steps.map((step, index) => ({
                ...step,
                recipe_id: recipeId,
                sort_order: index,
              }))
            );
        }
      })()
    );
  }

  // Update media
  if (updates.media) {
    updatePromises.push(
      (async () => {
        await supabase
          .from('recipe_media')
          .delete()
          .eq('recipe_id', recipeId);
        
        if (updates.media.length > 0) {
          await supabase
            .from('recipe_media')
            .insert(
              updates.media.map((media, index) => ({
                ...media,
                recipe_id: recipeId,
                sort_order: index,
              }))
            );
        }
      })()
    );
  }

  // Update quality standards
  if (updates.qualityStandards) {
    updatePromises.push(
      (async () => {
        await supabase
          .from('recipe_quality_standards')
          .delete()
          .eq('recipe_id', recipeId);
        
        await supabase
          .from('recipe_quality_standards')
          .insert({
            ...updates.qualityStandards,
            recipe_id: recipeId,
          });
      })()
    );
  }

  // Update training
  if (updates.training) {
    updatePromises.push(
      (async () => {
        await supabase
          .from('recipe_training')
          .delete()
          .eq('recipe_id', recipeId);
        
        await supabase
          .from('recipe_training')
          .insert({
            ...updates.training,
            recipe_id: recipeId,
          });
      })()
    );
  }

  // Update allergens
  if (updates.allergenInfo) {
    updatePromises.push(
      (async () => {
        await supabase
          .from('recipe_allergens')
          .delete()
          .eq('recipe_id', recipeId);

        const allergens = [
          ...updates.allergenInfo.contains.map(type => ({
            recipe_id: recipeId,
            allergen_type: type,
            severity: 'contains',
          })),
          ...updates.allergenInfo.mayContain.map(type => ({
            recipe_id: recipeId,
            allergen_type: type,
            severity: 'may_contain',
          })),
          ...updates.allergenInfo.crossContactRisk.map(type => ({
            recipe_id: recipeId,
            allergen_type: type,
            severity: 'cross_contact',
          })),
        ];

        if (allergens.length > 0) {
          await supabase
            .from('recipe_allergens')
            .insert(allergens);
        }
      })()
    );
  }

  // Wait for all updates to complete
  await Promise.all(updatePromises);
}
