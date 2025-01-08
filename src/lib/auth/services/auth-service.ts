import { supabase } from "@/lib/supabase";
import { AuthSession } from "../types";
import { authStorage } from "../utils/auth-storage";
import { TokenManager } from "../utils/token-manager";
import { logger } from "../utils/logger";
import { AuthError, AuthSessionError } from "../errors/auth-errors";
import { AUTH_CONSTANTS } from "../constants/auth-constants";

class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const session = await this.getSession();
      if (session) {
        await this.startRefreshTimer();
      }
      this.initialized = true;
      logger.info("Auth service initialized");
    } catch (error) {
      logger.error("Failed to initialize auth service", error);
      throw new AuthError(AUTH_CONSTANTS.ERRORS.INITIALIZATION);
    }
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) throw error;
      if (!data.session) throw new AuthSessionError("No session data returned");

      const session = await this.createSession(data.session.user);
      await this.startRefreshTimer();

      return session;
    } catch (error) {
      logger.error("Sign in failed", error);
      throw new AuthError("Invalid email or password");
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.stopRefreshTimer();
      authStorage.clear();
      TokenManager.clearTokens();
      logger.info("User signed out successfully");
    } catch (error) {
      logger.error("Sign out failed", error);
      throw new AuthError("Failed to sign out");
    }
  }

  async getSession(): Promise<AuthSession | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) return null;

      return this.createSession(session.user);
    } catch (error) {
      logger.error("Failed to get session", error);
      return null;
    }
  }

  private async createSession(user: User): Promise<AuthSession> {
    try {
      // Query the organization role and user metadata in parallel
      const [{ data: orgRole }, { data: metadata }] = await Promise.all([
        // Query organization roles table for the user's organization and role
        supabase
          .from("organization_roles")
          .select("organization_id, role")
          .eq("user_id", user.id)
          .maybeSingle(),

        // Query user metadata
        supabase
          .from("users")
          .select("user_metadata")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      const isDev = false; // No more static dev access
      const hasAdminAccess = Boolean(
        orgRole?.role === "owner" || orgRole?.role === "admin",
      );

      const session: AuthSession = {
        user,
        organizationId: orgRole?.organization_id || null,
        metadata: metadata?.user_metadata || {},
        isDev,
        hasAdminAccess,
        lastRefreshed: new Date().toISOString(),
      };

      authStorage.setItem("session", session);
      return session;
    } catch (error) {
      logger.error("Failed to create session", error);
      throw new AuthSessionError("Failed to create session");
    }
  }

  private async startRefreshTimer(): Promise<void> {
    this.stopRefreshTimer();

    this.refreshTimer = setInterval(async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.refreshSession();
        if (error) throw error;
        if (!session)
          throw new AuthSessionError("No session returned from refresh");

        await this.createSession(session.user);
        logger.debug("Session refreshed successfully");
      } catch (error) {
        logger.error("Failed to refresh session", error);
        this.stopRefreshTimer();
        authStorage.clear();
        window.location.href = "/auth/signin";
      }
    }, AUTH_CONSTANTS.SESSION.REFRESH_THRESHOLD);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const authService = new AuthService();
