// src/lib/auth/bridge/auth-bridge.ts
import { useAuthStore } from '@/stores/authStore';
import { useNextAuthStore } from '../next/auth-store';
import type { AuthSession } from '../types';
import type { User } from '@supabase/supabase-js';
import { AUTH_CONSTANTS } from '../constants/auth-constants';
import toast from 'react-hot-toast';

export function bridgeSession(legacyUser: User | null): AuthSession | null {
  if (!legacyUser) return null;

  try {
    return {
      user: legacyUser,
      organizationId: legacyUser.user_metadata?.organizationId || null,
      metadata: legacyUser.user_metadata || {},
      isDev: Boolean(
        legacyUser.user_metadata?.system_role === 'dev' ||
        legacyUser.user_metadata?.role === 'dev'
      ),
      hasAdminAccess: Boolean(
        legacyUser.user_metadata?.system_role === 'dev' ||
        legacyUser.user_metadata?.role === 'owner' ||
        legacyUser.user_metadata?.role === 'admin'
      ),
      lastRefreshed: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error bridging session:', error);
    return null;
  }
}

export function syncAuthStores() {
  try {
    const legacyStore = useAuthStore.getState();
    const nextStore = useNextAuthStore.getState();

    // Handle signout case (no user in either store)
    if (!legacyStore.user && !nextStore.session) {
      // Clean reset of both stores
      useAuthStore.setState({
        user: null,
        organizationId: null,
        isDev: false,
        hasAdminAccess: false,
        isLoading: false,
        error: null
      });
      
      useNextAuthStore.setState({
        session: null,
        isLoading: false,
        error: null
      });
      
      return;
    }

    // Sync legacy to next
    if (legacyStore.user && !nextStore.session) {
      const bridgedSession = bridgeSession(legacyStore.user);
      if (bridgedSession) {
        useNextAuthStore.setState({ 
          session: bridgedSession,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Failed to bridge legacy session');
      }
    }

    // Sync next to legacy
    if (nextStore.session && !legacyStore.user) {
      useAuthStore.setState({
        user: nextStore.session.user,
        organizationId: nextStore.session.organizationId,
        isDev: nextStore.session.isDev,
        hasAdminAccess: nextStore.session.hasAdminAccess,
        isLoading: false,
        error: null
      });
    }

    // Validate sync
    const syncedLegacy = useAuthStore.getState();
    const syncedNext = useNextAuthStore.getState();

    if (
      (syncedLegacy.user && !syncedNext.session) || 
      (!syncedLegacy.user && syncedNext.session)
    ) {
      throw new Error('Store sync validation failed');
    }

  } catch (error) {
    console.error('Auth store sync error:', error);
    
    // Reset both stores to a safe state
    useAuthStore.setState({
      user: null,
      organizationId: null,
      isDev: false,
      hasAdminAccess: false,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Auth sync failed'
    });
    
    useNextAuthStore.setState({
      session: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Auth sync failed'
    });

    toast.error(AUTH_CONSTANTS.ERRORS.SYNC_FAILED);
  }
}

// Add a utility function to verify store consistency
export function verifyAuthStores(): boolean {
  try {
    const legacyStore = useAuthStore.getState();
    const nextStore = useNextAuthStore.getState();

    // Both should be in same state (either both have user or neither does)
    const isConsistent = Boolean(legacyStore.user) === Boolean(nextStore.session);
    
    if (!isConsistent) {
      console.warn('Auth stores are in inconsistent state');
      return false;
    }

    // If we have a user, verify critical fields match
    if (legacyStore.user && nextStore.session) {
      const fieldsMatch = 
        legacyStore.user.id === nextStore.session.user.id &&
        legacyStore.organizationId === nextStore.session.organizationId &&
        legacyStore.isDev === nextStore.session.isDev &&
        legacyStore.hasAdminAccess === nextStore.session.hasAdminAccess;

      if (!fieldsMatch) {
        console.warn('Auth store fields are mismatched');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error verifying auth stores:', error);
    return false;
  }
}