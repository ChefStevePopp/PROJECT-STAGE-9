// src/lib/auth/types/session.ts
import type { User } from '@supabase/supabase-js';

export interface AuthSession {
  user: User;
  organizationId: string | null;
  metadata: Record<string, any>;
  isDev: boolean;
  hasAdminAccess: boolean;
  lastRefreshed: string;
}

export interface SessionMetadata {
  deviceId?: string;
  lastActive?: string;
  platform?: string;
  browser?: string;
}

export type SessionStatus = 'active' | 'expired' | 'revoked' | 'invalid';
