import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { MasterIngredient } from "@/types/master-ingredient";

interface MasterIngredientsStore {
  ingredients: MasterIngredient[];
  isLoading: boolean;
  error: string | null;
  fetchIngredients: () => Promise<void>;
  createIngredient: (ingredient: Partial<MasterIngredient>) => Promise<void>;
  updateIngredient: (
    id: string,
    updates: Partial<MasterIngredient>,
  ) => Promise<void>;
  updateIngredientByItemCode: (
    itemCode: string,
    updates: Partial<MasterIngredient>,
  ) => Promise<void>;
  bulkUpdatePrices: (
    priceUpdates: Array<{ itemCode: string; newPrice: number }>,
  ) => Promise<void>;
  setUmbrellaIngredientFromPrimary: (
    umbrellaId: string,
    primaryIngredientId: string,
  ) => Promise<void>;
  updateMasterIngredientsFromUmbrella: (
    umbrellaId: string,
    umbrellaData: Record<string, any>,
  ) => Promise<void>;
  updatePrimaryMasterIngredientFromUmbrella: (
    umbrellaId: string,
  ) => Promise<void>;
}

export const useMasterIngredientsStore = create<MasterIngredientsStore>(
  (set, get) => ({
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
          ingredients: [],
        });
      }
    },

    createIngredient: async (ingredient) => {
      try {
        // Validate organization_id
        if (!ingredient.organization_id) {
          console.error(
            "Missing organization_id in ingredient data:",
            ingredient,
          );
          throw new Error("Organization ID is required");
        }

        // Debug: Log the incoming data
        console.log("Creating ingredient:", {
          organization_id: ingredient.organization_id,
          ingredient: ingredient,
        });

        // Create a new object with required fields
        const newIngredient = {
          organization_id: ingredient.organization_id,
          product: ingredient.product || "",
          major_group: ingredient.major_group || "",
          category: ingredient.category || "",
          sub_category: ingredient.sub_category || "",
          vendor: ingredient.vendor || "",
          item_code: ingredient.item_code || "",
          unit_of_measure: ingredient.unit_of_measure || "",
          current_price: ingredient.current_price || 0,
          recipe_unit_per_purchase_unit:
            ingredient.recipe_unit_per_purchase_unit || 0,
          units_per_case: ingredient.units_per_case || 0,
          yield_percent: ingredient.yield_percent || 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          allergen_peanut: ingredient.allergen_peanut || false,
          allergen_crustacean: ingredient.allergen_crustacean || false,
          allergen_treenut: ingredient.allergen_treenut || false,
          allergen_shellfish: ingredient.allergen_shellfish || false,
          allergen_sesame: ingredient.allergen_sesame || false,
          allergen_soy: ingredient.allergen_soy || false,
          allergen_fish: ingredient.allergen_fish || false,
          allergen_wheat: ingredient.allergen_wheat || false,
          allergen_milk: ingredient.allergen_milk || false,
          allergen_sulphite: ingredient.allergen_sulphite || false,
          allergen_egg: ingredient.allergen_egg || false,
          allergen_gluten: ingredient.allergen_gluten || false,
          allergen_mustard: ingredient.allergen_mustard || false,
          allergen_celery: ingredient.allergen_celery || false,
          allergen_garlic: ingredient.allergen_garlic || false,
          allergen_onion: ingredient.allergen_onion || false,
          allergen_nitrite: ingredient.allergen_nitrite || false,
          allergen_mushroom: ingredient.allergen_mushroom || false,
          allergen_hot_pepper: ingredient.allergen_hot_pepper || false,
          allergen_citrus: ingredient.allergen_citrus || false,
          allergen_pork: ingredient.allergen_pork || false,
          allergen_custom1_name: ingredient.allergen_custom1_name || null,
          allergen_custom1_active: ingredient.allergen_custom1_active || false,
          allergen_custom2_name: ingredient.allergen_custom2_name || null,
          allergen_custom2_active: ingredient.allergen_custom2_active || false,
          allergen_custom3_name: ingredient.allergen_custom3_name || null,
          allergen_custom3_active: ingredient.allergen_custom3_active || false,
          allergen_notes: ingredient.allergen_notes || null,
          storage_area: ingredient.storage_area || "",
        };

        const { data, error } = await supabase
          .from("master_ingredients")
          .insert([newIngredient])
          .select()
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Created ingredient:", data);

        // Refresh the ingredients list
        const store = useMasterIngredientsStore.getState();
        await store.fetchIngredients();
      } catch (error) {
        console.error("Error creating ingredient:", error);
        throw error;
      }
    },

    updateIngredient: async (id, updates) => {
      try {
        // Debug: Log the update data
        console.log("Updating ingredient:", {
          id,
          updates,
        });

        const { error } = await supabase
          .from("master_ingredients")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // Refresh the ingredients list
        const store = useMasterIngredientsStore.getState();
        await store.fetchIngredients();
      } catch (error) {
        console.error("Error updating ingredient:", error);
        throw error;
      }
    },
    updateIngredientByItemCode: async (itemCode, updates) => {
      try {
        console.log(`Updating ingredient with item code ${itemCode}:`, updates);

        const { error } = await supabase
          .from("master_ingredients")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("item_code", itemCode);

        if (error) throw error;

        // Refresh the ingredients list
        await get().fetchIngredients();
      } catch (error) {
        console.error(
          `Error updating ingredient with item code ${itemCode}:`,
          error,
        );
        throw error;
      }
    },

    bulkUpdatePrices: async (priceUpdates) => {
      try {
        console.log(
          "Bulk updating prices for",
          priceUpdates.length,
          "ingredients",
        );

        // Process updates sequentially to avoid potential conflicts
        for (const update of priceUpdates) {
          const { error } = await supabase
            .from("master_ingredients")
            .update({
              current_price: update.newPrice,
              updated_at: new Date().toISOString(),
            })
            .eq("item_code", update.itemCode);

          if (error) {
            console.error(
              `Error updating price for item code ${update.itemCode}:`,
              error,
            );
            throw error;
          }
        }

        // Refresh the ingredients list after all updates
        await get().fetchIngredients();
      } catch (error) {
        console.error("Error in bulk price update:", error);
        throw error;
      }
    },

    setUmbrellaIngredientFromPrimary: async (
      umbrellaId,
      primaryIngredientId,
    ) => {
      console.log(
        `SYNC: Setting umbrella ${umbrellaId} from primary ${primaryIngredientId}`,
      );
      try {
        console.log(
          `Setting umbrella ingredient ${umbrellaId} from primary ingredient ${primaryIngredientId}`,
        );

        // 1. Fetch the primary ingredient details
        const { data: primaryIngredient, error: primaryError } = await supabase
          .from("master_ingredients_with_categories")
          .select("*")
          .eq("id", primaryIngredientId)
          .single();

        if (primaryError) {
          console.error("Error fetching primary ingredient:", primaryError);
          throw primaryError;
        }
        if (!primaryIngredient) {
          throw new Error(
            `Primary ingredient with ID ${primaryIngredientId} not found`,
          );
        }

        console.log(
          "Found primary ingredient:",
          primaryIngredient.id,
          primaryIngredient.product,
        );

        // 2. Fetch the umbrella ingredient data
        const { data: umbrellaData, error: umbrellaViewError } = await supabase
          .from("umbrella_ingredients_with_details")
          .select("*")
          .eq("id", umbrellaId)
          .single();

        if (umbrellaViewError) {
          console.error(
            "Error fetching umbrella ingredient:",
            umbrellaViewError,
          );
          throw umbrellaViewError;
        }

        if (!umbrellaData) {
          throw new Error(
            `Umbrella ingredient with ID ${umbrellaId} not found`,
          );
        }

        console.log("Current umbrella data:", {
          id: umbrellaData.id,
          name: umbrellaData.name,
          primary_master_ingredient_id:
            umbrellaData.primary_master_ingredient_id,
        });

        // Always update the primary_master_ingredient_id to ensure proper syncing
        console.log(
          `Setting primary_master_ingredient_id to ${primaryIngredientId}`,
        );
        const { error: updatePrimaryError } = await supabase
          .from("umbrella_ingredients")
          .update({
            primary_master_ingredient_id: primaryIngredientId,
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
          `Successfully set primary_master_ingredient_id to ${primaryIngredientId}`,
        );

        // Update the umbrella with the primary ingredient's data
        const updateData = {
          major_group: primaryIngredient.major_group || "",
          category: primaryIngredient.category || "",
          sub_category: primaryIngredient.sub_category || "",
          storage_area: primaryIngredient.storage_area || "",
          recipe_unit_type: primaryIngredient.recipe_unit_type || "",
          cost_per_recipe_unit: primaryIngredient.cost_per_recipe_unit || 0,
          allergen_peanut: Boolean(primaryIngredient.allergen_peanut),
          allergen_crustacean: Boolean(primaryIngredient.allergen_crustacean),
          allergen_treenut: Boolean(primaryIngredient.allergen_treenut),
          allergen_shellfish: Boolean(primaryIngredient.allergen_shellfish),
          allergen_sesame: Boolean(primaryIngredient.allergen_sesame),
          allergen_soy: Boolean(primaryIngredient.allergen_soy),
          allergen_fish: Boolean(primaryIngredient.allergen_fish),
          allergen_wheat: Boolean(primaryIngredient.allergen_wheat),
          allergen_milk: Boolean(primaryIngredient.allergen_milk),
          allergen_sulphite: Boolean(primaryIngredient.allergen_sulphite),
          allergen_egg: Boolean(primaryIngredient.allergen_egg),
          allergen_gluten: Boolean(primaryIngredient.allergen_gluten),
          allergen_mustard: Boolean(primaryIngredient.allergen_mustard),
          allergen_celery: Boolean(primaryIngredient.allergen_celery),
          allergen_garlic: Boolean(primaryIngredient.allergen_garlic),
          allergen_onion: Boolean(primaryIngredient.allergen_onion),
          allergen_nitrite: Boolean(primaryIngredient.allergen_nitrite),
          allergen_mushroom: Boolean(primaryIngredient.allergen_mushroom),
          allergen_hot_pepper: Boolean(primaryIngredient.allergen_hot_pepper),
          allergen_citrus: Boolean(primaryIngredient.allergen_citrus),
          allergen_pork: Boolean(primaryIngredient.allergen_pork),
          allergen_custom1_name:
            primaryIngredient.allergen_custom1_name || null,
          allergen_custom1_active: Boolean(
            primaryIngredient.allergen_custom1_active,
          ),
          allergen_custom2_name:
            primaryIngredient.allergen_custom2_name || null,
          allergen_custom2_active: Boolean(
            primaryIngredient.allergen_custom2_active,
          ),
          allergen_custom3_name:
            primaryIngredient.allergen_custom3_name || null,
          allergen_custom3_active: Boolean(
            primaryIngredient.allergen_custom3_active,
          ),
          allergen_notes: primaryIngredient.allergen_notes || null,
          updated_at: new Date().toISOString(),
        };

        console.log(
          "Updating umbrella ingredient with primary ingredient data:",
          {
            umbrellaId,
            primaryIngredientId,
            recipe_unit_type: updateData.recipe_unit_type,
            cost_per_recipe_unit: updateData.cost_per_recipe_unit,
          },
        );

        // Update the umbrella's data
        const { error: updateError } = await supabase
          .from("umbrella_ingredients")
          .update(updateData)
          .eq("id", umbrellaId);

        if (updateError) {
          console.error(
            "Error updating umbrella with primary ingredient data:",
            updateError,
          );
          throw updateError;
        }

        console.log(
          "Successfully updated umbrella with primary ingredient data",
        );

        // 3. Find all master ingredients that need to be updated
        // First, get all master ingredients associated with this umbrella
        const { data: relatedMasterIngredients, error: relatedError } =
          await supabase
            .from("umbrella_ingredient_master_ingredients")
            .select("master_ingredient_id")
            .eq("umbrella_ingredient_id", umbrellaId);

        if (relatedError) throw relatedError;

        // Skip if no related master ingredients
        if (
          !relatedMasterIngredients ||
          relatedMasterIngredients.length === 0
        ) {
          console.log(`No master ingredients found for umbrella ${umbrellaId}`);
          return;
        }

        // 4. Update each master ingredient with the umbrella ingredient's data
        const masterIngredientIds = relatedMasterIngredients.map(
          (item) => item.master_ingredient_id,
        );
        console.log(
          `Updating ${masterIngredientIds.length} master ingredients with umbrella data`,
        );

        // Find the UMB- master ingredient (if any) to update
        let umbMasterIngredientId = null;
        let umbMasterIngredient = null;

        for (const masterIngredientId of masterIngredientIds) {
          // Get the master ingredient to check if it's a UMB- ingredient
          const { data: masterIngredient, error: masterError } = await supabase
            .from("master_ingredients")
            .select("*")
            .eq("id", masterIngredientId)
            .single();

          if (masterError) {
            console.error(
              `Error fetching master ingredient ${masterIngredientId}:`,
              masterError,
            );
            continue;
          }

          if (
            masterIngredient &&
            masterIngredient.item_code &&
            masterIngredient.item_code.startsWith("UMB-")
          ) {
            umbMasterIngredientId = masterIngredientId;
            umbMasterIngredient = masterIngredient;
            console.log(
              `Found UMB- master ingredient: ${umbMasterIngredientId} with item code ${masterIngredient.item_code}`,
            );
            break;
          }
        }

        // Only update the UMB- master ingredient if found
        if (umbMasterIngredientId) {
          console.log(
            `Updating UMB- master ingredient: ${umbMasterIngredientId}`,
          );

          // Create an update object with data from the primary ingredient
          const updateData = {
            // Keep the existing product name, item_code, and vendor
            product:
              umbMasterIngredient?.product || primaryIngredient.product || "",
            item_code: umbMasterIngredient?.item_code || "", // Preserve the UMB- code
            vendor: umbMasterIngredient?.vendor || "", // Preserve the vendor
            // Update all other fields from the primary ingredient
            major_group: primaryIngredient.major_group || "",
            category: primaryIngredient.category || "",
            sub_category: primaryIngredient.sub_category || "",
            storage_area: primaryIngredient.storage_area || "",
            unit_of_measure: primaryIngredient.unit_of_measure || "",
            current_price: primaryIngredient.current_price || 0,
            recipe_unit_per_purchase_unit:
              primaryIngredient.recipe_unit_per_purchase_unit || 0,
            units_per_case: primaryIngredient.units_per_case || 0,
            yield_percent: primaryIngredient.yield_percent || 100,
            recipe_unit_type: primaryIngredient.recipe_unit_type || "",
            cost_per_recipe_unit: primaryIngredient.cost_per_recipe_unit || 0,

            // Copy all allergen data from the primary ingredient
            allergen_peanut: Boolean(primaryIngredient.allergen_peanut),
            allergen_crustacean: Boolean(primaryIngredient.allergen_crustacean),
            allergen_treenut: Boolean(primaryIngredient.allergen_treenut),
            allergen_shellfish: Boolean(primaryIngredient.allergen_shellfish),
            allergen_sesame: Boolean(primaryIngredient.allergen_sesame),
            allergen_soy: Boolean(primaryIngredient.allergen_soy),
            allergen_fish: Boolean(primaryIngredient.allergen_fish),
            allergen_wheat: Boolean(primaryIngredient.allergen_wheat),
            allergen_milk: Boolean(primaryIngredient.allergen_milk),
            allergen_sulphite: Boolean(primaryIngredient.allergen_sulphite),
            allergen_egg: Boolean(primaryIngredient.allergen_egg),
            allergen_gluten: Boolean(primaryIngredient.allergen_gluten),
            allergen_mustard: Boolean(primaryIngredient.allergen_mustard),
            allergen_celery: Boolean(primaryIngredient.allergen_celery),
            allergen_garlic: Boolean(primaryIngredient.allergen_garlic),
            allergen_onion: Boolean(primaryIngredient.allergen_onion),
            allergen_nitrite: Boolean(primaryIngredient.allergen_nitrite),
            allergen_mushroom: Boolean(primaryIngredient.allergen_mushroom),
            allergen_hot_pepper: Boolean(primaryIngredient.allergen_hot_pepper),
            allergen_citrus: Boolean(primaryIngredient.allergen_citrus),
            allergen_pork: Boolean(primaryIngredient.allergen_pork),
            allergen_custom1_name:
              primaryIngredient.allergen_custom1_name || null,
            allergen_custom1_active: Boolean(
              primaryIngredient.allergen_custom1_active,
            ),
            allergen_custom2_name:
              primaryIngredient.allergen_custom2_name || null,
            allergen_custom2_active: Boolean(
              primaryIngredient.allergen_custom2_active,
            ),
            allergen_custom3_name:
              primaryIngredient.allergen_custom3_name || null,
            allergen_custom3_active: Boolean(
              primaryIngredient.allergen_custom3_active,
            ),
            allergen_notes: primaryIngredient.allergen_notes || null,
            updated_at: new Date().toISOString(),
          };

          console.log(`Updating UMB- master ingredient with data:`, {
            id: umbMasterIngredientId,
            item_code: updateData.item_code,
            product: updateData.product,
            major_group: updateData.major_group,
            category: updateData.category,
          });

          // Update only the UMB- master ingredient
          const { error: updateError } = await supabase
            .from("master_ingredients")
            .update(updateData)
            .eq("id", umbMasterIngredientId);

          if (updateError) {
            console.error(
              `Error updating UMB- master ingredient ${umbMasterIngredientId}:`,
              updateError,
            );
          } else {
            console.log(
              `Successfully updated UMB- master ingredient ${umbMasterIngredientId} with primary ingredient data`,
            );
          }
        } else {
          console.log("No UMB- master ingredient found to update");
        }

        // 5. Refresh the ingredients list
        await get().fetchIngredients();
        console.log(
          `Successfully updated all master ingredients for umbrella ${umbrellaId}`,
        );

        // Return success for better error handling
        return true;
      } catch (error) {
        console.error("Error setting umbrella ingredient from primary:", error);
        throw error;
      }
    },
    updateMasterIngredientsFromUmbrella: async (umbrellaId, umbrellaData) => {
      console.log(
        `SYNC: Updating master ingredients from umbrella ${umbrellaId}`,
      );
      try {
        console.log(
          `Updating master ingredients from umbrella ingredient ${umbrellaId}`,
        );

        // 1. Fetch the umbrella ingredient data if not provided
        let umbrellaDetails = umbrellaData;
        if (!umbrellaDetails || Object.keys(umbrellaDetails).length === 0) {
          const { data, error: umbrellaError } = await supabase
            .from("umbrella_ingredients")
            .select("*")
            .eq("id", umbrellaId)
            .single();

          if (umbrellaError) {
            console.error("Error fetching umbrella ingredient:", umbrellaError);
            throw umbrellaError;
          }
          umbrellaDetails = data;
        }

        if (!umbrellaDetails) {
          throw new Error(
            `Umbrella ingredient with ID ${umbrellaId} not found`,
          );
        }

        // 2. Find all master ingredients associated with this umbrella
        const { data: relatedMasterIngredients, error: relatedError } =
          await supabase
            .from("umbrella_ingredient_master_ingredients")
            .select("master_ingredient_id")
            .eq("umbrella_ingredient_id", umbrellaId);

        if (relatedError) throw relatedError;

        // Skip if no related master ingredients
        if (
          !relatedMasterIngredients ||
          relatedMasterIngredients.length === 0
        ) {
          console.log(`No master ingredients found for umbrella ${umbrellaId}`);
          return;
        }

        // 3. Find the UMB- master ingredient to update
        const masterIngredientIds = relatedMasterIngredients.map(
          (item) => item.master_ingredient_id,
        );
        console.log(
          `Looking for UMB- master ingredient among ${masterIngredientIds.length} linked ingredients`,
        );

        // Find the UMB- master ingredient (if any)
        let umbMasterIngredientId = null;
        let umbMasterIngredient = null;

        for (const masterIngredientId of masterIngredientIds) {
          // Get the master ingredient to check if it's a UMB- ingredient
          const { data: masterIngredient, error: masterError } = await supabase
            .from("master_ingredients")
            .select("*")
            .eq("id", masterIngredientId)
            .single();

          if (masterError) {
            console.error(
              `Error fetching master ingredient ${masterIngredientId}:`,
              masterError,
            );
            continue;
          }

          if (
            masterIngredient &&
            masterIngredient.item_code &&
            masterIngredient.item_code.startsWith("UMB-")
          ) {
            umbMasterIngredientId = masterIngredientId;
            umbMasterIngredient = masterIngredient;
            console.log(
              `Found UMB- master ingredient: ${umbMasterIngredientId} with item code ${masterIngredient.item_code}`,
            );
            break;
          }
        }

        // Only update the UMB- master ingredient if found
        if (umbMasterIngredientId) {
          console.log(
            `Updating UMB- master ingredient: ${umbMasterIngredientId}`,
          );

          // Create an update object with umbrella data
          const updateData = {
            // Keep the existing product name, item_code, and vendor
            product: umbMasterIngredient?.product || umbrellaDetails.name || "",
            item_code: umbMasterIngredient?.item_code || "", // Preserve the UMB- code
            vendor: umbMasterIngredient?.vendor || "", // Preserve the vendor
            // Update all other fields from the umbrella ingredient
            major_group: umbrellaDetails.major_group || "",
            category: umbrellaDetails.category || "",
            sub_category: umbrellaDetails.sub_category || "",
            storage_area: umbrellaDetails.storage_area || "",
            recipe_unit_type: umbrellaDetails.recipe_unit_type || "",
            cost_per_recipe_unit: umbrellaDetails.cost_per_recipe_unit || 0,

            // Copy all allergen data from the umbrella ingredient
            allergen_peanut: Boolean(umbrellaDetails.allergen_peanut),
            allergen_crustacean: Boolean(umbrellaDetails.allergen_crustacean),
            allergen_treenut: Boolean(umbrellaDetails.allergen_treenut),
            allergen_shellfish: Boolean(umbrellaDetails.allergen_shellfish),
            allergen_sesame: Boolean(umbrellaDetails.allergen_sesame),
            allergen_soy: Boolean(umbrellaDetails.allergen_soy),
            allergen_fish: Boolean(umbrellaDetails.allergen_fish),
            allergen_wheat: Boolean(umbrellaDetails.allergen_wheat),
            allergen_milk: Boolean(umbrellaDetails.allergen_milk),
            allergen_sulphite: Boolean(umbrellaDetails.allergen_sulphite),
            allergen_egg: Boolean(umbrellaDetails.allergen_egg),
            allergen_gluten: Boolean(umbrellaDetails.allergen_gluten),
            allergen_mustard: Boolean(umbrellaDetails.allergen_mustard),
            allergen_celery: Boolean(umbrellaDetails.allergen_celery),
            allergen_garlic: Boolean(umbrellaDetails.allergen_garlic),
            allergen_onion: Boolean(umbrellaDetails.allergen_onion),
            allergen_nitrite: Boolean(umbrellaDetails.allergen_nitrite),
            allergen_mushroom: Boolean(umbrellaDetails.allergen_mushroom),
            allergen_hot_pepper: Boolean(umbrellaDetails.allergen_hot_pepper),
            allergen_citrus: Boolean(umbrellaDetails.allergen_citrus),
            allergen_pork: Boolean(umbrellaDetails.allergen_pork),
            allergen_custom1_name:
              umbrellaDetails.allergen_custom1_name || null,
            allergen_custom1_active: Boolean(
              umbrellaDetails.allergen_custom1_active,
            ),
            allergen_custom2_name:
              umbrellaDetails.allergen_custom2_name || null,
            allergen_custom2_active: Boolean(
              umbrellaDetails.allergen_custom2_active,
            ),
            allergen_custom3_name:
              umbrellaDetails.allergen_custom3_name || null,
            allergen_custom3_active: Boolean(
              umbrellaDetails.allergen_custom3_active,
            ),
            allergen_notes: umbrellaDetails.allergen_notes || null,
            updated_at: new Date().toISOString(),
          };

          console.log(`Updating UMB- master ingredient with data:`, {
            id: umbMasterIngredientId,
            item_code: updateData.item_code,
            product: updateData.product,
            major_group: updateData.major_group,
            category: updateData.category,
          });

          // Update only the UMB- master ingredient
          const { error: updateError } = await supabase
            .from("master_ingredients")
            .update(updateData)
            .eq("id", umbMasterIngredientId);

          if (updateError) {
            console.error(
              `Error updating UMB- master ingredient ${umbMasterIngredientId}:`,
              updateError,
            );
          } else {
            console.log(
              `Successfully updated UMB- master ingredient ${umbMasterIngredientId} with umbrella data`,
            );
          }
        } else {
          console.log("No UMB- master ingredient found to update");
        }

        // 4. Refresh the ingredients list
        await get().fetchIngredients();
        console.log(
          `Successfully updated master ingredients for umbrella ${umbrellaId}`,
        );

        // Return success for better error handling
        return true;
      } catch (error) {
        console.error(
          "Error updating master ingredients from umbrella:",
          error,
        );
        throw error;
      }
    },
    updatePrimaryMasterIngredientFromUmbrella: async (umbrellaId) => {
      console.log(
        `SYNC: Updating primary master ingredient from umbrella ${umbrellaId}`,
      );
      try {
        // 1. Fetch the umbrella ingredient data
        const { data: umbrellaData, error: umbrellaError } = await supabase
          .from("umbrella_ingredients_with_details")
          .select("*")
          .eq("id", umbrellaId)
          .single();

        if (umbrellaError) {
          console.error("Error fetching umbrella ingredient:", umbrellaError);
          throw umbrellaError;
        }

        if (!umbrellaData) {
          throw new Error(
            `Umbrella ingredient with ID ${umbrellaId} not found`,
          );
        }

        // Check if there's a primary master ingredient ID
        if (!umbrellaData.primary_master_ingredient_id) {
          console.log(
            `No primary master ingredient set for umbrella ${umbrellaId}`,
          );
          return;
        }

        const primaryMasterIngredientId =
          umbrellaData.primary_master_ingredient_id;
        console.log(
          `Found primary master ingredient ID: ${primaryMasterIngredientId}`,
        );

        // 2. Create an update object with umbrella data
        const updateData = {
          // Only update fields that should be synced from umbrella to master ingredient
          // Don't update product name, item_code, vendor, etc.
          major_group: umbrellaData.major_group || "",
          category: umbrellaData.category || "",
          sub_category: umbrellaData.sub_category || "",
          storage_area: umbrellaData.storage_area || "",
          recipe_unit_type: umbrellaData.recipe_unit_type || "",
          cost_per_recipe_unit: umbrellaData.cost_per_recipe_unit || 0,

          // Copy all allergen data from the umbrella ingredient
          allergen_peanut: Boolean(umbrellaData.allergen_peanut),
          allergen_crustacean: Boolean(umbrellaData.allergen_crustacean),
          allergen_treenut: Boolean(umbrellaData.allergen_treenut),
          allergen_shellfish: Boolean(umbrellaData.allergen_shellfish),
          allergen_sesame: Boolean(umbrellaData.allergen_sesame),
          allergen_soy: Boolean(umbrellaData.allergen_soy),
          allergen_fish: Boolean(umbrellaData.allergen_fish),
          allergen_wheat: Boolean(umbrellaData.allergen_wheat),
          allergen_milk: Boolean(umbrellaData.allergen_milk),
          allergen_sulphite: Boolean(umbrellaData.allergen_sulphite),
          allergen_egg: Boolean(umbrellaData.allergen_egg),
          allergen_gluten: Boolean(umbrellaData.allergen_gluten),
          allergen_mustard: Boolean(umbrellaData.allergen_mustard),
          allergen_celery: Boolean(umbrellaData.allergen_celery),
          allergen_garlic: Boolean(umbrellaData.allergen_garlic),
          allergen_onion: Boolean(umbrellaData.allergen_onion),
          allergen_nitrite: Boolean(umbrellaData.allergen_nitrite),
          allergen_mushroom: Boolean(umbrellaData.allergen_mushroom),
          allergen_hot_pepper: Boolean(umbrellaData.allergen_hot_pepper),
          allergen_citrus: Boolean(umbrellaData.allergen_citrus),
          allergen_pork: Boolean(umbrellaData.allergen_pork),
          allergen_custom1_name: umbrellaData.allergen_custom1_name || null,
          allergen_custom1_active: Boolean(
            umbrellaData.allergen_custom1_active,
          ),
          allergen_custom2_name: umbrellaData.allergen_custom2_name || null,
          allergen_custom2_active: Boolean(
            umbrellaData.allergen_custom2_active,
          ),
          allergen_custom3_name: umbrellaData.allergen_custom3_name || null,
          allergen_custom3_active: Boolean(
            umbrellaData.allergen_custom3_active,
          ),
          allergen_notes: umbrellaData.allergen_notes || null,
          updated_at: new Date().toISOString(),
        };

        console.log(
          `Updating primary master ingredient ${primaryMasterIngredientId} with umbrella data:`,
          {
            major_group: updateData.major_group,
            category: updateData.category,
            sub_category: updateData.sub_category,
            recipe_unit_type: updateData.recipe_unit_type,
          },
        );

        // 3. Update the primary master ingredient
        const { error: updateError } = await supabase
          .from("master_ingredients")
          .update(updateData)
          .eq("id", primaryMasterIngredientId);

        if (updateError) {
          console.error(
            `Error updating primary master ingredient ${primaryMasterIngredientId}:`,
            updateError,
          );
          throw updateError;
        }

        console.log(
          `Successfully updated primary master ingredient ${primaryMasterIngredientId} with umbrella data`,
        );

        // 4. Also update any UMB- master ingredients
        await get().updateMasterIngredientsFromUmbrella(
          umbrellaId,
          umbrellaData,
        );

        // 5. Refresh the ingredients list
        await get().fetchIngredients();
        console.log(
          `Successfully updated all master ingredients for umbrella ${umbrellaId}`,
        );

        return true;
      } catch (error) {
        console.error(
          "Error updating primary master ingredient from umbrella:",
          error,
        );
        throw error;
      }
    },
  }),
);
