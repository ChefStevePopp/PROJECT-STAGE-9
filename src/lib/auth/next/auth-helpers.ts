import { supabase } from "../../supabase";
import type { User } from "@supabase/supabase-js";
import type { AuthSession } from "../types";

export async function initializeSession(user: User): Promise<AuthSession> {
  try {
    // Get organization role and metadata
    const [{ data: orgRole }, { data: metadata }] = await Promise.all([
      supabase
        .from("organization_roles")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_metadata")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    // Determine user roles and permissions
    const isDev = Boolean(
      (user.user_metadata as any)?.system_role === "dev" ||
        (user.user_metadata as any)?.role === "dev",
    );

    const hasAdminAccess = Boolean(
      isDev || orgRole?.role === "owner" || orgRole?.role === "admin",
    );

    return {
      user,
      organizationId:
        orgRole?.organization_id || (user.user_metadata as any)?.organizationId,
      metadata: metadata?.data || {},
      isDev,
      hasAdminAccess,
      lastRefreshed: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error initializing session:", error);
    throw error;
  }
}

export async function refreshSession(
  session: AuthSession,
): Promise<AuthSession> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("No user found");

    return await initializeSession(user);
  } catch (error) {
    console.error("Error refreshing session:", error);
    throw error;
  }
}

export async function validateSession(
  session: AuthSession | null,
): Promise<boolean> {
  if (!session) return false;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user && user.id === session.user.id);
  } catch {
    return false;
  }
}
