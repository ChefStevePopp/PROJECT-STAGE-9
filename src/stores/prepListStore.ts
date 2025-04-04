import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  PrepList,
  PrepListStore,
  PrepListTemplate,
  PrepListFilters,
} from "../types/tasks";

// Helper function to get organization ID for the current user
const getUserOrganizationId = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User not authenticated");

  // Try to get organization ID from user metadata
  let organizationId = userData.user?.user_metadata?.organizationId;

  // If not found in metadata, try to get from organization_team_members table
  if (!organizationId) {
    const { data: orgData, error: orgError } = await supabase
      .from("organization_team_members")
      .select("organization_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (orgError && orgError.code !== "PGRST116") {
      console.error("Error fetching organization:", orgError);
      throw new Error("Failed to fetch organization data");
    }

    if (orgData) {
      organizationId = orgData.organization_id;
    }
  }

  // If still no organization ID, try organization_roles table
  if (!organizationId) {
    const { data: roleData, error: roleError } = await supabase
      .from("organization_roles")
      .select("organization_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (roleError && roleError.code !== "PGRST116") {
      console.error("Error fetching organization roles:", roleError);
    } else if (roleData) {
      organizationId = roleData.organization_id;
    }
  }

  if (!organizationId) throw new Error("No organization found for user");
  return { organizationId, userId: userData.user.id };
};

export const usePrepListStore = create<PrepListStore>((set, get) => ({
  prepLists: [],
  templates: [],
  isLoading: false,
  error: null,

  // Template operations
  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const { organizationId } = await getUserOrganizationId();

      const { data, error } = await supabase
        .from("prep_list_templates")
        .select("*")
        .eq("organization_id", organizationId)
        .order("title");

      if (error) throw error;

      set({ templates: data as PrepListTemplate[], isLoading: false });
    } catch (error) {
      console.error("Error fetching prep list templates:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Prep list operations
  fetchPrepLists: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const { organizationId } = await getUserOrganizationId();

      // Build the query
      let query = supabase
        .from("prep_lists")
        .select("*, template_ids")
        .eq("organization_id", organizationId);

      // Apply filters if provided
      if (filters) {
        if (filters.date) {
          query = query.eq("date", filters.date);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.assignedTo) {
          query = query.eq("assigned_to", filters.assignedTo);
        }
        if (filters.templateId) {
          // Filter by template ID in the template_ids array
          query = query.contains("template_ids", [filters.templateId]);
        }
      }

      // Order by date descending
      query = query.order("date", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      set({ prepLists: data as PrepList[], isLoading: false });
    } catch (error) {
      console.error("Error fetching prep lists:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createPrepList: async (prepList) => {
    set({ isLoading: true, error: null });
    try {
      const { organizationId, userId } = await getUserOrganizationId();

      const { data, error } = await supabase
        .from("prep_lists")
        .insert({
          ...prepList,
          organization_id: organizationId,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          template_ids: prepList.template_ids || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new prep list to the state
      const newPrepList = data as PrepList;
      set((state) => ({
        prepLists: [...state.prepLists, newPrepList],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error creating prep list:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updatePrepList: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("prep_lists")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update the prep list in the state
      set((state) => ({
        prepLists: state.prepLists.map((prepList) =>
          prepList.id === id
            ? {
                ...prepList,
                ...updates,
                updated_at: new Date().toISOString(),
              }
            : prepList,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating prep list:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deletePrepList: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Delete the prep list (tasks will be deleted via CASCADE)
      const { error } = await supabase.from("prep_lists").delete().eq("id", id);

      if (error) throw error;

      // Remove the prep list from the state
      set((state) => ({
        prepLists: state.prepLists.filter((prepList) => prepList.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting prep list:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  completePrepList: async (id, completedBy) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("prep_lists")
        .update({
          status: "completed",
          completed_at: now,
          completed_by: completedBy,
          updated_at: now,
        })
        .eq("id", id);

      if (error) throw error;

      // Update the prep list in the state
      set((state) => ({
        prepLists: state.prepLists.map((prepList) =>
          prepList.id === id
            ? {
                ...prepList,
                status: "completed",
                completed_at: now,
                completed_by: completedBy,
                updated_at: now,
              }
            : prepList,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error completing prep list:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Generate a prep list from a template
  generatePrepListFromTemplate: async (templateId, date, assignedTo) => {
    set({ isLoading: true, error: null });
    try {
      // First, get the template details
      const { data: templateData, error: templateError } = await supabase
        .from("prep_list_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      const { organizationId, userId } = await getUserOrganizationId();

      // Create a new prep list based on the template
      const { data, error } = await supabase
        .from("prep_lists")
        .insert({
          template_id: templateId,
          template_ids: [templateId], // Store the template ID in the array
          title: templateData.title,
          description: templateData.description,
          date: date,
          prep_system: templateData.prep_system,
          status: "active",
          assigned_to: assignedTo,
          organization_id: organizationId,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new prep list to the state
      const newPrepList = data as PrepList;
      set((state) => ({
        prepLists: [...state.prepLists, newPrepList],
        isLoading: false,
      }));

      return newPrepList;
    } catch (error) {
      console.error("Error generating prep list from template:", error);
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },
}));
