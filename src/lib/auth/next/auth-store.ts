import { create } from 'zustand';
import { supabase } from '../../supabase';
import { handleAuthStateChange } from './auth-state';
import type { AuthState } from '../types';
import toast from 'react-hot-toast';

export const useNextAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      await handleAuthStateChange({ 
        session: null, 
        isLoading: true, 
        error: null 
      }, set);
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        error: 'Failed to initialize auth',
        isLoading: false 
      });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Invalid email or password');
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({
        session: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ error: 'Failed to sign out' });
      throw error;
    }
  }
}));

// Initialize auth on store creation
useNextAuthStore.getState().initialize();