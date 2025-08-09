import React from "react";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import { MainLayout, AuthLayout } from "@/shared/layouts";
import { SignIn } from "@/features/auth/components/SignIn";
import { SignUp } from "@/features/auth/components/SignUp";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ROUTES } from "@/config/routes";
import { AdminRoutes } from "@/features/admin/routes";
import { KitchenRoutes } from "@/features/kitchen/routes";
import { LoadingLogo } from "@/features/shared/components";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/lib/auth/simplified-auth";
import routes from "tempo-routes";

function App() {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingLogo
          message="Initializing authentication..."
          timeout={3000}
          onTimeout={() => {
            console.error("App loading timeout - forcing completion");
            // Force the loading state to false to prevent infinite loading
            useAuthStore.setState({ isLoading: false });
          }}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Tempo routes */}
        {import.meta.env.VITE_TEMPO && useRoutes(routes)}

        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
          </Route>

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

          {/* Account Routes */}
          <Route
            path="/account/*"
            element={
              <PrivateRoute>
                <AdminRoutes />
              </PrivateRoute>
            }
          />

          {/* Default Routes */}
          <Route
            path="/"
            element={<Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />}
          />

          {/* Tempo routes catchall */}
          {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

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
    </ErrorBoundary>
  );
}

export default App;
