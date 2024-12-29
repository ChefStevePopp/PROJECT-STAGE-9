import { useAuth } from '@/features/auth/hooks/useAuth';
import { PERMISSIONS } from '@/config/permissions';

export const useAdminAccess = () => {
  const { user } = useAuth();

  const hasAccess = (feature: keyof typeof PERMISSIONS.admin) => {
    if (!user) return false;
    
    const userRole = user.role as keyof typeof PERMISSIONS;
    return PERMISSIONS[userRole]?.[feature]?.view ?? false;
  };

  const canEdit = (feature: keyof typeof PERMISSIONS.admin) => {
    if (!user) return false;
    
    const userRole = user.role as keyof typeof PERMISSIONS;
    return PERMISSIONS[userRole]?.[feature]?.edit ?? false;
  };

  const canDelete = (feature: keyof typeof PERMISSIONS.admin) => {
    if (!user) return false;
    
    const userRole = user.role as keyof typeof PERMISSIONS;
    return PERMISSIONS[userRole]?.[feature]?.delete ?? false;
  };

  return {
    hasAccess,
    canEdit,
    canDelete,
    isAdmin: user?.role === 'admin'
  };
};

export default useAdminAccess;