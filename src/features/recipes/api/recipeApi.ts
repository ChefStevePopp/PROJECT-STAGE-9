// Path: src/features/recipes/api/recipeApi.ts

import { supabase } from "@/lib/supabase";
import type { Recipe, RecipeInput } from "../types/recipe";

export const recipeApi = {
  async fetchRecipes(organizationId: string) {
    const { data, error } = await supabase
      .from("recipes")
      .select(
        `
        *,
        recipe_ingredients (
          id, type, master_ingredient_id, prepared_recipe_id, 
          quantity, unit, cost, notes, sort_order
        ),
        recipe_media (
          id, type, url, title, description, step_id, 
          is_primary, tags, sort_order
        ),
        recipe_quality_standards (
          id, appearance_description, appearance_image_urls,
          texture_points, taste_points, aroma_points,
          plating_instructions, plating_image_url,
          temperature_value, temperature_unit, temperature_tolerance
        ),
        recipe_steps (
          id, instruction, notes, warning_level, time_in_minutes,
          temperature_value, temperature_unit,
          is_quality_control_point, is_critical_control_point, sort_order
        ),
        recipe_training (
          id, required_skill_level, certification_required,
          common_errors, key_techniques, safety_protocols,
          quality_standards, notes
        ),
        recipe_versions (
          id, version, changes, reverted_from,
          approved_by, approved_at, approval_notes, created_by, date
        ),
        recipe_allergens (
          id, allergen_type, severity, notes
        )
      `,
      )
      .eq("organization_id", organizationId);

    if (error) throw error;
    return data;
  },

  async createRecipe(recipe: RecipeInput) {
    const { data, error } = await supabase
      .from("recipes")
      .insert([recipe])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRecipe(id: string, recipe: RecipeInput) {
    const { data, error } = await supabase
      .from("recipes")
      .update(recipe)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRecipeRelations(
    recipeId: string,
    relations: {
      ingredients?: RecipeInput["ingredients"];
      steps?: RecipeInput["steps"];
      media?: RecipeInput["media"];
      qualityStandards?: RecipeInput["qualityStandards"];
      training?: RecipeInput["training"];
      allergenInfo?: RecipeInput["allergenInfo"];
    },
  ) {
    const updates = [];

    if (relations.ingredients) {
      updates.push(
        supabase.from("recipe_ingredients").upsert(
          relations.ingredients.map((ing, index) => ({
            recipe_id: recipeId,
            ...ing,
            sort_order: index,
          })),
        ),
      );
    }

    if (relations.steps) {
      updates.push(
        supabase.from("recipe_steps").upsert(
          relations.steps.map((step, index) => ({
            recipe_id: recipeId,
            ...step,
            sort_order: index,
          })),
        ),
      );
    }

    if (relations.media) {
      updates.push(
        supabase.from("recipe_media").upsert(
          relations.media.map((item, index) => ({
            recipe_id: recipeId,
            ...item,
            sort_order: index,
          })),
        ),
      );
    }

    if (relations.qualityStandards) {
      updates.push(
        supabase.from("recipe_quality_standards").upsert({
          recipe_id: recipeId,
          ...relations.qualityStandards,
        }),
      );
    }

    if (relations.training) {
      updates.push(
        supabase.from("recipe_training").upsert({
          recipe_id: recipeId,
          ...relations.training,
        }),
      );
    }

    if (relations.allergenInfo) {
      updates.push(
        supabase.from("recipe_allergens").upsert(
          relations.allergenInfo.map((allergen) => ({
            recipe_id: recipeId,
            ...allergen,
          })),
        ),
      );
    }

    await Promise.all(updates);
  },

  async deleteRecipe(id: string) {
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) throw error;
  },
};
