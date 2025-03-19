import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { ColumnMapping } from "@/types/csv-mappings";
import toast from "react-hot-toast";

interface CSVMappingsStore {
  mappings: any[];
  loading: boolean;
  error: string | null;
  fetchMappings: (organizationId: string, format: string) => Promise<void>;
  saveMapping: (
    organizationId: string,
    format: string,
    typeId: string | null,
    mapping: ColumnMapping,
  ) => Promise<boolean>;
  deleteMapping: (id: string) => Promise<void>;
}

export const useCSVMappingsStore = create<CSVMappingsStore>((set, get) => ({
  mappings: [],
  loading: false,
  error: null,

  fetchMappings: async (organizationId: string, format: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from("csv_mappings")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("format", format);

      if (error) throw error;

      set({ mappings: data || [], loading: false });
    } catch (error) {
      console.error("Error fetching CSV mappings:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load CSV mappings",
        loading: false,
      });
    }
  },

  saveMapping: async (
    organizationId: string,
    format: string,
    typeId: string | null,
    mapping: ColumnMapping,
  ) => {
    try {
      set({ loading: true, error: null });

      // Prepare the record for database with explicit field mapping
      const record = {
        id: mapping.id,
        name: mapping.name,
        organization_id: organizationId,
        format: format,
        format_type: typeId,
        column_mapping: mapping,
        config: {}, // Add empty object for config column to satisfy not-null constraint
        // Explicitly map each field to ensure database compatibility
        employee_name_field: mapping.employeeNameField || null,
        role_field: mapping.roleField || null,
        date_field: mapping.dateField || null,
        start_time_field: mapping.startTimeField || null,
        end_time_field: mapping.endTimeField || null,
        break_duration_field: mapping.breakDurationField || null,
        notes_field: mapping.notesField || null,
        monday_field: mapping.mondayField || null,
        tuesday_field: mapping.tuesdayField || null,
        wednesday_field: mapping.wednesdayField || null,
        thursday_field: mapping.thursdayField || null,
        friday_field: mapping.fridayField || null,
        saturday_field: mapping.saturdayField || null,
        sunday_field: mapping.sundayField || null,
        time_format: mapping.timeFormat || null,
        role_pattern: mapping.rolePattern || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if the mapping already exists
      const { data: existingMapping } = await supabase
        .from("csv_mappings")
        .select("id")
        .eq("id", mapping.id)
        .single();

      let result;
      if (existingMapping) {
        // Update existing mapping
        result = await supabase
          .from("csv_mappings")
          .update({
            name: mapping.name,
            column_mapping: mapping,
            config: {}, // Add empty object for config column to satisfy not-null constraint
            // Explicitly map each field with null fallbacks
            employee_name_field: mapping.employeeNameField || null,
            role_field: mapping.roleField || null,
            date_field: mapping.dateField || null,
            start_time_field: mapping.startTimeField || null,
            end_time_field: mapping.endTimeField || null,
            break_duration_field: mapping.breakDurationField || null,
            notes_field: mapping.notesField || null,
            monday_field: mapping.mondayField || null,
            tuesday_field: mapping.tuesdayField || null,
            wednesday_field: mapping.wednesdayField || null,
            thursday_field: mapping.thursdayField || null,
            friday_field: mapping.fridayField || null,
            saturday_field: mapping.saturdayField || null,
            sunday_field: mapping.sundayField || null,
            time_format: mapping.timeFormat || null,
            role_pattern: mapping.rolePattern || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", mapping.id);
      } else {
        // Insert new mapping
        result = await supabase.from("csv_mappings").insert([record]);
      }

      if (result.error) throw result.error;

      // Refresh mappings
      await get().fetchMappings(organizationId, format);
      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error saving CSV mapping:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to save CSV mapping",
        loading: false,
      });
      return false;
    }
  },

  deleteMapping: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from("csv_mappings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        mappings: state.mappings.filter((mapping) => mapping.id !== id),
        loading: false,
      }));
      toast.success("Mapping deleted successfully");
    } catch (error) {
      console.error("Error deleting CSV mapping:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete CSV mapping",
        loading: false,
      });
      throw error;
    }
  },
}));
