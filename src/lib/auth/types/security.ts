// src/lib/auth/types/security.ts
export interface SecurityRequirements {
  sessionHandling: boolean;
  tokenRefresh: boolean;
  multiDevice: boolean;
  revokeAccess: boolean;
  encryption?: {
    type: 'AES' | 'RSA';
    strength: number;
  };
}

export interface SecurityCapabilities {
  mfa: boolean;
  biometric: boolean;
  passwordless: boolean;
  sso: boolean;
}
