import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/shared/layouts";
import { AuthLayout } from "@/shared/layouts";
import { SignIn } from "@/features/auth/components/SignIn";
import { SignUp } from "@/features/auth/components/SignUp";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ROUTES } from "@/config/routes";
import { AdminRoutes } from "@/features/admin/routes";
import { KitchenRoutes } from "@/features/kitchen/routes";
import { LoadingLogo } from "@/features/shared/components";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthLayout />}>
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminRoutes />
              </PrivateRoute>
            }
          />

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

          {/* Default Routes */}
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
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
