import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { InventoryCount, InventoryCountDB } from "@/types/inventory";
import type { MasterIngredient } from "@/types/master-ingredient";
import toast from "react-hot-toast";

// Local storage keys
const LOCAL_STORAGE_KEY = "inventory_counts";
const LAST_FETCH_KEY = "inventory_last_fetch";

interface InventoryStore {
  items: InventoryCount[];
  isLoading: boolean;
  error: string | null;
  loadingProgress: number;
  totalItems: number;
  lastFetched: number | null;
  isBackgroundLoading: boolean;
  fetchItems: (forceRefresh?: boolean) => Promise<void>;
  fetchItemsBackground: () => Promise<void>;
  addCount: (
    count: Omit<InventoryCount, "id" | "lastUpdated">,
  ) => Promise<void>;
  updateCount: (id: string, updates: Partial<InventoryCount>) => Promise<void>;
  deleteCount: (id: string) => Promise<void>;
  importItems: (data: any[]) => Promise<void>;
  clearItems: () => Promise<void>;
  getLocalItems: () => InventoryCount[] | null;
  saveLocalItems: (items: InventoryCount[]) => void;
  getLastFetchTime: () => number | null;
  saveLastFetchTime: () => void;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  loadingProgress: 0,
  totalItems: 0,
  lastFetched: null,
  isBackgroundLoading: false,

  getLocalItems: () => {
    try {
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItems) {
        return JSON.parse(storedItems) as InventoryCount[];
      }
    } catch (error) {
      console.error("Error retrieving items from local storage:", error);
    }
    return null;
  },

  saveLocalItems: (items: InventoryCount[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving items to local storage:", error);
    }
  },

  getLastFetchTime: () => {
    try {
      const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
      if (lastFetch) {
        return parseInt(lastFetch, 10);
      }
    } catch (error) {
      console.error(
        "Error retrieving last fetch time from local storage:",
        error,
      );
    }
    return null;
  },

  saveLastFetchTime: () => {
    try {
      const now = Date.now();
      localStorage.setItem(LAST_FETCH_KEY, now.toString());
      set({ lastFetched: now });
    } catch (error) {
      console.error("Error saving last fetch time to local storage:", error);
    }
  },

  fetchItems: async (forceRefresh = false) => {
    // Try to load from local storage first if not forcing refresh
    if (!forceRefresh) {
      const localItems = get().getLocalItems();
      const lastFetchTime = get().getLastFetchTime();
      const isCurrentlyBackgroundLoading = get().isBackgroundLoading;

      // If we have local data and it's less than 1 hour old, use it
      if (localItems && localItems.length > 0 && lastFetchTime) {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        if (lastFetchTime > oneHourAgo) {
          set({
            items: localItems,
            isLoading: false,
            error: null,
            lastFetched: lastFetchTime,
          });

          // Only fetch in background if not already doing so and if data is older than 15 minutes
          const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
          if (
            !isCurrentlyBackgroundLoading &&
            lastFetchTime < fifteenMinutesAgo
          ) {
            setTimeout(() => get().fetchItemsBackground(), 100);
          }
          return;
        }
      }
    }

    set({ isLoading: true, error: null, loadingProgress: 0, totalItems: 0 });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      // First get the total count for progress tracking
      const { count: totalCount, error: countError } = await supabase
        .from("inventory_counts")
        .select("id", { count: "exact", head: false })
        .eq("organization_id", organizationId);

      if (!countError && totalCount && totalCount > 0) {
        set({ totalItems: totalCount });

        // Try to fetch from inventory_counts table
        try {
          const { data: inventoryCounts, error: fetchError } = await supabase
            .from("inventory_counts")
            .select("*, master_ingredients_with_categories!inner(*)")
            .eq("organization_id", organizationId)
            .order("count_date", { ascending: false });

          // Update progress after fetch completes
          set({ loadingProgress: totalCount });

          if (!fetchError && inventoryCounts && inventoryCounts.length > 0) {
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

            set({ items: formattedCounts, error: null, isLoading: false });

            // Save to local storage
            get().saveLocalItems(formattedCounts);
            get().saveLastFetchTime();
            return;
          }
        } catch (fetchError) {
          console.warn("Error fetching from inventory_counts:", fetchError);
        }
      }

      // Fallback: Get count of master ingredients for progress tracking
      const { count: totalMasterCount, error: countMasterError } =
        await supabase
          .from("master_ingredients_with_categories")
          .select("id", { count: "exact", head: false })
          .eq("organization_id", organizationId);

      if (!countMasterError && totalMasterCount) {
        set({ totalItems: totalMasterCount });
      }

      // Fallback: Use the master_ingredients table to create mock data
      const { data: masterIngredients, error: miError } = await supabase
        .from("master_ingredients_with_categories")
        .select("*")
        .eq("organization_id", organizationId);

      // Update progress after fetch completes
      if (totalMasterCount) {
        set({ loadingProgress: totalMasterCount });
      }

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

      // Save to local storage
      get().saveLocalItems(mockInventoryData);
      get().saveLastFetchTime();
    } catch (error) {
      console.error("Error fetching inventory:", error);
      set({ error: "Failed to load inventory data", items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemsBackground: async () => {
    // Check if already loading in background to prevent multiple simultaneous fetches
    if (get().isBackgroundLoading) {
      console.log("Background fetch already in progress, skipping");
      return;
    }

    set({ isBackgroundLoading: true });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (!organizationId) {
        throw new Error("No organization ID found");
      }

      // First try to fetch from inventory_counts table
      try {
        const { data: inventoryCounts, error: fetchError } = await supabase
          .from("inventory_counts")
          .select("*, master_ingredients_with_categories!inner(*)")
          .eq("organization_id", organizationId)
          .order("count_date", { ascending: false });

        if (!fetchError && inventoryCounts && inventoryCounts.length > 0) {
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

          // Update state without setting loading to true
          set({ items: formattedCounts });

          // Save to local storage
          get().saveLocalItems(formattedCounts);
          get().saveLastFetchTime();
          return;
        }
      } catch (fetchError) {
        console.warn(
          "Error fetching from inventory_counts in background:",
          fetchError,
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
        quantity: 0,
        unitCost: ingredient.current_price || 0,
        totalValue: 0,
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

      // Update state without setting loading to true
      set({ items: mockInventoryData });

      // Save to local storage
      get().saveLocalItems(mockInventoryData);
      get().saveLastFetchTime();
    } catch (error) {
      console.error("Error fetching inventory in background:", error);
    } finally {
      set({ isBackgroundLoading: false });
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

      const updatedItems = [...get().items, newCountLocal];
      set({ items: updatedItems });

      // Update local storage
      get().saveLocalItems(updatedItems);
      get().saveLastFetchTime();

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
      const updatedItems = get().items.map((item) =>
        item.id === id
          ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
          : item,
      );

      set({ items: updatedItems });

      // Update local storage
      get().saveLocalItems(updatedItems);
      get().saveLastFetchTime();

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
      const updatedItems = get().items.filter((item) => item.id !== id);
      set({ items: updatedItems });

      // Update local storage
      get().saveLocalItems(updatedItems);
      get().saveLastFetchTime();

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
      const updatedItems = [...get().items, ...localCounts];
      set({ items: updatedItems });

      // Update local storage
      get().saveLocalItems(updatedItems);
      get().saveLastFetchTime();

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

          // Update local storage
          get().saveLocalItems([]);
          get().saveLastFetchTime();

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

      // Update local storage
      get().saveLocalItems([]);
      get().saveLastFetchTime();

      toast.success("Inventory data cleared successfully");
    } catch (error) {
      console.error("Error clearing inventory:", error);
      toast.error("Failed to clear inventory data");
    }
  },
}));
