import React, { useEffect, useState } from "react";
import { useTeamStore } from "@/stores/teamStore";
import { CreateTeamMemberModal } from "../CreateTeamMemberModal";
import { EditTeamMemberModal } from "../EditTeamMemberModal";
import { ImportTeamModal } from "../ImportTeamModal";
import { TeamList } from "../TeamList";
import { Plus, Upload } from "lucide-react";
import type { TeamMember } from "../../types";

export const TeamManagement: React.FC = () => {
  const { fetchTeamMembers } = useTeamStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Team Management
          </h1>
          <p className="text-gray-400">
            Manage your organization's team members
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-ghost"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Team
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Team List */}
      <TeamList viewMode="full" onEdit={handleEdit} />

      {/* Modals */}
      <CreateTeamMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedMember && (
        <EditTeamMemberModal
          member={selectedMember}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMember(null);
          }}
        />
      )}

      <ImportTeamModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
