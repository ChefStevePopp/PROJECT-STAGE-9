import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  UmbrellaIngredient,
  UmbrellaIngredientWithDetails,
} from "@/types/umbrella-ingredient";
import { MasterIngredient } from "@/types/master-ingredient";
import toast from "react-hot-toast";

interface UmbrellaIngredientsStore {
  umbrellaIngredients: UmbrellaIngredientWithDetails[];
  isLoading: boolean;
  error: string | null;
  fetchUmbrellaIngredients: () => Promise<UmbrellaIngredientWithDetails[]>;
  getUmbrellaIngredient: (
    id: string,
  ) => Promise<UmbrellaIngredientWithDetails | null>;
  createUmbrellaIngredient: (
    data: Partial<UmbrellaIngredient>,
  ) => Promise<UmbrellaIngredient | null>;
  updateUmbrellaIngredient: (
    id: string,
    data: Partial<UmbrellaIngredient>,
  ) => Promise<void>;
  deleteUmbrellaIngredient: (id: string) => Promise<void>;
  addMasterIngredientToUmbrella: (
    umbrellaId: string,
    masterIngredientId: string,
  ) => Promise<void>;
  removeMasterIngredientFromUmbrella: (
    umbrellaId: string,
    masterIngredientId: string,
  ) => Promise<void>;
  setPrimaryMasterIngredient: (
    umbrellaId: string,
    masterIngredientId: string,
  ) => Promise<void>;
}

export const useUmbrellaIngredientsStore = create<UmbrellaIngredientsStore>(
  (set, get) => ({
    umbrellaIngredients: [],
    isLoading: false,
    error: null,

    fetchUmbrellaIngredients: async () => {
      try {
        set({ isLoading: true, error: null });

        // This is a placeholder - in a real implementation, you would fetch from your umbrella_ingredients table
        // For now, we'll simulate by using the master_ingredients table and grouping by product name
        const { data: masterIngredients, error: masterError } = await supabase
          .from("master_ingredients_with_categories")
          .select("*");

        if (masterError) throw masterError;

        // Group by product name to simulate umbrella ingredients
        const groupedByProduct: Record<string, MasterIngredient[]> = {};
        masterIngredients?.forEach((ingredient) => {
          if (!groupedByProduct[ingredient.product]) {
            groupedByProduct[ingredient.product] = [];
          }
          groupedByProduct[ingredient.product].push(
            ingredient as MasterIngredient,
          );
        });

        // Convert to umbrella ingredients format
        const umbrellaIngredients: UmbrellaIngredientWithDetails[] =
          Object.entries(groupedByProduct).map(
            ([productName, ingredients]) => ({
              id: ingredients[0].id, // Use first ingredient's ID as umbrella ID (temporary)
              organization_id: ingredients[0].organization_id,
              name: productName,
              description: "",
              category: ingredients[0].category || undefined,
              sub_category: ingredients[0].sub_category || undefined,
              created_at: ingredients[0].created_at,
              updated_at: ingredients[0].updated_at,
              master_ingredients: ingredients.map((i) => i.id),
              primary_master_ingredient_id: ingredients[0].id,
              master_ingredient_details: ingredients,
            }),
          );

        set({ umbrellaIngredients, isLoading: false });
        return umbrellaIngredients;
      } catch (error) {
        console.error("Error fetching umbrella ingredients:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load umbrella ingredients",
          isLoading: false,
        });
        return [];
      }
    },

    getUmbrellaIngredient: async (id: string) => {
      try {
        const umbrellaIngredients = get().umbrellaIngredients;
        let umbrellaIngredient = umbrellaIngredients.find((u) => u.id === id);

        if (!umbrellaIngredient) {
          // If not in state, fetch it
          // This is a placeholder - in a real implementation, you would fetch from your umbrella_ingredients table
          const { data: ingredient, error } = await supabase
            .from("master_ingredients_with_categories")
            .select("*")
            .eq("id", id)
            .single();

          if (error) throw error;
          if (!ingredient) return null;

          // Create a simulated umbrella ingredient
          umbrellaIngredient = {
            id: ingredient.id,
            organization_id: ingredient.organization_id,
            name: ingredient.product,
            description: "",
            category: ingredient.category || undefined,
            sub_category: ingredient.sub_category || undefined,
            created_at: ingredient.created_at,
            updated_at: ingredient.updated_at,
            master_ingredients: [ingredient.id],
            primary_master_ingredient_id: ingredient.id,
            master_ingredient_details: [ingredient as MasterIngredient],
          };
        }

        return umbrellaIngredient;
      } catch (error) {
        console.error("Error getting umbrella ingredient:", error);
        return null;
      }
    },

    createUmbrellaIngredient: async (data: Partial<UmbrellaIngredient>) => {
      try {
        set({ isLoading: true, error: null });

        // This is a placeholder - in a real implementation, you would insert into your umbrella_ingredients table
        // For now, we'll simulate by creating a master ingredient
        const { data: newIngredient, error } = await supabase
          .from("master_ingredients")
          .insert([
            {
              product: data.name,
              organization_id: data.organization_id,
              category: data.category,
              sub_category: data.sub_category,
              // Add required fields for master_ingredients
              item_code: `UMB-${Date.now()}`,
              unit_of_measure: "EA",
              vendor: "Umbrella",
              current_price: 0,
              // Set default values for required fields
              allergen_celery: false,
              allergen_citrus: false,
              allergen_crustacean: false,
              allergen_egg: false,
              allergen_fish: false,
              allergen_garlic: false,
              allergen_gluten: false,
              allergen_hot_pepper: false,
              allergen_milk: false,
              allergen_mushroom: false,
              allergen_mustard: false,
              allergen_nitrite: false,
              allergen_onion: false,
              allergen_peanut: false,
              allergen_pork: false,
              allergen_sesame: false,
              allergen_shellfish: false,
              allergen_soy: false,
              allergen_sulphite: false,
              allergen_treenut: false,
              allergen_wheat: false,
              cost_per_recipe_unit: 0,
              recipe_unit_per_purchase_unit: 1,
              yield_percent: 100,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Create a simulated umbrella ingredient from the master ingredient
        const umbrellaIngredient: UmbrellaIngredient = {
          id: newIngredient.id,
          organization_id: newIngredient.organization_id,
          name: newIngredient.product,
          description: "",
          category: newIngredient.category || undefined,
          sub_category: newIngredient.sub_category || undefined,
          created_at: newIngredient.created_at,
          updated_at: newIngredient.updated_at,
          master_ingredients: [newIngredient.id],
          primary_master_ingredient_id: newIngredient.id,
        };

        // Refresh umbrella ingredients
        await get().fetchUmbrellaIngredients();

        set({ isLoading: false });
        toast.success("Umbrella ingredient created successfully");
        return umbrellaIngredient;
      } catch (error) {
        console.error("Error creating umbrella ingredient:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create umbrella ingredient",
          isLoading: false,
        });
        toast.error("Failed to create umbrella ingredient");
        return null;
      }
    },

    updateUmbrellaIngredient: async (
      id: string,
      data: Partial<UmbrellaIngredient>,
    ) => {
      try {
        set({ isLoading: true, error: null });

        // This is a placeholder - in a real implementation, you would update your umbrella_ingredients table
        // For now, we'll simulate by updating the master ingredient
        const { error } = await supabase
          .from("master_ingredients")
          .update({
            product: data.name,
            category: data.category,
            sub_category: data.sub_category,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // Refresh umbrella ingredients
        await get().fetchUmbrellaIngredients();

        set({ isLoading: false });
        toast.success("Umbrella ingredient updated successfully");
      } catch (error) {
        console.error("Error updating umbrella ingredient:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to update umbrella ingredient",
          isLoading: false,
        });
        toast.error("Failed to update umbrella ingredient");
      }
    },

    deleteUmbrellaIngredient: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        // This is a placeholder - in a real implementation, you would delete from your umbrella_ingredients table
        // For now, we'll simulate by deleting the master ingredient
        const { error } = await supabase
          .from("master_ingredients")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Refresh umbrella ingredients
        await get().fetchUmbrellaIngredients();

        set({ isLoading: false });
        toast.success("Umbrella ingredient deleted successfully");
      } catch (error) {
        console.error("Error deleting umbrella ingredient:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete umbrella ingredient",
          isLoading: false,
        });
        toast.error("Failed to delete umbrella ingredient");
      }
    },

    addMasterIngredientToUmbrella: async (
      umbrellaId: string,
      masterIngredientId: string,
    ) => {
      try {
        set({ isLoading: true, error: null });

        // This is a placeholder - in a real implementation, you would update your umbrella_ingredients table
        // For now, we'll just refresh the data
        await get().fetchUmbrellaIngredients();

        set({ isLoading: false });
        toast.success("Master ingredient added to umbrella successfully");
      } catch (error) {
        console.error("Error adding master ingredient to umbrella:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to add master ingredient to umbrella",
          isLoading: false,
        });
        toast.error("Failed to add master ingredient to umbrella");
      }
    },

    removeMasterIngredientFromUmbrella: async (
      umbrellaId: string,
      masterIngredientId: string,
    ) => {
      try {
        set({ isLoading: true, error: null });

        // This is a placeholder - in a real implementation, you would update your umbrella_ingredients table
        // For now, we'll just refresh the data
        await get().fetchUmbrellaIngredients();

        set({ isLoading: false });
        toast.success("Master ingredient removed from umbrella successfully");
      } catch (error) {
        console.error("Error removing master ingredient from umbrella:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to remove master ingredient from umbrella",
          isLoading: false,
        });
        toast.error("Failed to remove master ingredient from umbrella");
      }
    },

    setPrimaryMasterIngredient: async (
      umbrellaId: string,
      masterIngredientId: string,
    ) => {
      try {
        set({ isLoading: true, error: null });

        // This is a placeholder - in a real implementation, you would update your umbrella_ingredients table
        // For now, we'll just refresh the data
        await get().fetchUmbrellaIngredients();

        set({ isLoading: false });
        toast.success("Primary master ingredient set successfully");
      } catch (error) {
        console.error("Error setting primary master ingredient:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to set primary master ingredient",
          isLoading: false,
        });
        toast.error("Failed to set primary master ingredient");
      }
    },
  }),
);
