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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
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
          supabase
            .from("organizations")
            .select("*")
            .eq("id", orgId)
            .single()
            .then(({ data: org }) => {
              if (org) setOrganization(org);
            });
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
          supabase
            .from("organizations")
            .select("*")
            .eq("id", orgId)
            .single()
            .then(({ data: org }) => {
              if (org) setOrganization(org);
            });
        }
      } else {
        setUser(null);
        setOrganization(null);
        setOrganizationId(null);
        setIsDev(false);
        setHasAdminAccess(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
