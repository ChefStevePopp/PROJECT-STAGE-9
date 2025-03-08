import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { TeamMember, TeamStore } from "@/features/team/types";
import { logActivity } from "@/lib/activity-logger";
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
      set({ error: "Failed to load team members", members: [] });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTeamMember: async (id: string, updates: Partial<TeamMember>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // Get the current member data
      const { data: currentMember, error: fetchError } = await supabase
        .from("organization_team_members")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!currentMember) throw new Error("Team member not found");

      // Prepare update data - only include fields that exist in the database
      const updateData: any = {
        organization_id: user.user_metadata.organizationId,
        first_name: updates.first_name || currentMember.first_name,
        last_name: updates.last_name || currentMember.last_name,
        display_name: updates.display_name || currentMember.display_name,
        email: updates.email || currentMember.email,
        phone: updates.phone || currentMember.phone || null,
        punch_id: updates.punch_id || currentMember.punch_id || null,
        avatar_url: updates.avatar_url || currentMember.avatar_url || null,
        roles: updates.roles || currentMember.roles || [],
        departments: updates.departments || currentMember.departments || [],
        locations: updates.locations || currentMember.locations || [],
        notification_preferences:
          updates.notification_preferences ||
          currentMember.notification_preferences ||
          null,
        updated_at: new Date().toISOString(),
      };

      // Handle kitchen_role and kitchen_stations directly
      if (updates.kitchen_role) {
        updateData.kitchen_role = updates.kitchen_role;
      }

      if (updates.kitchen_stations) {
        updateData.kitchen_stations = updates.kitchen_stations;
      }

      // Perform update
      const { error: updateError } = await supabase
        .from("organization_team_members")
        .update(updateData)
        .match({ id, organization_id: user.user_metadata.organizationId });

      if (updateError) throw updateError;

      // Fetch fresh data to ensure we have the latest state
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "team_member_updated",
        details: {
          team_member_id: id,
          changes: updates,
        },
      });
      await get().fetchTeamMembers();
      toast.success("Team member updated successfully");
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
      throw error;
    }
  },

  createTeamMember: async (member: Omit<TeamMember, "id">) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // No need to prepare metadata, we'll use the columns directly

      const { data, error } = await supabase
        .from("organization_team_members")
        .insert([
          {
            first_name: member.first_name,
            last_name: member.last_name,
            display_name: member.display_name,
            email: member.email,
            phone: member.phone || null,
            punch_id: member.punch_id || null,
            avatar_url: member.avatar_url,
            roles: member.roles || [],
            departments: member.departments || [],
            locations: member.locations || [],
            notification_preferences: member.notification_preferences || null,
            kitchen_role: member.kitchen_role || "team_member",
            kitchen_stations: member.kitchen_stations || [],
            organization_id: user.user_metadata.organizationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Fetch fresh data to ensure we have the latest state
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "team_member_added",
        details: {
          team_member_id: data.id,
          team_member: member,
        },
      });
      await get().fetchTeamMembers();
      toast.success("Team member added successfully");
    } catch (error) {
      console.error("Error creating team member:", error);
      set({ error: "Failed to create team member" });
      toast.error("Failed to add team member");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTeamMember: async (id: string) => {
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
        .match({ id, organization_id: user.user_metadata.organizationId });

      if (error) throw error;

      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "team_member_removed",
        details: {
          team_member_id: id,
        },
      });
      // Fetch fresh data to ensure we have the latest state
      await get().fetchTeamMembers();
      toast.success("Team member removed successfully");
    } catch (error) {
      console.error("Error deleting team member:", error);
      set({ error: "Failed to delete team member" });
      toast.error("Failed to remove team member");
    } finally {
      set({ isLoading: false });
    }
  },
}));
