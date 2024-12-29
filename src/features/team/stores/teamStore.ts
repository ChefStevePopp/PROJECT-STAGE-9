import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { TeamMemberData } from '../types';
import type { KitchenRole } from '@/config/kitchen-roles';
import toast from 'react-hot-toast';

interface TeamStore {
  members: TeamMemberData[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  importTeam: (data: any[]) => Promise<void>;
  clearTeam: () => Promise<void>;
  saveTeam: () => Promise<void>;
  updateMember: (id: string, updates: Partial<TeamMemberData>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  members: [],
  isLoading: false,
  isImporting: false,
  error: null,

  fetchTeamMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('organization_team_members')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('last_name', { ascending: true });

      if (teamError) throw teamError;

      // Fetch app roles
      const { data: roleData, error: roleError } = await supabase
        .from('organization_user_app_roles')
        .select('user_id, kitchen_role')
        .eq('organization_id', user.user_metadata.organizationId)
        .eq('is_active', true);

      if (roleError) throw roleError;

      // Create role lookup
      const roleLookup = roleData.reduce((acc, { user_id, kitchen_role }) => {
        acc[user_id] = kitchen_role;
        return acc;
      }, {} as Record<string, KitchenRole>);

      // Transform data
      const transformedData = teamData.map(member => ({
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        phone: member.phone || '',
        avatar: member.avatar_url,
        departments: member.departments || [],
        roles: member.roles || [],
        locations: member.locations || [],
        kitchenRole: roleLookup[member.id] || 'team_member',
        lastUpdated: member.updated_at
      }));

      set({ members: transformedData, error: null });
    } catch (error) {
      console.error('Error fetching team members:', error);
      set({ error: 'Failed to load team members' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateMember: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // First update organization_team_members
      const { error: teamError } = await supabase
        .from('organization_team_members')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          avatar_url: updates.avatar,
          departments: updates.departments,
          roles: updates.roles,
          locations: updates.locations,
          kitchen_role: updates.kitchenRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (teamError) throw teamError;

      // Then update organization_user_app_roles if we have a kitchen role change
      if (updates.kitchenRole) {
        // Get the auth user ID for this team member
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
          filters: { email: updates.email }
        });

        if (authData?.users?.[0]) {
          const authUserId = authData.users[0].id;

          const { error: roleError } = await supabaseAdmin
            .from('organization_user_app_roles')
            .upsert({
              organization_id: user.user_metadata.organizationId,
              user_id: authUserId,
              app_role: updates.kitchenRole,
              kitchen_role: updates.kitchenRole,
              permissions: {},
              is_active: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'organization_id,user_id'
            });

          if (roleError) {
            console.error('Error updating app role:', roleError);
            throw roleError;
          }
        }
      }

      // Update local state
      set(state => ({
        members: state.members.map(member =>
          member.id === id ? { ...member, ...updates } : member
        )
      }));

      toast.success('Team member updated successfully');
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('organization_team_members')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        members: state.members.filter(member => member.id !== id)
      }));

      toast.success('Team member deleted successfully');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member');
      throw error;
    }
  },

  importTeam: async (data) => {
    set({ isImporting: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // Process and validate import data
      const importData = data.map(row => ({
        organization_id: user.user_metadata.organizationId,
        first_name: row['First Name'],
        last_name: row['Last name'],
        email: row['Email'],
        phone: row['Mobile phone'],
        punch_id: row['Punch ID'],
        departments: row['Departments']?.split(',').map((d: string) => d.trim()) || [],
        roles: row['Roles']?.split(',').map((r: string) => r.trim()) || [],
        locations: row['Locations']?.split(',').map((l: string) => l.trim()) || [],
        kitchen_role: 'team_member',
        updated_at: new Date().toISOString()
      }));

      // Import team members
      const { error } = await supabase
        .from('organization_team_members')
        .upsert(importData, {
          onConflict: 'organization_id,email'
        });

      if (error) throw error;

      // Refresh team members
      await get().fetchTeamMembers();
      toast.success('Team data imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import team data');
      throw error;
    } finally {
      set({ isImporting: false });
    }
  },

  clearTeam: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('organization_team_members')
        .delete()
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;
      
      set({ members: [] });
      toast.success('Team data cleared successfully');
    } catch (error) {
      console.error('Error clearing team:', error);
      toast.error('Failed to clear team data');
    }
  },

  saveTeam: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { members } = get();
      
      // Process members sequentially to avoid conflicts
      for (const member of members) {
        const { error: upsertError } = await supabase
          .from('organization_team_members')
          .upsert({
            organization_id: user.user_metadata.organizationId,
            first_name: member.firstName,
            last_name: member.lastName,
            email: member.email,
            phone: member.phone,
            departments: member.departments,
            roles: member.roles,
            locations: member.locations,
            kitchen_role: member.kitchenRole,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'organization_id,email'
          });

        if (upsertError) throw upsertError;
      }
      
      toast.success('Team data saved successfully');
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error('Failed to save team data');
    }
  }
}));