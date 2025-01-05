import { supabase } from '../../supabase';
import type { AuthSession, AuthState } from '../types';
import { initializeSession, refreshSession, validateSession } from './auth-helpers';

export async function handleAuthStateChange(state: AuthState, set: (updates: Partial<AuthState>) => void) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      set({ session: null, isLoading: false });
      return;
    }

    // Initialize or refresh session
    const authSession = state.session 
      ? await refreshSession(state.session)
      : await initializeSession(session.user);

    set({ 
      session: authSession,
      isLoading: false,
      error: null
    });

    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      try {
        const isValid = await validateSession(state.session);
        if (!isValid) {
          clearInterval(refreshInterval);
          set({ session: null, error: 'Session expired' });
          return;
        }

        const refreshed = await refreshSession(state.session!);
        set({ session: refreshed });
      } catch (error) {
        console.error('Session refresh error:', error);
        clearInterval(refreshInterval);
        set({ session: null, error: 'Session refresh failed' });
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    // Cleanup on unmount
    return () => clearInterval(refreshInterval);
  } catch (error) {
    console.error('Auth state change error:', error);
    set({ 
      session: null, 
      isLoading: false,
      error: error instanceof Error ? error.message : 'Authentication error'
    });
  }
}