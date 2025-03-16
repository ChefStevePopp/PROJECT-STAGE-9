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

        console.log("Creating umbrella ingredient with data:", data);

        // Ensure primary_master_ingredient_id is properly captured
        const primaryMasterIngredientId = data.primary_master_ingredient_id;
        console.log("Primary master ingredient ID:", primaryMasterIngredientId);

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
              primary_master_ingredient_id: primaryMasterIngredientId,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        console.log("Created umbrella ingredient:", newUmbrella);

        // Create a new umbrella ingredient with empty master ingredients
        const umbrellaIngredient: UmbrellaIngredientWithDetails = {
          ...newUmbrella,
          master_ingredients: [],
          master_ingredient_details: [],
        };

        // If we have a primary master ingredient, add it to the master_ingredients array
        if (primaryMasterIngredientId) {
          // Add the master ingredient to the umbrella
          try {
            await get().addMasterIngredientToUmbrella(
              newUmbrella.id,
              primaryMasterIngredientId,
            );
            console.log(
              `Added primary master ingredient ${primaryMasterIngredientId} to umbrella ${newUmbrella.id}`,
            );

            // Also set it as the primary master ingredient
            await get().setPrimaryMasterIngredient(
              newUmbrella.id,
              primaryMasterIngredientId,
            );
            console.log(
              `Set ${primaryMasterIngredientId} as primary master ingredient for umbrella ${newUmbrella.id}`,
            );
          } catch (linkError) {
            console.error(
              "Error linking primary master ingredient:",
              linkError,
            );
            // Continue with creation even if linking fails
          }
        }

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

        // If there's a primary master ingredient, copy its data to the umbrella ingredient
        if (data.primary_master_ingredient_id) {
          // Get the master ingredient details
          const { data: masterIngredient, error: masterError } = await supabase
            .from("master_ingredients_with_categories")
            .select("*")
            .eq("id", data.primary_master_ingredient_id)
            .single();

          if (masterError) throw masterError;

          if (masterIngredient) {
            console.log(
              "Copying data from primary master ingredient to umbrella ingredient:",
              masterIngredient.id,
            );

            // Copy all relevant data from master ingredient to umbrella ingredient data
            // (excluding name and vendor-specific information)
            // Only copy if not already provided in the data object
            if (data.major_group === undefined) {
              data.major_group = masterIngredient.major_group || "";
            }
            if (data.category === undefined) {
              data.category = masterIngredient.category || "";
            }
            if (data.sub_category === undefined) {
              data.sub_category = masterIngredient.sub_category || "";
            }
            if (data.storage_area === undefined) {
              data.storage_area = masterIngredient.storage_area || "";
            }
            if (data.recipe_unit_type === undefined) {
              data.recipe_unit_type = masterIngredient.recipe_unit_type || "";
            }
            if (data.cost_per_recipe_unit === undefined) {
              data.cost_per_recipe_unit =
                masterIngredient.cost_per_recipe_unit || 0;
            }

            // Copy allergen data if not already provided
            if (data.allergen_peanut === undefined) {
              data.allergen_peanut = Boolean(masterIngredient.allergen_peanut);
            }
            if (data.allergen_crustacean === undefined) {
              data.allergen_crustacean = Boolean(
                masterIngredient.allergen_crustacean,
              );
            }
            if (data.allergen_treenut === undefined) {
              data.allergen_treenut = Boolean(
                masterIngredient.allergen_treenut,
              );
            }
            if (data.allergen_shellfish === undefined) {
              data.allergen_shellfish = Boolean(
                masterIngredient.allergen_shellfish,
              );
            }
            if (data.allergen_sesame === undefined) {
              data.allergen_sesame = Boolean(masterIngredient.allergen_sesame);
            }
            if (data.allergen_soy === undefined) {
              data.allergen_soy = Boolean(masterIngredient.allergen_soy);
            }
            if (data.allergen_fish === undefined) {
              data.allergen_fish = Boolean(masterIngredient.allergen_fish);
            }
            if (data.allergen_wheat === undefined) {
              data.allergen_wheat = Boolean(masterIngredient.allergen_wheat);
            }
            if (data.allergen_milk === undefined) {
              data.allergen_milk = Boolean(masterIngredient.allergen_milk);
            }
            if (data.allergen_sulphite === undefined) {
              data.allergen_sulphite = Boolean(
                masterIngredient.allergen_sulphite,
              );
            }
            if (data.allergen_egg === undefined) {
              data.allergen_egg = Boolean(masterIngredient.allergen_egg);
            }
            if (data.allergen_gluten === undefined) {
              data.allergen_gluten = Boolean(masterIngredient.allergen_gluten);
            }
            if (data.allergen_mustard === undefined) {
              data.allergen_mustard = Boolean(
                masterIngredient.allergen_mustard,
              );
            }
            if (data.allergen_celery === undefined) {
              data.allergen_celery = Boolean(masterIngredient.allergen_celery);
            }
            if (data.allergen_garlic === undefined) {
              data.allergen_garlic = Boolean(masterIngredient.allergen_garlic);
            }
            if (data.allergen_onion === undefined) {
              data.allergen_onion = Boolean(masterIngredient.allergen_onion);
            }
            if (data.allergen_nitrite === undefined) {
              data.allergen_nitrite = Boolean(
                masterIngredient.allergen_nitrite,
              );
            }
            if (data.allergen_mushroom === undefined) {
              data.allergen_mushroom = Boolean(
                masterIngredient.allergen_mushroom,
              );
            }
            if (data.allergen_hot_pepper === undefined) {
              data.allergen_hot_pepper = Boolean(
                masterIngredient.allergen_hot_pepper,
              );
            }
            if (data.allergen_citrus === undefined) {
              data.allergen_citrus = Boolean(masterIngredient.allergen_citrus);
            }
            if (data.allergen_pork === undefined) {
              data.allergen_pork = Boolean(masterIngredient.allergen_pork);
            }
            if (data.allergen_custom1_name === undefined) {
              data.allergen_custom1_name =
                masterIngredient.allergen_custom1_name || null;
            }
            if (data.allergen_custom1_active === undefined) {
              data.allergen_custom1_active = Boolean(
                masterIngredient.allergen_custom1_active,
              );
            }
            if (data.allergen_custom2_name === undefined) {
              data.allergen_custom2_name =
                masterIngredient.allergen_custom2_name || null;
            }
            if (data.allergen_custom2_active === undefined) {
              data.allergen_custom2_active = Boolean(
                masterIngredient.allergen_custom2_active,
              );
            }
            if (data.allergen_custom3_name === undefined) {
              data.allergen_custom3_name =
                masterIngredient.allergen_custom3_name || null;
            }
            if (data.allergen_custom3_active === undefined) {
              data.allergen_custom3_active = Boolean(
                masterIngredient.allergen_custom3_active,
              );
            }
            if (data.allergen_notes === undefined) {
              data.allergen_notes = masterIngredient.allergen_notes || null;
            }
            // Preserve the umbrella ingredient's name and description
          }
        }

        // Create an update object with proper null/undefined handling
        const updateData = {
          name: data.name || "",
          description: data.description,
          major_group: data.major_group || "",
          category: data.category || "",
          sub_category: data.sub_category || "",
          primary_master_ingredient_id: data.primary_master_ingredient_id,
          storage_area: data.storage_area || "",
          recipe_unit_type: data.recipe_unit_type || "",
          cost_per_recipe_unit: data.cost_per_recipe_unit || 0,
          allergen_peanut:
            data.allergen_peanut !== undefined
              ? Boolean(data.allergen_peanut)
              : false,
          allergen_crustacean:
            data.allergen_crustacean !== undefined
              ? Boolean(data.allergen_crustacean)
              : false,
          allergen_treenut:
            data.allergen_treenut !== undefined
              ? Boolean(data.allergen_treenut)
              : false,
          allergen_shellfish:
            data.allergen_shellfish !== undefined
              ? Boolean(data.allergen_shellfish)
              : false,
          allergen_sesame:
            data.allergen_sesame !== undefined
              ? Boolean(data.allergen_sesame)
              : false,
          allergen_soy:
            data.allergen_soy !== undefined
              ? Boolean(data.allergen_soy)
              : false,
          allergen_fish:
            data.allergen_fish !== undefined
              ? Boolean(data.allergen_fish)
              : false,
          allergen_wheat:
            data.allergen_wheat !== undefined
              ? Boolean(data.allergen_wheat)
              : false,
          allergen_milk:
            data.allergen_milk !== undefined
              ? Boolean(data.allergen_milk)
              : false,
          allergen_sulphite:
            data.allergen_sulphite !== undefined
              ? Boolean(data.allergen_sulphite)
              : false,
          allergen_egg:
            data.allergen_egg !== undefined
              ? Boolean(data.allergen_egg)
              : false,
          allergen_gluten:
            data.allergen_gluten !== undefined
              ? Boolean(data.allergen_gluten)
              : false,
          allergen_mustard:
            data.allergen_mustard !== undefined
              ? Boolean(data.allergen_mustard)
              : false,
          allergen_celery:
            data.allergen_celery !== undefined
              ? Boolean(data.allergen_celery)
              : false,
          allergen_garlic:
            data.allergen_garlic !== undefined
              ? Boolean(data.allergen_garlic)
              : false,
          allergen_onion:
            data.allergen_onion !== undefined
              ? Boolean(data.allergen_onion)
              : false,
          allergen_nitrite:
            data.allergen_nitrite !== undefined
              ? Boolean(data.allergen_nitrite)
              : false,
          allergen_mushroom:
            data.allergen_mushroom !== undefined
              ? Boolean(data.allergen_mushroom)
              : false,
          allergen_hot_pepper:
            data.allergen_hot_pepper !== undefined
              ? Boolean(data.allergen_hot_pepper)
              : false,
          allergen_citrus:
            data.allergen_citrus !== undefined
              ? Boolean(data.allergen_citrus)
              : false,
          allergen_pork:
            data.allergen_pork !== undefined
              ? Boolean(data.allergen_pork)
              : false,
          allergen_custom1_name: data.allergen_custom1_name || null,
          allergen_custom1_active:
            data.allergen_custom1_active !== undefined
              ? Boolean(data.allergen_custom1_active)
              : false,
          allergen_custom2_name: data.allergen_custom2_name || null,
          allergen_custom2_active:
            data.allergen_custom2_active !== undefined
              ? Boolean(data.allergen_custom2_active)
              : false,
          allergen_custom3_name: data.allergen_custom3_name || null,
          allergen_custom3_active:
            data.allergen_custom3_active !== undefined
              ? Boolean(data.allergen_custom3_active)
              : false,
          allergen_notes: data.allergen_notes || null,
          updated_at: new Date().toISOString(),
        };

        // Log the data being sent to the database
        console.log("Updating umbrella ingredient with data:", {
          id,
          primary_master_ingredient_id: updateData.primary_master_ingredient_id,
          recipe_unit_type: updateData.recipe_unit_type,
          cost_per_recipe_unit: updateData.cost_per_recipe_unit,
          major_group: updateData.major_group,
          category: updateData.category,
          sub_category: updateData.sub_category,
          storage_area: updateData.storage_area,
        });

        // Update the umbrella ingredient in the database with potentially enriched data
        const { error } = await supabase
          .from("umbrella_ingredients")
          .update(updateData)
          .eq("id", id);

        if (error) throw error;

        // Update the umbrella ingredient in state
        set((state) => {
          const updatedUmbrellaIngredients = state.umbrellaIngredients.map(
            (umbrella) => {
              if (umbrella.id === id) {
                return {
                  ...umbrella,
                  ...updateData,
                  // Preserve these fields
                  master_ingredients: umbrella.master_ingredients,
                  master_ingredient_details: umbrella.master_ingredient_details,
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

        // Always update all related master ingredients, regardless of primary ingredient
        try {
          // Import the master ingredients store to use its function
          const masterIngredientsStore = await import(
            "./masterIngredientsStore"
          );

          // If there's a primary master ingredient, use it as the source
          if (data.primary_master_ingredient_id) {
            // Force synchronization with primary ingredient
            await masterIngredientsStore.useMasterIngredientsStore
              .getState()
              .setUmbrellaIngredientFromPrimary(
                id,
                data.primary_master_ingredient_id,
              );
            console.log(
              `Successfully synchronized umbrella ingredient ${id} with master ingredients using primary ingredient`,
            );
          } else {
            // Otherwise, update master ingredients directly from the umbrella data
            // Force synchronization with umbrella data
            await masterIngredientsStore.useMasterIngredientsStore
              .getState()
              .updateMasterIngredientsFromUmbrella(id, updateData);
            console.log(
              `Successfully synchronized master ingredients with umbrella ingredient ${id}`,
            );
          }

          // Refresh master ingredients to ensure changes are reflected
          await masterIngredientsStore.useMasterIngredientsStore
            .getState()
            .fetchIngredients();
        } catch (syncError) {
          console.error(
            "Error synchronizing with master ingredients:",
            syncError,
          );
          // Don't throw this error as we still want to complete the umbrella update
          toast.warning(
            "Updated umbrella ingredient, but failed to sync with master ingredients",
          );
        }

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
        console.log(
          `Setting primary master ingredient: umbrella=${umbrellaId}, master=${masterIngredientId}`,
        );

        // 1. Fetch the master ingredient details
        const { data: masterIngredient, error: masterError } = await supabase
          .from("master_ingredients_with_categories")
          .select("*")
          .eq("id", masterIngredientId)
          .single();

        if (masterError) {
          console.error("Error fetching master ingredient:", masterError);
          throw masterError;
        }

        if (!masterIngredient) {
          console.warn(
            `Master ingredient with ID ${masterIngredientId} not found!`,
          );
          toast.error("Master ingredient not found!");
          return;
        }

        console.log(
          "Found master ingredient:",
          masterIngredient.id,
          masterIngredient.product,
        );

        // Get the current umbrella ingredient to preserve its name and existing primary_master_ingredient_id
        const { data: currentUmbrella, error: umbrellaError } = await supabase
          .from("umbrella_ingredients")
          .select("name, description, primary_master_ingredient_id")
          .eq("id", umbrellaId)
          .single();

        if (umbrellaError) {
          console.error("Error fetching umbrella ingredient:", umbrellaError);
          throw umbrellaError;
        }

        console.log("Current umbrella data:", currentUmbrella);

        // Check if this is the first time setting a primary ingredient
        const isFirstTimeSetting =
          !currentUmbrella.primary_master_ingredient_id;

        // Only update the primary_master_ingredient_id if it's not set yet
        if (isFirstTimeSetting) {
          console.log("First time setting primary_master_ingredient_id");
          const { error: updatePrimaryError } = await supabase
            .from("umbrella_ingredients")
            .update({
              primary_master_ingredient_id: masterIngredientId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", umbrellaId);

          if (updatePrimaryError) {
            console.error(
              "Error updating primary master ingredient ID:",
              updatePrimaryError,
            );
            throw updatePrimaryError;
          }

          console.log(
            `Successfully set primary_master_ingredient_id to ${masterIngredientId}`,
          );
        } else {
          console.log(
            `Keeping existing primary_master_ingredient_id: ${currentUmbrella.primary_master_ingredient_id}`,
          );
        }

        // Create an update object with proper null/undefined handling for the rest of the data
        const updateData = {
          major_group: masterIngredient.major_group || "",
          category: masterIngredient.category || "",
          sub_category: masterIngredient.sub_category || "",
          storage_area: masterIngredient.storage_area || "",
          recipe_unit_type: masterIngredient.recipe_unit_type || "",
          cost_per_recipe_unit: masterIngredient.cost_per_recipe_unit || 0,
          allergen_peanut: Boolean(masterIngredient.allergen_peanut),
          allergen_crustacean: Boolean(masterIngredient.allergen_crustacean),
          allergen_treenut: Boolean(masterIngredient.allergen_treenut),
          allergen_shellfish: Boolean(masterIngredient.allergen_shellfish),
          allergen_sesame: Boolean(masterIngredient.allergen_sesame),
          allergen_soy: Boolean(masterIngredient.allergen_soy),
          allergen_fish: Boolean(masterIngredient.allergen_fish),
          allergen_wheat: Boolean(masterIngredient.allergen_wheat),
          allergen_milk: Boolean(masterIngredient.allergen_milk),
          allergen_sulphite: Boolean(masterIngredient.allergen_sulphite),
          allergen_egg: Boolean(masterIngredient.allergen_egg),
          allergen_gluten: Boolean(masterIngredient.allergen_gluten),
          allergen_mustard: Boolean(masterIngredient.allergen_mustard),
          allergen_celery: Boolean(masterIngredient.allergen_celery),
          allergen_garlic: Boolean(masterIngredient.allergen_garlic),
          allergen_onion: Boolean(masterIngredient.allergen_onion),
          allergen_nitrite: Boolean(masterIngredient.allergen_nitrite),
          allergen_mushroom: Boolean(masterIngredient.allergen_mushroom),
          allergen_hot_pepper: Boolean(masterIngredient.allergen_hot_pepper),
          allergen_citrus: Boolean(masterIngredient.allergen_citrus),
          allergen_pork: Boolean(masterIngredient.allergen_pork),
          allergen_custom1_name: masterIngredient.allergen_custom1_name || null,
          allergen_custom1_active: Boolean(
            masterIngredient.allergen_custom1_active,
          ),
          allergen_custom2_name: masterIngredient.allergen_custom2_name || null,
          allergen_custom2_active: Boolean(
            masterIngredient.allergen_custom2_active,
          ),
          allergen_custom3_name: masterIngredient.allergen_custom3_name || null,
          allergen_custom3_active: Boolean(
            masterIngredient.allergen_custom3_active,
          ),
          allergen_notes: masterIngredient.allergen_notes || null,
          updated_at: new Date().toISOString(),
        };

        // 2. Update the umbrella ingredient with data from the master ingredient
        const { error: updateUmbrellaError } = await supabase
          .from("umbrella_ingredients")
          .update(updateData)
          .eq("id", umbrellaId);

        if (updateUmbrellaError) {
          console.error(
            "Error updating umbrella ingredient data:",
            updateUmbrellaError,
          );
          throw updateUmbrellaError;
        }

        console.log(
          "Successfully updated umbrella ingredient with master ingredient data",
        );

        // 3. Update the umbrella ingredients in state
        set((state) => {
          const updatedUmbrellaIngredients = state.umbrellaIngredients.map(
            (umbrella) => {
              if (umbrella.id === umbrellaId) {
                // Update with data from the master ingredient while preserving name and description
                return {
                  ...umbrella,
                  ...updateData,
                  primary_master_ingredient_id: masterIngredientId,
                  // Preserve these fields
                  name: umbrella.name,
                  description: umbrella.description,
                  master_ingredients: umbrella.master_ingredients,
                  master_ingredient_details: umbrella.master_ingredient_details,
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

        // 4. Also update any master ingredients that use this umbrella ingredient as their primary
        try {
          // Import the master ingredients store to use its function
          const masterIngredientsStore = await import(
            "./masterIngredientsStore"
          );
          await masterIngredientsStore.useMasterIngredientsStore
            .getState()
            .setUmbrellaIngredientFromPrimary(umbrellaId, masterIngredientId);
          console.log(
            `Successfully synchronized umbrella ingredient ${umbrellaId} with master ingredients`,
          );
        } catch (syncError) {
          console.error(
            "Error synchronizing with master ingredients:",
            syncError,
          );
          // Don't throw this error as we still want to complete the umbrella update
          toast.warning(
            "Updated umbrella ingredient, but failed to sync with master ingredients",
          );
        }

        // Refresh the umbrella ingredients to get updated data
        get().fetchUmbrellaIngredients();
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
