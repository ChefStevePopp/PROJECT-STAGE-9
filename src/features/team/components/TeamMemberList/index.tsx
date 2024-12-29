import React from 'react';
import type { TeamMemberData } from '../../types';

interface TeamMemberListProps {
  members: TeamMemberData[];
  searchTerm: string;
  roleFilter: string;
  onEdit: (member: TeamMemberData) => void;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  searchTerm,
  roleFilter,
  onEdit
}) => {
  const filteredMembers = members.filter(member => {
    const matchesSearch = (
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesRole = roleFilter === 'all' || member.roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="pb-3">Name</th>
            <th className="pb-3">Role</th>
            <th className="pb-3">Department</th>
            <th className="pb-3">Contact</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => (
            <tr key={member.id} className="border-b border-gray-700">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      ID: {member.punchId}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div className="flex flex-wrap gap-2">
                  {member.roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-4">
                <div className="flex flex-wrap gap-2">
                  {member.departments.map((dept, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">{member.email}</p>
                  <p className="text-sm text-gray-300">{member.phone}</p>
                </div>
              </td>
              <td className="py-4">
                <button
                  onClick={() => onEdit(member)}
                  className="btn-ghost px-4 py-2"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamMemberList;