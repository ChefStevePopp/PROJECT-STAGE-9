import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = "https://vcfigkwtsqvrvahfprya.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmlna3d0c3F2cnZhaGZwcnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNDY5NzAsImV4cCI6MjA0NzcyMjk3MH0.8iDPpzIxyoiUs2K9scek0lEbkc463uwXTaeOL3LpQgg";

// Create the Supabase client immediately
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: "kitchen-ai-auth",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Health check function
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("organizations")
      .select("count")
      .limit(1)
      .single();

    return !error;
  } catch (error) {
    console.error("Supabase health check failed:", error);
    return false;
  }
}
