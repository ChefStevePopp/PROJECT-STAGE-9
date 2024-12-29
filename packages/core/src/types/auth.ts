export type SystemRole = 'dev' | 'user';
export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'staff';

export interface UserMetadata {
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  system_role?: SystemRole;
  role?: OrganizationRole;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
}