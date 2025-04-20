import { useState, useEffect } from "react";
import { useAuthStore } from "../lib/auth/simplified-auth";

export function useOrganizationId() {
  // Always initialize these hooks at the top level
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth state
  const authState = useAuthStore();
  const {
    user,
    organizationId: storeOrgId,
    isLoading: authLoading,
  } = authState;

  // Derived state
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Effect to update organization ID when auth state changes
  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    // If we have an organization ID from the store, use it
    if (storeOrgId) {
      setOrganizationId(storeOrgId);
      setError(null);
      setIsLoading(false);
      return;
    }

    // If we have a user but no organization ID
    if (user && !storeOrgId) {
      // Try to get organization ID from user metadata
      const metadataOrgId = user.user_metadata?.organizationId;
      if (metadataOrgId) {
        setOrganizationId(metadataOrgId);
        setError(null);
      } else {
        setOrganizationId(null);
        setError("No organization associated with this user");
      }
    } else if (!user) {
      // No user is logged in
      setOrganizationId(null);
      setError("User is not authenticated");
    }

    setIsLoading(false);
  }, [authLoading, storeOrgId, user]);

  return { organizationId, isLoading, error };
}
