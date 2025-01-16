import { supabase } from "@/lib/supabase";
import { AuthSession } from "../types";
import { authStorage } from "../utils/auth-storage";
import { TokenManager } from "../utils/token-manager";
import { logger } from "../utils/logger";
import { AuthError, AuthSessionError } from "../errors/auth-errors";
import { AUTH_CONSTANTS } from "../constants/auth-constants";
import toast from "react-hot-toast";

class AuthService {
  private initialized = false;
  private isInitializing = false;

  async initialize(): Promise<void> {
    if (this.initialized || this.isInitializing) return;

    this.isInitializing = true;

    try {
      // Get initial session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        // Set up refresh listener
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "TOKEN_REFRESHED" && session) {
            await this.createSession(session.user);
            logger.debug("Session refreshed via Supabase");
          }
        });

        // Create initial session
        await this.createSession(session.user);
        this.initialized = true;
      } else {
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
    await this.cleanupStorage();
    this.initialized = false;
    this.isInitializing = false;

    if (!window.location.pathname.includes("/auth/")) {
      window.location.href = "/auth/signin";
    }
  }

  private async cleanupStorage(): Promise<void> {
    try {
      await supabase.auth.signOut();
      authStorage.clear();
      TokenManager.clearTokens();
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

      const session = await this.createSession(data.session.user);
      this.initialized = true;
      return session;
    } catch (error) {
      logger.error("Sign in failed", error);
      throw new AuthError("Invalid email or password");
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

  async getSession(): Promise<AuthSession | null> {
    return authStorage.getItem("session");
  }
}

export const authService = new AuthService();
