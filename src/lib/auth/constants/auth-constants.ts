export const AUTH_CONSTANTS = {
  SESSION: {
    STORAGE_KEY: "kitchen-ai-auth",
    REFRESH_THRESHOLD: 2 * 60 * 1000, // 2 minutes in ms
    MAX_REFRESH_ATTEMPTS: 3,
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours in ms
  },
  INITIALIZATION_TIMEOUT: 10000, // 10 seconds
  ERRORS: {
    INITIALIZATION: "Auth system failed to initialize",
    SESSION_EXPIRED: "Your session has expired. Please sign in again.",
    REFRESH_FAILED: "Unable to refresh authentication",
    SYNC_FAILED: "Auth store sync failed",
  },
  HEALTH: {
    CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
    TIMEOUT: 10000, // 10 seconds
  },
} as const;
