import React, { useState, useEffect } from "react";
import { User, Users, ChevronDown } from "lucide-react";
import { useUserNameMapping } from "@/hooks/useUserNameMapping";
import { supabase } from "@/lib/supabase";

interface TaskAssignmentDropdownProps {
  taskId: string;
  assigneeId?: string;
  assignmentType?: "direct" | "lottery" | "station";
  onAssign: (taskId: string, assigneeId: string) => Promise<void>;
  onSetForLottery: (taskId: string) => Promise<void>;
}

export const TaskAssignmentDropdown: React.FC<TaskAssignmentDropdownProps> = ({
  taskId,
  assigneeId,
  assignmentType = "direct",
  onAssign,
  onSetForLottery,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getUserName } = useUserNameMapping();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user?.user_metadata?.organizationId) {
          console.error("No organization ID found");
          return;
        }

        const organizationId = userData.user.user_metadata.organizationId;

        const { data, error } = await supabase
          .from("organization_team_members")
          .select("id, first_name, last_name, kitchen_role")
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Error fetching team members:", error);
          return;
        }

        const formattedMembers = data.map((member) => ({
          id: member.id,
          name: `${member.first_name} ${member.last_name}${member.kitchen_role ? ` (${member.kitchen_role})` : ""}`,
        }));

        setTeamMembers(formattedMembers);
      } catch (error) {
        console.error("Error in fetchTeamMembers:", error);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleAssign = async (memberId: string) => {
    setIsLoading(true);
    try {
      await onAssign(taskId, memberId);
    } catch (error) {
      console.error("Error assigning task:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleSetForLottery = async () => {
    setIsLoading(true);
    try {
      await onSetForLottery(taskId);
    } catch (error) {
      console.error("Error setting task for lottery:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        disabled={isLoading}
      >
        {assignmentType === "lottery" ? (
          <>
            <Users className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400">Lottery</span>
          </>
        ) : assigneeId ? (
          <>
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">
              {getUserName(assigneeId)}
            </span>
          </>
        ) : (
          <>
            <User className="w-3 h-3" />
            <span>Assign</span>
          </>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={handleSetForLottery}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-gray-700"
            >
              <Users className="w-4 h-4" />
              Set for lottery
            </button>
            <div className="border-t border-gray-700 my-1"></div>
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleAssign(member.id)}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                <User className="w-4 h-4" />
                <span className="truncate">{member.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
