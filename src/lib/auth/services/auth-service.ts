import { supabase } from "@/lib/supabase";
import { AuthSession } from "../types";
import { authStorage } from "../utils/auth-storage";
import { TokenManager } from "../utils/token-manager";
import { logger } from "../utils/logger";
import { AuthError, AuthSessionError } from "../errors/auth-errors";
import { AUTH_CONSTANTS } from "../constants/auth-constants";
import toast from "react-hot-toast";

class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private initialized = false;
  private initializationTimeout: NodeJS.Timeout | null = null;
  private isInitializing = false;

  async initialize(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.initialized || this.isInitializing) return;

    this.isInitializing = true;

    try {
      // First try to get the Supabase session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      // If we have a session, try to refresh it
      if (session) {
        const {
          data: { session: refreshedSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError) {
          throw refreshError;
        }

        if (refreshedSession) {
          // Successfully refreshed, create our session
          const authSession = await this.createSession(refreshedSession.user);
          await this.startRefreshTimer();
          this.initialized = true;
          this.isInitializing = false;
          return;
        }
      }

      // No valid session, check if we're on auth page
      const isAuthPage = window.location.pathname.includes("/auth/");
      if (!isAuthPage) {
        await this.handleNoSession();
      }
    } catch (error) {
      logger.error("Failed to initialize auth service", error);
      await this.handleNoSession();
    } finally {
      this.isInitializing = false;
    }
  }

  private async handleNoSession() {
    // Clear any existing data
    await this.cleanupStorage();

    // Reset state
    this.initialized = false;
    this.isInitializing = false;

    // Redirect if not on auth page
    if (!window.location.pathname.includes("/auth/")) {
      window.location.href = "/auth/signin";
    }
  }

  private async cleanupStorage(): Promise<void> {
    try {
      // Stop refresh timer first
      this.stopRefreshTimer();

      // Clear Supabase session
      await supabase.auth.signOut();

      // Clear storage
      authStorage.clear();
      TokenManager.clearTokens();

      // Reset state
      this.initialized = false;
    } catch (error) {
      logger.error("Failed to cleanup storage", error);
    }
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) throw error;
      if (!data.session?.user)
        throw new AuthSessionError("No session data returned");

      // Create our session
      const session = await this.createSession(data.session.user);

      // Start refresh timer
      await this.startRefreshTimer();

      // Set initialized state
      this.initialized = true;

      return session;
    } catch (error) {
      logger.error("Sign in failed", error);
      throw new AuthError("Invalid email or password");
    }
  }

  private async startRefreshTimer(): Promise<void> {
    this.stopRefreshTimer();

    // Immediately try to refresh to ensure we have the latest session
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (!session?.user)
        throw new AuthSessionError("No session returned from refresh");

      await this.createSession(session.user);
    } catch (error) {
      logger.error("Initial session refresh failed", error);
      throw error;
    }

    // Set up refresh timer
    this.refreshTimer = setInterval(async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.refreshSession();
        if (error) throw error;
        if (!session?.user)
          throw new AuthSessionError("No session returned from refresh");

        await this.createSession(session.user);
        logger.debug("Session refreshed successfully");
      } catch (error) {
        logger.error("Failed to refresh session", error);
        await this.handleNoSession();
      }
    }, AUTH_CONSTANTS.SESSION.REFRESH_THRESHOLD);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async createSession(user: User): Promise<AuthSession> {
    try {
      const [{ data: orgRole }, { data: metadata }] = await Promise.all([
        supabase
          .from("organization_roles")
          .select("organization_id, role")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("users")
          .select("user_metadata")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      const session: AuthSession = {
        user,
        organizationId: orgRole?.organization_id || null,
        metadata: metadata?.user_metadata || {},
        isDev: false,
        hasAdminAccess: Boolean(
          orgRole?.role === "owner" || orgRole?.role === "admin",
        ),
        lastRefreshed: new Date().toISOString(),
      };

      authStorage.setItem("session", session);
      return session;
    } catch (error) {
      logger.error("Failed to create session", error);
      throw new AuthSessionError("Failed to create session");
    }
  }

  async signOut(): Promise<void> {
    await this.cleanupStorage();
  }
}

export const authService = new AuthService();
