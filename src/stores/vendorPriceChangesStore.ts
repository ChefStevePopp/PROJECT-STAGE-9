import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { MasterIngredient } from "@/types/master-ingredient";

export interface PriceChange {
  id: string;
  organization_id: string;
  vendor_id: string;
  item_code: string;
  product_name: string;
  old_price: number;
  new_price: number;
  change_percent: number;
  created_at: string;
  invoice_date: string;
  master_ingredient?: MasterIngredient;
}

interface VendorPriceChangesStore {
  priceChanges: PriceChange[];
  isLoading: boolean;
  error: string | null;
  fetchPriceChanges: (days?: number) => Promise<void>;
}

export const useVendorPriceChangesStore = create<VendorPriceChangesStore>(
  (set) => ({
    priceChanges: [],
    isLoading: false,
    error: null,

    fetchPriceChanges: async (days = 30) => {
      try {
        set({ isLoading: true, error: null });

        // Fetch price changes with invoice date
        const { data: priceChangesData, error: priceChangesError } =
          await supabase
            .from("vendor_price_changes")
            .select("*")
            .gte(
              "created_at",
              new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
            )
            .order("created_at", { ascending: false });

        if (priceChangesError) throw priceChangesError;

        // Get all unique item codes from the price changes
        const itemCodes = [
          ...new Set(priceChangesData?.map((change) => change.item_code) || []),
        ];

        // Fetch master ingredients for these item codes
        const { data: masterIngredientsData, error: masterIngredientsError } =
          await supabase
            .from("master_ingredients_with_categories")
            .select("*")
            .in("item_code", itemCodes);

        if (masterIngredientsError) throw masterIngredientsError;

        // Create a map of item codes to master ingredients for quick lookup
        const masterIngredientsMap = (masterIngredientsData || []).reduce(
          (map, ingredient) => {
            map[ingredient.item_code] = ingredient;
            return map;
          },
          {} as Record<string, MasterIngredient>,
        );

        // Combine the price changes with master ingredient data
        const enrichedPriceChanges = (priceChangesData || []).map((change) => ({
          ...change,
          master_ingredient: masterIngredientsMap[change.item_code],
          // If product_name is not available in the price change, use the one from master ingredient
          product_name:
            change.product_name ||
            masterIngredientsMap[change.item_code]?.product ||
            "Unknown Product",
        }));

        set({
          priceChanges: enrichedPriceChanges,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching price changes:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load price changes",
          isLoading: false,
        });
      }
    },
  }),
);
