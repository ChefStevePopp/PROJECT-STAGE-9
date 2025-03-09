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

  // Create a mock organization object if organizationId exists but organization object is missing
  const organization = organizationId
    ? {
        id: organizationId,
        name: user?.user_metadata?.organizationName || "My Organization",
        owner_id: user?.id,
        settings: user?.user_metadata?.organizationSettings || {
          business_type: "restaurant",
        },
      }
    : null;

  return {
    user,
    organization,
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
