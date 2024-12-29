import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { type KitchenRole } from '@/config/kitchen-roles';
import toast from 'react-hot-toast';

interface UserRole {
  appRole: KitchenRole;
  kitchenRole: KitchenRole;
  permissions: Record<string, boolean>;
}

interface UserRoleStore {
  userRoles: Record<string, UserRole>;
  isLoading: boolean;
  error: string | null;
  fetchUserRoles: () => Promise<void>;
  assignKitchenRole: (teamMemberId: string, role: KitchenRole) => Promise<void>;
  saveUserRoles: () => Promise<void>;
}

export const useUserRoleStore = create<UserRoleStore>((set, get) => ({
  userRoles: {},
  isLoading: false,
  error: null,

  fetchUserRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        set({ userRoles: {}, isLoading: false });
        return;
      }

      // First get all team members
      const { data: teamData, error: teamError } = await supabase
        .from('organization_team_members')
        .select('id, email, kitchen_role')
        .eq('organization_id', user.user_metadata.organizationId);

      if (teamError) throw teamError;

      // Then get all app roles
      const { data: roleData, error: roleError } = await supabase
        .from('organization_user_app_roles')
        .select('user_id, app_role, kitchen_role, permissions')
        .eq('organization_id', user.user_metadata.organizationId)
        .eq('is_active', true);

      if (roleError) throw roleError;

      // Create a map of team member IDs to roles
      const roles = teamData.reduce((acc, member) => {
        const appRole = roleData.find(r => r.user_id === member.id);
        acc[member.id] = {
          appRole: (appRole?.app_role || member.kitchen_role || 'team_member') as KitchenRole,
          kitchenRole: (appRole?.kitchen_role || member.kitchen_role || 'team_member') as KitchenRole,
          permissions: appRole?.permissions || {}
        };
        return acc;
      }, {} as Record<string, UserRole>);

      set({ userRoles: roles, isLoading: false });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      set({ error: 'Failed to load user roles', isLoading: false });
    }
  },

  assignKitchenRole: async (teamMemberId: string, role: KitchenRole) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      // First update the team member's kitchen role
      const { error: teamError } = await supabase
        .from('organization_team_members')
        .update({ kitchen_role: role })
        .eq('id', teamMemberId)
        .eq('organization_id', user.user_metadata.organizationId);

      if (teamError) throw teamError;

      // Get the team member's email
      const { data: teamMember, error: memberError } = await supabase
        .from('organization_team_members')
        .select('email')
        .eq('id', teamMemberId)
        .single();

      if (memberError) throw memberError;

      // Get or create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        filters: {
          email: teamMember.email
        }
      });

      if (authError) throw authError;

      let authUserId: string;

      if (authData.users.length === 0) {
        // Create new auth user if doesn't exist
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: teamMember.email,
          email_confirm: true,
          user_metadata: {
            organizationId: user.user_metadata.organizationId
          }
        });

        if (createError) throw createError;
        authUserId = newUser.user.id;
      } else {
        authUserId = authData.users[0].id;
      }

      // Update app role
      const { error: roleError } = await supabase
        .from('organization_user_app_roles')
        .upsert({
          organization_id: user.user_metadata.organizationId,
          user_id: authUserId,
          app_role: role,
          kitchen_role: role,
          permissions: {},
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,user_id'
        });

      if (roleError) throw roleError;

      // Update local state
      set(state => ({
        userRoles: {
          ...state.userRoles,
          [teamMemberId]: {
            appRole: role,
            kitchenRole: role,
            permissions: {}
          }
        }
      }));

      toast.success('Role assigned successfully');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      throw error;
    }
  },

  saveUserRoles: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { userRoles } = get();
      const updates = Object.entries(userRoles).map(([userId, role]) => ({
        organization_id: user.user_metadata.organizationId,
        user_id: userId,
        app_role: role.appRole,
        kitchen_role: role.kitchenRole,
        permissions: role.permissions,
        is_active: true,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('organization_user_app_roles')
        .upsert(updates, {
          onConflict: 'organization_id,user_id'
        });

      if (error) throw error;
      toast.success('Roles saved successfully');
    } catch (error) {
      console.error('Error saving user roles:', error);
      toast.error('Failed to save roles');
      throw error;
    }
  }
}));