import React from "react";
import { Shield, Check, X } from "lucide-react";
import type { TeamMember } from "../../../types";
import { KITCHEN_ROLES, KitchenRole } from "@/config/kitchen-roles";

interface PermissionsTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="space-y-6">
      {/* Permission Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Permission Level
          </h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Role
          </label>
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.kitchen_role || "team_member"}
            onChange={(e) =>
              setFormData({
                ...formData,
                kitchen_role: e.target.value as KitchenRole,
              })
            }
          >
            {Object.entries(KITCHEN_ROLES).map(([key, role]) => (
              <option key={key} value={key}>
                {role.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            {KITCHEN_ROLES[formData.kitchen_role as KitchenRole]?.description ||
              "Determines what features and data this user can access"}
          </p>
        </div>
      </div>

      {/* Permission Details */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-700/50">
          <h4 className="font-medium text-white">
            {KITCHEN_ROLES[formData.kitchen_role as KitchenRole]?.label ||
              "Team Member"}{" "}
            Permissions
          </h4>
          <p className="text-sm text-gray-400">
            {KITCHEN_ROLES[formData.kitchen_role as KitchenRole]?.description ||
              "Basic access to kitchen operations"}
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                Feature
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                View
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                Create
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                Edit
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                Delete
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Object.entries(
              KITCHEN_ROLES[formData.kitchen_role as KitchenRole]
                ?.permissions || {},
            ).map(([feature, permissions]) => (
              <tr key={feature} className="hover:bg-gray-700/20">
                <td className="px-4 py-2 text-sm text-white capitalize">
                  {feature}
                </td>
                <td className="px-4 py-2 text-center">
                  {permissions.view ? (
                    <Check className="w-4 h-4 text-green-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {permissions.create ? (
                    <Check className="w-4 h-4 text-green-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {permissions.edit ? (
                    <Check className="w-4 h-4 text-green-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {permissions.delete ? (
                    <Check className="w-4 h-4 text-green-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-green-500/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-400">
              About Permissions
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              Permissions determine what actions a team member can perform in
              the system. Higher-level roles have more access to features and
              functionality. Choose the appropriate role based on the team
              member's responsibilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
