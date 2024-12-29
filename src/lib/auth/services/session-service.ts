// src/lib/auth/services/session-service.ts
import { supabase } from '@/lib/supabase';
import { AuthSession } from '../types';
import { authStorage } from '../utils/auth-storage';
import { logger } from '../utils/logger';
import { AuthSessionError } from '../errors/auth-errors';

class SessionService {
  async validateSession(session: AuthSession): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return Boolean(user && user.id === session.user.id);
    } catch {
      return false;
    }
  }

  async refreshSession(session: AuthSession): Promise<AuthSession> {
    try {
      const {
        data: { session: refreshedSession },
        error,
      } = await supabase.auth.refreshSession();

      if (error) throw error;
      if (!refreshedSession) {
        throw new AuthSessionError('No session returned from refresh');
      }

      const updatedSession: AuthSession = {
        ...session,
        user: refreshedSession.user,
        lastRefreshed: new Date().toISOString(),
      };

      authStorage.setItem('session', updatedSession);
      return updatedSession;
    } catch (error) {
      logger.error('Failed to refresh session', error);
      throw new AuthSessionError('Failed to refresh session');
    }
  }

  getStoredSession(): AuthSession | null {
    return authStorage.getItem<AuthSession>('session');
  }

  clearSession(): void {
    authStorage.removeItem('session');
  }
}

export const sessionService = new SessionService();
