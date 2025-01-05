// src/lib/auth/types/index.ts
export * from './session';
export * from './security';
export * from './reliability';
export * from './monitoring';
export * from './user-experience';

export interface AuthSystemCapabilities {
  version: string;
  lastChecked: string;
  healthStatus: 'healthy' | 'degraded' | 'error';
  security: SecurityCapabilities;
  reliability: ReliabilityRequirements;
  monitoring: MonitoringRequirements;
  userExperience: UserExperienceRequirements;
}

export interface AuthSystemConfig {
  environment: 'development' | 'staging' | 'production';
  features: {
    mfa: boolean;
    sso: boolean;
    offlineMode: boolean;
    deviceSync: boolean;
  };
  security: {
    sessionTimeout: number;
    refreshInterval: number;
    maxDevices: number;
  };
  monitoring: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    metricsEnabled: boolean;
    healthCheckInterval: number;
  };
}
