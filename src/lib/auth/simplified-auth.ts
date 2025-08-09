import { create } from "zustand";
import { supabase } from "../supabase";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

interface AuthState {
  user: User | null;
  organizationId: string | null;
  organization: any | null;
  isLoading: boolean;
  error: string | null;
  isDev: boolean;
  hasAdminAccess: boolean;
  initialize: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Helper to get organization ID from user or database
async function getOrganizationId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("organization_roles")
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error getting organization ID:", error);
      return null;
    }

    return data?.organization_id || null;
  } catch (error) {
    console.error("Error getting organization ID:", error);
    return null;
  }
}

// Helper to fetch organization details
async function fetchOrganizationDetails(
  organizationId: string,
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (error) {
      console.error("Error fetching organization details:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching organization details:", error);
    return null;
  }
}

// Create a new organization if needed
async function createOrganization(
  userId: string,
  email: string,
): Promise<string> {
  try {
    // Create new organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: `${email.split("@")[0]}'s Organization`,
        owner_id: userId,
        settings: {
          business_type: "restaurant",
          default_timezone: "America/Toronto",
          multi_unit: false,
          currency: "CAD",
          date_format: "MM/DD/YYYY",
          time_format: "12h",
        },
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      throw orgError;
    }

    // Create owner role
    const { error: roleError } = await supabase
      .from("organization_roles")
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: "owner",
      });

    if (roleError) {
      console.error("Error creating owner role:", roleError);
    }

    return org.id;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organizationId: null,
  organization: null,
  isLoading: true,
  error: null,
  isDev: false,
  hasAdminAccess: false,

  initialize: async () => {
    const currentState = get();

    // Prevent multiple simultaneous initializations
    if (isInitializing) {
      return;
    }
    isInitializing = true;
    set({ isLoading: true, error: null });

    try {
      // Get session with timeout
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        set({ error: null, isLoading: false });
        return;
      }

      if (session?.user) {
        const user = session.user;

        // Get basic user info from metadata
        const organizationId = user.user_metadata?.organizationId || null;
        const isDev = Boolean(
          user.user_metadata?.system_role === "dev" ||
            user.user_metadata?.role === "dev",
        );
        const hasAdminAccess = Boolean(
          isDev ||
            user.user_metadata?.role === "owner" ||
            user.user_metadata?.role === "admin",
        );

        set({
          user,
          organizationId,
          organization: null, // Load later if needed
          isDev,
          hasAdminAccess,
          error: null,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          organizationId: null,
          organization: null,
          isDev: false,
          hasAdminAccess: false,
          error: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: null,
        isLoading: false,
        user: null,
        organizationId: null,
        organization: null,
        isDev: false,
        hasAdminAccess: false,
      });
    } finally {
      isInitializing = false;
    }
  },

  signIn: async (email: string, password: string, rememberMe = true) => {
    try {
      // Set session persistence based on rememberMe
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        console.error("Supabase sign in error:", error);
        throw error;
      }
      if (!data.user || !data.session) {
        throw new Error("No user data or session returned");
      }

      // Ensure session is properly set in storage
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        console.error("Error setting session:", sessionError);
        throw sessionError;
      }

      // Get or create organization
      let organizationId = data.user.user_metadata?.organizationId;

      if (!organizationId) {
        // Check if user has an organization
        organizationId = await getOrganizationId(data.user.id);

        // If not, create one
        if (!organizationId) {
          organizationId = await createOrganization(
            data.user.id,
            data.user.email || "",
          );
        }

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            organizationId,
            ...data.user.user_metadata,
          },
        });

        if (updateError) {
          console.error("Error updating user metadata:", updateError);
        }
      }

      // Verify session is persisted
      const {
        data: { session: verifySession },
      } = await supabase.auth.getSession();
      if (!verifySession) {
        console.warn("Session not properly persisted after sign in");
      }

      toast.success("Signed in successfully");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Invalid email or password");
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase sign out error:", error);
        throw error;
      }

      set({
        user: null,
        organizationId: null,
        organization: null,
        isDev: false,
        hasAdminAccess: false,
      });

      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  },

  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        throw error;
      }
      // No need to update state as the auth listener will handle it
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  },
}));

// Initialize auth on app load - but only once
let isInitialized = false;
let authSubscription: any = null;
let isInitializing = false;

if (!isInitialized) {
  isInitialized = true;

  // Initialize auth state immediately
  useAuthStore.getState().initialize();

  // Set up auth state change listener with simplified logic
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    // Prevent processing during initialization
    if (isInitializing) {
      return;
    }

    const currentState = useAuthStore.getState();

    // Handle sign out - simple and direct
    if (event === "SIGNED_OUT" || !session) {
      useAuthStore.setState({
        user: null,
        organizationId: null,
        organization: null,
        isDev: false,
        hasAdminAccess: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Handle sign in - only update if we don't have this user AND not currently loading
    if (
      session?.user &&
      (!currentState.user || currentState.user.id !== session.user.id) &&
      !currentState.isLoading
    ) {
      const user = session.user;
      const organizationId = user.user_metadata?.organizationId || null;
      const isDev = Boolean(
        user.user_metadata?.system_role === "dev" ||
          user.user_metadata?.role === "dev",
      );
      const hasAdminAccess = Boolean(
        isDev ||
          user.user_metadata?.role === "owner" ||
          user.user_metadata?.role === "admin",
      );

      // Update state directly without re-initialization
      useAuthStore.setState({
        user,
        organizationId,
        organization: null, // Will be loaded later if needed
        isDev,
        hasAdminAccess,
        isLoading: false,
        error: null,
      });
    }
  });

  authSubscription = subscription;
}
