import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface FoodCategoryGroup {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}

interface FoodCategory {
  id: string;
  group_id: string;
  name: string;
  description: string;
  sort_order: number;
}

interface FoodSubCategory {
  id: string;
  category_id: string;
  name: string;
  description: string;
  sort_order: number;
}

interface FoodRelationshipsStore {
  majorGroups: Array<{
    id: string;
    name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    group_id: string;
  }>;
  subCategories: Array<{
    id: string;
    name: string;
    category_id: string;
  }>;
  isLoading: boolean;
  error: string | null;
  fetchFoodRelationships: () => Promise<void>;
  updateSortOrder: (
    type: "group" | "category" | "sub",
    id: string,
    newOrder: number,
  ) => Promise<void>;
  updateItem: (
    type: "group" | "category" | "sub",
    id: string,
    updates: { description: string },
  ) => Promise<void>;
  addItem: (
    type: "group" | "category" | "sub",
    data: Partial<FoodCategoryGroup | FoodCategory | FoodSubCategory>,
  ) => Promise<void>;
  deleteItem: (type: "group" | "category" | "sub", id: string) => Promise<void>;
}

export const useFoodRelationshipsStore = create<FoodRelationshipsStore>(
  (set, get) => ({
    majorGroups: [],
    categories: [],
    subCategories: [],
    isLoading: true,
    error: null,

    fetchFoodRelationships: async () => {
      try {
        set({ isLoading: true, error: null });

        // Fetch all data in parallel
        const [groupsResponse, categoriesResponse, subCategoriesResponse] =
          await Promise.all([
            supabase
              .from("food_category_groups")
              .select("*")
              .order("sort_order"),
            supabase.from("food_categories").select("*").order("sort_order"),
            supabase
              .from("food_sub_categories")
              .select("*")
              .order("sort_order"),
          ]);

        // Check for errors
        if (groupsResponse.error) throw groupsResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;
        if (subCategoriesResponse.error) throw subCategoriesResponse.error;

        // Transform data for dropdowns
        const majorGroups =
          groupsResponse.data?.map((g) => ({
            id: g.id,
            name: g.name,
          })) || [];

        const categories =
          categoriesResponse.data?.map((c) => ({
            id: c.id,
            name: c.name,
            group_id: c.group_id,
          })) || [];

        const subCategories =
          subCategoriesResponse.data?.map((s) => ({
            id: s.id,
            name: s.name,
            category_id: s.category_id,
          })) || [];

        set({
          majorGroups,
          categories,
          subCategories,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching food relationships:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load food relationships",
          isLoading: false,
          majorGroups: [],
          categories: [],
          subCategories: [],
        });
      }
    },

    updateSortOrder: async (type, id, newOrder) => {
      try {
        const table =
          type === "group"
            ? "food_category_groups"
            : type === "category"
              ? "food_categories"
              : "food_sub_categories";

        const { error } = await supabase
          .from(table)
          .update({ sort_order: newOrder })
          .eq("id", id);

        if (error) throw error;

        // Refresh data
        get().fetchFoodRelationships();
      } catch (error) {
        console.error("Error updating sort order:", error);
        throw error;
      }
    },

    updateItem: async (type, id, updates) => {
      try {
        const table =
          type === "group"
            ? "food_category_groups"
            : type === "category"
              ? "food_categories"
              : "food_sub_categories";

        const { error } = await supabase
          .from(table)
          .update({
            description: updates.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // Refresh data
        await get().fetchFoodRelationships();
      } catch (error) {
        console.error("Error updating item:", error);
        throw error;
      }
    },

    addItem: async (type, data) => {
      try {
        const table =
          type === "group"
            ? "food_category_groups"
            : type === "category"
              ? "food_categories"
              : "food_sub_categories";

        // Clean data before insert
        const cleanData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === "" ? null : value,
          ]),
        );

        const { error } = await supabase.from(table).insert([cleanData]);

        if (error) throw error;

        // Refresh data
        get().fetchFoodRelationships();
      } catch (error) {
        console.error("Error adding item:", error);
        throw error;
      }
    },

    deleteItem: async (type, id) => {
      try {
        const table =
          type === "group"
            ? "food_category_groups"
            : type === "category"
              ? "food_categories"
              : "food_sub_categories";

        const { error } = await supabase.from(table).delete().eq("id", id);

        if (error) throw error;

        // Refresh data
        get().fetchFoodRelationships();
      } catch (error) {
        console.error("Error deleting item:", error);
        throw error;
      }
    },
  }),
);
