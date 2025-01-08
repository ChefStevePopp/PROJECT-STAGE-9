import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

class SupabaseClient {
  private static instance: ReturnType<typeof createClient>;
  private static url = "https://vcfigkwtsqvrvahfprya.supabase.co";
  private static key =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmlna3d0c3F2cnZhaGZwcnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNDY5NzAsImV4cCI6MjA0NzcyMjk3MH0.8iDPpzIxyoiUs2K9scek0lEbkc463uwXTaeOL3LpQgg";

  private constructor() {}

  public static getInstance(): ReturnType<typeof createClient> {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = createClient<Database>(
        SupabaseClient.url,
        SupabaseClient.key,
        {
          auth: {
            persistSession: true,
            storageKey: "kitchen-ai-auth",
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        },
      );
    }
    return SupabaseClient.instance;
  }

  public static async checkHealth(): Promise<boolean> {
    try {
      const { error } = await this.getInstance()
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
}

// Export the singleton instance
export const supabase = SupabaseClient.getInstance();

// Export the health check function
export const checkSupabaseHealth = () => SupabaseClient.checkHealth();
