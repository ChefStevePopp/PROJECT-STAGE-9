import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { OperationsSettings } from "@/types/operations";

interface OperationsStore {
  settings: OperationsSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

export const useOperationsStore = create<OperationsStore>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { data, error } = await supabase
        .from("operations_settings")
        .select("*")
        .eq("organization_id", user.user_metadata.organizationId)
        .single();

      if (error) throw error;

      // Log for debugging
      console.log("Fetched operations settings:", data);

      set({
        settings: data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching operations settings:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load settings",
        isLoading: false,
      });
    }
  },
}));
