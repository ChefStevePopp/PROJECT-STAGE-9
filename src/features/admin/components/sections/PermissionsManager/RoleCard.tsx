import React from 'react';
import { type KitchenRole } from '@/config/kitchen-roles';

interface RoleCardProps {
  role: KitchenRole;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  assignedUsers?: number;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  label,
  description,
  isActive,
  onClick,
  assignedUsers
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary-500/20 text-white' 
          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <div className="font-medium">{label}</div>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
      {assignedUsers !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {assignedUsers} {assignedUsers === 1 ? 'user' : 'users'} assigned
          </span>
        </div>
      )}
    </button>
  );
};