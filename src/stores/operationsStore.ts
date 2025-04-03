import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { OperationsSettings } from "@/types/operations";

interface OperationsStore {
  settings: OperationsSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updatedSettings: OperationsSettings) => Promise<void>;
}

export const useOperationsStore = create<OperationsStore>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  updateSettings: async (updatedSettings: OperationsSettings) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // Make a clean copy of the settings object without any potential circular references
      // Use a more reliable deep copy method that preserves all properties
      const cleanSettings = structuredClone(updatedSettings);

      // Ensure team_schedule is properly included in the update
      if (updatedSettings.team_schedule) {
        cleanSettings.team_schedule = updatedSettings.team_schedule;
      }

      console.log("Sending to database:", JSON.stringify(cleanSettings));

      // Perform the update with a direct RPC call to ensure it completes
      const { data, error } = await supabase
        .from("operations_settings")
        .update(cleanSettings)
        .eq("organization_id", user.user_metadata.organizationId)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log(
        "Database update successful, returned data:",
        JSON.stringify(data),
      );

      // Update the local state with the clean settings
      set({
        settings: cleanSettings,
        isLoading: false,
      });

      return data;
    } catch (error) {
      console.error("Error updating operations settings:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update settings",
        isLoading: false,
      });
      throw error; // Re-throw to allow handling in components
    }
  },

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
