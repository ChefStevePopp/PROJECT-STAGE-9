import React, { useEffect } from 'react';
import { routes } from "tempo-devtools"
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/shared/layouts';
import { SignIn } from '@/features/auth/components/SignIn';
import { SignUp } from '@/features/auth/components/SignUp';
import { PrivateRoute } from '@/components/PrivateRoute';
import { ROUTES } from '@/config/routes';
import { AdminRoutes } from '@/features/admin/routes';
import { KitchenRoutes } from '@/features/kitchen/routes';
import { LoadingLogo } from '@/features/shared/components';
import { useAuthStore } from '@/stores/authStore';
import { useNextAuthStore } from '@/lib/auth/next/auth-store';
import { authService } from '@/lib/auth/services/auth-service';
import { verifyAuthStores, syncAuthStores } from '@/lib/auth/bridge/auth-bridge';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
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
          console.warn('Auth stores inconsistent after initialization');
          await syncAuthStores();
        }

        // Set up health check interval
        const healthCheckInterval = setInterval(async () => {
          const health = await authService.checkAuthHealth();
          if (health.status === 'error') {
            console.error('Auth health check failed:', health.error);
            clearInterval(healthCheckInterval);
            await authService.signOut();
            window.location.href = ROUTES.AUTH.SIGN_IN;
          }
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(healthCheckInterval);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Reset to a safe state
        await authService.signOut();
        window.location.href = ROUTES.AUTH.SIGN_IN;
      }
    };

    initAuth();
  }, []);

  // Handle auth errors
  const handleError = async (error: Error) => {
    console.error('Application error:', error);
    if (error.message.includes('auth') || error.message.includes('fetch')) {
      try {
        await authService.signOut();
        window.location.href = ROUTES.AUTH.SIGN_IN;
      } catch (e) {
        console.error('Error handler failed:', e);
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

  return (
    <ErrorBoundary onError={handleError}>
      <Routes>
        {/* Tempo routes - add this before other routes */}
      {import.meta.env.VITE_TEMPO && useRoutes(routes)}

        {/* Auth Routes */}
        <Route path="/auth/*" element={<AuthLayout />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>

        {/* Protected Kitchen Routes */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/kitchen/*" element={<KitchenRoutes />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/*" element={<PrivateRoute><AdminRoutes /></PrivateRoute>} />

        {/* Default Routes */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
        <Route path="/" element={
          <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />
        } />
        <Route path="*" element={
          <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />
        } />
      </Routes>

      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-gray-800 text-white',
          duration: 3000,
        }}
      />
    </ErrorBoundary>
  );
}

export default App;