import React, { useState } from "react";
import { X, Search, Users } from "lucide-react";
import type { TeamMember } from "@/features/team/types";

interface AssignMembersModalProps {
  role: string;
  allMembers: TeamMember[];
  currentMembers: TeamMember[];
  onClose: () => void;
  onAssign: (memberId: string, role: string) => Promise<void>;
}

export const AssignMembersModal: React.FC<AssignMembersModalProps> = ({
  role,
  allMembers,
  currentMembers,
  onClose,
  onAssign,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter members based on search
  const filteredMembers = allMembers.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name.toLowerCase().includes(searchLower) ||
      member.last_name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    );
  });

  const handleAssign = async (memberId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onAssign(memberId, role);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Assign Members</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select team members to assign to this role
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/50 outline-none"
            placeholder="Search team members..."
          />
        </div>

        {/* Members List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredMembers.map((member) => {
            const isAssigned = currentMembers.some((m) => m.id === member.id);
            const currentRole = member.kitchen_role || "team_member";

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                    <img
                      src={
                        member.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.first_name}`
                      }
                      alt={member.first_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.first_name}`;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white truncate">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      Current Role: {currentRole}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAssign(member.id)}
                  disabled={isUpdating}
                  className={`flex-shrink-0 px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                    isAssigned
                      ? "bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"
                      : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {isAssigned ? "Remove" : "Assign"}
                </button>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm
                ? "No team members found matching your search."
                : "No team members available."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-700">
          <button onClick={onClose} className="btn-ghost text-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
