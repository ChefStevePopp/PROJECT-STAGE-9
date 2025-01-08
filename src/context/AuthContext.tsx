import React, { createContext, useContext, useEffect, useState } from "react";
import {
  supabase,
  isDevelopment,
  getDefaultSession,
  DEFAULT_CREDENTIALS,
} from "@/lib/supabase";
import { LoadingLogo } from "@/components/LoadingLogo";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  organizationId: string | null;
  isDev: boolean;
  hasAdminAccess: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isDev, setIsDev] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data with fallback for development
  const loadUserData = async (userId: string) => {
    try {
      const { data: orgRole, error: orgError } = await supabase
        .from("organization_roles")
        .select("organization_id, role")
        .eq("user_id", userId)
        .single();

      if (orgError) {
        if (isDevelopment) {
          console.log("Using default organization data");
          setOrganizationId(DEFAULT_CREDENTIALS.organizationId);
          setIsDev(true);
          setHasAdminAccess(true);
          return;
        }
        throw orgError;
      }

      setOrganizationId(orgRole.organization_id);
      setIsDev(isDevelopment);
      setHasAdminAccess(orgRole.role === "owner" || orgRole.role === "admin");
    } catch (error) {
      console.error("Error loading user data:", error);
      if (isDevelopment) {
        setOrganizationId(DEFAULT_CREDENTIALS.organizationId);
        setIsDev(true);
        setHasAdminAccess(true);
      } else {
        throw error;
      }
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // In development, try to use default session if none exists
        if (!session && isDevelopment) {
          const defaultSession = await getDefaultSession();
          if (defaultSession?.user && mounted) {
            setUser(defaultSession.user);
            await loadUserData(defaultSession.user.id);
            setIsLoading(false);
            return;
          }
        }

        if (session?.user && mounted) {
          setUser(session.user);
          await loadUserData(session.user.id);
        } else if (mounted) {
          setUser(null);
          setOrganizationId(null);
          setIsDev(isDevelopment);
          setHasAdminAccess(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize auth",
          );
          toast.error("Authentication error");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setOrganizationId(null);
        setIsDev(isDevelopment);
        setHasAdminAccess(false);
        return;
      }

      if (session.user) {
        setUser(session.user);
        await loadUserData(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user data returned");

      toast.success("Signed in successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setOrganizationId(null);
      setIsDev(isDevelopment);
      setHasAdminAccess(false);

      // Clear local storage
      localStorage.removeItem("kitchen-ai-auth");

      toast.success("Signed out successfully");
      window.location.href = "/auth/signin";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign out";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    organizationId,
    isDev,
    hasAdminAccess,
    isLoading,
    error,
    signIn,
    signOut,
  };

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
