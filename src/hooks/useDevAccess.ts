import { useAuth } from '@/hooks/useAuth';

export function useDevAccess() {
  const { user } = useAuth();
  
  const isDev = Boolean(
    user?.user_metadata?.system_role === 'dev' || 
    user?.user_metadata?.role === 'dev' ||
    user?.raw_user_meta_data?.system_role === 'dev' ||
    user?.raw_user_meta_data?.role === 'dev'
  );
  
  return {
    isDev,
    canBypassRestrictions: isDev,
    canAccessDevTools: isDev,
    canAccessAllOrgs: isDev
  };
}