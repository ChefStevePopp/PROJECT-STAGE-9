import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { LoadingLogo } from "@/components/LoadingLogo";
import type { Organization } from "@/types/organization";

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  organizationId: string | null;
  isDev: boolean;
  hasAdminAccess: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Separate loading component to avoid re-renders
const LoadingScreen = React.memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
    <LoadingLogo message="Initializing..." />
  </div>
));

LoadingScreen.displayName = "LoadingScreen";

// Main AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isDev, setIsDev] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user && mounted) {
          setUser(session.user);
          setIsDev(session.user.user_metadata?.system_role === "dev");
          const orgId = session.user.user_metadata?.organizationId;
          setOrganizationId(orgId);
          setHasAdminAccess(
            session.user.user_metadata?.role === "owner" ||
              session.user.user_metadata?.role === "admin",
          );

          // Fetch organization if we have an orgId
          if (orgId) {
            const { data: org, error: orgError } = await supabase
              .from("organizations")
              .select("*")
              .eq("id", orgId)
              .single();

            if (!orgError && mounted) {
              setOrganization(org);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize auth",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setIsDev(session.user.user_metadata?.system_role === "dev");
        const orgId = session.user.user_metadata?.organizationId;
        setOrganizationId(orgId);
        setHasAdminAccess(
          session.user.user_metadata?.role === "owner" ||
            session.user.user_metadata?.role === "admin",
        );

        if (orgId) {
          const { data: org, error: orgError } = await supabase
            .from("organizations")
            .select("*")
            .eq("id", orgId)
            .single();

          if (!orgError && mounted) {
            setOrganization(org);
          }
        }
      } else {
        setUser(null);
        setOrganization(null);
        setOrganizationId(null);
        setIsDev(false);
        setHasAdminAccess(false);
      }
    });

    // Start initialization
    initializeAuth();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user data returned");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      setError(message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign out";
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    organization,
    organizationId,
    isDev,
    hasAdminAccess,
    isLoading,
    error,
    signIn,
    signOut,
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { AuthContextType };
