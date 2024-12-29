import { useAuth } from './useAuth';
import { getUserLevel, type UserLevel, USER_LEVELS, hasAccess } from '@/config/user-levels';

export function useUserLevel() {
  const { user } = useAuth();
  const userLevel = getUserLevel(user?.user_metadata);

  return {
    userLevel,
    levelInfo: USER_LEVELS[userLevel],
    hasAccess: (feature: string, action: string) => hasAccess(userLevel, feature as any, action),
    canManageUsers: USER_LEVELS[userLevel].canManageUsers,
    canManageSettings: USER_LEVELS[userLevel].canManageSettings,
    canAccessDevTools: USER_LEVELS[userLevel].canAccessDevTools
  };
}