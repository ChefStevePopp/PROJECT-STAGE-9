import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, organization, isLoading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log("PrivateRoute:", {
    path: location.pathname,
    isLoading,
    hasUser: !!user,
    hasOrg: !!organization,
    userMetadata: user?.user_metadata,
  });

  // Handle loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Handle unauthenticated state
  if (!user) {
    console.log("No user, redirecting to login");
    return (
      <Navigate
        to={ROUTES.AUTH.SIGN_IN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Handle missing organization for non-dev users
  const isDev = user.user_metadata?.system_role === "dev";
  if (!organization && !isDev && !location.pathname.includes("/admin")) {
    console.log("No organization, showing error");
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            No Organization Access
          </h2>
          <p className="text-gray-400">
            You don't have access to any organization. Please contact your
            administrator.
          </p>
          <div className="text-xs text-gray-500 mt-4">
            User ID: {user.id}
            <br />
            Role: {user.user_metadata?.role || "None"}
          </div>
        </div>
      </div>
    );
  }

  // Return children directly
  return <>{children}</>;
};

PrivateRoute.displayName = "PrivateRoute";

export default PrivateRoute;
