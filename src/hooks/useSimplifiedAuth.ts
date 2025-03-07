import { useAuthStore } from "../lib/auth/simplified-auth";

export function useAuth() {
  const {
    user,
    organizationId,
    isLoading,
    error,
    isDev,
    hasAdminAccess,
    signIn,
    signOut,
  } = useAuthStore();

  return {
    user,
    organizationId,
    isLoading,
    error,
    isDev,
    hasAdminAccess,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
