// src/lib/auth/bridge/useAuthBridge.ts
import { useEffect, useState, useCallback } from 'react';
import { authService } from '../services/auth-service';
import { sessionService } from '../services/session-service';
import type { AuthSession } from '../types';
import { logger } from '../utils/logger';

export function useAuthBridge() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        await authService.initialize();
        const currentSession = await authService.getSession();
        setSession(currentSession);
      } catch (err) {
        logger.error('Auth initialization failed:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sign in handler
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const newSession = await authService.signIn(email, password);
      setSession(newSession);
    } catch (err) {
      logger.error('Sign in failed:', err);
      setError('Invalid email or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out handler
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setSession(null);
    } catch (err) {
      logger.error('Sign out failed:', err);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user: session?.user || null,
    session,
    isLoading,
    error,
    signIn,
    signOut,
    organizationId: session?.organizationId || null,
    isDev: session?.isDev || false,
    hasAdminAccess: session?.hasAdminAccess || false,
  };
}
