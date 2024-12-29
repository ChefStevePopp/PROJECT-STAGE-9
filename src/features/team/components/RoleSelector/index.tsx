import React from 'react';
import { Shield } from 'lucide-react';
import { KITCHEN_ROLES, type KitchenRole } from '@/config/kitchen-roles';
import { useUserRole } from '@/hooks/useUserRole';
import toast from 'react-hot-toast';

interface RoleSelectorProps {
  selectedRole: KitchenRole;
  onRoleChange: (role: KitchenRole) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
  disabled = false
}) => {
  const { kitchenRole } = useUserRole();

  const handleRoleChange = (role: KitchenRole) => {
    // Check if current user has permission to assign this role
    if (disabled || !kitchenRole) {
      toast.error('You do not have permission to change roles');
      return;
    }

    // Only allow assigning roles of equal or lower level
    const currentRoleIndex = Object.keys(KITCHEN_ROLES).indexOf(kitchenRole);
    const newRoleIndex = Object.keys(KITCHEN_ROLES).indexOf(role);

    if (newRoleIndex <= currentRoleIndex) {
      toast.error('You cannot assign a role higher than or equal to your own');
      return;
    }

    onRoleChange(role);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-400">
        <Shield className="w-4 h-4 inline-block mr-2" />
        Kitchen Role
      </label>
      <select
        value={selectedRole}
        onChange={(e) => handleRoleChange(e.target.value as KitchenRole)}
        className="input w-full"
        disabled={disabled}
      >
        {Object.entries(KITCHEN_ROLES).map(([role, config]) => (
          <option key={role} value={role}>
            {config.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        {KITCHEN_ROLES[selectedRole].description}
      </p>
    </div>
  );
};