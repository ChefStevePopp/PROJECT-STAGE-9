import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { initializeUserOrganization, getUserOrganization } from '@/lib/auth-helpers';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  organizationId: string | null;
  isLoading: boolean;
  error: string | null;
  isDev: boolean;
  hasAdminAccess: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organizationId: null,
  isLoading: true,
  error: null,
  isDev: false,
  hasAdminAccess: false,

  initialize: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        // Check if user is a dev from metadata
        const isDev = Boolean(
          session.user.user_metadata?.system_role === 'dev' ||
          session.user.user_metadata?.role === 'dev'
        );
        
        // Admin access is granted to devs and organization owners/admins
        const hasAdminAccess = Boolean(
          isDev ||
          session.user.user_metadata?.role === 'owner' ||
          session.user.user_metadata?.role === 'admin'
        );

        // Get or create organization
        const organizationId = await initializeUserOrganization(
          session.user.id,
          session.user.email || ''
        );

        // Update user metadata with organization ID if needed
        if (!session.user.user_metadata?.organizationId) {
          await supabase.auth.updateUser({
            data: {
              organizationId,
              ...session.user.user_metadata
            }
          });
        }

        set({
          user: session.user,
          organizationId,
          isDev,
          hasAdminAccess,
          error: null
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: 'Failed to initialize auth' });
    } finally {
      set({ isLoading: false });
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const isDev = Boolean(
          session.user.user_metadata?.system_role === 'dev' ||
          session.user.user_metadata?.role === 'dev'
        );

        const hasAdminAccess = Boolean(
          isDev ||
          session.user.user_metadata?.role === 'owner' ||
          session.user.user_metadata?.role === 'admin'
        );

        // Get organization info
        const orgData = await getUserOrganization(session.user.id);

        set({
          user: session.user,
          organizationId: orgData?.organization_id || null,
          isDev,
          hasAdminAccess,
          error: null
        });
      } else {
        set({
          user: null,
          organizationId: null,
          isDev: false,
          hasAdminAccess: false
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error('Invalid email or password');
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Get or initialize organization
      const organizationId = await initializeUserOrganization(
        data.user.id,
        data.user.email || ''
      );

      // Update user metadata if needed
      if (!data.user.user_metadata?.organizationId) {
        await supabase.auth.updateUser({
          data: {
            organizationId,
            ...data.user.user_metadata
          }
        });
      }

      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
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
        hasAdminAccess: false
      });

      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  }
}));

// Initialize auth on app load
useAuthStore.getState().initialize();