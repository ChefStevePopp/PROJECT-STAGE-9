import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDev: boolean;
  organization: { id: string } | null;
  user: { id: string; user_metadata: any } | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isDev: false,
  organization: null,
  user: null,
});

const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", {
        session,
        metadata: session?.user?.user_metadata,
        organizationId: session?.user?.user_metadata?.organizationId,
      });
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state change:", {
        session,
        metadata: session?.user?.user_metadata,
        organizationId: session?.user?.user_metadata?.organizationId,
      });
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Compute context value
  const contextValue = {
    session,
    isAuthenticated: !!session,
    isLoading,
    isDev: session?.user?.user_metadata?.role === "dev",
    organization: session?.user?.user_metadata?.organizationId
      ? {
          id: session.user.user_metadata.organizationId,
        }
      : null,
    user: session?.user
      ? {
          id: session.user.id,
          user_metadata: session.user.user_metadata,
        }
      : null,
  };

  // Debug log
  console.log("Auth context value:", {
    isAuthenticated: contextValue.isAuthenticated,
    isDev: contextValue.isDev,
    organization: contextValue.organization,
    userMetadata: session?.user?.user_metadata,
  });

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
export default AuthProvider;
