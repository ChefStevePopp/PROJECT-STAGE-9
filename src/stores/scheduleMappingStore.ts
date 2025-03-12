import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { ColumnMapping } from "@/features/admin/components/sections/ScheduleManager/components/CSVConfiguration";
import toast from "react-hot-toast";

interface ScheduleMappingStore {
  mappings: ColumnMapping[];
  isLoading: boolean;
  error: string | null;
  fetchMappings: () => Promise<ColumnMapping[]>;
  saveMapping: (mapping: ColumnMapping) => Promise<void>;
  deleteMapping: (id: string) => Promise<void>;
}

export const useScheduleMappingStore = create<ScheduleMappingStore>(
  (set, get) => ({
    mappings: [],
    isLoading: false,
    error: null,

    fetchMappings: async () => {
      try {
        set({ isLoading: true, error: null });

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.user_metadata?.organizationId) {
          throw new Error("No organization ID found");
        }

        const { data, error } = await supabase
          .from("csv_mappings")
          .select("*")
          .eq("organization_id", user.user_metadata.organizationId)
          .eq("format", "schedule");

        if (error) throw error;

        // Transform database records to ColumnMapping format
        const mappings: ColumnMapping[] = data.map((record) => ({
          id: record.id,
          name: record.name,
          format: record.format_type || "standard",
          employeeNameField: record.employee_name_field || "",
          roleField: record.role_field || "",
          dateField: record.date_field || "",
          startTimeField: record.start_time_field || "",
          endTimeField: record.end_time_field || "",
          breakDurationField: record.break_duration_field || "",
          notesField: record.notes_field || "",
          mondayField: record.monday_field || "",
          tuesdayField: record.tuesday_field || "",
          wednesdayField: record.wednesday_field || "",
          thursdayField: record.thursday_field || "",
          fridayField: record.friday_field || "",
          saturdayField: record.saturday_field || "",
          sundayField: record.sunday_field || "",
          timeFormat: record.time_format || "",
          rolePattern: record.role_pattern || "",
        }));

        set({ mappings, isLoading: false });
        return mappings;
      } catch (error) {
        console.error("Error fetching schedule mappings:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load schedule mappings",
          isLoading: false,
        });
        return [];
      }
    },

    saveMapping: async (mapping: ColumnMapping) => {
      try {
        set({ isLoading: true, error: null });

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.user_metadata?.organizationId) {
          throw new Error("No organization ID found");
        }

        // Prepare the record for database
        const record = {
          id: mapping.id || crypto.randomUUID(),
          name: mapping.name,
          organization_id: user.user_metadata.organizationId,
          format: "schedule", // This is the format type in the database
          format_type: mapping.format, // This is standard, weekly, or custom
          employee_name_field: mapping.employeeNameField,
          role_field: mapping.roleField,
          date_field: mapping.dateField,
          start_time_field: mapping.startTimeField,
          end_time_field: mapping.endTimeField,
          break_duration_field: mapping.breakDurationField,
          notes_field: mapping.notesField,
          monday_field: mapping.mondayField,
          tuesday_field: mapping.tuesdayField,
          wednesday_field: mapping.wednesdayField,
          thursday_field: mapping.thursdayField,
          friday_field: mapping.fridayField,
          saturday_field: mapping.saturdayField,
          sunday_field: mapping.sundayField,
          time_format: mapping.timeFormat,
          role_pattern: mapping.rolePattern,
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
          const { id, created_at, ...updateData } = record;
          result = await supabase
            .from("csv_mappings")
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq("id", mapping.id);
        } else {
          // Insert new mapping
          result = await supabase.from("csv_mappings").insert([record]);
        }

        if (result.error) throw result.error;

        // Refresh mappings
        await get().fetchMappings();
        set({ isLoading: false });
        toast.success("Mapping saved successfully");
      } catch (error) {
        console.error("Error saving schedule mapping:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to save schedule mapping",
          isLoading: false,
        });
        toast.error("Failed to save mapping");
        throw error;
      }
    },

    deleteMapping: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        const { error } = await supabase
          .from("csv_mappings")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Update local state
        set((state) => ({
          mappings: state.mappings.filter((mapping) => mapping.id !== id),
          isLoading: false,
        }));

        toast.success("Mapping deleted successfully");
      } catch (error) {
        console.error("Error deleting schedule mapping:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete schedule mapping",
          isLoading: false,
        });
        toast.error("Failed to delete mapping");
        throw error;
      }
    },
  }),
);
