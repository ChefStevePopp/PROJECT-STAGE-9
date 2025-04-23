import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create Supabase client with extended session duration and retry configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-application-name": "kitchen-ai",
    },
    fetch: (url, options) => {
      // Add retry logic for network failures
      const fetchWithRetry = async (retriesLeft = 3, delay = 1000) => {
        try {
          return await fetch(url, options);
        } catch (error) {
          if (retriesLeft <= 0) throw error;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetry(retriesLeft - 1, delay * 2);
        }
      };
      return fetchWithRetry();
    },
  },
});
