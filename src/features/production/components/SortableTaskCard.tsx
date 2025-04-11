import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/tasks";
import { useUserNameMapping } from "@/hooks/useUserNameMapping";
import { supabase } from "@/lib/supabase";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useNavigate } from "react-router-dom";
import { useTeamStore } from "@/stores/teamStore";
import { useOperationsStore } from "@/stores/operationsStore";
import {
  Clock,
  User,
  CheckCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  MapPin,
  Award,
  Users,
  RefreshCw,
  CalendarClock,
  Play,
  Pause,
} from "lucide-react";
import { TaskAssignment } from "./TaskAssignment";
import { TaskConfiguration } from "./TaskConfiguration";
import { IngredientDetails } from "./IngredientDetails";
import { RecipeReference } from "./RecipeReference";
import { AssignmentStatus } from "./AssignmentStatus";
import toast from "react-hot-toast";

interface SortableTaskCardProps {
  id: string;
  task: Task;
  onComplete: (taskId: string) => void;
  onAssign: (taskId: string, assigneeId: string) => Promise<void>;
  onSetForLottery: (taskId: string) => Promise<void>;
  onUpdatePrepSystem?: (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => Promise<void>;
  onUpdateAmount?: (taskId: string, amount: number) => Promise<void>;
  onUpdatePar?: (taskId: string, par: number) => Promise<void>;
  onUpdateCurrent?: (taskId: string, current: number) => Promise<void>;
  showAdminView?: boolean;
  isDayView?: boolean;
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
  showAdminView = false,
  isDayView = false,
}) => {
  const [isExpanded, setIsExpanded] = useState({ main: false, config: false });
  const [masterIngredientData, setMasterIngredientData] = useState<any>(null);
  const [recipeName, setRecipeName] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState<string>(
    task.assignment_type || "",
  );
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const { getUserName } = useUserNameMapping();
  const { ingredients, fetchIngredients } = useMasterIngredientsStore();
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
  const navigate = useNavigate();

  // Keep assignmentType in sync with task.assignment_type
  useEffect(() => {
    setAssignmentType(task.assignment_type || "");

    // If assignment_type is undefined but we have station information, set it to station type
    if (!task.assignment_type && (task.station || task.kitchen_station)) {
      setAssignmentType("station");
      task.assignment_type = "station";
    }
  }, [task.assignment_type, task.station, task.kitchen_station]);

  // Keep assignment type in sync with task properties
  useEffect(() => {
    // If assignment_type is undefined but we have station information, set it to station type
    if (
      !task.assignment_type &&
      (task.station || task.kitchen_station || task.assignee_station)
    ) {
      setAssignmentType("station");
      task.assignment_type = "station";
    } else if (task.assignment_type) {
      setAssignmentType(task.assignment_type);
    }
  }, [
    task.assignment_type,
    task.station,
    task.kitchen_station,
    task.assignee_station,
  ]);

  // Fetch team members and kitchen stations
  useEffect(() => {
    fetchTeamMembers();
    fetchSettings();
  }, [fetchTeamMembers, fetchSettings]);

  // Fetch master ingredient data if needed
  useEffect(() => {
    if (
      task.master_ingredient_id &&
      (!task.master_ingredient_name || !task.case_size || !task.units_per_case)
    ) {
      console.log(
        `Task ${task.id} has master_ingredient_id ${task.master_ingredient_id} but missing data, fetching...`,
      );

      // First try to get from the store
      if (ingredients.length > 0) {
        const ingredient = ingredients.find(
          (ing) => ing.id === task.master_ingredient_id,
        );
        if (ingredient) {
          console.log(`Found master ingredient in store:`, ingredient);
          setMasterIngredientData(ingredient);
          return;
        }
      }

      // If not in store, fetch directly
      const fetchMasterIngredient = async () => {
        try {
          const { data, error } = await supabase
            .from("master_ingredients_with_categories")
            .select("*")
            .eq("id", task.master_ingredient_id)
            .single();

          if (error) {
            console.error(
              `Error fetching master ingredient ${task.master_ingredient_id}:`,
              error,
            );
          } else if (data) {
            console.log(`Fetched master ingredient data:`, data);
            setMasterIngredientData(data);
          }
        } catch (err) {
          console.error(`Error in fetchMasterIngredient:`, err);
        }
      };

      fetchMasterIngredient();
    }
  }, [
    task.master_ingredient_id,
    task.master_ingredient_name,
    task.case_size,
    task.units_per_case,
    ingredients,
  ]);

  // Fetch recipe name if recipe_id is available
  useEffect(() => {
    if (task.recipe_id) {
      const fetchRecipeName = async () => {
        try {
          const { data, error } = await supabase
            .from("recipes")
            .select("name")
            .eq("id", task.recipe_id)
            .single();

          if (error) {
            console.error(`Error fetching recipe ${task.recipe_id}:`, error);
          } else if (data) {
            setRecipeName(data.name);
          }
        } catch (err) {
          console.error(`Error in fetchRecipeName:`, err);
        }
      };

      fetchRecipeName();
    }
  }, [task.recipe_id]);

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
    console.log("Getting color for priority:", priority);
    switch (priority) {
      case "high":
        return "bg-red-800 text-white";
      case "medium":
        return "bg-amber-500/20 text-amber-400";
      case "low":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => ({ ...prev, main: !prev.main }));
  };

  // Get prep system display text
  const getPrepSystemDisplay = (system: string | undefined) => {
    if (!system) return null;

    switch (system) {
      case "par":
        return "P";
      case "as_needed":
        return "A";
      case "scheduled_production":
        return "SC";
      case "hybrid":
        return "HY";
      default:
        return system.toUpperCase();
    }
  };

  // Get prep system badge color
  const getPrepSystemColor = (system: string | undefined) => {
    if (!system) return "";

    switch (system) {
      case "par":
        return "text-bold bg-slate-500/20 text-blue-300 border border-slate-500/50";
      case "as_needed":
        return "text-bold bg-slate-500/20 text-amber-300 border border-slate-500/50";
      case "scheduled_production":
        return "bg-slate-500/20 text-purple-300 border border-slate-500/50";
      case "hybrid":
        return "bg-slate-500/20 text-green-300 border border-slate-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
    }
  };

  // Function to handle task updates and provide visual feedback
  const handleTaskUpdate = (updatedTask: Task) => {
    setAssignmentType(updatedTask.assignment_type || "");
    setIsUpdated(true);

    // Visual feedback
    const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
    if (taskElement) {
      taskElement.classList.add("task-updated");
      setTimeout(() => taskElement.classList.remove("task-updated"), 3000);
    }

    setTimeout(() => setIsUpdated(false), 2000);
  };

  // Function to accept a task (for the current user)
  const acceptTask = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user?.id) {
        toast.error("You must be logged in to accept a task");
        return;
      }

      // Call the API handler to update the database
      await onAssign(task.id, data.user.id);

      // Update local task state
      task.assignment_type = "direct";
      task.assignee_id = data.user.id;
      task.kitchen_station = null;
      task.assignee_station = null;
      task.station = null;
      task.lottery = false;

      handleTaskUpdate(task);
      toast.success("Task accepted and assigned to you");
    } catch (error) {
      console.error("Error accepting task:", error);
      toast.error("Failed to accept task");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-task-id={task.id}
      className="expandable-kanban-section"
    >
      <div className="expandable-kanban-header" onClick={toggleExpand}>
        <div className="flex flex-col sm:flex-row w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg text-white font-medium truncate">
              {task.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-0 sm:ml-auto">
            {/* Show badges in day view, hide in week view */}
            {isUpdated && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300 flex-shrink-0">
                Updated
              </span>
            )}
            {isDayView && task.prep_system && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${getPrepSystemColor(task.prep_system)}`}
                key={`prep-system-badge-${task.prep_system}-${isUpdated ? "updated" : "normal"}`}
              >
                {getPrepSystemDisplay(task.prep_system)}
              </span>
            )}
            {/* Late badge - Always show if task is late */}
            {isDayView && task.isLate && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/30 text-rose-300 font-bold border border-rose-500/50 shadow-sm">
                {task.daysLate} {task.daysLate === 1 ? "Day" : "Days"} Late
              </span>
            )}
            {/* Priority badge */}
            {isDayView && task.priority && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}
                key={`priority-badge-${task.priority}-${isUpdated ? "updated" : "normal"}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
            <div className="ml-1">
              {isExpanded.main ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded.main && (
        <div className="expandable-kanban-content">
          {/* Task description - cleaned up without auto-advance history */}
          {task.description && (
            <p className="text-gray-400 text-sm mb-3">
              {task.description.replace(/\s*\[Auto-advanced from.*?\]/g, "")}
            </p>
          )}

          {/* Ingredient Details Section - Now first */}
          <IngredientDetails
            task={task}
            masterIngredientData={masterIngredientData}
          />

          {/* Recipe Reference Component - Now second */}
          <RecipeReference task={task} recipeName={recipeName} />

          {/* Assignment Status Component - Now third */}
          <AssignmentStatus
            task={task}
            onComplete={onComplete}
            estimatedTime={task.estimated_time}
          />

          {task.requires_certification &&
            task.requires_certification.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <Award className="w-3 h-3" />
                <span>Requires certification</span>
              </div>
            )}

          {/* Task Configuration - Expandable section */}
          <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-gray-700">
            {/* Configuration Header */}
            <div
              className="expandable-kanban-header p-2 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => ({ ...prev, config: !prev.config }));
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">
                  Configuration
                </span>
              </div>
              {isExpanded.config ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Configuration Content */}
            {isExpanded.config && (
              <div className="expandable-kanban-content p-0">
                {/* Task Configuration Component */}
                <TaskConfiguration
                  task={task}
                  onUpdatePrepSystem={onUpdatePrepSystem}
                  onUpdateAmount={onUpdateAmount}
                  onUpdatePar={onUpdatePar}
                  onUpdateCurrent={onUpdateCurrent}
                  masterIngredientData={masterIngredientData}
                />

                {/* Assignment Options */}
                <TaskAssignment
                  task={task}
                  onAssign={onAssign}
                  onSetForLottery={onSetForLottery}
                />
              </div>
            )}

            {/* Complete Task Button */}
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task.id);
                  }}
                  className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition-colors"
                >
                  <CheckCircle className="w-3 h-3" />
                  Complete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
