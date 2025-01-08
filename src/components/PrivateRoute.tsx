import React, { useState, useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { LoadingLogo } from "@/components/LoadingLogo";

interface PrivateRouteProps {
  children?: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("Connection error...");

  // Add debug logging
  console.log("PrivateRoute:", {
    user,
    isLoading,
    connectionError,
    retryCount,
    errorMessage,
  });

  useEffect(() => {
    let mounted = true;
    let retryTimeout: number;

    const checkConnection = async () => {
      try {
        // Simple ping to check if server is responding
        const response = await fetch(window.location.origin, {
          method: "HEAD",
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        if (mounted) {
          setConnectionError(false);
          setErrorMessage("");
          setRetryCount(0);
        }
      } catch (error) {
        console.error("Connection check error:", error);

        if (mounted) {
          setConnectionError(true);
          if (error instanceof Error) {
            setErrorMessage(
              error.message.includes("502")
                ? "Server is temporarily unavailable. Retrying..."
                : "Unable to connect to server. Retrying...",
            );
          }

          // Retry logic with exponential backoff
          if (retryCount < 5) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            console.log(`Retrying in ${delay}ms...`);
            retryTimeout = window.setTimeout(() => {
              if (mounted) {
                setRetryCount((prev) => prev + 1);
              }
            }, delay);
          } else {
            setErrorMessage(
              "Unable to establish connection. Please check your internet connection and try again.",
            );
          }
        }
      }
    };

    if (isLoading) {
      checkConnection();
    }

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [isLoading, retryCount]);

  // If we're loading or have a connection error, show the loading screen
  if (isLoading || connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <LoadingLogo
          message={connectionError ? errorMessage : "Loading..."}
          error={connectionError}
        />
      </div>
    );
  }

  // If there's no user, redirect to login
  if (!user) {
    return (
      <Navigate
        to={ROUTES.AUTH.SIGN_IN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If we have a user and no errors, render the protected content
  return children || <Outlet />;
};

export default PrivateRoute;
