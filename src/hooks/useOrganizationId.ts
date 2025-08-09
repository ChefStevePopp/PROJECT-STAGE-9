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

  console.log("🏢 useOrganizationId hook state:", {
    hasUser: !!user,
    userId: user?.id,
    storeOrgId,
    authLoading,
    hookIsLoading: isLoading,
  });

  // Derived state
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Effect to update organization ID when auth state changes
  useEffect(() => {
    console.log("🔄 useOrganizationId effect triggered:", {
      authLoading,
      storeOrgId,
      hasUser: !!user,
    });

    // If auth is still loading, wait
    if (authLoading) {
      console.log("⏳ Auth still loading, waiting...");
      setIsLoading(true);
      return;
    }

    // If we have an organization ID from the store, use it
    if (storeOrgId) {
      console.log("✅ Using organization ID from store:", storeOrgId);
      setOrganizationId(storeOrgId);
      setError(null);
      setIsLoading(false);
      return;
    }

    // If we have a user but no organization ID
    if (user && !storeOrgId) {
      console.log("👤 User exists but no org ID, checking metadata...");
      // Try to get organization ID from user metadata
      const metadataOrgId = user.user_metadata?.organizationId;
      if (metadataOrgId) {
        console.log("📋 Found org ID in metadata:", metadataOrgId);
        setOrganizationId(metadataOrgId);
        setError(null);
      } else {
        console.log("❌ No org ID found in metadata");
        setOrganizationId(null);
        setError("No organization associated with this user");
      }
    } else if (!user) {
      // No user is logged in
      console.log("❌ No user authenticated");
      setOrganizationId(null);
      setError("User is not authenticated");
    }

    console.log(
      "✅ useOrganizationId effect completed, setting loading to false",
    );
    setIsLoading(false);
  }, [authLoading, storeOrgId, user]);

  const result = { organizationId, isLoading, error };
  console.log("🏁 useOrganizationId returning:", result);
  return result;
}
