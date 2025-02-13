import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface VendorTemplate {
  id: string;
  vendor_id: string;
  name: string;
  file_type: "csv" | "pdf" | "photo";
  column_mapping?: Record<string, string>;
  ocr_regions?: Array<{
    name: string;
    type: string;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
  created_at: string;
  updated_at: string;
}

interface VendorTemplatesStore {
  templates: VendorTemplate[];
  isLoading: boolean;
  error: string | null;
  fetchTemplates: (vendorId: string) => Promise<void>;
  saveTemplate: (
    template: Omit<VendorTemplate, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateTemplate: (
    id: string,
    updates: Partial<VendorTemplate>,
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useVendorTemplatesStore = create<VendorTemplatesStore>(
  (set, get) => ({
    templates: [],
    isLoading: false,
    error: null,

    fetchTemplates: async (vendorId: string) => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from("vendor_templates")
          .select("*")
          .eq("vendor_id", vendorId);

        if (error) throw error;

        set({
          templates: data || [],
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching templates:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to load templates",
          isLoading: false,
        });
      }
    },

    saveTemplate: async (template) => {
      try {
        const { data, error } = await supabase
          .from("vendor_templates")
          .insert([template])
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          templates: [...state.templates, data],
        }));
      } catch (error) {
        console.error("Error saving template:", error);
        throw error;
      }
    },

    updateTemplate: async (id, updates) => {
      try {
        const { error } = await supabase
          .from("vendor_templates")
          .update(updates)
          .eq("id", id);

        if (error) throw error;

        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        }));
      } catch (error) {
        console.error("Error updating template:", error);
        throw error;
      }
    },

    deleteTemplate: async (id) => {
      try {
        const { error } = await supabase
          .from("vendor_templates")
          .delete()
          .eq("id", id);

        if (error) throw error;

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
      }
    },
  }),
);
