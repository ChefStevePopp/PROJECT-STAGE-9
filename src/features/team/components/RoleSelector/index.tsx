import React from "react";
import { Shield } from "lucide-react";
import { ROLE_DEFINITIONS } from "@/lib/auth/roles/roleDefinitions";

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  // Filter out the dev role and convert role definitions to array
  const roles = Object.entries(ROLE_DEFINITIONS)
    .filter(([id]) => id !== "dev")
    .map(([id, role]) => ({
      id,
      label: role.label,
      description: role.description,
      level: role.level,
    }));

  return (
    <div className="space-y-2">
      {roles.map((role) => (
        <label
          key={role.id}
          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            value === role.id
              ? "bg-primary-500/20 border border-primary-500/50"
              : "bg-gray-800/50 border border-transparent hover:border-gray-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="role"
            value={role.id}
            checked={value === role.id}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
            disabled={disabled}
          />
          <Shield
            className={`w-5 h-5 mt-0.5 ${
              value === role.id ? "text-primary-400" : "text-gray-400"
            }`}
          />
          <div>
            <div
              className={`font-medium ${
                value === role.id ? "text-primary-400" : "text-white"
              }`}
            >
              {role.label}
            </div>
            <div className="text-sm text-gray-400">{role.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
};
