import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/tasks";
import { Clock, User, CheckCircle, GripVertical } from "lucide-react";

interface SortableTaskCardProps {
  id: string;
  task: Task;
  onComplete: (taskId: string) => void;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  id,
  task,
  onComplete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <h3 className="text-white font-medium">{task.title}</h3>
        </div>
        {task.priority && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-gray-400 text-sm mb-3 ml-6">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mb-3 ml-6">
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
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 ml-6">
          <User className="w-3 h-3" />
          <span>Assigned to: {task.assignee_id}</span>
        </div>
      ) : null}

      <div className="flex justify-end items-center mt-3 pt-3 border-t border-gray-700">
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
