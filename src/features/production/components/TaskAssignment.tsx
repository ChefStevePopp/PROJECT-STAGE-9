import React, { useState } from "react";
import { Task } from "@/types/tasks";
import { supabase } from "@/lib/supabase";
import { useTeamStore } from "@/stores/teamStore";
import { useOperationsStore } from "@/stores/operationsStore";
import { useUserNameMapping } from "@/hooks/useUserNameMapping";
import { User, MapPin, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface TaskAssignmentProps {
  task: Task;
  onAssign: (taskId: string, assigneeId: string) => Promise<void>;
  onSetForLottery: (taskId: string) => Promise<void>;
}

export const TaskAssignment: React.FC<TaskAssignmentProps> = ({
  task,
  onAssign,
  onSetForLottery,
}) => {
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>(
    task.assignment_type === "direct" && task.assignee_id
      ? task.assignee_id
      : "",
  );
  const [selectedStation, setSelectedStation] = useState<string>(
    task.assignment_type === "station" && task.assignee_station
      ? task.assignee_station
      : task.assignment_type === "station" && task.kitchen_station
        ? task.kitchen_station
        : task.station
          ? task.station
          : "",
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const {
    members,
    fetchTeamMembers,
    isLoading: isTeamLoading,
  } = useTeamStore();

  const {
    settings,
    fetchSettings,
    isLoading: isSettingsLoading,
  } = useOperationsStore();

  const { getUserName } = useUserNameMapping();

  // Function to assign task to station
  const assignToStation = async (stationName: string) => {
    if (!stationName || isUpdating) return;

    setIsUpdating(true);

    try {
      // Update UI state first for immediate feedback
      setSelectedTeamMember("");
      setSelectedStation(stationName);

      // Call the API handler to update the database
      await onAssign(task.id, stationName);

      // Update local task state after successful API call
      task.assignment_type = "station";
      task.assignee_station = stationName; // Use assignee_station for the assigned station
      task.kitchen_station = stationName; // Update kitchen_station for consistency
      task.station = stationName; // Keep station updated for backward compatibility
      task.assignee_id = null;
      task.lottery = false;

      // Visual feedback
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        taskElement.classList.add("task-updated");
        setTimeout(() => taskElement.classList.remove("task-updated"), 3000);
      }

      toast.success(`Assigned to station: ${stationName}`);
    } catch (error) {
      console.error("Error assigning to station:", error);
      toast.error("Failed to assign task to station");
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to assign task to team member (including accepting station/lottery tasks)
  const assignToTeamMember = async (memberId: string) => {
    if (!memberId || isUpdating) return;

    setIsUpdating(true);

    try {
      // Update UI state first for immediate feedback
      setSelectedStation("");
      setSelectedTeamMember(memberId);

      // Check if this is a team member accepting a station/lottery task
      const isAcceptingTask =
        task.assignment_type === "station" ||
        task.assignment_type === "lottery" ||
        task.lottery === true;

      // Call the API handler to update the database
      await onAssign(task.id, memberId);

      // Update local task state after successful API call
      task.assignment_type = "direct";
      task.assignee_id = memberId;
      task.kitchen_station = null;
      task.assignee_station = null;
      task.station = null;
      task.lottery = false;

      // Visual feedback
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        taskElement.classList.add("task-updated");
        setTimeout(() => taskElement.classList.remove("task-updated"), 3000);
      }

      // Show appropriate toast message
      if (isAcceptingTask) {
        toast.success("Task accepted and assigned to you");
      } else {
        toast.success("Task assigned successfully");
      }
    } catch (error) {
      console.error("Error assigning to team member:", error);
      toast.error("Failed to assign task to team member");
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to assign task to lottery pool
  const assignToLottery = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      // Clear selections
      setSelectedTeamMember("");
      setSelectedStation("");

      // Call the API handler to update the database
      await onSetForLottery(task.id);

      // Update local task state after successful API call
      task.assignment_type = "lottery";
      task.lottery = true;
      task.assignee_id = null;
      task.kitchen_station = null;
      task.assignee_station = null;
      task.station = null;

      // Visual feedback
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        taskElement.classList.add("task-updated");
        setTimeout(() => taskElement.classList.remove("task-updated"), 3000);
      }

      toast.success("Task added to lottery pool");
    } catch (error) {
      console.error("Error assigning to lottery:", error);
      toast.error("Failed to assign task to lottery");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-3 rounded border border-gray-700 mb-3">
      <div className="text-sm font-medium mb-3 flex items-center bg-gray-800 p-2 rounded border border-gray-700">
        <span className="text-white">Assign Task:</span>
        {task.assignment_type === "lottery" || task.lottery ? (
          <span className="ml-2 bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full text-xs font-bold border border-rose-500/50">
            LOTTERY POOL
          </span>
        ) : task.assignee_id && task.assignment_type === "direct" ? (
          <span className="ml-2 bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-xs font-bold border border-green-500/50">
            ASSIGNED TO MEMBER
          </span>
        ) : (task.assignee_station || task.kitchen_station || task.station) &&
          (task.assignment_type === "station" || !task.assignment_type) ? (
          <span className="ml-2 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-500/50">
            ASSIGNED TO STATION
          </span>
        ) : (
          <span className="ml-2 bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
            Not Assigned
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Station Assignment */}
        <div className="flex flex-col gap-2">
          <div className="h-9 flex items-center">
            <div
              className={`w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs h-full flex items-center ${task.assignment_type === "station" && (task.assignee_station || task.kitchen_station || task.station) ? "bg-blue-500/20 border-blue-500/50" : selectedStation && selectedStation !== "" ? "bg-blue-500/10 border-blue-500/30" : ""}`}
            >
              <MapPin className="w-3 h-3 mr-1 text-blue-400" />
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                disabled={isSettingsLoading}
                className={`w-full bg-transparent border-none focus:outline-none focus:ring-0 ${isSettingsLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">Select Station</option>
                {isSettingsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  settings?.kitchen_stations?.map((station, index) => (
                    <option key={`station-${index}`} value={station}>
                      {station}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              assignToStation(selectedStation);
            }}
            disabled={!selectedStation || isSettingsLoading || isUpdating}
            className={`flex items-center justify-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors ${!selectedStation || isSettingsLoading || isUpdating ? "opacity-50 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500/50"}`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                Assign Station
              </>
            )}
          </button>
        </div>

        {/* Team Member Assignment */}
        <div className="flex flex-col gap-2">
          <div className="h-9 flex items-center">
            <div
              className={`w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs h-full flex items-center ${task.assignment_type === "direct" && task.assignee_id ? "bg-green-500/20 border-green-500/50" : selectedTeamMember && selectedTeamMember !== "" ? "bg-green-500/10 border-green-500/30" : ""}`}
            >
              <User className="w-3 h-3 mr-1 text-green-400" />
              <select
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
                disabled={isTeamLoading}
                className={`w-full bg-transparent border-none focus:outline-none focus:ring-0 ${isTeamLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">Select Member</option>
                {isTeamLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.display_name ||
                        `${member.first_name} ${member.last_name}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              assignToTeamMember(selectedTeamMember);
            }}
            disabled={!selectedTeamMember || isTeamLoading || isUpdating}
            className={`flex items-center justify-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition-colors ${!selectedTeamMember || isTeamLoading || isUpdating ? "opacity-50 cursor-not-allowed" : "focus:ring-2 focus:ring-green-500/50"}`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                Assign Member
              </>
            )}
          </button>
        </div>

        {/* Lottery Assignment */}
        <div className="flex flex-col gap-2">
          <div className="h-9 flex items-center">
            <div
              className={`w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs h-full flex items-center justify-center ${task.assignment_type === "lottery" || task.lottery ? "bg-rose-500/20 border-rose-500/50" : ""}`}
            >
              <Users className="w-3 h-3 mr-1 text-amber-400" />
              <span>Lottery Pool</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              assignToLottery();
            }}
            disabled={isUpdating}
            className={`flex items-center justify-center gap-1 text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded hover:bg-rose-500/30 transition-colors ${isUpdating ? "opacity-50 cursor-not-allowed" : "focus:ring-2 focus:ring-rose-500/50"}`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Users className="w-3 h-3" />
                Assign to Lottery
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
