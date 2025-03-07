import { create } from "zustand";
import { supabase } from "../supabase";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

interface AuthState {
  user: User | null;
  organizationId: string | null;
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
    const { data } = await supabase
      .from("organization_roles")
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();

    return data?.organization_id || null;
  } catch (error) {
    console.error("Error getting organization ID:", error);
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

    if (orgError) throw orgError;

    // Create owner role
    await supabase.from("organization_roles").insert({
      organization_id: org.id,
      user_id: userId,
      role: "owner",
    });

    return org.id;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organizationId: null,
  isLoading: true,
  error: null,
  isDev: false,
  hasAdminAccess: false,

  initialize: async () => {
    try {
      // Check for existing session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = session.user;

        // Get organization ID
        let organizationId = user.user_metadata?.organizationId || null;
        if (!organizationId) {
          organizationId = await getOrganizationId(user.id);
        }

        // Check if user is a dev or admin
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
          isDev,
          hasAdminAccess,
          error: null,
        });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ error: "Failed to initialize auth" });
    } finally {
      set({ isLoading: false });
    }

    // Set up a simple auth change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        const organizationId =
          user.user_metadata?.organizationId ||
          (await getOrganizationId(user.id));

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
          isDev,
          hasAdminAccess,
          error: null,
        });
      } else {
        set({
          user: null,
          organizationId: null,
          isDev: false,
          hasAdminAccess: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signIn: async (email: string, password: string, rememberMe = true) => {
    try {
      // Set session expiration to 14 days if rememberMe is true
      const expiresIn = rememberMe ? 60 * 60 * 24 * 14 : 60 * 60; // 14 days or 1 hour

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user data returned");

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
        await supabase.auth.updateUser({
          data: {
            organizationId,
            ...data.user.user_metadata,
          },
        });
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
      if (error) throw error;

      set({
        user: null,
        organizationId: null,
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
      if (error) throw error;

      // No need to update state as the auth listener will handle it
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  },
}));

// Initialize auth on app load
useAuthStore.getState().initialize();

// Set up a daily refresh timer to keep the session alive
setInterval(
  () => {
    const { user } = useAuthStore.getState();
    if (user) {
      useAuthStore.getState().refreshSession();
    }
  },
  1000 * 60 * 60 * 24,
); // Once per day
