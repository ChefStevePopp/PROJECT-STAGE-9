import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { TeamMember, TeamStore } from "@/features/team/types";
import toast from "react-hot-toast";

export const useTeamStore = create<TeamStore>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchTeamMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { data, error } = await supabase
        .from("organization_team_members")
        .select("*")
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;
      set({ members: data || [], error: null });
    } catch (error) {
      console.error("Error fetching team members:", error);
      set({ error: "Failed to load team members" });
    } finally {
      set({ isLoading: false });
    }
  },

  createTeamMember: async (member) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { data, error } = await supabase
        .from("organization_team_members")
        .insert([
          { ...member, organization_id: user.user_metadata.organizationId },
        ])
        .select()
        .single();

      if (error) throw error;

      const { members } = get();
      set({ members: [...members, data], error: null });
      toast.success("Team member added successfully");
    } catch (error) {
      console.error("Error creating team member:", error);
      set({ error: "Failed to create team member" });
      toast.error("Failed to add team member");
    } finally {
      set({ isLoading: false });
    }
  },

  updateTeamMember: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { error } = await supabase
        .from("organization_team_members")
        .update(updates)
        .eq("id", id)
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;

      const { members } = get();
      set({
        members: members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        error: null,
      });
      toast.success("Team member updated successfully");
    } catch (error) {
      console.error("Error updating team member:", error);
      set({ error: "Failed to update team member" });
      toast.error("Failed to update team member");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTeamMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { error } = await supabase
        .from("organization_team_members")
        .delete()
        .eq("id", id)
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;

      const { members } = get();
      set({
        members: members.filter((m) => m.id !== id),
        error: null,
      });
      toast.success("Team member removed successfully");
    } catch (error) {
      console.error("Error deleting team member:", error);
      set({ error: "Failed to delete team member" });
      toast.error("Failed to remove team member");
    } finally {
      set({ isLoading: false });
    }
  },

  importTeamMembers: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // Transform Excel data to match team member structure
      const teamMembers = data.map((row) => ({
        organization_id: user.user_metadata.organizationId,
        id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        first_name: row.firstName || row["First Name"] || "",
        last_name: row.lastName || row["Last Name"] || "",
        email: row.email || row["Email"] || "",
        phone: row.phone || row["Phone"] || "",
        role: row.role || row["Role"] || "staff",
        kitchen_role: row.kitchenRole || row["Kitchen Role"] || "",
        station: row.station || row["Station"] || "",
        punch_id: row.punchId || row["Punch ID"] || "",
        status: "active",
        start_date:
          row.startDate || row["Start Date"] || new Date().toISOString(),
      }));

      const { data: inserted, error } = await supabase
        .from("organization_team_members")
        .insert(teamMembers)
        .select();

      if (error) throw error;

      const { members } = get();
      set({
        members: [...members, ...inserted],
        error: null,
      });
      toast.success(`${inserted.length} team members imported successfully`);
    } catch (error) {
      console.error("Error importing team members:", error);
      set({ error: "Failed to import team members" });
      toast.error("Failed to import team members");
    } finally {
      set({ isLoading: false });
    }
  },
}));
