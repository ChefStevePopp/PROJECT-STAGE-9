import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { LoadingLogo } from "@/components/LoadingLogo";

interface PrivateRouteProps {
  children?: React.ReactNode;
  className?: string;
}

export const PrivateRoute = React.forwardRef<HTMLDivElement, PrivateRouteProps>(
  ({ children, className }, ref) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
      return (
        <div
          ref={ref}
          className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center ${className || ""}`}
        >
          <LoadingLogo message="Loading..." />
        </div>
      );
    }

    if (!user) {
      return (
        <Navigate
          to={ROUTES.AUTH.SIGN_IN}
          state={{ from: location.pathname }}
          replace
        />
      );
    }

    if (children) {
      return <>{children}</>;
    }

    return <Outlet />;
  },
);

PrivateRoute.displayName = "PrivateRoute";
