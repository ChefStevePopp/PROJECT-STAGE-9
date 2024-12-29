import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vcfigkwtsqvrvahfprya.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmlna3d0c3F2cnZhaGZwcnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNDY5NzAsImV4cCI6MjA0NzcyMjk3MH0.8iDPpzIxyoiUs2K9scek0lEbkc463uwXTaeOL3LpQgg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using development defaults');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'kitchen-ai-auth',
    flowType: 'pkce'
  }
});