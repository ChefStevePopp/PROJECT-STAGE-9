import { create } from "zustand";
import { supabase } from "@/lib/supabase";

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

        const { data, error } = await supabase
          .from("vendor_price_changes")
          .select("*")
          .gte(
            "created_at",
            new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        set({
          priceChanges: data || [],
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
