import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Recipe } from "@/features/recipes/types/recipe";

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
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
}));
