import React from "react";
import { useTeamStore } from "@/stores/teamStore";
import { Users, Edit2, Trash2 } from "lucide-react";
import type { TeamMember } from "../../types";

interface TeamListProps {
  viewMode?: "full" | "compact";
  onEdit?: (member: TeamMember) => void;
}

export const TeamList: React.FC<TeamListProps> = ({
  viewMode = "full",
  onEdit,
}) => {
  const { members, isLoading, error, deleteTeamMember } = useTeamStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-400">Loading team members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg">
        <h2 className="text-lg font-medium">Error Loading Team</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 bg-gray-800/50 rounded-lg flex items-center gap-4"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`}
              alt={member.first_name}
              className="w-12 h-12 rounded-full bg-gray-700"
            />
            <div className="flex-1">
              <div className="font-medium text-white">
                {member.first_name} {member.last_name}
              </div>
              <div className="text-sm text-primary-400">
                {member.kitchen_role || member.role}
              </div>
              {member.station && (
                <div className="text-xs text-gray-400 mt-1">
                  {member.station}
                </div>
              )}
            </div>

            {viewMode === "full" && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit?.(member)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTeamMember(member.id)}
                  className="p-2 text-gray-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No team members found.
        </div>
      )}
    </div>
  );
};
