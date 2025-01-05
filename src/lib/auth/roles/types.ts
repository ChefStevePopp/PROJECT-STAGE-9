// src/lib/auth/roles/types.ts
export type Permission = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type SystemRole = 'system_admin' | 'owner' | 'admin' | 'manager' | 'staff';
export type KitchenRole = 'head_chef' | 'sous_chef' | 'line_cook' | 'prep_cook';

export interface RoleDefinition {
  label: string;
  description: string;
  level: number; // Lower number = higher access
  systemRole: SystemRole;
  kitchenRole?: KitchenRole;
  permissions: Record<string, Permission>;
  capabilities: {
    canManageUsers: boolean;
    canManageOrganizations: boolean;
    canManageSettings: boolean;
    canAccessDevTools: boolean;
  };
}
