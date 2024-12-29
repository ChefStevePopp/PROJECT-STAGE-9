import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { TeamMemberData } from '@/features/team/types';
import type { KitchenRole } from '@/config/kitchen-roles';
import toast from 'react-hot-toast';

interface TeamStore {
  members: TeamMemberData[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  updateMember: (id: string, updates: Partial<TeamMemberData>) => Promise<void>;
  updateKitchenRole: (memberId: string, role: KitchenRole) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  importTeam: (data: any[]) => Promise<void>;
  clearTeam: () => Promise<void>;
  saveTeam: () => Promise<void>;
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

      const { data, error } = await supabase
        .from('organization_team_members')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('last_name', { ascending: true });

      if (error) throw error;

      const transformedData = data.map(member => ({
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        phone: member.phone || '',
        punchId: member.punch_id || '',
        avatar: member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.first_name}-${member.last_name}`,
        departments: member.departments || [],
        roles: member.roles || [],
        locations: member.locations || [],
        kitchenRole: member.kitchen_role || 'team_member',
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

      const { error } = await supabase
        .from('organization_team_members')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          punch_id: updates.punchId,
          avatar_url: updates.avatar,
          departments: updates.departments,
          roles: updates.roles,
          locations: updates.locations,
          kitchen_role: updates.kitchenRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

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

  // ... rest of the store implementation remains the same
}));