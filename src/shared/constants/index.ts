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