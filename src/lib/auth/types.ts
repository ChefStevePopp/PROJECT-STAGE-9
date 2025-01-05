// src/lib/auth/types/index.ts
import type { User } from '@supabase/supabase-js';

export interface AuthSession {
  user: User;
  organizationId: string | null;
  metadata: Record<string, any>;
  isDev: boolean;
  hasAdminAccess: boolean;
  lastRefreshed: string;
}

export interface AuthSystemRequirements {
  security: {
    sessionHandling: boolean    
    tokenRefresh: boolean      
    multiDevice: boolean        
    revokeAccess: boolean       
  }
  reliability: {
    offlineSupport: boolean     
    stateSync: boolean          
    errorRecovery: boolean      
    persistence: boolean        
  }
  monitoring: {
    auditLogging: boolean       
    errorTracking: boolean      
    analytics: boolean          
    healthChecks: boolean       
  }
  userExperience: {
    loadingStates: boolean      
    errorMessages: boolean      
    recoveryOptions: boolean    
    deviceManagement: boolean   
  }
}

export interface AuthSystemCapabilities extends AuthSystemRequirements {
  version: string;
  lastChecked: string;
  healthStatus: 'healthy' | 'degraded' | 'error';
}