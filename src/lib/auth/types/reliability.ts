// src/lib/auth/types/reliability.ts
export interface ReliabilityRequirements {
  offlineSupport: boolean;
  stateSync: boolean;
  errorRecovery: boolean;
  persistence: boolean;
}

export interface SyncStatus {
  lastSync: string;
  pending: number;
  failed: number;
}
