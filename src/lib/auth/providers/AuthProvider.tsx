// src/lib/auth/providers/AuthProvider.tsx
import React, { createContext, useContext } from 'react';
import { useAuthBridge } from '../bridge/useAuthBridge';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AuthContextValue {
  user: User | null;
  organizationId: string | null;
  isDev: boolean;
  hasAdminAccess: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthBridge();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
