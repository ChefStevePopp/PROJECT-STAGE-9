import React from "react";
import { Shield, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RoleCardProps {
  role: {
    id: string;
    label: string;
    description: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  memberCount: number;
  onAssignMembers: () => void;
  isFullWidth?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isSelected,
  onSelect,
  memberCount,
  onAssignMembers,
  isFullWidth = false,
}) => {
  const { user, organization } = useAuth();

  // Helper function to get role-specific styles and descriptions
  const getRoleInfo = (roleId: string) => {
    const info = {
      owner: {
        icon: "bg-rose-500/20 text-rose-400",
        border: "border-rose-500",
        description: "text-rose-300",
        canDo: [
          "Full access to all kitchen settings and recipes",
          "Manage team members and their roles",
          "View and edit costs and financial data",
          "Create and modify recipes and prep lists",
        ],
        cantDo: ["Cannot be restricted from any area"],
      },
      sous_chef: {
        icon: "bg-amber-500/20 text-amber-400",
        border: "border-amber-500",
        description: "text-amber-300",
        canDo: [
          "Manage daily operations and team schedules",
          "Create and modify recipes",
          "View and update inventory",
          "Access production reports",
        ],
        cantDo: [
          "Cannot modify financial settings",
          "Cannot remove team members",
        ],
      },
      supervisor: {
        icon: "bg-emerald-500/20 text-emerald-400",
        border: "border-emerald-500",
        description: "text-emerald-300",
        canDo: [
          "View and follow recipes",
          "Update inventory counts",
          "Manage shift tasks",
          "View team schedules",
        ],
        cantDo: [
          "Cannot modify recipes",
          "Cannot access financial data",
          "Cannot manage team members",
        ],
      },
      team_member: {
        icon: "bg-blue-500/20 text-blue-400",
        border: "border-blue-500",
        description: "text-blue-300",
        canDo: [
          "View assigned recipes",
          "Mark tasks as complete",
          "View personal schedule",
          "Access basic training materials",
        ],
        cantDo: [
          "Cannot modify any settings",
          "Cannot view sensitive information",
          "Cannot access financial data",
        ],
      },
    }[roleId] || {
      icon: "bg-gray-500/20 text-gray-400",
      border: "border-gray-500",
      description: "text-gray-300",
      canDo: [],
      cantDo: [],
    };

    return info;
  };

  const info = getRoleInfo(role.id);

  return (
    <div
      className={`card p-6 cursor-pointer transition-all border-2 ${isSelected ? info.border : "border-transparent hover:border-gray-700"}`}
      onClick={onSelect}
    >
      {/* Role Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${info.icon}`}>
          <Shield className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-white text-lg">{role.label}</h3>
      </div>

      {/* Can Do Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Can:</h4>
        <ul className="space-y-1">
          {info.canDo.map((item, index) => (
            <li
              key={index}
              className="text-sm text-gray-400 flex items-start gap-2"
            >
              <span className="text-green-400 mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Cannot Do Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Cannot:</h4>
        <ul className="space-y-1">
          {info.cantDo.map((item, index) => (
            <li
              key={index}
              className="text-sm text-gray-400 flex items-start gap-2"
            >
              <span className="text-rose-400 mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Member Count and Assign Button */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Users className="w-4 h-4" />
          {memberCount} team members
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignMembers();
          }}
          className="w-full py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors text-sm font-medium"
        >
          Assign Team Members
        </button>

        {/* Owner Info - Only show for owner role */}
        {role.id === "owner" && organization?.owner_id && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Organization Owner:{" "}
              <span className="text-rose-400">
                {user?.id === organization.owner_id ? "You" : "Another user"}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              The owner role is automatically assigned to the organization
              creator
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
