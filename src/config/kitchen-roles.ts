import type { Permission } from './permissions';

export type KitchenRole = 'owner' | 'chef' | 'sous_chef' | 'supervisor' | 'team_member';

export const KITCHEN_ROLES: Record<KitchenRole, {
  label: string;
  description: string;
  permissions: Record<string, Permission>;
}> = {
  owner: {
    label: 'Owner/Chef',
    description: 'Full access to all features and settings',
    permissions: {
      team: { view: true, create: true, edit: true, delete: true },
      recipes: { view: true, create: true, edit: true, delete: true },
      inventory: { view: true, create: true, edit: true, delete: true },
      production: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true }
    }
  },
  chef: {
    label: 'Head Chef',
    description: 'Full kitchen management and team oversight',
    permissions: {
      team: { view: true, create: true, edit: true, delete: false },
      recipes: { view: true, create: true, edit: true, delete: true },
      inventory: { view: true, create: true, edit: true, delete: false },
      production: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: false, edit: true, delete: false },
      reports: { view: true, create: true, edit: true, delete: false }
    }
  },
  sous_chef: {
    label: 'Sous Chef',
    description: 'Kitchen operations and team supervision',
    permissions: {
      team: { view: true, create: false, edit: true, delete: false },
      recipes: { view: true, create: true, edit: true, delete: false },
      inventory: { view: true, create: true, edit: true, delete: false },
      production: { view: true, create: true, edit: true, delete: false },
      settings: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, edit: false, delete: false }
    }
  },
  supervisor: {
    label: 'Supervisor',
    description: 'Team supervision and daily operations',
    permissions: {
      team: { view: true, create: false, edit: false, delete: false },
      recipes: { view: true, create: false, edit: false, delete: false },
      inventory: { view: true, create: true, edit: true, delete: false },
      production: { view: true, create: true, edit: true, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false }
    }
  },
  team_member: {
    label: 'Team Member',
    description: 'Basic kitchen duties and operations',
    permissions: {
      team: { view: true, create: false, edit: false, delete: false },
      recipes: { view: true, create: false, edit: false, delete: false },
      inventory: { view: true, create: false, edit: false, delete: false },
      production: { view: true, create: true, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false }
    }
  }
};

// Map auth system roles to kitchen roles
export const AUTH_ROLE_MAPPING: Record<string, KitchenRole> = {
  'owner': 'owner',
  'admin': 'chef',
  'manager': 'sous_chef',
  'staff': 'team_member'
};

// Helper function to get kitchen role from auth role
export function getKitchenRole(authRole: string): KitchenRole {
  return AUTH_ROLE_MAPPING[authRole] || 'team_member';
}

// Helper function to check if a role has a specific permission
export function hasPermission(
  role: KitchenRole,
  feature: string,
  action: keyof Permission
): boolean {
  return KITCHEN_ROLES[role]?.permissions[feature]?.[action] || false;
}