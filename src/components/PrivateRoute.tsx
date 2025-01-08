import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { LoadingLogo } from "@/components/LoadingLogo";

interface PrivateRouteProps {
  children: React.ReactNode;
}

// Separate loading component to avoid re-renders
const LoadingScreen = React.memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
    <LoadingLogo message="Loading..." />
  </div>
));

LoadingScreen.displayName = "LoadingScreen";

// Main PrivateRoute component
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Handle unauthenticated state
  if (!user) {
    // Render Navigate component directly without spreading props
    return (
      <Navigate
        to={ROUTES.AUTH.SIGN_IN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Return children directly
  return <>{children}</>;
};

PrivateRoute.displayName = "PrivateRoute";

export default PrivateRoute;
