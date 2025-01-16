import { AUTH_CONSTANTS } from "../constants/auth-constants";
import { AuthStorageError } from "../errors/auth-errors";
import { logger } from "./logger";
import { TokenManager } from "./token-manager";

interface StorageOptions {
  prefix?: string;
  secure?: boolean;
}

export class AuthStorage {
  private readonly storageKey: string;
  private readonly secure: boolean;

  constructor(options: StorageOptions = {}) {
    this.storageKey = options.prefix || AUTH_CONSTANTS.SESSION.STORAGE_KEY;
    this.secure = options.secure ?? true;
  }

  setItem<T>(key: string, value: T): void {
    try {
      const timestamp = new Date().getTime();
      const storageValue = {
        value,
        timestamp,
        expiry: timestamp + AUTH_CONSTANTS.SESSION.MAX_AGE,
      };

      const serializedValue = JSON.stringify(storageValue);
      const storageKey = this.getFullKey(key);
      localStorage.setItem(storageKey, serializedValue);
      logger.debug(`Storage: Set item for key ${key}`);
    } catch (error) {
      logger.error("Storage: Failed to set item", { key, error });
      throw new AuthStorageError("Failed to set storage item");
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const storageKey = this.getFullKey(key);
      const item = localStorage.getItem(storageKey);

      if (!item) return null;

      const storageValue = JSON.parse(item);
      const now = new Date().getTime();

      // Check if item has expired
      if (storageValue.expiry && now > storageValue.expiry) {
        this.removeItem(key);
        return null;
      }

      return storageValue.value;
    } catch (error) {
      logger.error("Storage: Failed to get item", { key, error });
      return null;
    }
  }

  removeItem(key: string): void {
    const storageKey = this.getFullKey(key);
    localStorage.removeItem(storageKey);
  }

  clear(): void {
    TokenManager.clearTokens();
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .forEach((key) => localStorage.removeItem(key));
  }

  private getFullKey(key: string): string {
    return `${this.storageKey}:${key}`;
  }
}

export const authStorage = new AuthStorage();
