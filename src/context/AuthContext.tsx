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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isDev, setIsDev] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organization data
  const fetchOrganization = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Organization not found");

      setOrganization(data);
    } catch (error) {
      console.error("Error fetching organization:", error);
      setError("Failed to load organization data");
    }
  };

  // Initialize auth state
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

        // Fetch organization data if we have an orgId
        if (orgId) {
          fetchOrganization(orgId);
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsDev(session.user.user_metadata?.system_role === "dev");
        const orgId = session.user.user_metadata?.organizationId;
        setOrganizationId(orgId);
        setHasAdminAccess(
          session.user.user_metadata?.role === "owner" ||
            session.user.user_metadata?.role === "admin",
        );

        // Fetch organization data if we have an orgId
        if (orgId) {
          fetchOrganization(orgId);
        }
      } else {
        setUser(null);
        setOrganization(null);
        setOrganizationId(null);
        setIsDev(false);
        setHasAdminAccess(false);
      }
      setIsLoading(false);
    });

    return () => {
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign out";
      setError(message);
      throw error;
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <LoadingLogo message="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <LoadingLogo message={error} error />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { AuthContextType };
