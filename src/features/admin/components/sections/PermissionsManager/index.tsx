import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useSimplifiedAuth";
import { Shield, AlertTriangle, Users, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { RoleCard } from "./RoleCard";
import { TeamMemberList } from "./TeamMemberList";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { AssignMembersModal } from "./AssignMembersModal";
import { ROLE_DEFINITIONS } from "@/lib/auth/roles/roleDefinitions";
import toast from "react-hot-toast";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  kitchen_role: string;
}

export const PermissionsManager: React.FC = () => {
  const { user, organizationId } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [assignModalRole, setAssignModalRole] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!organizationId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: teamData, error: teamError } = await supabase
          .from("organization_team_members")
          .select(
            `
            id,
            first_name,
            last_name,
            email,
            kitchen_role
          `,
          )
          .eq("organization_id", organizationId);

        if (teamError) throw teamError;
        setTeamMembers(teamData || []);
      } catch (error) {
        console.error("Error loading team members:", error);
        setError("Failed to load team members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [organizationId]);

  const handleRoleAssignment = async (memberId: string, role: string) => {
    if (!organizationId) return;

    setIsUpdating(true);
    try {
      // Update the team member's kitchen_role
      const { error: updateError } = await supabase
        .from("organization_team_members")
        .update({ kitchen_role: role })
        .eq("id", memberId)
        .eq("organization_id", organizationId);

      if (updateError) throw updateError;

      // Update local state
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, kitchen_role: role } : m)),
      );

      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  // Count unassigned team members
  const unassignedMembers = teamMembers.filter(
    (m) => !m.kitchen_role || m.kitchen_role === "",
  );
  const hasUnassigned = unassignedMembers.length > 0;

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pb-8">
      {/* Header with Unassigned Warning */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Permissions Manager
          </h1>
          <p className="text-gray-400">
            Manage team member roles and access levels
          </p>
        </div>
        {hasUnassigned && (
          <button
            onClick={() => {
              setAssignModalRole("team_member");
              setIsAssignModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              {unassignedMembers.length} Unassigned
            </span>
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white">
              About Permissions
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Each role has predefined permissions that determine what actions
              team members can perform. Changes to roles take effect
              immediately.
            </p>
          </div>
        </div>
      </div>

      {/* All Role Cards in a 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(ROLE_DEFINITIONS)
          .filter(([id]) => id !== "dev")
          .map(([id, role]) => (
            <RoleCard
              key={id}
              role={{ ...role, id }}
              isSelected={selectedRole === id}
              onSelect={() => setSelectedRole(id)}
              memberCount={
                teamMembers.filter((m) => m.kitchen_role === id).length
              }
              onAssignMembers={() => {
                setAssignModalRole(id);
                setIsAssignModalOpen(true);
              }}
            />
          ))}
      </div>

      {/* Team Members List */}
      {selectedRole && (
        <TeamMemberList
          members={teamMembers}
          selectedRole={selectedRole}
          onAssignRole={handleRoleAssignment}
          isUpdating={isUpdating}
        />
      )}

      {/* Assign Members Modal */}
      {isAssignModalOpen && assignModalRole && (
        <AssignMembersModal
          role={assignModalRole}
          allMembers={teamMembers}
          currentMembers={teamMembers.filter(
            (m) => m.kitchen_role === assignModalRole,
          )}
          onClose={() => {
            setIsAssignModalOpen(false);
            setAssignModalRole(null);
          }}
          onAssign={handleRoleAssignment}
        />
      )}
    </div>
  );
};
