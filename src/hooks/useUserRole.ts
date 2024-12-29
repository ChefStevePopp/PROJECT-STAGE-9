import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useUserRoleStore } from '@/stores/userRoleStore';
import { hasPermission, type KitchenRole } from '@/config/kitchen-roles';

export function useUserRole() {
  const { user } = useAuth();
  const { userRoles } = useUserRoleStore();

  const kitchenRole = useMemo(() => {
    if (!user) return undefined;
    
    // Dev users always get owner role
    if (user.user_metadata?.system_role === 'dev') {
      return 'owner' as KitchenRole;
    }

    // Default to team_member if no role is found
    return userRoles[user.id]?.kitchenRole || 'team_member';
  }, [userRoles, user]);

  const checkPermission = (feature: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    if (!kitchenRole) return false;
    return hasPermission(kitchenRole, feature, action);
  };

  return {
    kitchenRole,
    checkPermission
  };
}