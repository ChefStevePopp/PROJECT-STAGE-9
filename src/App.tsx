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

// Memoized route components to prevent unnecessary re-renders
const ProtectedAdminRoutes = React.memo(() => (
  <PrivateRoute>
    <AdminRoutes />
  </PrivateRoute>
));

const ProtectedKitchenRoutes = React.memo(() => (
  <PrivateRoute>
    <MainLayout>
      <KitchenRoutes />
    </MainLayout>
  </PrivateRoute>
));

// Add display names for debugging
ProtectedAdminRoutes.displayName = "ProtectedAdminRoutes";
ProtectedKitchenRoutes.displayName = "ProtectedKitchenRoutes";

function App() {
  // Extract root props to avoid key prop spreading
  const rootProps = {
    id: "root",
    className:
      "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div {...rootProps}>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/admin/*" element={<ProtectedAdminRoutes />} />
            <Route path="/kitchen/*" element={<ProtectedKitchenRoutes />} />

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
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
