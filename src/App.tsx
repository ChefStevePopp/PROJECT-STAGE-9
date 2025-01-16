<<<<<<< HEAD
import React, { useEffect } from "react";
import { routes } from "tempo-devtools";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import { MainLayout, AuthLayout } from "@/shared/layouts";
=======
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/shared/layouts";
import { AuthLayout } from "@/shared/layouts";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
import { SignIn } from "@/features/auth/components/SignIn";
import { SignUp } from "@/features/auth/components/SignUp";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ROUTES } from "@/config/routes";
import { AdminRoutes } from "@/features/admin/routes";
import { KitchenRoutes } from "@/features/kitchen/routes";
<<<<<<< HEAD
import { LoadingLogo } from "@/features/shared/components";
import { useAuthStore } from "@/stores/authStore";
import { useNextAuthStore } from "@/lib/auth/next/auth-store";
import { authService } from "@/lib/auth/services/auth-service";
import {
  verifyAuthStores,
  syncAuthStores,
} from "@/lib/auth/bridge/auth-bridge";
=======
import { AuthProvider } from "@/context/AuthContext";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
<<<<<<< HEAD
  const { isLoading: legacyLoading } = useAuthStore();
  const { isLoading: nextLoading } = useNextAuthStore();
  const isLoading = legacyLoading || nextLoading;

  // Initialize auth system
  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.initialize();

        // Verify store consistency after initialization
        if (!verifyAuthStores()) {
          console.warn("Auth stores inconsistent after initialization");
          await syncAuthStores();
        }

        // Set up health check interval
        const healthCheckInterval = setInterval(
          async () => {
            const health = await authService.checkAuthHealth();
            if (health.status === "error") {
              console.error("Auth health check failed:", health.error);
              clearInterval(healthCheckInterval);
              await authService.signOut();
              window.location.href = ROUTES.AUTH.SIGN_IN;
            }
          },
          5 * 60 * 1000,
        ); // Check every 5 minutes

        return () => clearInterval(healthCheckInterval);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Reset to a safe state
        await authService.signOut();
        window.location.href = ROUTES.AUTH.SIGN_IN;
      }
    };

    initAuth();
  }, []);

  // Handle auth errors
  const handleError = async (error: Error) => {
    console.error("Application error:", error);
    if (error.message.includes("auth") || error.message.includes("fetch")) {
      try {
        await authService.signOut();
        window.location.href = ROUTES.AUTH.SIGN_IN;
      } catch (e) {
        console.error("Error handler failed:", e);
        window.location.reload();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingLogo message="Loading..." />
      </div>
    );
  }

  // Use the useRoutes hook for Tempo routes
  const tempoRoutes =
    import.meta.env.VITE_TEMPO && routes ? useRoutes(routes) : null;

  return (
    <ErrorBoundary onError={handleError}>
      <Routes>
        {/* Tempo routes */}
        {tempoRoutes}
=======
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
            </Route>

            {/* Protected Routes with MainLayout */}
            <Route
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              {/* Kitchen Routes */}
              <Route path="/kitchen/*" element={<KitchenRoutes />} />
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa

              {/* Redirect root to kitchen dashboard */}
              <Route
                path="/"
                element={<Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />}
              />
            </Route>

<<<<<<< HEAD
        {/* Protected Kitchen Routes */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/kitchen/*" element={<KitchenRoutes />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <AdminRoutes />
            </PrivateRoute>
          }
        />

        {/* Default Routes */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
        <Route
          path="/"
          element={<Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />}
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-gray-800 text-white",
          duration: 3000,
        }}
      />
=======
            {/* Admin Routes (separate layout) */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminRoutes />
                </PrivateRoute>
              }
            />

            {/* Account Routes (under Admin layout) */}
            <Route
              path="/account/*"
              element={
                <PrivateRoute>
                  <AdminRoutes />
                </PrivateRoute>
              }
            />

            {/* Catch all redirect */}
            <Route
              path="*"
              element={<Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />}
            />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              className: "bg-gray-800 text-white",
              duration: 3000,
            }}
          />
        </div>
      </AuthProvider>
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
    </ErrorBoundary>
  );
}

export default App;
