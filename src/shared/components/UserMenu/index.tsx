import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  ChefHat,
  Settings,
  LogOut,
  Building2,
  User,
  UtensilsCrossed,
  Package,
  Calendar,
  Bell,
  Shield,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { supabase } from "@/lib/supabase";

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, organization, organizationId, isDev, signOut } = useAuth();
  const { hasAdminAccess } = useUserRole();
  const [teamMember, setTeamMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch team member data to get avatar_url
  useEffect(() => {
    const fetchTeamMember = async () => {
      if (!user?.email || !organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("organization_team_members")
          .select("*")
          .eq("organization_id", organizationId)
          .eq("email", user.email)
          .single();

        if (!error && data) {
          setTeamMember(data);
        }
      } catch (err) {
        console.error("Error fetching team member:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMember();
  }, [user?.email, organizationId]);

  if (!user) return null;

  // Get display name from user metadata or format email nicely
  const displayName =
    user.user_metadata?.firstName && user.user_metadata?.lastName
      ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
      : user.email?.split("@")[0]?.replace(/[._-]/g, " ");

  // Get user role for display
  const role = user.user_metadata?.role || "Team Member";
  const roleColor =
    role.toLowerCase() === "owner"
      ? "text-rose-400"
      : role.toLowerCase() === "admin"
        ? "text-amber-400"
        : role.toLowerCase() === "manager"
          ? "text-emerald-400"
          : "text-blue-400";

  // Get avatar URL with priority:
  // 1. team member avatar_url
  // 2. Kitchen AI logo for dev users
  // 3. DiceBear avatar
  const avatarUrl = teamMember?.avatar_url
    ? teamMember.avatar_url
    : isDev
      ? "https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png" // Kitchen AI logo path
      : `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-lg bg-gray-800 object-cover"
          onError={(e) => {
            // Fallback to DiceBear if image fails to load
            (e.target as HTMLImageElement).src =
              `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
          }}
        />
        <div className="text-left">
          <div className="text-sm font-medium text-white">{displayName}</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${roleColor}`}>{role}</span>
          </div>
          {organization && (
            <div className="text-xs text-gray-500">{organization.name}</div>
          )}
        </div>
        <ChefHat className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-gray-800 rounded-xl border border-gray-700/50 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-700/50 mb-2">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-lg bg-gray-700 object-cover"
              onError={(e) => {
                // Fallback to DiceBear if image fails to load
                (e.target as HTMLImageElement).src =
                  `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
              }}
            />
            <div>
              <div className="text-sm font-medium text-white">
                {displayName}
              </div>
              <div className="text-xs text-gray-400">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Kitchen Role */}
        {organization && (
          <div className="px-4 py-2 border-b border-gray-700/50 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Building2 className="w-4 h-4" />
              <span>{organization.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Shield className="w-3 h-3" />
              <span>
                Role: <span className={roleColor}>{role}</span>
              </span>
            </div>
            {teamMember?.kitchen_role && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <ChefHat className="w-3 h-3" />
                <span>Kitchen Role: {teamMember.kitchen_role}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <div className="py-1">
          <button
            onClick={() => navigate("/admin/account")}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <User className="w-4 h-4" />
            My Account
          </button>
          <button
            onClick={() => navigate("/kitchen/recipes")}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            Recipes
          </button>
          <button
            onClick={() => navigate("/kitchen/tasks")}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Tasks
          </button>
          <button
            onClick={() => navigate("/kitchen/inventory")}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <Package className="w-4 h-4" />
            Inventory
          </button>
          <button
            onClick={() => navigate("/kitchen/schedule")}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
        </div>

        {/* Settings & Logout */}
        <div className="border-t border-gray-700/50 mt-1 pt-1">
          {(hasAdminAccess ||
            isDev ||
            role.toLowerCase() === "owner" ||
            role.toLowerCase() === "chef" ||
            role.toLowerCase() === "sous_chef") && (
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Admin Dashboard
            </button>
          )}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-gray-700/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Debug Info - Only visible in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="px-4 py-2 border-t border-gray-700/50 mt-1">
            <div className="text-xs text-gray-500">
              <div>User ID: {user.id}</div>
              <div>Org ID: {organizationId || "Not set"}</div>
              <div>Team Member ID: {teamMember?.id || "Not found"}</div>
              <div>Kitchen Role: {teamMember?.kitchen_role || "None"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
