// src/lib/auth/roles/roleDefinitions.ts

import type { Permission } from '@/config/permissions';
import type { RoleDefinition } from './types';

// Kitchen-specific features
export const KITCHEN_FEATURES = {
  RECIPES: 'Recipe Management',
  INVENTORY: 'Inventory Management',
  PRODUCTION: 'Production Planning',
  TEAM: 'Team Management',
  SETTINGS: 'System Settings',
  REPORTS: 'Reports & Analytics'
} as const;

// Role definitions with permissions
export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  dev: {
    label: 'Developer',
    description: 'Full system access with development capabilities',
    level: -1, // Highest level (above owner)
    permissions: {
      recipes: { view: true, create: true, edit: true, delete: true },
      inventory: { view: true, create: true, edit: true, delete: true },
      production: { view: true, create: true, edit: true, delete: true },
      team: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true },
      system: { view: true, create: true, edit: true, delete: true }
    }
  },
  owner: {
    label: 'Owner/Chef',
    description: 'Full access to all kitchen features',
    level: 0,
    permissions: {
      recipes: { view: true, create: true, edit: true, delete: true },
      inventory: { view: true, create: true, edit: true, delete: true },
      production: { view: true, create: true, edit: true, delete: true },
      team: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true }
    }
  },
  sous_chef: {
    label: 'Sous Chef',
    description: 'Kitchen operations and team supervision',
    level: 1,
    permissions: {
      recipes: { view: true, create: true, edit: true, delete: false },
      inventory: { view: true, create: true, edit: true, delete: false },
      production: { view: true, create: true, edit: true, delete: false },
      team: { view: true, create: false, edit: true, delete: false },
      settings: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, edit: false, delete: false }
    }
  },
  supervisor: {
    label: 'Supervisor',
    description: 'Team supervision and daily operations',
    level: 2,
    permissions: {
      recipes: { view: true, create: false, edit: false, delete: false },
      inventory: { view: true, create: true, edit: true, delete: false },
      production: { view: true, create: true, edit: true, delete: false },
      team: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false }
    }
  },
  team_member: {
    label: 'Team Member',
    description: 'Basic kitchen duties and operations',
    level: 3,
    permissions: {
      recipes: { view: true, create: false, edit: false, delete: false },
      inventory: { view: true, create: false, edit: false, delete: false },
      production: { view: true, create: true, edit: false, delete: false },
      team: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false }
    }
  }
};

// Helper functions
export function hasPermission(
  role: string,
  feature: keyof typeof KITCHEN_FEATURES,
  action: keyof Permission
): boolean {
  return ROLE_DEFINITIONS[role]?.permissions[feature.toLowerCase()]?.[action] || false;
}

export function canManageRole(currentRole: string, targetRole: string): boolean {
  const currentLevel = ROLE_DEFINITIONS[currentRole]?.level ?? Infinity;
  const targetLevel = ROLE_DEFINITIONS[targetRole]?.level ?? Infinity;
  return currentLevel < targetLevel;
}

export function getRoleLabel(role: string): string {
  return ROLE_DEFINITIONS[role]?.label || role;
}

export function getRoleDescription(role: string): string {
  return ROLE_DEFINITIONS[role]?.description || '';
}

export function getAvailableRoles(currentRole: string): string[] {
  const currentLevel = ROLE_DEFINITIONS[currentRole]?.level ?? Infinity;
  return Object.entries(ROLE_DEFINITIONS)
    .filter(([_, def]) => def.level > currentLevel)
    .map(([role]) => role);
}
