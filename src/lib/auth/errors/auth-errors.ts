// src/lib/auth/errors/auth-errors.ts
export class AuthError extends Error {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = "AuthError";
  }
}

export class AuthStorageError extends AuthError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = "AuthStorageError";
  }
}

export class AuthSessionError extends AuthError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = "AuthSessionError";
  }
}

export class AuthTokenError extends AuthError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = "AuthTokenError";
  }
}
