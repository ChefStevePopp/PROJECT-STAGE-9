import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Recipe, RecipeInput } from "../types/recipe";
import { logActivity } from "@/lib/activity-logger";

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  currentRecipe: Recipe | null;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  createRecipe: (recipe: RecipeInput) => Promise<Recipe>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  filterRecipes: (type: Recipe["type"], searchTerm: string) => Recipe[];
  updateRecipeStatus: (
    id: string,
    status: "draft" | "review" | "approved" | "archived",
  ) => Promise<void>;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  isLoading: false,
  currentRecipe: null,
  error: null,

  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // Get all recipes from the view (now includes stages)
      const { data: recipes, error } = await supabase
        .from("recipes_with_categories")
        .select("*")
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;

      // Ensure stages is always an array and log the first recipe for debugging
      const recipesWithValidStages = recipes?.map((recipe) => ({
        ...recipe,
        stages: recipe.stages || [],
      }));

      if (recipesWithValidStages && recipesWithValidStages.length > 0) {
        console.log("First recipe data sample:", {
          id: recipesWithValidStages[0].id,
          name: recipesWithValidStages[0].name,
          hasStages: Array.isArray(recipesWithValidStages[0].stages),
          stagesCount: Array.isArray(recipesWithValidStages[0].stages)
            ? recipesWithValidStages[0].stages.length
            : 0,
          createdBy: recipesWithValidStages[0].created_by,
          createdByName: recipesWithValidStages[0].created_by_name,
          modifiedBy: recipesWithValidStages[0].modified_by,
          modifiedByName: recipesWithValidStages[0].modified_by_name,
        });
      }

      // Set the recipes data
      set({ recipes: recipesWithValidStages || [], error: null });
    } catch (error) {
      console.error("Error fetching recipes:", error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createRecipe: async (recipeInput: RecipeInput) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found.");
      }

      const newRecipe = {
        organization_id: user.user_metadata.organizationId,
        created_by: user.id,
        modified_by: user.id,
        type: recipeInput.type || "prepared",
        name: recipeInput.name || "",
        description: recipeInput.description || "",
        status: recipeInput.status || "draft",
        station: recipeInput.station || "",
        major_group: recipeInput.major_group || null,
        category: recipeInput.category || null,
        sub_category: recipeInput.sub_category || null,
        // Storage fields
        storage: recipeInput.storage || {
          container: "",
          container_type: "",
          primary_area: "",
          shelf_life_duration: null,
          shelf_life_unit: "days",
        },
        // Timing
        prep_time: recipeInput.prep_time || 0,
        cook_time: recipeInput.cook_time || 0,
        rest_time: recipeInput.rest_time || 0,
        total_time: recipeInput.total_time || 0,
        // Units and Yield
        recipe_unit_ratio: recipeInput.recipe_unit_ratio || "",
        unit_type: recipeInput.unit_type || "",
        yield_amount: recipeInput.yield_amount || 0,
        yield_unit: recipeInput.yield_unit || "",
        // JSONB fields
        ingredients: recipeInput.ingredients || [],
        steps: recipeInput.steps || [],
        equipment: recipeInput.equipment || [],
        quality_standards: recipeInput.quality_standards || {},
        allergenInfo: recipeInput.allergenInfo || {
          contains: [],
          mayContain: [],
          crossContactRisk: [],
        },
        media: recipeInput.media || [],
        training: recipeInput.training || {},
        versions: recipeInput.versions || [],
        // Costing fields - matching exact database column names
        labor_cost_per_hour: recipeInput.labor_cost_per_hour || 0,
        total_cost: recipeInput.total_cost || 0,
        target_cost_percent: recipeInput.target_cost_percent || 0,
      };

      // Need to insert into the base recipes table, not the view
      const { data: recipe, error } = await supabase
        .from("recipes")
        .insert([newRecipe])
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "recipe_created",
        details: {
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          recipe_type: recipe.type,
          user_name: user.user_metadata.name || user.email,
        },
        metadata: {
          category: "recipes",
          severity: "info",
        },
      });

      // Update local state
      await get().fetchRecipes();

      return recipe;
    } catch (error) {
      console.error("Error creating recipe:", error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipe: async (id: string, updates: Partial<Recipe>) => {
    console.log("Updating recipe with:", updates);
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // Must update the base recipes table, not the view
      // Make sure stages is properly formatted as JSONB
      let formattedUpdates = { ...updates };

      // Remove view-only fields that don't exist in the recipes table
      const viewOnlyFields = [
        "station_name",
        "major_group_name",
        "category_name",
        "sub_category_name",
        "created_by_name",
        "modified_by_name",
        "created_by_email",
        "modified_by_email",
      ];

      viewOnlyFields.forEach((field) => {
        if (field in formattedUpdates) {
          delete formattedUpdates[field];
        }
      });

      // Log the updates for debugging
      console.log("Formatted updates before API call:", formattedUpdates);

      const { error } = await supabase
        .from("recipes")
        .update({
          ...formattedUpdates,
          modified_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Log the activity
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "recipe_updated",
        details: {
          recipe_id: id,
          recipe_name: updates.name,
          update_type: Object.keys(updates).join(", "),
          user_name: user.user_metadata.name || user.email,
        },
        metadata: {
          category: "recipes",
          severity: "info",
          diffs: {
            table_name: "recipes",
            record_id: id,
            new_values: updates,
          },
        },
      });

      // Refresh recipes
      await get().fetchRecipes();
    } catch (error) {
      console.error("Error updating recipe:", error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipeStatus: async (
    id: string,
    status: "draft" | "review" | "approved" | "archived",
  ) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { error } = await supabase
        .from("recipes")
        .update({
          status,
          modified_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Log the activity
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "recipe_status_changed",
        details: {
          recipe_id: id,
          new_status: status,
          user_name: user.user_metadata.name || user.email,
        },
        metadata: {
          category: "recipes",
          severity: status === "archived" ? "warning" : "info",
        },
      });

      // Update local state
      set((state) => ({
        recipes: state.recipes.map((recipe) =>
          recipe.id === id ? { ...recipe, status } : recipe,
        ),
      }));
    } catch (error) {
      console.error("Error updating recipe status:", error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", id);

      if (error) throw error;

      // Get recipe name before deletion for logging
      const { data: recipeData } = await supabase
        .from("recipes")
        .select("name, organization_id")
        .eq("id", id)
        .single();

      // Update store state
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        currentRecipe:
          state.currentRecipe?.id === id ? null : state.currentRecipe,
        error: null,
      }));

      // Log the activity
      if (recipeData) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        await logActivity({
          organization_id: recipeData.organization_id,
          user_id: user.id,
          activity_type: "recipe_deleted",
          details: {
            recipe_id: id,
            recipe_name: recipeData.name,
            user_name: user.user_metadata.name || user.email,
          },
          metadata: {
            category: "recipes",
            severity: "warning",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentRecipe: (recipe) => {
    set({ currentRecipe: recipe });
  },

  filterRecipes: (type, searchTerm) => {
    const { recipes } = get();
    return recipes.filter((recipe) => {
      const matchesType = recipe.type === type;
      const matchesSearch = searchTerm
        ? recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          recipe.station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.station_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          recipe.sub_category_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          recipe.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesType && matchesSearch;
    });
  },
}));
