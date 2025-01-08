import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Default development credentials
export const DEFAULT_CREDENTIALS = {
  email: "office@memphisfirebbq.com",
  password: "memphis2024!",
  organizationId: "memphis-fire-bbq-01",
  role: "owner",
  accessLevel: "admin",
};

// Create a single instance of the Supabase client
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmlna3d0c3F2cnZhaGZwcnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNDY5NzAsImV4cCI6MjA0NzcyMjk3MH0.8iDPpzIxyoiUs2K9scek0lEbkc463uwXTaeOL3LpQgg";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "kitchen-ai-auth",
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Development mode helpers
export const isDevelopment = process.env.NODE_ENV === "development";

export async function getDefaultSession() {
  if (!isDevelopment) return null;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_CREDENTIALS.email,
      password: DEFAULT_CREDENTIALS.password,
    });

    if (error) throw error;
    return data.session;
  } catch (error) {
    console.warn("Failed to get default session:", error);
    return null;
  }
}

// Debug logging in development
if (isDevelopment) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", { event, session });
  });
}
