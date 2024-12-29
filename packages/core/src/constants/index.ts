export const APP_NAME = 'KITCHEN AI';
export const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=2000&q=80';
export const LABOR_RATE_PER_HOUR = 30;

export const TIME_ZONES = [
  { value: 'UTC-8', label: 'Pacific Time' },
  { value: 'UTC-5', label: 'Eastern Time' },
  { value: 'UTC+0', label: 'GMT' },
] as const;

export const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
] as const;

export const ROUTES = {
  AUTH: {
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
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
  }
} as const;