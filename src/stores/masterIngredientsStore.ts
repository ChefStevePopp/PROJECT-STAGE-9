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
  }),
);
