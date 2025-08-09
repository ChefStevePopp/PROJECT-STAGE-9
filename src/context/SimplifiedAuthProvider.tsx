import React from "react";

// This provider is no longer needed - we're using Supabase auth directly
// Keeping minimal implementation for backward compatibility
interface AuthProviderProps {
  children: React.ReactNode;
}

export const SimplifiedAuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  return <>{children}</>;
};
