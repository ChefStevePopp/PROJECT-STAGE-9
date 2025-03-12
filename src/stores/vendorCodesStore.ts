import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  VendorCode,
  VendorCodeWithIngredient,
  VendorPriceHistory,
  VendorPriceTrend,
} from "@/types/vendor-codes";
import toast from "react-hot-toast";

interface VendorCodesStore {
  vendorCodes: VendorCodeWithIngredient[];
  priceHistory: VendorPriceHistory[];
  priceTrends: VendorPriceTrend[];
  isLoading: boolean;
  error: string | null;
  fetchVendorCodes: (
    ingredientId?: string,
  ) => Promise<VendorCodeWithIngredient[]>;
  fetchPriceHistory: (
    ingredientId: string,
    vendorId?: string,
  ) => Promise<VendorPriceHistory[]>;
  fetchPriceTrends: (
    ingredientId?: string,
    vendorId?: string,
  ) => Promise<VendorPriceTrend[]>;
  addVendorCode: (
    vendorCode: Omit<VendorCode, "id" | "created_at" | "updated_at">,
  ) => Promise<VendorCode | null>;
  updateVendorCode: (id: string, updates: Partial<VendorCode>) => Promise<void>;
  deleteVendorCode: (id: string) => Promise<void>;
  setCurrentVendorCode: (id: string) => Promise<void>;
  addPriceHistory: (
    priceRecord: Omit<VendorPriceHistory, "id" | "created_at">,
  ) => Promise<VendorPriceHistory | null>;
}

export const useVendorCodesStore = create<VendorCodesStore>((set, get) => ({
  vendorCodes: [],
  priceHistory: [],
  priceTrends: [],
  isLoading: false,
  error: null,

  fetchVendorCodes: async (ingredientId?: string) => {
    try {
      set({ isLoading: true, error: null });

      let query = supabase.from("current_vendor_codes").select("*");

      if (ingredientId) {
        query = query.eq("master_ingredient_id", ingredientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({
        vendorCodes: data || [],
        isLoading: false,
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching vendor codes:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load vendor codes",
        isLoading: false,
      });
      return [];
    }
  },

  fetchPriceHistory: async (ingredientId: string, vendorId?: string) => {
    try {
      set({ isLoading: true, error: null });

      let query = supabase
        .from("vendor_price_history")
        .select("*")
        .eq("master_ingredient_id", ingredientId)
        .order("effective_date", { ascending: false });

      if (vendorId) {
        query = query.eq("vendor_id", vendorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({
        priceHistory: data || [],
        isLoading: false,
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching price history:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load price history",
        isLoading: false,
      });
      return [];
    }
  },

  fetchPriceTrends: async (ingredientId?: string, vendorId?: string) => {
    try {
      set({ isLoading: true, error: null });

      let query = supabase
        .from("vendor_price_trends")
        .select("*")
        .order("effective_date", { ascending: false });

      if (ingredientId) {
        query = query.eq("master_ingredient_id", ingredientId);
      }

      if (vendorId) {
        query = query.eq("vendor_id", vendorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({
        priceTrends: data || [],
        isLoading: false,
      });

      return data || [];
    } catch (error) {
      console.error("Error fetching price trends:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load price trends",
        isLoading: false,
      });
      return [];
    }
  },

  addVendorCode: async (vendorCode) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from("vendor_codes")
        .insert([vendorCode])
        .select()
        .single();

      if (error) throw error;

      // Refresh vendor codes
      await get().fetchVendorCodes();

      set({ isLoading: false });
      toast.success("Vendor code added successfully");
      return data;
    } catch (error) {
      console.error("Error adding vendor code:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to add vendor code",
        isLoading: false,
      });
      toast.error("Failed to add vendor code");
      return null;
    }
  },

  updateVendorCode: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from("vendor_codes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Refresh vendor codes
      await get().fetchVendorCodes();

      set({ isLoading: false });
      toast.success("Vendor code updated successfully");
    } catch (error) {
      console.error("Error updating vendor code:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update vendor code",
        isLoading: false,
      });
      toast.error("Failed to update vendor code");
    }
  },

  deleteVendorCode: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from("vendor_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh vendor codes
      await get().fetchVendorCodes();

      set({ isLoading: false });
      toast.success("Vendor code deleted successfully");
    } catch (error) {
      console.error("Error deleting vendor code:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete vendor code",
        isLoading: false,
      });
      toast.error("Failed to delete vendor code");
    }
  },

  setCurrentVendorCode: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // First get the vendor code to get the master_ingredient_id and vendor_id
      const { data: vendorCode, error: fetchError } = await supabase
        .from("vendor_codes")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Update the vendor code to be current
      const { error: updateError } = await supabase
        .from("vendor_codes")
        .update({ is_current: true })
        .eq("id", id);

      if (updateError) throw updateError;

      // Refresh vendor codes
      await get().fetchVendorCodes();

      set({ isLoading: false });
      toast.success("Current vendor code updated successfully");
    } catch (error) {
      console.error("Error setting current vendor code:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to set current vendor code",
        isLoading: false,
      });
      toast.error("Failed to set current vendor code");
    }
  },

  addPriceHistory: async (priceRecord) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from("vendor_price_history")
        .insert([priceRecord])
        .select()
        .single();

      if (error) throw error;

      // Refresh price history
      await get().fetchPriceHistory(
        priceRecord.master_ingredient_id,
        priceRecord.vendor_id,
      );

      set({ isLoading: false });
      toast.success("Price history added successfully");
      return data;
    } catch (error) {
      console.error("Error adding price history:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to add price history",
        isLoading: false,
      });
      toast.error("Failed to add price history");
      return null;
    }
  },
}));
