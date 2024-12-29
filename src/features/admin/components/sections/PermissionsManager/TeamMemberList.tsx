import React from 'react';
import { type TeamMemberData } from '@/features/team/types';
import { type KitchenRole } from '@/config/kitchen-roles';
import { useUserRoleStore } from '@/stores/userRoleStore';

interface TeamMemberListProps {
  members: TeamMemberData[];
  role: KitchenRole;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({ members, role }) => {
  const { userRoles } = useUserRoleStore();

  // Filter members by their assigned kitchen role
  const roleMembers = members.filter(m => 
    userRoles[m.id]?.kitchenRole === role
  );

  if (roleMembers.length === 0) {
    return (
      <span className="text-sm text-gray-500">
        No team members assigned
      </span>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto max-w-[500px] pb-2 mask-fade-right">
        {roleMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 px-2 py-1 bg-gray-800/50 rounded-lg flex-shrink-0"
          >
            <img
              src={member.avatar}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-300 whitespace-nowrap">
              {member.firstName} {member.lastName}
            </span>
          </div>
        ))}
      </div>
      {/* Gradient fade-out effect */}
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
    </div>
  );
};