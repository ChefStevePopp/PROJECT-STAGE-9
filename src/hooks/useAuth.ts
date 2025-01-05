import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("Current user:", session.user);
        console.log("User metadata:", session.user.user_metadata);
        console.log("User ID:", session.user.id);
        setUser(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Get the latest user data
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting current user:", error);
          return;
        }

        console.log("Auth state changed - Current user:", currentUser);
        console.log(
          "Auth state changed - User metadata:",
          currentUser?.user_metadata,
        );
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user has dev system role
  const isDev = Boolean(
    user?.user_metadata?.system_role === "dev" ||
      user?.user_metadata?.role === "dev",
  );

  console.log("isDev check:", isDev, "metadata:", user?.user_metadata);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return {
    user,
    isLoading,
    isDev,
    signOut,
  };
}
