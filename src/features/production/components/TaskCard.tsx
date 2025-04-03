import React from "react";
import { Task } from "@/types/tasks";
import {
  Clock,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ListChecks,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onMoveToInProgress: (taskId: string) => void;
  isCompleted?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onMoveToInProgress,
  isCompleted = false,
}) => {
  // Format the estimated time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Determine priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/20 text-rose-400";
      case "medium":
        return "bg-amber-500/20 text-amber-400";
      case "low":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  // Since status column doesn't exist, we can't determine if it's in progress
  const isInProgress = false;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium">{task.title}</h3>
        {task.priority && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-gray-400 text-sm mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        {task.estimated_time ? (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(task.estimated_time)}
          </span>
        ) : (
          <span></span>
        )}

        {task.station && (
          <span className="bg-gray-700 px-2 py-0.5 rounded-full">
            {task.station}
          </span>
        )}
      </div>

      {task.assignee_id ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <User className="w-3 h-3" />
          <span>Assigned to: {task.assignee_id}</span>
        </div>
      ) : null}

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
        {!isCompleted ? (
          <button
            onClick={() => onMoveToInProgress(task.id)}
            className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
          >
            <ListChecks className="w-3 h-3" />
            Add to Prep List
          </button>
        ) : isInProgress ? (
          <div className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3" />
            In Progress
          </div>
        ) : (
          <div></div>
        )}

        <button
          onClick={() => onComplete(task.id)}
          className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition-colors"
        >
          <CheckCircle className="w-3 h-3" />
          Complete
        </button>
      </div>
    </div>
  );
};
