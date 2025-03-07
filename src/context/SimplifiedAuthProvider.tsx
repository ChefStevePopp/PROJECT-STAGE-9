import React, { useEffect } from "react";
import { useAuthStore } from "../lib/auth/simplified-auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const SimplifiedAuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    // Initialize auth when the provider mounts
    const unsubscribe = useAuthStore.getState().initialize();

    // Clean up subscription when the provider unmounts
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return <>{children}</>;
};
