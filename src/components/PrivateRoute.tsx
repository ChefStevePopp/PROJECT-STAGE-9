import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/auth/simplified-auth";
import { ROUTES } from "@/config/routes";
import { LoadingLogo } from "@/components/LoadingLogo";
import { AlertTriangle } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const LoadingScreen = React.memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
    <LoadingLogo message="Loading..." />
  </div>
));

LoadingScreen.displayName = "LoadingScreen";

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, organizationId, isLoading, isDev, hasAdminAccess } =
    useAuthStore();
  const location = useLocation();

  console.log("[PrivateRoute] Current state:", {
    hasUser: !!user,
    organizationId,
    isLoading,
    isDev,
    hasAdminAccess,
    pathname: location.pathname,
  });

  // Handle loading state with timeout
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Handle unauthenticated state
  if (!user) {
    console.log("[PrivateRoute] No user, redirecting to sign in");
    return (
      <Navigate
        to={ROUTES.AUTH.SIGN_IN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Allow access to admin routes if user has admin access, regardless of organization
  const isAdminRoute = location.pathname.includes("/admin");
  const isAccountRoute = location.pathname.includes("/account");

  if (isAdminRoute && hasAdminAccess) {
    console.log("[PrivateRoute] Admin route access granted");
    return <>{children}</>;
  }

  if (isAccountRoute) {
    console.log("[PrivateRoute] Account route access granted");
    return <>{children}</>;
  }

  // Handle missing organization for regular routes
  if (!organizationId && !isDev) {
    console.log("[PrivateRoute] No organization access:", {
      organizationId,
      isDev,
      hasAdminAccess,
      pathname: location.pathname,
      userMetadata: user.user_metadata,
    });

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
            <br />
            Org ID: {organizationId || "None"}
            <br />
            Path: {location.pathname}
            <br />
            Has Admin: {hasAdminAccess ? "Yes" : "No"}
          </div>
        </div>
      </div>
    );
  }

  console.log("[PrivateRoute] Access granted");
  return <>{children}</>;
};

export default PrivateRoute;
