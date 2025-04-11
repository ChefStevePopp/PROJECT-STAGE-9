import React from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  User,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { useTaskStore } from "@/stores/taskStore";
import { Task } from "@/types/tasks";
import { TeamMember } from "@/features/team/types";
import { SortableTaskCard } from "@/features/production/components/SortableTaskCard";

interface TaskListProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskAssign?: (taskId: string, assigneeId: string) => Promise<void>;
  onTaskSetForLottery?: (taskId: string) => Promise<void>;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  teamMembers,
  onTaskAssign,
  onTaskSetForLottery,
}) => {
  const { updateTask, deleteTask } = useTaskStore();

  const handleToggleComplete = async (task: Task) => {
    await updateTask(task.id, { completed: !task.completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/20 text-rose-400";
      case "medium":
        return "bg-amber-500/20 text-amber-400";
      case "low":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return "Unassigned";
    const member = teamMembers.find((m) => m.id === assigneeId);
    return member ? `${member.first_name} ${member.last_name}` : "Unassigned";
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No Tasks Found</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          There are no tasks matching your current filters. Try adjusting your
          filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Completion Status */}
            <button
              onClick={() => handleToggleComplete(task)}
              className="mt-1 flex-shrink-0"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500 hover:text-primary-400" />
              )}
            </button>

            {/* Task Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-medium text-lg ${task.completed ? "text-gray-500 line-through" : "text-white"}`}
                >
                  {task.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}
                >
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </span>
              </div>

              <p
                className={`text-sm mb-3 ${task.completed ? "text-gray-600" : "text-gray-400"}`}
              >
                {task.description}
              </p>

              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <User className="w-3.5 h-3.5" />
                  <span>{getAssigneeName(task.assignee_id)}</span>
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due: {formatDueDate(task.due_date)}</span>
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. {formatEstimatedTime(task.estimated_time)}</span>
                </div>

                {task.station && (
                  <div className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full">
                    {task.station}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="dropdown dropdown-end">
              <button className="p-1 hover:bg-gray-700 rounded-full">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              <div className="dropdown-content bg-gray-800 rounded-md shadow-lg p-1 min-w-32">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md"
                  onClick={() =>
                    updateTask(task.id, { completed: !task.completed })
                  }
                >
                  {task.completed ? "Mark Incomplete" : "Mark Complete"}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md"
                  // Edit functionality would be added here
                >
                  Edit Task
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-gray-700 rounded-md"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
