import React, { useEffect, useState } from "react";
import { useTeamStore } from "@/stores/teamStore";
import { CreateTeamMemberModal } from "../CreateTeamMemberModal";
import { EditTeamMemberModal } from "../EditTeamMemberModal";
import { ImportTeamModal } from "../ImportTeamModal";
import { TeamList } from "../TeamList";
import { Plus, Upload, Download } from "lucide-react";
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

  const downloadTemplate = () => {
    const headers = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "employee_id",
      "kitchen_role",
      "departments",
      "roles",
    ].join(",");

    const exampleRow = [
      "John",
      "Smith",
      "john.smith@example.com",
      "555-0123",
      "EMP001",
      "Line Cook",
      "Kitchen,Prep",
      "Grill,Sauté",
    ].join(",");

    const csvContent = `${headers}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex p-4 justify-between items-center bg-[#1a1f2b] rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Team Management
          </h1>
          <p className="text-gray-400">
            Manage your organization's team members
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} className="btn-ghost">
            <Download className="w-5 h-5 mr-2" />
            Template
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-ghost"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Member
          </button>
        </div>
      </div>

      {/* Main Content */}
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
