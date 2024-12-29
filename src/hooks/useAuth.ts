import { useAuthBridge } from '@/lib/auth/bridge/useAuthBridge';

export function useAuth() {
  const auth = useAuthBridge();

  // Get display name from metadata, checking both new and legacy formats
  const displayName = auth.user 
    ? `${auth.user.user_metadata?.firstName || auth.user.user_metadata?.first_name || ''} ${
        auth.user.user_metadata?.lastName || auth.user.user_metadata?.last_name || ''
      }`.trim() 
    : '';

  return {
    ...auth,
    displayName,
    // Ensure all required properties are available
    user: auth.user,
    organizationId: auth.organizationId,
    isDev: auth.isDev || false,
    hasAdminAccess: auth.hasAdminAccess || false,
    isLoading: auth.isLoading || false,
    error: auth.error || null,
    signIn: auth.signIn,
    signOut: auth.signOut
  };
}