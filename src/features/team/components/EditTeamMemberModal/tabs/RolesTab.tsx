import React from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import type { TeamMember } from "../../../types";

interface RolesTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const RolesTab: React.FC<RolesTabProps> = ({
  formData,
  setFormData,
}) => {
  const addWorkstationRole = () => {
    setFormData({
      ...formData,
      roles: [...(formData.roles || []), ""],
    });
  };

  const updateWorkstationRole = (index: number, value: string) => {
    const newRoles = [...(formData.roles || [])];
    newRoles[index] = value;
    setFormData({ ...formData, roles: newRoles });
  };

  const removeWorkstationRole = (index: number) => {
    const newRoles = [...(formData.roles || [])];
    newRoles.splice(index, 1);
    setFormData({ ...formData, roles: newRoles });
  };

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
        <div className="text-gray-400 text-sm">
          {formData.kitchen_role || "No permission level set"}
        </div>
        <div className="text-xs text-gray-500">
          Permissions are managed in the Admin section
        </div>
      </div>

      {/* Workstation Roles */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-300">
            Workstation Roles
          </h3>
          <button
            type="button"
            onClick={addWorkstationRole}
            className="text-green-400 hover:text-green-300 p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {(formData.roles || []).map((role, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={role}
                onChange={(e) => updateWorkstationRole(index, e.target.value)}
                className="input flex-1 text-sm"
                placeholder="Enter workstation role"
              />
              <button
                type="button"
                onClick={() => removeWorkstationRole(index)}
                className="text-gray-400 hover:text-rose-400 p-2 hover:bg-gray-800/50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(formData.roles || []).length === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              No workstation roles added
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
