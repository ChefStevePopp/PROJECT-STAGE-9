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

      // Step 1: First get all master ingredients to use as a reference
      const { data: masterIngredients, error: miError } = await supabase
        .from("master_ingredients_with_categories")
        .select("*")
        .eq("organization_id", organizationId);

      if (miError) {
        throw new Error(
          `Failed to fetch master ingredients: ${miError.message}`,
        );
      }

      // Create a map of master ingredients for quick lookup
      const masterIngredientsMap = new Map();
      masterIngredients.forEach((ingredient) => {
        masterIngredientsMap.set(ingredient.id, ingredient);
      });

      // Step 2: Get inventory counts
      const { data: inventoryCounts, error: countError } = await supabase
        .from("inventory_counts")
        .select("*")
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false });

      if (countError) {
        throw new Error(
          `Failed to fetch inventory counts: ${countError.message}`,
        );
      }

      // Step 3: Process inventory counts and link with master ingredients
      const processedCounts: InventoryCount[] = [];

      // Track which master ingredients have counts
      const masterIngredientsWithCounts = new Set();

      // Process actual inventory counts
      if (inventoryCounts && inventoryCounts.length > 0) {
        console.log(`Processing ${inventoryCounts.length} inventory counts`);

        inventoryCounts.forEach((count) => {
          const masterIngredientId = count.master_ingredient_id;
          const masterIngredient = masterIngredientsMap.get(masterIngredientId);

          // Skip if we can't find the master ingredient
          if (!masterIngredient) {
            console.warn(
              `Missing master ingredient for count ${count.id}, master_ingredient_id: ${masterIngredientId}`,
            );
            return;
          }

          // Mark this master ingredient as having a count
          masterIngredientsWithCounts.add(masterIngredientId);

          // Create a properly formatted inventory count
          processedCounts.push({
            id: count.id,
            masterIngredientId: masterIngredientId,
            master_ingredient_id: masterIngredientId,
            quantity:
              typeof count.quantity === "number"
                ? count.quantity
                : parseFloat(String(count.quantity) || "0"),
            unitCost:
              typeof count.unit_cost === "number"
                ? count.unit_cost
                : parseFloat(String(count.unit_cost) || "0"),
            totalValue:
              typeof count.total_value === "number"
                ? count.total_value
                : parseFloat(String(count.total_value) || "0"),
            location:
              count.location || masterIngredient.storage_area || "Main Storage",
            countedBy: count.counted_by,
            notes: count.notes || "",
            status: count.status || "pending",
            lastUpdated: count.updated_at,
            created_at: count.created_at,
            updated_at: count.updated_at,
            count_date: count.count_date,
            ingredient: {
              itemCode: masterIngredient.item_code,
              product: masterIngredient.product,
              category: masterIngredient.category_name,
              subCategory: masterIngredient.sub_category_name,
              unitOfMeasure: masterIngredient.unit_of_measure,
              imageUrl: masterIngredient.image_url,
            },
          });
        });
      }

      // Step 4: Set the processed counts in the store
      set({
        items: processedCounts,
        error: null,
        isLoading: false,
        totalItems: processedCounts.length,
      });

      // Save to local storage
      get().saveLocalItems(processedCounts);
      get().saveLastFetchTime();
    } catch (error) {
      console.error("Error fetching inventory:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load inventory data",
        items: [],
      });
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

      // Step 1: First get all master ingredients to use as a reference
      const { data: masterIngredients, error: miError } = await supabase
        .from("master_ingredients_with_categories")
        .select("*")
        .eq("organization_id", organizationId);

      if (miError) {
        throw new Error(
          `Failed to fetch master ingredients: ${miError.message}`,
        );
      }

      // Create a map of master ingredients for quick lookup
      const masterIngredientsMap = new Map();
      masterIngredients.forEach((ingredient) => {
        masterIngredientsMap.set(ingredient.id, ingredient);
      });

      // Step 2: Get inventory counts
      const { data: inventoryCounts, error: countError } = await supabase
        .from("inventory_counts")
        .select("*")
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false });

      if (countError) {
        throw new Error(
          `Failed to fetch inventory counts: ${countError.message}`,
        );
      }

      // Step 3: Process inventory counts and link with master ingredients
      const processedCounts: InventoryCount[] = [];

      // Process actual inventory counts - only include real counts with valid data
      if (inventoryCounts && inventoryCounts.length > 0) {
        inventoryCounts.forEach((count) => {
          // Skip if count doesn't have required fields
          if (
            !count.id ||
            count.quantity === undefined ||
            count.quantity === null
          ) {
            return;
          }

          const masterIngredientId = count.master_ingredient_id;
          const masterIngredient = masterIngredientsMap.get(masterIngredientId);

          // Skip if we can't find the master ingredient
          if (!masterIngredient) {
            return;
          }

          // Create a properly formatted inventory count
          processedCounts.push({
            id: count.id,
            masterIngredientId: masterIngredientId,
            master_ingredient_id: masterIngredientId,
            quantity:
              typeof count.quantity === "number"
                ? count.quantity
                : parseFloat(String(count.quantity) || "0"),
            unitCost:
              typeof count.unit_cost === "number"
                ? count.unit_cost
                : parseFloat(String(count.unit_cost) || "0"),
            totalValue:
              typeof count.total_value === "number"
                ? count.total_value
                : parseFloat(String(count.total_value) || "0"),
            location:
              count.location || masterIngredient.storage_area || "Main Storage",
            countedBy: count.counted_by,
            notes: count.notes || "",
            status: count.status || "pending",
            lastUpdated: count.updated_at,
            created_at: count.created_at,
            updated_at: count.updated_at,
            count_date: count.count_date,
            ingredient: {
              itemCode: masterIngredient.item_code,
              product: masterIngredient.product,
              category: masterIngredient.category_name,
              subCategory: masterIngredient.sub_category_name,
              unitOfMeasure: masterIngredient.unit_of_measure,
              imageUrl: masterIngredient.image_url,
            },
          });
        });
      }

      // Update state without setting loading to true
      set({ items: processedCounts });

      // Save to local storage
      get().saveLocalItems(processedCounts);
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

      // Normalize the master ingredient ID
      const masterIngredientId =
        count.master_ingredient_id || count.masterIngredientId;
      if (!masterIngredientId) {
        throw new Error("Master ingredient ID is required");
      }

      // Verify the master ingredient exists
      const { data: ingredient, error: ingredientError } = await supabase
        .from("master_ingredients")
        .select("id")
        .eq("id", masterIngredientId)
        .eq("organization_id", organizationId)
        .single();

      if (ingredientError || !ingredient) {
        throw new Error(`Master ingredient not found: ${masterIngredientId}`);
      }

      // Calculate the total value
      const quantity =
        typeof count.quantity === "number"
          ? count.quantity
          : parseFloat(String(count.quantity) || "0");
      const unitCost =
        typeof count.unitCost === "number"
          ? count.unitCost
          : parseFloat(String(count.unitCost) || "0");
      const totalValue = quantity * unitCost;

      console.log("Adding inventory count with data:", {
        masterIngredientId,
        quantity,
        unitCost,
        totalValue,
        location: count.location,
        status: count.status || "pending",
      });

      // First, fetch existing counts for this ingredient to calculate the correct total
      const { data: existingCounts, error: fetchError } = await supabase
        .from("inventory_counts")
        .select("*")
        .eq("master_ingredient_id", masterIngredientId)
        .eq("organization_id", organizationId);

      if (fetchError) {
        console.warn("Error fetching existing counts:", fetchError);
        // Continue with the insert even if we couldn't fetch existing counts
      } else {
        console.log(
          `Found ${existingCounts?.length || 0} existing counts for this ingredient`,
        );
      }

      // Insert into inventory_counts table
      const { data: newCount, error: insertError } = await supabase
        .from("inventory_counts")
        .insert({
          organization_id: organizationId,
          master_ingredient_id: masterIngredientId,
          quantity: quantity,
          unit_cost: unitCost,
          total_value: totalValue || 0, // Ensure we never send null or undefined
          location: count.location,
          counted_by: user.id,
          notes:
            count.notes || `Count added on ${new Date().toLocaleDateString()}`,
          status: count.status || "pending",
          count_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(
          `Failed to add inventory count: ${insertError.message}`,
        );
      }

      console.log("Successfully added inventory count:", newCount);

      // Get the current master ingredient data from the store
      const currentItems = get().items;

      // Format the new count
      const newCountFormatted = {
        id: newCount.id,
        masterIngredientId: masterIngredientId,
        master_ingredient_id: masterIngredientId,
        quantity: quantity,
        unitCost: unitCost,
        totalValue: totalValue,
        location: count.location || "Main Storage",
        countedBy: user.id,
        notes:
          count.notes || `Count added on ${new Date().toLocaleDateString()}`,
        status: count.status || "pending",
        lastUpdated: newCount.updated_at,
        created_at: newCount.created_at,
        updated_at: newCount.updated_at,
        count_date: newCount.count_date,
        ingredient: count.ingredient, // Preserve ingredient info if available
      };

      // Instead of just adding the new count, do a full refresh to get all counts
      // This ensures we have the complete and accurate data
      await get().fetchItems(true); // Force refresh to get the latest data including the new count
      toast.success("Inventory count added successfully");
    } catch (error) {
      console.error("Error adding count:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add inventory count",
      );
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

      // Find the current count to get existing values
      const currentCount = get().items.find((item) => item.id === id);
      if (!currentCount) {
        throw new Error(`Count with ID ${id} not found`);
      }

      // Prepare updates for the database
      const dbUpdates: Partial<InventoryCountDB> = {};

      // Handle quantity updates
      if (updates.quantity !== undefined) {
        const newQuantity =
          typeof updates.quantity === "number"
            ? updates.quantity
            : parseFloat(String(updates.quantity) || "0");

        dbUpdates.quantity = newQuantity;
        // Note: total_value is a generated column and will be calculated by the database
      }

      // Handle unit cost updates
      if (updates.unitCost !== undefined) {
        const newUnitCost =
          typeof updates.unitCost === "number"
            ? updates.unitCost
            : parseFloat(String(updates.unitCost) || "0");

        dbUpdates.unit_cost = newUnitCost;
        // Note: total_value is a generated column and will be calculated by the database
      }

      // Handle other updates
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      // Always update the updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();

      // Update the count in the database
      const { error: updateError } = await supabase
        .from("inventory_counts")
        .update(dbUpdates)
        .eq("id", id)
        .eq("organization_id", organizationId);

      if (updateError) {
        throw new Error(
          `Failed to update inventory count: ${updateError.message}`,
        );
      }

      // Refresh the inventory items
      await get().fetchItems();
      toast.success("Inventory count updated successfully");
    } catch (error) {
      console.error("Error updating count:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update inventory count",
      );
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

      // Delete the count from the database
      const { error: deleteError } = await supabase
        .from("inventory_counts")
        .delete()
        .eq("id", id)
        .eq("organization_id", organizationId);

      if (deleteError) {
        throw new Error(
          `Failed to delete inventory count: ${deleteError.message}`,
        );
      }

      // Refresh the inventory items
      await get().fetchItems();
      toast.success("Inventory count deleted successfully");
    } catch (error) {
      console.error("Error deleting count:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete inventory count",
      );
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

      // Get all master ingredients for reference
      const { data: ingredients, error: ingredientsError } = await supabase
        .from("master_ingredients")
        .select("id, item_code")
        .eq("organization_id", organizationId);

      if (ingredientsError) {
        throw new Error(
          `Failed to fetch master ingredients: ${ingredientsError.message}`,
        );
      }

      // Create lookup map for master ingredients by item code
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
        .map((row) => {
          const quantity = parseFloat(row["Quantity"]?.toString() || "0") || 0;
          const unitCost =
            parseFloat(
              row["Unit Cost"]?.toString().replace(/[$,]/g, "") || "0",
            ) || 0;

          return {
            organization_id: organizationId,
            master_ingredient_id: ingredientMap.get(row["Item ID"]),
            quantity: quantity,
            unit_cost: unitCost,
            // total_value is a generated column, do not include it
            location: row["Location"]?.toString() || "Main Storage",
            counted_by: user.id,
            notes: row["Notes"]?.toString() || "",
            status: "pending",
            count_date: new Date().toISOString(),
          };
        });

      if (validCounts.length === 0) {
        throw new Error("No valid inventory counts found in import data");
      }

      // Insert the counts into the database
      const { error: insertError } = await supabase
        .from("inventory_counts")
        .insert(validCounts);

      if (insertError) {
        throw new Error(
          `Failed to import inventory data: ${insertError.message}`,
        );
      }

      // Refresh the inventory items
      await get().fetchItems();
      toast.success(
        `Successfully imported ${validCounts.length} inventory counts`,
      );
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import inventory data",
      );
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

      // Delete all counts for this organization
      const { error: deleteError } = await supabase
        .from("inventory_counts")
        .delete()
        .eq("organization_id", organizationId);

      if (deleteError) {
        throw new Error(
          `Failed to clear inventory data: ${deleteError.message}`,
        );
      }

      // Clear the local state
      set({ items: [] });

      // Update local storage
      get().saveLocalItems([]);
      get().saveLastFetchTime();

      toast.success("Inventory data cleared successfully");
    } catch (error) {
      console.error("Error clearing inventory:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to clear inventory data",
      );
    }
  },
}));
