export const ROUTES = {
  KITCHEN: {
    DASHBOARD: '/kitchen',
    INVENTORY: '/kitchen/inventory',
    RECIPES: '/kitchen/recipes',
    PRODUCTION: '/kitchen/production',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    MY_ACCOUNT: '/admin/my-account',
    ORGANIZATIONS: '/admin/organizations',
    TEAM: '/admin/team',
    LOCATIONS: '/admin/locations',
    ACTIVITY: '/admin/activity',
    HELP: '/admin/help',
    REFER: '/admin/refer',
    NOTIFICATIONS: '/admin/notifications',
    PERMISSIONS: '/admin/permissions',
    SETTINGS: '/admin/settings',
    EXCEL_IMPORTS: '/admin/excel-imports',
    DEV_MANAGEMENT: '/admin/dev-management'
  },
  AUTH: {
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
  }
} as const;