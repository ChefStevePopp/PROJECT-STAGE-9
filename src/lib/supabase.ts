import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Create a single supabase instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Export a single instance
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: "kitchen-ai-auth",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export helper to check auth state
export const getAuthUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
};
