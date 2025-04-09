import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/tasks";
import { useUserNameMapping } from "@/hooks/useUserNameMapping";
import { TaskAssignmentDropdown } from "./TaskAssignmentDropdown";
import { PrepSystemSelector } from "./PrepSystemSelector";
import { supabase } from "@/lib/supabase";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useRecipeStore } from "@/features/recipes/stores/recipeStore";
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
  Layers,
  Award,
  Users,
  BookOpen,
  Save,
  RefreshCw,
  Check,
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
  const [masterIngredientData, setMasterIngredientData] = useState<any>(null);
  const [recipeName, setRecipeName] = useState<string>("");
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>(
    task.assignment_type === "direct" && task.assignee_id
      ? task.assignee_id
      : "",
  );
  const [selectedStation, setSelectedStation] = useState<string>(
    task.assignment_type === "station" && task.kitchen_station
      ? task.kitchen_station
      : "",
  );
  const [assignmentType, setAssignmentType] = useState<string>(
    task.assignment_type || "",
  );
  const [isSaved, setIsSaved] = useState<boolean>(!!task.created_at);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
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

  // Function to navigate to recipe
  const navigateToRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.recipe_id) {
      navigate(`/recipes/view/${task.recipe_id}`);
    }
  };

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
      data-task-id={task.id}
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
          {isUpdated && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
              Updated
            </span>
          )}
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
              key={`priority-badge-${task.priority}-${isUpdated ? "updated" : "normal"}`}
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

          {/* Assignment Status - Prominent visual indicator */}
          <div className="mb-3 p-2 rounded border">
            {task.assignment_type === "direct" && task.assignee_id ? (
              <div className="flex items-center gap-2 text-sm text-white bg-green-500/20 p-2 rounded border border-green-500/50">
                <User className="w-4 h-4 text-green-400" />
                <span className="font-medium">
                  Assigned to: {getUserName(task.assignee_id)}
                </span>
              </div>
            ) : task.assignment_type === "station" && task.kitchen_station ? (
              <div className="flex items-center gap-2 text-sm text-white bg-blue-500/20 p-2 rounded border border-blue-500/50">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="font-medium">
                  Assigned to station: {task.kitchen_station}
                </span>
              </div>
            ) : task.assignment_type === "lottery" || task.lottery ? (
              <div className="flex items-center gap-2 text-sm text-white bg-rose-500/20 p-2 rounded border border-rose-500/50">
                <Users className="w-4 h-4 text-rose-400" />
                <span className="font-medium">Available for lottery</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-white bg-gray-700/50 p-2 rounded border border-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Not assigned</span>
              </div>
            )}
          </div>

          {task.kitchen_station && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <MapPin className="w-3 h-3" />
              <span>Station: {task.kitchen_station}</span>
            </div>
          )}

          {/* Recipe information if available */}
          {task.recipe_id && recipeName && (
            <div className="flex flex-col gap-2 text-xs text-blue-400 mb-3 bg-blue-500/10 p-2 rounded border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="font-medium">Recipe: {recipeName}</div>
                <button
                  onClick={navigateToRecipe}
                  className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-1 rounded transition-colors"
                >
                  <BookOpen className="w-3 h-3" />
                  Read Recipe
                </button>
              </div>
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
            <div>
              master_ingredient_name:{" "}
              {task.master_ingredient_name ||
                masterIngredientData?.name ||
                masterIngredientData?.product ||
                "undefined"}
            </div>
            <div>
              case_size:{" "}
              {task.case_size || masterIngredientData?.case_size || "undefined"}
            </div>
            <div>
              units_per_case:{" "}
              {task.units_per_case ||
                masterIngredientData?.units_per_case ||
                "undefined"}
            </div>
          </div>

          {task.requires_certification &&
            task.requires_certification.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <Award className="w-3 h-3" />
                <span>Requires certification</span>
              </div>
            )}

          <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-gray-700">
            {/* Task Configuration - Comprehensive section with all task details */}
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700 mb-3">
              <div className="text-xs text-gray-400 font-medium mb-2">
                Task Configuration
                <span className="block text-xs text-gray-500 font-normal mt-1">
                  Set task details, priority, and production requirements
                </span>
              </div>

              {/* Prep System Section */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 font-medium mb-2">
                  Prep System
                </div>
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

                {/* Prep System Details */}
                {task.prep_system && (
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-600/50">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Layers className="w-3 h-3" />
                      <span className="font-medium">
                        Prep system: {getPrepSystemDisplay(task.prep_system)}
                      </span>
                    </div>

                    {task.prep_system === "par" && (
                      <div className="flex items-center gap-2 mt-1">
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
                      <div className="flex flex-col gap-2 mt-1 w-full">
                        {task.master_ingredient_id ? (
                          <div className="bg-amber-500/20 text-amber-300 p-2 rounded border border-amber-500/30">
                            <div className="text-xs font-medium mb-1">
                              {task.master_ingredient_name ||
                                masterIngredientData?.name ||
                                masterIngredientData?.product ||
                                `Ingredient ID: ${task.master_ingredient_id}`}
                            </div>
                            <div className="text-xs text-amber-200/70 mb-2">
                              Case size:{" "}
                              {task.case_size ||
                                masterIngredientData?.case_size ||
                                "N/A"}
                              , Units per case:{" "}
                              {task.units_per_case ||
                                masterIngredientData?.units_per_case ||
                                "N/A"}
                            </div>
                            {(task.storage_area ||
                              masterIngredientData?.storage_area) && (
                              <div className="text-xs text-amber-200/70 mb-2">
                                Storage area:{" "}
                                {task.storage_area ||
                                  masterIngredientData?.storage_area}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <label className="text-xs text-amber-200/70">
                                  Cases
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  defaultValue={
                                    task.amount_required &&
                                    (task.units_per_case ||
                                      masterIngredientData?.units_per_case)
                                      ? Math.floor(
                                          task.amount_required /
                                            parseInt(
                                              task.units_per_case ||
                                                masterIngredientData?.units_per_case ||
                                                "1",
                                            ),
                                        )
                                      : "0"
                                  }
                                  placeholder="0"
                                  className="w-16 bg-gray-700/50 border border-amber-500/30 rounded px-2 py-1 text-white text-xs"
                                  onChange={(e) => {
                                    const cases = parseInt(e.target.value) || 0;
                                    const units =
                                      task.units_per_case ||
                                      masterIngredientData?.units_per_case
                                        ? parseInt(
                                            task.units_per_case ||
                                              masterIngredientData?.units_per_case,
                                          )
                                        : 1;
                                    const totalAmount = cases * units;

                                    // Update local state immediately for UI feedback
                                    task.amount_required = totalAmount;
                                    setIsUpdated(true);

                                    // Then update in database
                                    supabase
                                      .from("prep_list_template_tasks")
                                      .update({
                                        amount_required: totalAmount,
                                        updated_at: new Date().toISOString(),
                                        // Preserve other important fields
                                        status: task.status || "pending",
                                        priority: task.priority || "medium",
                                        prep_system:
                                          task.prep_system || "as_needed",
                                        assignment_type: task.assignment_type,
                                        lottery: task.lottery || false,
                                        kitchen_station: task.kitchen_station,
                                        assignee_id: task.assignee_id,
                                      })
                                      .eq("id", task.id)
                                      .then(() => {
                                        console.log(
                                          `Updated amount to ${totalAmount}`,
                                        );
                                        setTimeout(
                                          () => setIsUpdated(false),
                                          3000,
                                        );
                                      })
                                      .catch((error) => {
                                        console.error(
                                          "Error updating amount:",
                                          error,
                                        );
                                      });

                                    // Also call the onUpdateAmount handler if provided
                                    if (onUpdateAmount) {
                                      onUpdateAmount(task.id, totalAmount);
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs text-amber-200/70">
                                  Units
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  defaultValue={
                                    task.amount_required &&
                                    (task.units_per_case ||
                                      masterIngredientData?.units_per_case)
                                      ? task.amount_required %
                                        parseInt(
                                          task.units_per_case ||
                                            masterIngredientData?.units_per_case ||
                                            "1",
                                        )
                                      : "0"
                                  }
                                  placeholder="0"
                                  className="w-16 bg-gray-700/50 border border-amber-500/30 rounded px-2 py-1 text-white text-xs"
                                  onChange={(e) => {
                                    const units = parseInt(e.target.value) || 0;

                                    // Update local state immediately for UI feedback
                                    task.amount_required = units;
                                    setIsUpdated(true);

                                    // Then update in database
                                    supabase
                                      .from("prep_list_template_tasks")
                                      .update({
                                        amount_required: units,
                                        updated_at: new Date().toISOString(),
                                        // Preserve other important fields
                                        status: task.status || "pending",
                                        priority: task.priority || "medium",
                                        prep_system:
                                          task.prep_system || "as_needed",
                                        assignment_type: task.assignment_type,
                                        lottery: task.lottery || false,
                                        kitchen_station: task.kitchen_station,
                                        assignee_id: task.assignee_id,
                                      })
                                      .eq("id", task.id)
                                      .then(() => {
                                        console.log(
                                          `Updated amount to ${units}`,
                                        );
                                        setTimeout(
                                          () => setIsUpdated(false),
                                          3000,
                                        );
                                      })
                                      .catch((error) => {
                                        console.error(
                                          "Error updating amount:",
                                          error,
                                        );
                                      });

                                    // Also call the onUpdateAmount handler if provided
                                    if (onUpdateAmount) {
                                      onUpdateAmount(task.id, units);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            {task.amount_required > 0 && (
                              <div className="text-xs text-amber-300 mt-2">
                                Total: {task.amount_required}{" "}
                                {task.unit_of_measure ||
                                  masterIngredientData?.unit_of_measure ||
                                  "units"}
                              </div>
                            )}
                          </div>
                        ) : task.amount_required ? (
                          <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            Amount: {task.amount_required}
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            No amount set
                          </span>
                        )}
                      </div>
                    )}

                    {task.prep_system === "scheduled_production" && (
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full mt-1">
                        Scheduled
                      </span>
                    )}

                    {task.prep_system === "hybrid" && task.amount_required && (
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full mt-1">
                        Amount: {task.amount_required}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Task Planning Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Priority Selector */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Priority
                  </label>
                  <select
                    value={task.priority || "medium"}
                    onChange={(e) => {
                      e.stopPropagation();
                      // Update priority in database
                      // Update local state first for immediate feedback
                      const newPriority = e.target.value;
                      task.priority = newPriority;

                      // Then update in database
                      supabase
                        .from("prep_list_template_tasks")
                        .update({
                          priority: newPriority,
                          updated_at: new Date().toISOString(),
                          // Preserve other important fields
                          status: task.status || "pending",
                          prep_system: task.prep_system || "as_needed",
                          assignment_type: task.assignment_type,
                          lottery: task.lottery || false,
                          kitchen_station: task.kitchen_station,
                          assignee_id: task.assignee_id,
                          amount_required: task.amount_required || 0,
                          par_level: task.par_level || 0,
                          current_level: task.current_level || 0,
                        })
                        .eq("id", task.id)
                        .then(() => {
                          // Show success message
                          console.log(`Updated priority to ${newPriority}`);
                          // Force re-render to update the badge
                          setIsUpdated(true);
                          setTimeout(() => setIsUpdated(false), 1000);
                        })
                        .catch((error) => {
                          console.error("Error updating priority:", error);
                        });
                    }}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {/* Estimated Time Input */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    defaultValue={task.estimated_time || 0}
                    onChange={(e) => {
                      e.stopPropagation();
                      const minutes = parseInt(e.target.value) || 0;
                      // Update estimated_time in database
                      // Update local state first for immediate feedback
                      task.estimated_time = minutes;

                      supabase
                        .from("prep_list_template_tasks")
                        .update({
                          estimated_time: minutes,
                          updated_at: new Date().toISOString(),
                          // Preserve other important fields
                          status: task.status || "pending",
                          priority: task.priority || "medium",
                          prep_system: task.prep_system || "as_needed",
                          assignment_type: task.assignment_type,
                          lottery: task.lottery || false,
                          kitchen_station: task.kitchen_station,
                          assignee_id: task.assignee_id,
                          amount_required: task.amount_required || 0,
                          par_level: task.par_level || 0,
                          current_level: task.current_level || 0,
                        })
                        .eq("id", task.id)
                        .then(() => {
                          // Show success message
                          console.log(
                            `Updated estimated time to ${minutes} minutes`,
                          );
                          // Show visual feedback
                          setIsUpdated(true);
                          setTimeout(() => setIsUpdated(false), 3000);
                          // Show visual feedback on the task card
                          const taskElement = document.querySelector(
                            `[data-task-id="${task.id}"]`,
                          );
                          if (taskElement) {
                            taskElement.classList.add("task-updated");
                            setTimeout(
                              () =>
                                taskElement.classList.remove("task-updated"),
                              3000,
                            );
                          }
                        })
                        .catch((error) => {
                          console.error(
                            "Error updating estimated time:",
                            error,
                          );
                        });
                    }}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    placeholder="Enter time in minutes"
                  />
                </div>
              </div>
            </div>

            {/* Assignment Options */}
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
                ) : task.kitchen_station &&
                  task.assignment_type === "station" ? (
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
                      className={`w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs h-full flex items-center ${task.assignment_type === "station" ? "bg-blue-500/20 border-blue-500/50" : selectedStation && selectedStation !== "" ? "bg-blue-500/10 border-blue-500/30" : ""}`}
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
                      if (selectedStation) {
                        // Clear assignee when assigning to station
                        setSelectedTeamMember("");

                        // Set loading state to prevent multiple clicks
                        setIsUpdating(true);

                        // CRITICAL: Update database FIRST with ALL required fields
                        supabase
                          .from("prep_list_template_tasks")
                          .update({
                            assignment_type: "station",
                            kitchen_station: selectedStation,
                            assignee_id: null,
                            lottery: false,
                            station: selectedStation, // Also update the station field for backward compatibility
                            updated_at: new Date().toISOString(), // Add timestamp to ensure update is tracked
                            status: task.status || "pending", // Ensure status is preserved
                            priority: task.priority || "medium", // Ensure priority is preserved
                            prep_system: task.prep_system || "as_needed", // Ensure prep system is preserved
                            amount_required: task.amount_required || 0, // Preserve amount required
                            par_level: task.par_level || 0, // Preserve PAR level
                            current_level: task.current_level || 0, // Preserve current level
                          })
                          .eq("id", task.id)
                          .then(({ error, data }) => {
                            setIsUpdating(false);

                            if (error) {
                              console.error("Database update failed:", error);
                              return;
                            }

                            console.log(
                              `Successfully assigned task to station: ${selectedStation}`,
                              data,
                            );

                            // IMPORTANT: Update local state AFTER successful DB update
                            task.assignment_type = "station";
                            task.kitchen_station = selectedStation;
                            task.station = selectedStation; // Also update station field in local state
                            task.assignee_id = undefined;
                            task.lottery = false; // Clear lottery flag
                            setAssignmentType("station");

                            // Force re-render
                            setIsUpdated(true);

                            // Then call the API if it exists
                            if (onAssign) {
                              onAssign(task.id, selectedStation).catch(
                                (err) => {
                                  console.error(
                                    "API call failed but database was updated:",
                                    err,
                                  );
                                },
                              );
                            }

                            // Reset updated flag after delay
                            setTimeout(() => setIsUpdated(false), 3000);

                            // Add task-updated class for visual feedback
                            const taskElement = document.querySelector(
                              `[data-task-id="${task.id}"]`,
                            );
                            if (taskElement) {
                              taskElement.classList.add("task-updated");
                              setTimeout(
                                () =>
                                  taskElement.classList.remove("task-updated"),
                                3000,
                              );
                            }
                          })
                          .catch((error) => {
                            console.error(
                              "Error updating task assignment:",
                              error,
                            );
                            setIsUpdating(false); // Make sure to reset loading state on error
                          });
                      }
                    }}
                    disabled={!selectedStation || isSettingsLoading}
                    className={`flex items-center justify-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors ${!selectedStation || isSettingsLoading ? "opacity-50 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500/50"}`}
                  >
                    <MapPin className="w-3 h-3" />
                    Assign Station
                  </button>
                </div>

                {/* Team Member Assignment */}
                <div className="flex flex-col gap-2">
                  <div className="h-9 flex items-center">
                    <div
                      className={`w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs h-full flex items-center ${task.assignment_type === "direct" ? "bg-green-500/20 border-green-500/50" : selectedTeamMember && selectedTeamMember !== "" ? "bg-green-500/10 border-green-500/30" : ""}`}
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
                      if (selectedTeamMember) {
                        // Clear station when assigning to team member
                        setSelectedStation("");

                        // Set loading state to prevent multiple clicks
                        setIsUpdating(true);

                        // CRITICAL: Update database FIRST with ALL required fields
                        supabase
                          .from("prep_list_template_tasks")
                          .update({
                            assignment_type: "direct",
                            assignee_id: selectedTeamMember,
                            kitchen_station: null,
                            station: null, // Also clear the station field
                            lottery: false,
                            updated_at: new Date().toISOString(), // Add timestamp to ensure update is tracked
                            status: task.status || "pending", // Ensure status is preserved
                            priority: task.priority || "medium", // Ensure priority is preserved
                            prep_system: task.prep_system || "as_needed", // Ensure prep system is preserved
                            amount_required: task.amount_required || 0, // Preserve amount required
                            par_level: task.par_level || 0, // Preserve PAR level
                            current_level: task.current_level || 0, // Preserve current level
                          })
                          .eq("id", task.id)
                          .then(({ error, data }) => {
                            setIsUpdating(false);

                            if (error) {
                              console.error("Database update failed:", error);
                              return;
                            }

                            console.log(
                              `Successfully assigned task to member: ${selectedTeamMember}`,
                              data,
                            );

                            // Update local state AFTER successful DB update
                            task.assignment_type = "direct";
                            task.assignee_id = selectedTeamMember;
                            task.kitchen_station = undefined; // Clear station when assigning to member
                            task.station = undefined; // Also clear station field in local state
                            task.lottery = false; // Clear lottery flag
                            setAssignmentType("direct");

                            // Force re-render
                            setIsUpdated(true);

                            // Then call the API if it exists
                            if (onAssign) {
                              onAssign(task.id, selectedTeamMember).catch(
                                (err) => {
                                  console.error(
                                    "API call failed but database was updated:",
                                    err,
                                  );
                                },
                              );
                            }

                            // Reset updated flag after delay
                            setTimeout(() => setIsUpdated(false), 3000);

                            // Add task-updated class for visual feedback
                            const taskElement = document.querySelector(
                              `[data-task-id="${task.id}"]`,
                            );
                            if (taskElement) {
                              taskElement.classList.add("task-updated");
                              setTimeout(
                                () =>
                                  taskElement.classList.remove("task-updated"),
                                3000,
                              );
                            }
                          })
                          .catch((error) => {
                            console.error(
                              "Error updating task assignment:",
                              error,
                            );
                            setIsUpdating(false); // Make sure to reset loading state on error
                          });
                      }
                    }}
                    disabled={!selectedTeamMember || isTeamLoading}
                    className={`flex items-center justify-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition-colors ${!selectedTeamMember || isTeamLoading ? "opacity-50 cursor-not-allowed" : "focus:ring-2 focus:ring-green-500/50"}`}
                  >
                    <User className="w-3 h-3" />
                    Assign Member
                  </button>
                </div>

                {/* Lottery Assignment */}
                <div className="flex flex-col gap-2">
                  <div className="h-9 flex items-center">
                    <div
                      className={`w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs h-full flex items-center justify-center ${task.assignment_type === "lottery" ? "bg-rose-500/20 border-rose-500/50" : ""}`}
                    >
                      <Users className="w-3 h-3 mr-1 text-amber-400" />
                      <span>Lottery Pool</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      // Clear other selections
                      setSelectedTeamMember("");
                      setSelectedStation("");

                      // Set loading state to prevent multiple clicks
                      setIsUpdating(true);

                      // CRITICAL: Update database FIRST with ALL required fields
                      supabase
                        .from("prep_list_template_tasks")
                        .update({
                          assignment_type: "lottery",
                          lottery: true,
                          assignee_id: null,
                          kitchen_station: null,
                          station: null, // Also clear the station field
                          updated_at: new Date().toISOString(), // Add timestamp to ensure update is tracked
                          status: task.status || "pending", // Ensure status is preserved
                          priority: task.priority || "medium", // Ensure priority is preserved
                          prep_system: task.prep_system || "as_needed", // Ensure prep system is preserved
                          amount_required: task.amount_required || 0, // Preserve amount required
                          par_level: task.par_level || 0, // Preserve PAR level
                          current_level: task.current_level || 0, // Preserve current level
                        })
                        .eq("id", task.id)
                        .then(({ error, data }) => {
                          setIsUpdating(false);

                          if (error) {
                            console.error("Database update failed:", error);
                            return;
                          }

                          console.log(
                            `Successfully assigned task to lottery pool`,
                            data,
                          );

                          // Update local state AFTER successful DB update
                          task.assignment_type = "lottery";
                          setAssignmentType("lottery");

                          // Set lottery flag to true
                          task.lottery = true;

                          // Clear assignee_id and kitchen_station to ensure it's not showing as assigned
                          task.assignee_id = undefined;
                          task.kitchen_station = undefined;
                          task.station = undefined; // Also clear station field in local state

                          // Force re-render
                          setIsUpdated(true);

                          // Then call the API if it exists
                          if (onSetForLottery) {
                            onSetForLottery(task.id).catch((err) => {
                              console.error(
                                "API call failed but database was updated:",
                                err,
                              );
                            });
                          }

                          // Reset updated flag after delay
                          setTimeout(() => setIsUpdated(false), 3000);

                          // Add task-updated class for visual feedback
                          const taskElement = document.querySelector(
                            `[data-task-id="${task.id}"]`,
                          );
                          if (taskElement) {
                            taskElement.classList.add("task-updated");
                            setTimeout(
                              () =>
                                taskElement.classList.remove("task-updated"),
                              3000,
                            );
                          }
                        })
                        .catch((error) => {
                          console.error(
                            "Error updating task assignment:",
                            error,
                          );
                          setIsUpdating(false); // Make sure to reset loading state on error
                        });
                    }}
                    className="flex items-center justify-center gap-1 text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded hover:bg-rose-500/30 transition-colors focus:ring-2 focus:ring-rose-500/50"
                  >
                    <Users className="w-3 h-3" />
                    Assign to Lottery
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Save task changes to database
                      setIsSaving(true);
                      supabase
                        .from("prep_list_template_tasks")
                        .update({
                          priority: task.priority || "medium",
                          estimated_time: task.estimated_time || 0,
                          prep_system: task.prep_system || "as_needed",
                          amount_required: task.amount_required || 0,
                          par_level: task.par_level || 0,
                          current_level: task.current_level || 0,
                          assignment_type: task.assignment_type,
                          lottery: task.lottery || false,
                          kitchen_station: task.kitchen_station,
                          assignee_id: task.assignee_id,
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", task.id)
                        .then(({ error }) => {
                          setIsSaving(false);
                          if (error) {
                            console.error("Error saving task:", error);
                          } else {
                            console.log("Task saved successfully");
                            setIsSaved(true);
                            // Could add toast notification here
                          }
                        });
                    }}
                    disabled={isSaved || isSaving}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${isSaved || isSaving ? "bg-gray-500/20 text-gray-400 cursor-not-allowed" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"}`}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="w-3 h-3" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        Save Task
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Update task in database with current values
                      setIsUpdating(true);
                      supabase
                        .from("prep_list_template_tasks")
                        .update({
                          title: task.title,
                          description: task.description,
                          priority: task.priority || "medium",
                          estimated_time: task.estimated_time || 0,
                          prep_system: task.prep_system || "as_needed",
                          amount_required: task.amount_required || 0,
                          par_level: task.par_level || 0,
                          current_level: task.current_level || 0,
                          assignee_id: task.assignee_id,
                          kitchen_station: task.kitchen_station,
                          station: task.station,
                          assignment_type: task.assignment_type,
                          lottery: task.lottery || false,
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", task.id)
                        .then(({ error }) => {
                          setIsUpdating(false);
                          if (error) {
                            console.error("Error updating task:", error);
                          } else {
                            console.log("Task updated successfully");
                            setIsUpdated(true);
                            // Reset the updated flag after 3 seconds
                            setTimeout(() => setIsUpdated(false), 3000);
                            // Show visual feedback on the task card
                            const taskElement = document.querySelector(
                              `[data-task-id="${task.id}"]`,
                            );
                            if (taskElement) {
                              taskElement.classList.add("task-updated");
                              setTimeout(
                                () =>
                                  taskElement.classList.remove("task-updated"),
                                3000,
                              );
                            }
                            // Could add toast notification here
                          }
                        });
                    }}
                    disabled={isUpdating}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${isUpdating ? "bg-gray-500/20 text-gray-400 cursor-not-allowed" : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"}`}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Update Task
                      </>
                    )}
                  </button>
                </div>
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
