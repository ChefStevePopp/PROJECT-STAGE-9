import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/shared/layouts";
import { AuthLayout } from "@/shared/layouts";
import { SignIn } from "@/features/auth/components/SignIn";
import { SignUp } from "@/features/auth/components/SignUp";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ROUTES } from "@/config/routes";
import { AdminRoutes } from "@/features/admin/routes";
import { KitchenRoutes } from "@/features/kitchen/routes";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
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

              {/* Redirect root to kitchen dashboard */}
              <Route
                path="/"
                element={<Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />}
              />
            </Route>

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
    </ErrorBoundary>
  );
}

export default App;
