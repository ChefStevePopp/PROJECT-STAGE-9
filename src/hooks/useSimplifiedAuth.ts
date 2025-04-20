import { useAuthStore } from "../lib/auth/simplified-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const authState = useAuthStore();
  const {
    user,
    organizationId,
    isLoading: authLoading,
    error: authError,
    isDev,
    hasAdminAccess,
    signIn,
    signOut,
  } = authState;

  // Always initialize these hooks, regardless of conditions
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(authLoading);
  const [error, setError] = useState<string | null>(authError);

  // Fetch actual organization data from the database
  useEffect(() => {
    // Create a fallback organization object
    const fallbackOrg = organizationId
      ? {
          id: organizationId,
          name: user?.user_metadata?.organizationName || "My Organization",
          owner_id: user?.id,
          settings: user?.user_metadata?.organizationSettings || {
            business_type: "restaurant",
          },
        }
      : null;

    // If no organizationId, just set the organization to null and return early
    if (!organizationId) {
      setOrganization(null);
      setIsLoading(false);
      return;
    }

    // Define the fetch function
    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("organizations")
          .select(
            "id, name, owner_id, settings, legal_name, contact_email, contact_phone",
          )
          .eq("id", organizationId)
          .single();

        if (error) {
          console.error("Error fetching organization:", error);
          setError(error.message);
          // Fallback to mock organization if fetch fails
          setOrganization(fallbackOrg);
        } else if (data) {
          setOrganization(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error in fetchOrganization:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setOrganization(fallbackOrg);
      } finally {
        setIsLoading(false);
      }
    };

    // Execute the fetch
    fetchOrganization();
  }, [organizationId, user]);

  // Always return the same shape of object to avoid hook count changes
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
