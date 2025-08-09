import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/auth/simplified-auth";
import { LoadingLogo } from "@/features/shared/components/LoadingLogo";

interface Props {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingLogo message="Checking authentication..." />
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    console.log(
      "[PRIVATE_ROUTE] User not authenticated, redirecting to sign in",
    );
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default PrivateRoute;
