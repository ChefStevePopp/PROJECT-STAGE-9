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

        // Fetch umbrella ingredients from the database
        const { data: umbrellaData, error: umbrellaError } = await supabase
          .from("umbrella_ingredients_with_details")
          .select("*");

        if (umbrellaError) throw umbrellaError;

        // For each umbrella ingredient, fetch the associated master ingredients
        const umbrellaIngredients: UmbrellaIngredientWithDetails[] = [];

        for (const umbrella of umbrellaData || []) {
          // Get master ingredients for this umbrella
          const masterIngredientIds = umbrella.master_ingredients || [];

          if (masterIngredientIds.length > 0) {
            const { data: masterIngredients, error: masterError } =
              await supabase
                .from("master_ingredients_with_categories")
                .select("*")
                .in("id", masterIngredientIds);

            if (masterError) throw masterError;

            umbrellaIngredients.push({
              ...umbrella,
              master_ingredients: masterIngredientIds,
              master_ingredient_details: masterIngredients || [],
            });
          } else {
            // No master ingredients associated yet
            umbrellaIngredients.push({
              ...umbrella,
              master_ingredients: [],
              master_ingredient_details: [],
            });
          }
        }

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
          // If not in state, fetch it from the database
          const { data: umbrella, error: umbrellaError } = await supabase
            .from("umbrella_ingredients_with_details")
            .select("*")
            .eq("id", id)
            .single();

          if (umbrellaError) throw umbrellaError;
          if (!umbrella) return null;

          // Get master ingredients for this umbrella
          const masterIngredientIds = umbrella.master_ingredients || [];

          if (masterIngredientIds.length > 0) {
            const { data: masterIngredients, error: masterError } =
              await supabase
                .from("master_ingredients_with_categories")
                .select("*")
                .in("id", masterIngredientIds);

            if (masterError) throw masterError;

            umbrellaIngredient = {
              ...umbrella,
              master_ingredients: masterIngredientIds,
              master_ingredient_details: masterIngredients || [],
            };
          } else {
            // No master ingredients associated yet
            umbrellaIngredient = {
              ...umbrella,
              master_ingredients: [],
              master_ingredient_details: [],
            };
          }
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

        // Insert the umbrella ingredient into the database
        const { data: newUmbrella, error } = await supabase
          .from("umbrella_ingredients")
          .insert([
            {
              name: data.name,
              organization_id: data.organization_id,
              description: data.description,
              major_group: data.major_group,
              category: data.category,
              sub_category: data.sub_category,
              primary_master_ingredient_id: data.primary_master_ingredient_id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Create a new umbrella ingredient with empty master ingredients
        const umbrellaIngredient: UmbrellaIngredientWithDetails = {
          ...newUmbrella,
          master_ingredients: [],
          master_ingredient_details: [],
        };

        // Add the new umbrella ingredient to the state
        set((state) => ({
          ...state,
          umbrellaIngredients: [
            ...state.umbrellaIngredients,
            umbrellaIngredient,
          ],
          isLoading: false,
        }));

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

        // Update the umbrella ingredient in the database
        const { error } = await supabase
          .from("umbrella_ingredients")
          .update({
            name: data.name,
            description: data.description,
            major_group: data.major_group,
            category: data.category,
            sub_category: data.sub_category,
            primary_master_ingredient_id: data.primary_master_ingredient_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // Update the umbrella ingredient in state
        set((state) => {
          const updatedUmbrellaIngredients = state.umbrellaIngredients.map(
            (umbrella) => {
              if (umbrella.id === id) {
                return {
                  ...umbrella,
                  name: data.name || umbrella.name,
                  description: data.description || umbrella.description,
                  major_group: data.major_group || umbrella.major_group,
                  category: data.category || umbrella.category,
                  sub_category: data.sub_category || umbrella.sub_category,
                  primary_master_ingredient_id:
                    data.primary_master_ingredient_id ||
                    umbrella.primary_master_ingredient_id,
                  updated_at: new Date().toISOString(),
                };
              }
              return umbrella;
            },
          );
          return {
            ...state,
            umbrellaIngredients: updatedUmbrellaIngredients,
            isLoading: false,
          };
        });

        // Refresh the umbrella ingredients to get updated category names
        get().fetchUmbrellaIngredients();
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

        // Delete the umbrella ingredient from the database
        const { error } = await supabase
          .from("umbrella_ingredients")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Remove the umbrella ingredient from state
        set((state) => ({
          ...state,
          umbrellaIngredients: state.umbrellaIngredients.filter(
            (umbrella) => umbrella.id !== id,
          ),
          isLoading: false,
        }));

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

        // Add the master ingredient to the umbrella in the database
        const { error } = await supabase
          .from("umbrella_ingredient_master_ingredients")
          .insert([
            {
              umbrella_ingredient_id: umbrellaId,
              master_ingredient_id: masterIngredientId,
            },
          ]);

        if (error) throw error;

        // Find the master ingredient to add to the state
        const { data: masterIngredient, error: masterError } = await supabase
          .from("master_ingredients_with_categories")
          .select("*")
          .eq("id", masterIngredientId)
          .single();

        if (masterError) throw masterError;

        // Update the umbrella ingredients in state
        set((state) => {
          const updatedUmbrellaIngredients = state.umbrellaIngredients.map(
            (umbrella) => {
              if (umbrella.id === umbrellaId) {
                // Add the new master ingredient to this umbrella
                return {
                  ...umbrella,
                  master_ingredients: [
                    ...umbrella.master_ingredients,
                    masterIngredientId,
                  ],
                  master_ingredient_details: [
                    ...umbrella.master_ingredient_details,
                    masterIngredient as MasterIngredient,
                  ],
                };
              }
              return umbrella;
            },
          );
          return {
            ...state,
            umbrellaIngredients: updatedUmbrellaIngredients,
            isLoading: false,
          };
        });

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

        // Remove the master ingredient from the umbrella in the database
        const { error } = await supabase
          .from("umbrella_ingredient_master_ingredients")
          .delete()
          .eq("umbrella_ingredient_id", umbrellaId)
          .eq("master_ingredient_id", masterIngredientId);

        if (error) throw error;

        // Update the umbrella ingredients in state
        set((state) => {
          const updatedUmbrellaIngredients = state.umbrellaIngredients.map(
            (umbrella) => {
              if (umbrella.id === umbrellaId) {
                // Remove the master ingredient from this umbrella
                return {
                  ...umbrella,
                  master_ingredients: umbrella.master_ingredients.filter(
                    (id) => id !== masterIngredientId,
                  ),
                  master_ingredient_details:
                    umbrella.master_ingredient_details.filter(
                      (ingredient) => ingredient.id !== masterIngredientId,
                    ),
                };
              }
              return umbrella;
            },
          );
          return {
            ...state,
            umbrellaIngredients: updatedUmbrellaIngredients,
            isLoading: false,
          };
        });

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

        // Update the primary master ingredient in the database
        const { error } = await supabase
          .from("umbrella_ingredients")
          .update({
            primary_master_ingredient_id: masterIngredientId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", umbrellaId);

        if (error) throw error;

        // Update the umbrella ingredients in state
        set((state) => {
          const updatedUmbrellaIngredients = state.umbrellaIngredients.map(
            (umbrella) => {
              if (umbrella.id === umbrellaId) {
                // Set the primary master ingredient
                return {
                  ...umbrella,
                  primary_master_ingredient_id: masterIngredientId,
                };
              }
              return umbrella;
            },
          );
          return {
            ...state,
            umbrellaIngredients: updatedUmbrellaIngredients,
            isLoading: false,
          };
        });

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
