import { supabase } from "@/lib/supabase";

type ActivityType =
  | "team_member_added"
  | "team_member_updated"
  | "team_member_removed"
  | "role_assigned"
  | "role_removed"
  | "recipe_created"
  | "recipe_updated"
  | "recipe_deleted"
  | "inventory_updated"
  | "settings_changed";

interface ActivityLogEntry {
  organization_id: string;
  user_id: string;
  activity_type: ActivityType;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

export const logActivity = async ({
  organization_id,
  user_id,
  activity_type,
  details,
  metadata = {},
}: ActivityLogEntry): Promise<void> => {
  try {
    // Add user name to details if not present
    if (!details.user_name) {
      const { data: userData } = await supabase
        .from("organization_team_members")
        .select("first_name, last_name")
        .eq("user_id", user_id)
        .single();

      if (userData) {
        details.user_name = `${userData.first_name} ${userData.last_name}`;
      }
    }

    const { error } = await supabase.from("activity_logs").insert([
      {
        organization_id,
        user_id,
        activity_type,
        details,
        metadata,
      },
    ]);

    if (error) {
      console.error("Error inserting activity log:", error);
      throw error;
    }
  } catch (err) {
    console.error("Error logging activity:", err);
    // Don't throw - we don't want to break the main flow if logging fails
  }
};
