import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/tasks";
import { useUserNameMapping } from "@/hooks/useUserNameMapping";
import { TaskAssignmentDropdown } from "./TaskAssignmentDropdown";
import { PrepSystemSelector } from "./PrepSystemSelector";
import {
  Clock,
  User,
  CheckCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  MapPin,
  Layers,
  Award,
  Users,
} from "lucide-react";

interface SortableTaskCardProps {
  id: string;
  task: Task;
  onComplete: (taskId: string) => void;
  onAssign?: (taskId: string, assigneeId: string) => Promise<void>;
  onSetForLottery?: (taskId: string) => Promise<void>;
  onUpdatePrepSystem?: (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => Promise<void>;
  onUpdateAmount?: (taskId: string, amount: number) => Promise<void>;
  onUpdatePar?: (taskId: string, par: number) => Promise<void>;
  onUpdateCurrent?: (taskId: string, current: number) => Promise<void>;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  id,
  task,
  onComplete,
  onAssign,
  onSetForLottery,
  onUpdatePrepSystem,
  onUpdateAmount,
  onUpdatePar,
  onUpdateCurrent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const { getUserName } = useUserNameMapping();

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

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Get prep system display text
  const getPrepSystemDisplay = (system: string | undefined) => {
    if (!system) return null;

    switch (system) {
      case "par":
        return "PAR";
      case "as_needed":
        return "AS NEEDED";
      case "scheduled_production":
        return "SCHEDULED";
      case "hybrid":
        return "HYBRID";
      default:
        return system.toUpperCase();
    }
  };

  // Get prep system badge color
  const getPrepSystemColor = (system: string | undefined) => {
    if (!system) return "";

    switch (system) {
      case "par":
        return "bg-blue-500/20 text-blue-300";
      case "as_needed":
        return "bg-amber-500/20 text-amber-300";
      case "scheduled_production":
        return "bg-purple-500/20 text-purple-300";
      case "hybrid":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="expandable-kanban-section"
    >
      <div className="expandable-kanban-header" onClick={toggleExpand}>
        <div className="flex items-center gap-2">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <h3 className="text-lg text-white font-medium">{task.title}</h3>
          {task.prep_system && (
            <span
              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPrepSystemColor(task.prep_system)}`}
            >
              {getPrepSystemDisplay(task.prep_system)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.priority && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="expandable-kanban-content">
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
              <span>Assigned to: {getUserName(task.assignee_id)}</span>
            </div>
          ) : task.assignment_type === "lottery" ? (
            <div className="flex items-center gap-2 text-xs text-amber-400 mb-3">
              <Users className="w-3 h-3" />
              <span>Available for lottery</span>
            </div>
          ) : task.assignment_type === "station" && task.kitchen_station_id ? (
            <div className="flex items-center gap-2 text-xs text-blue-400 mb-3">
              <MapPin className="w-3 h-3" />
              <span>Assigned to station: {task.kitchen_station}</span>
            </div>
          ) : null}

          {task.kitchen_station && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <MapPin className="w-3 h-3" />
              <span>Station: {task.kitchen_station}</span>
            </div>
          )}

          {/* Debug info to verify data */}
          <div className="flex flex-col gap-1 text-xs text-gray-400 mb-3 bg-gray-800/50 p-2 rounded border border-gray-700">
            <div className="font-mono">Debug: Task Data</div>
            <div>prep_system: {task.prep_system || "undefined"}</div>
            <div>station: {task.station || "undefined"}</div>
            <div>kitchen_station: {task.kitchen_station || "undefined"}</div>
            <div>
              kitchen_stations:{" "}
              {JSON.stringify(task.kitchen_stations) || "undefined"}
            </div>
            <div>par_level: {task.par_level || "undefined"}</div>
            <div>current_level: {task.current_level || "undefined"}</div>
            <div>amount_required: {task.amount_required || "undefined"}</div>
            <div>recipe_id: {task.recipe_id || "undefined"}</div>
            <div>kitchen_role: {task.kitchen_role || "undefined"}</div>
            <div>
              master_ingredient_id: {task.master_ingredient_id || "undefined"}
            </div>
          </div>

          {task.prep_system && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Layers className="w-3 h-3" />
              <span className="font-medium">
                Prep system: {getPrepSystemDisplay(task.prep_system)}
              </span>
              {task.prep_system === "par" && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    PAR: {task.par_level || 0}
                  </span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Current: {task.current_level || 0}
                  </span>
                  {task.amount_required && (
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                      Need: {task.amount_required}
                    </span>
                  )}
                </div>
              )}
              {task.prep_system === "as_needed" && (
                <div className="flex items-center gap-2 ml-2">
                  <div className="flex flex-col gap-2 w-full">
                    {task.amount_required ? (
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                        Amount: {task.amount_required}
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                        No amount set
                      </span>
                    )}

                    {onUpdateAmount && (
                      <div className="flex gap-2 items-center mt-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                          id={`amount-input-${task.id}`}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const input = document.getElementById(
                              `amount-input-${task.id}`,
                            ) as HTMLInputElement;
                            if (input && input.value) {
                              const amount = parseInt(input.value);
                              if (!isNaN(amount) && amount > 0) {
                                onUpdateAmount(task.id, amount);
                              }
                            }
                          }}
                          className="bg-amber-500/30 text-amber-300 px-2 py-1 rounded hover:bg-amber-500/50 transition-colors text-xs"
                        >
                          Set Amount
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {task.prep_system === "scheduled_production" && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full ml-2">
                  Scheduled
                </span>
              )}
              {task.prep_system === "hybrid" && task.amount_required && (
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">
                  Amount: {task.amount_required}
                </span>
              )}
            </div>
          )}

          {task.requires_certification &&
            task.requires_certification.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <Award className="w-3 h-3" />
                <span>Requires certification</span>
              </div>
            )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
            <div className="flex gap-2">
              {onAssign && onSetForLottery && (
                <TaskAssignmentDropdown
                  taskId={task.id}
                  assigneeId={task.assignee_id}
                  assignmentType={task.assignment_type}
                  onAssign={onAssign}
                  onSetForLottery={onSetForLottery}
                />
              )}
              {onUpdatePrepSystem && (
                <PrepSystemSelector
                  taskId={task.id}
                  currentSystem={task.prep_system || "as_needed"}
                  onSelectSystem={onUpdatePrepSystem}
                  onUpdateAmount={onUpdateAmount}
                  onUpdatePar={onUpdatePar}
                  onUpdateCurrent={onUpdateCurrent}
                  masterIngredientId={task.master_ingredient_id}
                />
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle className="w-3 h-3" />
              Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
