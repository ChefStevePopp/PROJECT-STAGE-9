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

  // Use organization directly from auth store to avoid duplicate state and re-renders
  const organization =
    authState.organization ||
    (organizationId
      ? {
          id: organizationId,
          name: user?.user_metadata?.organizationName || "My Organization",
          owner_id: user?.id,
          settings: user?.user_metadata?.organizationSettings || {
            business_type: "restaurant",
          },
        }
      : null);

  // Always return the same shape of object to avoid hook count changes
  return {
    user,
    organization,
    organizationId,
    isLoading: authLoading,
    error: authError,
    isDev,
    hasAdminAccess,
    signIn,
    signOut,
    isAuthenticated: !!user,
    // Ensure backward compatibility
    displayName: user
      ? `${user.user_metadata?.firstName || ""} ${user.user_metadata?.lastName || ""}`.trim()
      : "",
  };
}
