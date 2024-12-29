import { create } from 'zustand';
import { supabase } from '../supabase';
import { initializeUserOrganization, getUserOrganization } from './auth-helpers';
import { handleAuthStateChange } from './auth-state';
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
        await handleAuthStateChange(session.user, set);
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
        await handleAuthStateChange(session.user, set);
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

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      // Get or initialize organization
      const organizationId = await initializeUserOrganization(data.user.id, data.user.email || '');

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
      toast.error('Invalid email or password');
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