// src/lib/auth/types/monitoring.ts
export interface MonitoringRequirements {
  auditLogging: boolean;
  errorTracking: boolean;
  analytics: boolean;
  healthChecks: boolean;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  lastCheck: string;
  issues: HealthIssue[];
}

export interface HealthIssue {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}
