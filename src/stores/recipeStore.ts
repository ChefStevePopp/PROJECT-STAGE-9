import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Recipe } from "@/features/recipes/types/recipe";

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<Recipe>;
  createRecipe: (recipe: Partial<Recipe>) => Promise<Recipe>;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  isLoading: false,
  error: null,

  fetchRecipes: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;
      set({ recipes: data || [], error: null });
    } catch (error) {
      console.error("Error fetching recipes:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load recipes",
        recipes: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipe: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });

      // Update the main recipe record
      const { data, error } = await supabase
        .from("recipes")
        .update({
          ...updates,
          // Ensure stages are properly included in the update
          stages: updates.stages || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update the recipes list in the store
      set((state) => ({
        recipes: state.recipes.map((recipe) =>
          recipe.id === id ? { ...recipe, ...data } : recipe,
        ),
      }));

      return data;
    } catch (error) {
      console.error("Error updating recipe:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update recipe",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createRecipe: async (recipe) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("User organization not found");
      }

      const { data, error } = await supabase
        .from("recipes")
        .insert([
          {
            ...recipe,
            organization_id: user.user_metadata.organizationId,
            // Ensure stages are properly included in the creation
            stages: recipe.stages || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the new recipe to the store
      set((state) => ({
        recipes: [...state.recipes, data],
      }));

      return data;
    } catch (error) {
      console.error("Error creating recipe:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to create recipe",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
