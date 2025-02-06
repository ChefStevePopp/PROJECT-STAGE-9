import { create } from "zustand";
import { supabase } from "@/lib/supabase";

import { MasterIngredient } from "@/types/master-ingredient";

interface MasterIngredientsStore {
  ingredients: MasterIngredient[];
  isLoading: boolean;
  error: string | null;
  fetchIngredients: () => Promise<void>;
}

export const useMasterIngredientsStore = create<MasterIngredientsStore>(
  (set) => ({
    ingredients: [],
    isLoading: false,
    error: null,

    fetchIngredients: async () => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from("master_ingredients_with_categories")
          .select("*");

        if (error) throw error;

        // Log for debugging
        console.log("Fetched master ingredients:", data);

        set({
          ingredients: data || [],
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching master ingredients:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load ingredients",
          isLoading: false,
          ingredients: [], // Clear ingredients on error
        });
      }
    },
  }),
);
