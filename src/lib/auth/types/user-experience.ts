// src/lib/auth/types/user-experience.ts
export interface UserExperienceRequirements {
  loadingStates: boolean;
  errorMessages: boolean;
  recoveryOptions: boolean;
  deviceManagement: boolean;
}

export interface UserFeedback {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
}
