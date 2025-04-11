import React, { useState } from "react";
import { Task } from "@/types/tasks";
import { supabase } from "@/lib/supabase";
import { Layers, RefreshCw, Check, Save, CalendarClock } from "lucide-react";
import { TaskScheduler } from "./TaskScheduler";
import toast from "react-hot-toast";

interface TaskConfigurationProps {
  task: Task;
  onUpdatePrepSystem?: (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => Promise<void>;
  onUpdateAmount?: (taskId: string, amount: number) => Promise<void>;
  onUpdatePar?: (taskId: string, par: number) => Promise<void>;
  onUpdateCurrent?: (taskId: string, current: number) => Promise<void>;
  onUpdateCases?: (taskId: string, cases: number) => Promise<void>;
  onUpdateUnits?: (taskId: string, units: number) => Promise<void>;
  masterIngredientData?: any;
}

export const TaskConfiguration: React.FC<TaskConfigurationProps> = ({
  task,
  onUpdatePrepSystem,
  onUpdateAmount,
  onUpdatePar,
  onUpdateCurrent,
  onUpdateCases,
  onUpdateUnits,
  masterIngredientData,
}) => {
  const [autoAdvance, setAutoAdvance] = useState<boolean>(
    task.auto_advance !== false,
  );
  const [dueDate, setDueDate] = useState<string>(task.due_date || "");
  const [isSaved, setIsSaved] = useState<boolean>(!!task.created_at);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unitOfMeasure, setUnitOfMeasure] = useState<string>(
    task.unit_of_measure || masterIngredientData?.unit_of_measure || "units",
  );

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
        return "bg-blue-500/20 text-blue-300 border border-blue-500/50";
      case "as_needed":
        return "bg-amber-500/20 text-amber-300 border border-amber-500/50";
      case "scheduled_production":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/50";
      case "hybrid":
        return "bg-green-500/20 text-green-300 border border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
    }
  };

  // Fetch the latest task data from the database
  const refreshTaskData = async () => {
    if (!task.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("id", task.id)
        .single();

      if (error) {
        console.error("Error fetching task data:", error);
        toast.error("Failed to refresh task data");
      } else if (data) {
        // Save original late status before updating
        const wasLate = task.isLate;
        const originalDaysLate = task.daysLate;

        // Update local task object with fresh data
        task.cases = data.cases || 0;
        task.units = data.units || 0;
        task.amount_required = data.amount_required || 0;
        task.par_level = data.par_level || 0;
        task.current_level = data.current_level || 0;
        task.prep_system = data.prep_system || "as_needed";
        task.due_date = data.due_date || "";
        task.auto_advance = data.auto_advance !== false;
        task.unit_of_measure =
          data.unit_of_measure ||
          masterIngredientData?.unit_of_measure ||
          "units";

        // Update the local state for unit of measure
        setUnitOfMeasure(task.unit_of_measure);

        // Preserve late status
        task.isLate = wasLate !== undefined ? wasLate : data.isLate;
        task.daysLate =
          originalDaysLate !== undefined
            ? originalDaysLate
            : data.daysLate || 0;

        // Update state
        setDueDate(data.due_date || "");
        setAutoAdvance(data.auto_advance !== false);

        toast.success("Task data refreshed");
      }
    } catch (err) {
      console.error("Error in refreshTaskData:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Save unit of measure to database
  const saveUnitOfMeasure = () => {
    setIsUpdated(true);

    // Update task object with current state value
    task.unit_of_measure = unitOfMeasure;

    // Update in database
    supabase
      .from("prep_list_template_tasks")
      .update({ unit_of_measure: unitOfMeasure })
      .eq("id", task.id)
      .then(() => {
        toast.success(`Unit updated to: ${unitOfMeasure}`);
        setTimeout(() => setIsUpdated(false), 3000);
      })
      .catch((error) => {
        console.error("Error updating unit of measure:", error);
        toast.error("Failed to update unit");
      });
  };

  // Reset unit of measure to original value
  const resetUnitOfMeasure = () => {
    const originalValue = masterIngredientData?.unit_of_measure || "units";
    setUnitOfMeasure(originalValue);
    task.unit_of_measure = originalValue;
  };

  // Fetch task data on component mount
  React.useEffect(() => {
    refreshTaskData();
  }, [task.id]);

  return (
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
        <div className="mb-4 bg-gray-800/70 p-3 rounded border border-gray-700">
          <div className="text-xs text-white font-medium mb-2">
            Prep System Selection
          </div>
          {/* Always show the tabs, regardless of onUpdatePrepSystem */}
          <div className="flex flex-col gap-2">
            {/* Prep System Tabs */}
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                className={`tab ${task.prep_system === "as_needed" ? "active amber" : "amber"}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Update local state immediately for UI feedback
                  task.prep_system = "as_needed";
                  setIsUpdated(true);

                  // Then update via API if available
                  if (onUpdatePrepSystem) {
                    onUpdatePrepSystem(task.id, "as_needed");
                  } else {
                    // If no API handler, update directly in database
                    supabase
                      .from("prep_list_template_tasks")
                      .update({ prep_system: "as_needed" })
                      .eq("id", task.id)
                      .then(() => {
                        console.log("Updated prep system to AS-NEEDED");
                      })
                      .catch((error) => {
                        console.error("Error updating prep system:", error);
                      });
                  }
                  setTimeout(() => setIsUpdated(false), 2000);
                }}
              >
                <span>As-Needed</span>
              </button>
              <button
                type="button"
                className={`tab ${task.prep_system === "par" ? "active primary" : "primary"}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Update local state immediately for UI feedback
                  task.prep_system = "par";
                  setIsUpdated(true);

                  // Then update via API if available
                  if (onUpdatePrepSystem) {
                    onUpdatePrepSystem(task.id, "par");
                  } else {
                    // If no API handler, update directly in database
                    supabase
                      .from("prep_list_template_tasks")
                      .update({ prep_system: "par" })
                      .eq("id", task.id)
                      .then(() => {
                        console.log("Updated prep system to PAR");
                      })
                      .catch((error) => {
                        console.error("Error updating prep system:", error);
                      });
                  }
                  setTimeout(() => setIsUpdated(false), 2000);
                }}
              >
                <span>PAR System</span>
              </button>
              <button
                type="button"
                className={`tab ${task.prep_system === "scheduled_production" ? "active purple" : "purple"}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Update local state immediately for UI feedback
                  task.prep_system = "scheduled_production";
                  setIsUpdated(true);

                  // Then update via API if available
                  if (onUpdatePrepSystem) {
                    onUpdatePrepSystem(task.id, "scheduled_production");
                  } else {
                    // If no API handler, update directly in database
                    supabase
                      .from("prep_list_template_tasks")
                      .update({ prep_system: "scheduled_production" })
                      .eq("id", task.id)
                      .then(() => {
                        console.log(
                          "Updated prep system to SCHEDULED PRODUCTION",
                        );
                      })
                      .catch((error) => {
                        console.error("Error updating prep system:", error);
                      });
                  }
                  setTimeout(() => setIsUpdated(false), 2000);
                }}
              >
                <span>Task Scheduler</span>
              </button>
            </div>
          </div>

          {/* Prep System Details - Always show but conditionally render content */}
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-600/50">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Layers className="w-3 h-3" />
              <span className="font-medium">
                Prep system: {getPrepSystemDisplay(task.prep_system)}
              </span>
              {/* Visual indicator for active prep system */}
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPrepSystemColor(task.prep_system)}`}
              >
                {getPrepSystemDisplay(task.prep_system)}
              </span>
            </div>

            {/* PAR System Content */}
            {task.prep_system === "par" && (
              <div className="flex flex-col gap-2 mt-1 w-full">
                {task.master_ingredient_id ? (
                  <div className="bg-blue-500/20 text-blue-300 p-2 rounded border border-blue-500/30">
                    <div className="text-xs font-medium mb-1">
                      {task.master_ingredient_name ||
                        masterIngredientData?.name ||
                        masterIngredientData?.product ||
                        `Ingredient ID: ${task.master_ingredient_id}`}
                    </div>
                    <div className="text-xs text-blue-200/70 mb-2">
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
                      <div className="text-xs text-blue-200/70 mb-2">
                        Storage area:{" "}
                        {task.storage_area ||
                          masterIngredientData?.storage_area}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col">
                        <label className="text-xs text-blue-200/70">
                          PAR Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={task.par_level || 0}
                          placeholder="0"
                          className="w-full bg-gray-700/50 border border-blue-500/30 rounded px-2 py-1 text-white text-xs"
                          onChange={(e) => {
                            const parLevel = parseInt(e.target.value) || 0;

                            // Update local state immediately for UI feedback
                            task.par_level = parLevel;
                            setIsUpdated(true);

                            // Calculate amount required based on PAR - current
                            const currentLevel = task.current_level || 0;
                            const amountRequired = Math.max(
                              0,
                              parLevel - currentLevel,
                            );
                            task.amount_required = amountRequired;

                            // Then update in database
                            supabase
                              .from("prep_list_template_tasks")
                              .update({
                                par_level: parLevel,
                                amount_required: amountRequired,
                              })
                              .eq("id", task.id)
                              .then(() => {
                                console.log(`Updated PAR level to ${parLevel}`);
                                setTimeout(() => setIsUpdated(false), 3000);
                              })
                              .catch((error) => {
                                console.error(
                                  "Error updating PAR level:",
                                  error,
                                );
                              });

                            // Also call the handlers if provided
                            if (onUpdatePar) {
                              onUpdatePar(task.id, parLevel);
                            }
                            if (onUpdateAmount) {
                              onUpdateAmount(task.id, amountRequired);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-blue-200/70">
                          Current Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={task.current_level || 0}
                          placeholder="0"
                          className="w-full bg-gray-700/50 border border-blue-500/30 rounded px-2 py-1 text-white text-xs"
                          onChange={(e) => {
                            const currentLevel = parseInt(e.target.value) || 0;

                            // Update local state immediately for UI feedback
                            task.current_level = currentLevel;
                            setIsUpdated(true);

                            // Calculate amount required based on PAR - current
                            const parLevel = task.par_level || 0;
                            const amountRequired = Math.max(
                              0,
                              parLevel - currentLevel,
                            );
                            task.amount_required = amountRequired;

                            // Then update in database
                            supabase
                              .from("prep_list_template_tasks")
                              .update({
                                current_level: currentLevel,
                                amount_required: amountRequired,
                              })
                              .eq("id", task.id)
                              .then(() => {
                                console.log(
                                  `Updated current level to ${currentLevel}`,
                                );
                                setTimeout(() => setIsUpdated(false), 3000);
                              })
                              .catch((error) => {
                                console.error(
                                  "Error updating current level:",
                                  error,
                                );
                              });

                            // Also call the handlers if provided
                            if (onUpdateCurrent) {
                              onUpdateCurrent(task.id, currentLevel);
                            }
                            if (onUpdateAmount) {
                              onUpdateAmount(task.id, amountRequired);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-blue-200/70">
                          Need to Prep
                        </label>
                        <div className="w-full bg-gray-700/50 border border-blue-500/30 rounded px-2 py-1 text-white text-xs flex items-center justify-center font-medium">
                          {task.amount_required || 0}
                        </div>
                      </div>
                    </div>
                    {task.amount_required > 0 && (
                      <div className="text-xs text-blue-300 mt-2">
                        Total to prep: {task.amount_required}{" "}
                        {task.unit_of_measure ||
                          masterIngredientData?.unit_of_measure ||
                          "units"}
                        {task.cases > 0 && task.units > 0 && (
                          <span className="ml-1">
                            ({task.cases} case
                            {task.cases !== 1 ? "s" : ""} + {task.units} unit
                            {task.units !== 1 ? "s" : ""})
                          </span>
                        )}
                        {task.cases > 0 && !task.units && (
                          <span className="ml-1">
                            ({task.cases} case
                            {task.cases !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      PAR: {task.par_level || 0}
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Current: {task.current_level || 0}
                    </span>
                    {task.amount_required > 0 && (
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                        Need: {task.amount_required}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* As-Needed System Content */}
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
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-amber-200/70">
                          # of Cases
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={task.cases || 0}
                          placeholder="0"
                          className="w-full bg-gray-700/50 border border-amber-500/30 rounded px-2 py-1 text-white text-xs"
                          onChange={(e) => {
                            const cases = parseInt(e.target.value) || 0;

                            // Update local state immediately for UI feedback
                            task.cases = cases;
                            setIsUpdated(true);

                            // Calculate total amount required based on cases and units
                            const unitsPerCase = parseInt(
                              task.units_per_case ||
                                masterIngredientData?.units_per_case ||
                                "1",
                            );
                            const units = task.units || 0;
                            const totalAmount = cases * unitsPerCase + units;
                            task.amount_required = totalAmount;

                            // Then update in database
                            supabase
                              .from("prep_list_template_tasks")
                              .update({
                                cases: cases,
                                amount_required: totalAmount,
                              })
                              .eq("id", task.id)
                              .then(() => {
                                console.log(`Updated cases to ${cases}`);
                                setTimeout(() => setIsUpdated(false), 3000);
                              })
                              .catch((error) => {
                                console.error("Error updating cases:", error);
                              });

                            // Also call the handlers if provided
                            if (onUpdateCases) {
                              onUpdateCases(task.id, cases);
                            }
                            if (onUpdateAmount) {
                              onUpdateAmount(task.id, totalAmount);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-amber-200/70">
                          # of Units
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={task.units || 0}
                          placeholder="0"
                          className="w-full bg-gray-700/50 border border-amber-500/30 rounded px-2 py-1 text-white text-xs"
                          onChange={(e) => {
                            const units = parseInt(e.target.value) || 0;

                            // Update local state immediately for UI feedback
                            task.units = units;
                            setIsUpdated(true);

                            // Calculate total amount required based on cases and units
                            const unitsPerCase = parseInt(
                              task.units_per_case ||
                                masterIngredientData?.units_per_case ||
                                "1",
                            );
                            const cases = task.cases || 0;
                            const totalAmount = cases * unitsPerCase + units;
                            task.amount_required = totalAmount;

                            // Then update in database
                            supabase
                              .from("prep_list_template_tasks")
                              .update({
                                units: units,
                                amount_required: totalAmount,
                              })
                              .eq("id", task.id)
                              .then(() => {
                                console.log(`Updated units to ${units}`);
                                setTimeout(() => setIsUpdated(false), 3000);
                              })
                              .catch((error) => {
                                console.error("Error updating units:", error);
                              });

                            // Also call the handlers if provided
                            if (onUpdateUnits) {
                              onUpdateUnits(task.id, units);
                            }
                            if (onUpdateAmount) {
                              onUpdateAmount(task.id, totalAmount);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-amber-200/70">
                          Total Units
                        </label>
                        <div className="w-full bg-gray-700/50 border border-amber-500/30 rounded px-2 py-1 text-white text-xs flex items-center justify-center font-medium">
                          {task.amount_required || 0}
                        </div>
                      </div>
                    </div>
                    {(task.storage_area ||
                      masterIngredientData?.storage_area) && (
                      <div className="text-xs text-amber-200/70 mb-2">
                        Storage area:{" "}
                        {task.storage_area ||
                          masterIngredientData?.storage_area}
                      </div>
                    )}
                    {task.amount_required > 0 && (
                      <div className="text-xs font-medium text-amber-300 mb-2 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                        <span className="block mb-1">
                          Cases and Units needed in total:
                        </span>
                        <span className="text-sm font-bold">
                          {task.amount_required}{" "}
                          {task.unit_of_measure ||
                            masterIngredientData?.unit_of_measure ||
                            "units"}
                        </span>
                        {task.cases > 0 && task.units > 0 && (
                          <span className="ml-1 block mt-1 text-amber-200/80">
                            ({task.cases} case
                            {task.cases !== 1 ? "s" : ""} + {task.units} unit
                            {task.units !== 1 ? "s" : ""})
                          </span>
                        )}
                        {task.cases > 0 && !task.units && (
                          <span className="ml-1 block mt-1 text-amber-200/80">
                            ({task.cases} case
                            {task.cases !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <label className="text-xs text-amber-200/70">
                          Amount Needed
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={task.amount_required || 0}
                          placeholder="0"
                          className="w-full bg-gray-700/50 border border-amber-500/30 rounded px-2 py-1 text-white text-xs"
                          onChange={(e) => {
                            const amount = parseInt(e.target.value) || 0;

                            // Update local state immediately for UI feedback
                            task.amount_required = amount;
                            setIsUpdated(true);

                            // Then update in database
                            supabase
                              .from("prep_list_template_tasks")
                              .update({ amount_required: amount })
                              .eq("id", task.id)
                              .then(() => {
                                console.log(`Updated amount to ${amount}`);
                                setTimeout(() => setIsUpdated(false), 3000);
                              })
                              .catch((error) => {
                                console.error("Error updating amount:", error);
                              });

                            // Also call the onUpdateAmount handler if provided
                            if (onUpdateAmount) {
                              onUpdateAmount(task.id, amount);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col ml-2">
                        <label className="text-xs text-amber-200/70">
                          Unit
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            maxLength={25}
                            value={unitOfMeasure}
                            className="w-full bg-gray-700/50 border border-amber-500/30 rounded px-2 py-1 text-white text-xs"
                            onChange={(e) => {
                              // Only update local state, don't save to database yet
                              setUnitOfMeasure(e.target.value);
                            }}
                          />
                          <button
                            type="button"
                            className="p-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded"
                            onClick={saveUnitOfMeasure}
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                            onClick={resetUnitOfMeasure}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
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

            {/* Scheduled Production System Content */}
            {task.prep_system === "scheduled_production" && (
              <div className="flex flex-col gap-2 mt-1 w-full">
                <div className="bg-purple-500/20 text-purple-300 p-2 rounded border border-purple-500/30">
                  <div className="text-xs font-medium mb-2">Task Scheduler</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-3 h-3 text-purple-400" />
                      <span className="text-xs">
                        Due date: {task.due_date || "Not set"}
                      </span>
                    </div>
                    {task.amount_required > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                          Amount: {task.amount_required}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Scheduler Component */}
        <TaskScheduler
          taskId={task.id}
          dueDate={dueDate}
          priority={task.priority || "medium"}
          estimatedTime={task.estimated_time || 0}
          autoAdvance={autoAdvance}
          onUpdatePrepSystem={onUpdatePrepSystem}
          onDueDateChange={(taskId, newDueDate) => {
            setDueDate(newDueDate);
            task.due_date = newDueDate;
          }}
          onPriorityChange={(taskId, newPriority) => {
            task.priority = newPriority;
          }}
          onEstimatedTimeChange={(taskId, minutes) => {
            task.estimated_time = minutes;
          }}
          onAutoAdvanceChange={(taskId, newValue) => {
            setAutoAdvance(newValue);
            task.auto_advance = newValue;
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                refreshTaskData();
              }}
              disabled={isLoading}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${isLoading ? "bg-gray-500/20 text-gray-400 cursor-not-allowed" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Refresh Data
                </>
              )}
            </button>
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
                    cases: task.cases || 0,
                    units: task.units || 0,
                    par_level: task.par_level || 0,
                    current_level: task.current_level || 0,
                    auto_advance: autoAdvance,
                    due_date: dueDate || null,
                    unit_of_measure: unitOfMeasure, // Use the state value here
                  })
                  .eq("id", task.id)
                  .then(({ error }) => {
                    setIsSaving(false);
                    if (error) {
                      console.error("Error saving task:", error);
                      toast.error("Failed to save task");
                    } else {
                      console.log("Task saved successfully");
                      setIsSaved(true);
                      toast.success("Task saved successfully");
                      setTimeout(() => setIsSaved(false), 3000);
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
                    cases: task.cases || 0,
                    units: task.units || 0,
                    par_level: task.par_level || 0,
                    current_level: task.current_level || 0,
                    assignee_id: task.assignee_id,
                    kitchen_station: task.kitchen_station,
                    station: task.station,
                    assignment_type: task.assignment_type,
                    lottery: task.lottery || false,
                    auto_advance: autoAdvance,
                    due_date: dueDate || null,
                    unit_of_measure: unitOfMeasure, // Use the state value here
                  })
                  .eq("id", task.id)
                  .then(({ error }) => {
                    setIsUpdating(false);
                    if (error) {
                      console.error("Error updating task:", error);
                      toast.error("Failed to update task");
                    } else {
                      console.log("Task updated successfully");
                      setIsUpdated(true);
                      toast.success("Task updated successfully");
                      // Reset the updated flag after 3 seconds
                      setTimeout(() => setIsUpdated(false), 3000);
                      // Show visual feedback on the task card
                      const taskElement = document.querySelector(
                        `[data-task-id="${task.id}"]`,
                      );
                      if (taskElement) {
                        taskElement.classList.add("task-updated");
                        setTimeout(
                          () => taskElement.classList.remove("task-updated"),
                          3000,
                        );
                      }
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
        </div>
      </div>
    </div>
  );
};
