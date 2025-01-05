// src/lib/auth/utils/auth-storage.ts
import { AUTH_CONSTANTS } from '../constants/auth-constants';
import { AuthStorageError } from '../errors/auth-errors';
import { logger } from './logger';
import { TokenManager } from './token-manager';

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
      const serializedValue = JSON.stringify(value);
      const storageKey = this.getFullKey(key);
      localStorage.setItem(storageKey, serializedValue);
      logger.debug(`Storage: Set item for key ${key}`);
    } catch (error) {
      logger.error('Storage: Failed to set item', { key, error });
      throw new AuthStorageError('Failed to set storage item');
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const storageKey = this.getFullKey(key);
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.error('Storage: Failed to get item', { key, error });
      throw new AuthStorageError('Failed to get storage item');
    }
  }

  removeItem(key: string): void {
    const storageKey = this.getFullKey(key);
    localStorage.removeItem(storageKey);
  }

  clear(): void {
    TokenManager.clearTokens();
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.storageKey))
      .forEach(key => localStorage.removeItem(key));
  }

  private getFullKey(key: string): string {
    return `${this.storageKey}:${key}`;
  }
}

export const authStorage = new AuthStorage();

