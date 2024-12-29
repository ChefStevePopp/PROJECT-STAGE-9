import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../types/supabase';
import { bridgeSession, syncAuthStores } from './auth-bridge';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict validation of environment variables
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid or missing VITE_SUPABASE_URL. Must be a valid HTTPS URL.');
}
if (!supabaseKey) {
  throw new Error('Invalid or missing VITE_SUPABASE_ANON_KEY. Must be provided.');
}

// Initialize Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'kitchen-ai-auth',
  },
  global: {
    headers: {
      'x-kitchen-ai-client': 'web',
    },
  },
});

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    console.log('Supabase connection successful:', data);
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    toast.error('Supabase connection failed. Check your API key and URL.');
  }
};

// Enhanced auth listener
supabase.auth.onAuthStateChange(async (_event, session) => {
  try {
    if (session?.user) {
      console.log('User signed in:', session.user);
      const bridgedSession = bridgeSession(session.user);
      await syncAuthStores();
    } else {
      console.log('User logged out');
      toast.info('User logged out successfully.');
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    toast.error('An unexpected error occurred. Please try again.');
  }
});

// Start health check on initialization
testSupabaseConnection();
