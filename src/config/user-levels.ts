export type UserLevel = 'system_admin' | 'kitchen_admin' | 'manager' | 'staff';

export const USER_LEVELS = {
  system_admin: {
    label: 'System Administrator',
    description: 'Full system access with ability to manage all organizations',
    level: 0, // Highest level
    canManageUsers: true,
    canManageOrganizations: true,
    canManageSettings: true,
    canAccessDevTools: true
  },
  kitchen_admin: {
    label: 'Kitchen Administrator',
    description: 'Full access to kitchen management and staff',
    level: 1,
    canManageUsers: true,
    canManageOrganizations: false,
    canManageSettings: true,
    canAccessDevTools: false
  },
  manager: {
    label: 'Manager',
    description: 'Access to manage daily operations and staff',
    level: 2,
    canManageUsers: false,
    canManageOrganizations: false,
    canManageSettings: false,
    canAccessDevTools: false
  },
  staff: {
    label: 'Staff',
    description: 'Basic access to required features',
    level: 3, // Lowest level
    canManageUsers: false,
    canManageOrganizations: false,
    canManageSettings: false,
    canAccessDevTools: false
  }
} as const;

// Feature access matrix
export const FEATURE_ACCESS = {
  system_admin: {
    inventory: ['view', 'create', 'edit', 'delete'],
    recipes: ['view', 'create', 'edit', 'delete'],
    production: ['view', 'create', 'edit', 'delete'],
    reports: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'create', 'edit', 'delete'],
    users: ['view', 'create', 'edit', 'delete']
  },
  kitchen_admin: {
    inventory: ['view', 'create', 'edit', 'delete'],
    recipes: ['view', 'create', 'edit', 'delete'],
    production: ['view', 'create', 'edit', 'delete'],
    reports: ['view', 'create', 'edit'],
    settings: ['view', 'edit'],
    users: ['view', 'create', 'edit']
  },
  manager: {
    inventory: ['view', 'create', 'edit'],
    recipes: ['view', 'create', 'edit'],
    production: ['view', 'create', 'edit'],
    reports: ['view', 'create'],
    settings: ['view'],
    users: ['view']
  },
  staff: {
    inventory: ['view'],
    recipes: ['view'],
    production: ['view', 'create'],
    reports: ['view'],
    settings: ['view'],
    users: ['view']
  }
} as const;

export function getUserLevel(metadata: any): UserLevel {
  if (metadata?.system_role === 'dev') return 'system_admin';
  if (metadata?.role === 'owner') return 'kitchen_admin';
  if (metadata?.role === 'manager') return 'manager';
  return 'staff';
}

export function hasAccess(
  userLevel: UserLevel,
  feature: keyof typeof FEATURE_ACCESS.system_admin,
  action: string
): boolean {
  return FEATURE_ACCESS[userLevel][feature].includes(action);
}

export function canManageUserLevel(currentLevel: UserLevel, targetLevel: UserLevel): boolean {
  return USER_LEVELS[currentLevel].level < USER_LEVELS[targetLevel].level;
}