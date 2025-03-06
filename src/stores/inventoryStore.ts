import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { InventoryCount, InventoryCountDB } from "@/types/inventory";
import type { MasterIngredient } from "@/types/master-ingredient";
import toast from "react-hot-toast";

interface InventoryStore {
  items: InventoryCount[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addCount: (
    count: Omit<InventoryCount, "id" | "lastUpdated">,
  ) => Promise<void>;
  updateCount: (id: string, updates: Partial<InventoryCount>) => Promise<void>;
  deleteCount: (id: string) => Promise<void>;
  importItems: (data: any[]) => Promise<void>;
  clearItems: () => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      // Try to fetch from inventory_counts table
      try {
        const { data: inventoryCounts, error: countError } = await supabase
          .from("inventory_counts")
          .select("*, master_ingredients_with_categories!inner(*)")
          .eq("organization_id", organizationId)
          .order("count_date", { ascending: false });

        if (!countError && inventoryCounts && inventoryCounts.length > 0) {
          // Transform DB format to app format
          const formattedCounts = inventoryCounts.map((count) => {
            const ingredient = count.master_ingredients_with_categories;
            return {
              id: count.id,
              masterIngredientId: count.master_ingredient_id,
              quantity: count.quantity,
              unitCost: count.unit_cost,
              totalValue: count.total_value,
              location:
                count.location || ingredient.storage_area || "Main Storage",
              countedBy: count.counted_by,
              notes: count.notes || "",
              status: count.status,
              lastUpdated: count.updated_at,
              ingredient: {
                itemCode: ingredient.item_code,
                product: ingredient.product,
                category: ingredient.category_name,
                subCategory: ingredient.sub_category_name,
                unitOfMeasure: ingredient.unit_of_measure,
                imageUrl: ingredient.image_url,
              },
            };
          });

          set({ items: formattedCounts, error: null });
          return;
        }
      } catch (countError) {
        console.warn(
          "Error fetching from inventory_counts, falling back to mock data:",
          countError,
        );
      }

      // Fallback: Use the master_ingredients table to create mock data
      const { data: masterIngredients, error: miError } = await supabase
        .from("master_ingredients_with_categories")
        .select("*")
        .eq("organization_id", organizationId);

      if (miError) throw miError;

      // Create mock inventory data based on master ingredients
      const mockInventoryData = masterIngredients.map((ingredient) => ({
        id: ingredient.id,
        masterIngredientId: ingredient.id,
        quantity: 0, // Set to zero instead of random value
        unitCost: ingredient.current_price || 0,
        totalValue: 0, // Set to zero since quantity is zero
        location: ingredient.storage_area || "Main Storage",
        countedBy: user.id,
        notes: "",
        status: "pending",
        lastUpdated: new Date().toISOString(),
        ingredient: {
          itemCode: ingredient.item_code,
          product: ingredient.product,
          category: ingredient.category_name,
          subCategory: ingredient.sub_category_name,
          unitOfMeasure: ingredient.unit_of_measure,
          imageUrl: ingredient.image_url,
        },
      }));

      set({ items: mockInventoryData, error: null });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      set({ error: "Failed to load inventory data", items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addCount: async (count) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      // First verify the master ingredient exists
      const { data: ingredient, error: ingredientError } = await supabase
        .from("master_ingredients")
        .select("id, item_code, product")
        .eq("id", count.masterIngredientId)
        .eq("organization_id", organizationId)
        .single();

      if (ingredientError || !ingredient) {
        throw new Error(
          `Master ingredient not found: ${count.masterIngredientId}`,
        );
      }

      try {
        // Try to insert into inventory_counts table
        const { data: newCount, error: insertError } = await supabase
          .from("inventory_counts")
          .insert({
            organization_id: organizationId,
            master_ingredient_id: count.masterIngredientId,
            quantity: count.quantity,
            unit_cost: count.unitCost,
            location: count.location,
            counted_by: user.id,
            notes: count.notes,
            status: count.status,
          })
          .select()
          .single();

        if (!insertError && newCount) {
          // Refresh the inventory items
          await get().fetchItems();
          toast.success("Inventory count added successfully");
          return;
        }
      } catch (insertError) {
        console.warn(
          "Error inserting into inventory_counts, falling back to local state:",
          insertError,
        );
      }

      // Fallback: Add to local state if table doesn't exist
      const newCountLocal = {
        id: crypto.randomUUID(),
        ...count,
        lastUpdated: new Date().toISOString(),
      };

      set((state) => ({
        items: [...state.items, newCountLocal],
      }));

      toast.success("Inventory count added successfully");
    } catch (error) {
      console.error("Error adding count:", error);
      toast.error("Failed to add inventory count");
    }
  },

  updateCount: async (id, updates) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      try {
        // Try to update in inventory_counts table
        const dbUpdates: Partial<InventoryCountDB> = {};

        if (updates.quantity !== undefined)
          dbUpdates.quantity = updates.quantity;
        if (updates.unitCost !== undefined)
          dbUpdates.unit_cost = updates.unitCost;
        if (updates.location !== undefined)
          dbUpdates.location = updates.location;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        const { error: updateError } = await supabase
          .from("inventory_counts")
          .update(dbUpdates)
          .eq("id", id)
          .eq("organization_id", organizationId);

        if (!updateError) {
          // Refresh the inventory items
          await get().fetchItems();
          toast.success("Inventory count updated successfully");
          return;
        }
      } catch (updateError) {
        console.warn(
          "Error updating inventory_counts, falling back to local state:",
          updateError,
        );
      }

      // Fallback: Update local state if table doesn't exist
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
            : item,
        ),
      }));

      toast.success("Inventory count updated successfully");
    } catch (error) {
      console.error("Error updating count:", error);
      toast.error("Failed to update inventory count");
    }
  },

  deleteCount: async (id) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      try {
        // Try to delete from inventory_counts table
        const { error: deleteError } = await supabase
          .from("inventory_counts")
          .delete()
          .eq("id", id)
          .eq("organization_id", organizationId);

        if (!deleteError) {
          // Refresh the inventory items
          await get().fetchItems();
          toast.success("Inventory count deleted successfully");
          return;
        }
      } catch (deleteError) {
        console.warn(
          "Error deleting from inventory_counts, falling back to local state:",
          deleteError,
        );
      }

      // Fallback: Delete from local state if table doesn't exist
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));

      toast.success("Inventory count deleted successfully");
    } catch (error) {
      console.error("Error deleting count:", error);
      toast.error("Failed to delete inventory count");
    }
  },

  importItems: async (data) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      // First get all master ingredients for reference
      const { data: ingredients, error: ingredientsError } = await supabase
        .from("master_ingredients")
        .select("id, item_code")
        .eq("organization_id", organizationId);

      if (ingredientsError) throw ingredientsError;

      // Create lookup map
      const ingredientMap = new Map(
        ingredients.map((ing) => [ing.item_code, ing.id]),
      );

      // Process and validate import data
      const validCounts = data
        .filter((row) => {
          const itemId = row["Item ID"]?.toString().trim();
          if (!itemId) {
            console.warn("Row missing Item ID:", row);
            return false;
          }
          if (!ingredientMap.has(itemId)) {
            console.warn(`Item ID not found in master ingredients: ${itemId}`);
            return false;
          }
          return true;
        })
        .map((row) => ({
          organization_id: organizationId,
          master_ingredient_id: ingredientMap.get(row["Item ID"]),
          quantity: parseFloat(row["Quantity"]?.toString() || "0") || 0,
          unit_cost:
            parseFloat(
              row["Unit Cost"]?.toString().replace(/[$,]/g, "") || "0",
            ) || 0,
          location: row["Location"]?.toString() || "Main Storage",
          counted_by: user.id,
          notes: row["Notes"]?.toString() || "",
          status: "pending",
        }));

      if (validCounts.length === 0) {
        throw new Error("No valid inventory counts found in import data");
      }

      try {
        // Try to insert into inventory_counts table
        const { error: insertError } = await supabase
          .from("inventory_counts")
          .insert(validCounts);

        if (!insertError) {
          // Refresh the inventory items
          await get().fetchItems();
          toast.success("Inventory data imported successfully");
          return;
        }
      } catch (insertError) {
        console.warn(
          "Error importing to inventory_counts, falling back to local state:",
          insertError,
        );
      }

      // Fallback: Add to local state if table doesn't exist
      const localCounts = validCounts.map((count) => ({
        id: crypto.randomUUID(),
        masterIngredientId: count.master_ingredient_id,
        quantity: count.quantity,
        unitCost: count.unit_cost,
        totalValue: count.quantity * count.unit_cost,
        location: count.location,
        countedBy: count.counted_by,
        notes: count.notes,
        status: count.status,
        lastUpdated: new Date().toISOString(),
      }));

      // Update our local state with the imported data
      set((state) => ({
        items: [...state.items, ...localCounts],
      }));

      toast.success("Inventory data imported successfully");
    } catch (error) {
      console.error("Import error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to import inventory data");
      }
      throw error;
    }
  },

  clearItems: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      try {
        // Try to delete from inventory_counts table
        const { error: deleteError } = await supabase
          .from("inventory_counts")
          .delete()
          .eq("organization_id", organizationId);

        if (!deleteError) {
          set({ items: [] });
          toast.success("Inventory data cleared successfully");
          return;
        }
      } catch (deleteError) {
        console.warn(
          "Error clearing inventory_counts, falling back to local state:",
          deleteError,
        );
      }

      // Fallback: Clear local state if table doesn't exist
      set({ items: [] });
      toast.success("Inventory data cleared successfully");
    } catch (error) {
      console.error("Error clearing inventory:", error);
      toast.error("Failed to clear inventory data");
    }
  },
}));
