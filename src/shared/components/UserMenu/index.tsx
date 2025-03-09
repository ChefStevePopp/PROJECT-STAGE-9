import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChefHat, Settings, LogOut, Building2 } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, organization, organizationId, signOut } = useAuth();

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

  // Get avatar URL or generate initials
  const avatarUrl =
    user.user_metadata?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-lg bg-gray-800 object-cover"
        />
        <div className="text-left">
          <div className="text-sm font-medium text-white">{displayName}</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${roleColor}`}>{role}</span>
            {organization && (
              <span className="text-xs text-gray-500">{organization.name}</span>
            )}
          </div>
        </div>
        <ChefHat className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-gray-800 rounded-xl border border-gray-700/50 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        {/* Organization Info */}
        {organization && (
          <div className="px-4 py-2 border-b border-gray-700/50 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Building2 className="w-4 h-4" />
              <span>{organization.name}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {organization.settings?.business_type || "Restaurant"}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="px-4 py-2 border-b border-gray-700/50 mb-2">
          <div className="text-xs text-gray-500">
            <div>User ID: {user.id}</div>
            <div>Org ID: {organizationId || "Not set"}</div>
            <div>
              Org from metadata:{" "}
              {user.user_metadata?.organizationId || "Not set"}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(ROUTES.ADMIN.MY_ACCOUNT)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Account Settings
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-gray-700/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
