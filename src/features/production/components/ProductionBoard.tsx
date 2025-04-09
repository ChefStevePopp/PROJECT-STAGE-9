import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  RefreshCw,
  Filter,
  HandPlatter,
  User,
  CheckSquare,
  LayoutGrid,
  LayoutList,
  Coffee,
  ListFilter,
  AlertTriangle,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useProductionStore } from "@/stores/productionStore";
import { useOperationsStore } from "@/stores/operationsStore";
import { usePrepListStore } from "@/stores/prepListStore";
import { format, parseISO } from "date-fns";
import { Task, PrepListTemplate, PrepListTemplateTask } from "@/types/tasks";
import { KanbanBoard } from "./KanbanBoard";
import { useProductionData } from "@/hooks/useProductionData";
import { SectionLoadingLogo } from "@/components/SectionLoadingLogo";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface ProductionBoardProps {
  selectedPrepListsFromHeader?: string[];
}

export const ProductionBoard = ({
  selectedPrepListsFromHeader,
}: ProductionBoardProps = {}) => {
  const {
    completeTemplateTask,
    updateTaskDueDate,
    templates,
    fetchTemplates,
    createTemplateTaskFromModule,
    updateTaskPrepSystem,
    updateTaskAmount,
    updateTaskParLevel,
    updateTaskCurrentLevel,
  } = useProductionStore();
  const { settings, fetchSettings } = useOperationsStore();
  const { prepLists, fetchPrepLists } = usePrepListStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [view, setView] = useState<"week" | "day">("week");
  const [selectedPrepLists, setSelectedPrepLists] = useState<string[]>(() => {
    // Try to get saved prep lists from local storage
    const savedPrepLists = localStorage.getItem("selectedPrepLists");
    if (savedPrepLists) {
      try {
        return JSON.parse(savedPrepLists);
      } catch (e) {
        console.error("Error parsing saved prep lists:", e);
      }
    }
    // Fall back to props or empty array
    return selectedPrepListsFromHeader || [];
  });
  const [showPrepListFilter, setShowPrepListFilter] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [availableModules, setAvailableModules] = useState<
    (PrepListTemplateTask & { assigned?: boolean })[]
  >([]);
  const [filters, setFilters] = useState({
    status: "pending" as "pending" | "in_progress" | "completed",
    personalOnly: false,
    kitchenStation: "",
    adminView: false,
    showCateringEvents: true,
    prepListIds: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [processingModuleId, setProcessingModuleId] = useState<string | null>(
    null,
  );

  // Fetch operations settings, templates, and prep lists on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Loading initial data...");
      await Promise.all([fetchSettings(), fetchTemplates(), fetchPrepLists()]);
      console.log("Initial data loaded");
      console.log("Templates loaded:", templates);
      console.log("Prep lists loaded:", prepLists);
    };

    loadInitialData();
  }, [fetchSettings, fetchTemplates, fetchPrepLists]);

  // Debug effect to log templates whenever they change
  useEffect(() => {
    console.log("Templates updated in component:", templates);
    if (templates.length > 0) {
      console.log("First template:", templates[0]);
      console.log("First template tasks:", templates[0].tasks);

      // If we have selected prep lists, update the available modules
      if (selectedPrepLists.length > 0 && selectedDay) {
        const selectedPrepListsData = prepLists.filter((prepList) =>
          selectedPrepLists.includes(prepList.id),
        );

        // Extract template IDs from selected prep lists
        const templateIds = selectedPrepListsData
          .flatMap((prepList) => {
            if (
              prepList.template_ids &&
              Array.isArray(prepList.template_ids) &&
              prepList.template_ids.length > 0
            ) {
              return prepList.template_ids;
            } else if (prepList.template_id) {
              return [prepList.template_id];
            }
            return [];
          })
          .filter(Boolean);

        // Find matching templates
        const selectedTemplates = templates.filter((template) =>
          templateIds.includes(template.id),
        );

        // Extract tasks from templates
        const modulesFromTemplates = selectedTemplates.flatMap(
          (template) => template.tasks || [],
        );

        if (modulesFromTemplates.length > 0) {
          console.log(
            `Found ${modulesFromTemplates.length} modules from templates after update`,
          );
          setAvailableModules(modulesFromTemplates);
        } else if (templateIds.length > 0) {
          // If no modules found but we have template IDs, fetch directly
          console.log(
            "No modules found in templates after update, fetching directly",
          );
          // Define fetchModulesDirectly function
          const fetchModulesDirectly = async (ids: string[]) => {
            try {
              const { data, error } = await supabase
                .from("prep_list_template_tasks")
                .select("*")
                .in("template_id", ids);

              if (error) {
                console.error("Error fetching modules directly:", error);
                return;
              }

              console.log(`Fetched ${data.length} modules directly from database`);
              setAvailableModules(data);
            } catch (err) {
              console.error("Error in fetchModulesDirectly:", err);
            }
          };
          
          fetchModulesDirectly(templateIds);
        }
      }
    }
  }, [templates, selectedPrepLists, selectedDay, prepLists]);

  // Update local state when props change
  useEffect(() => {
    if (selectedPrepListsFromHeader !== undefined) {
      setSelectedPrepLists(selectedPrepListsFromHeader);
      // Save to local storage when updated from props
      localStorage.setItem(
        "selectedPrepLists",
        JSON.stringify(selectedPrepListsFromHeader),
      );
    }
  }, [selectedPrepListsFromHeader]);

  // Save selected prep lists to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "selectedPrepLists",
      JSON.stringify(selectedPrepLists),
    );
  }, [selectedPrepLists]);

  // Update filters when selected prep lists change
  useEffect(() => {
    // CRITICAL FIX: Always show all pending tasks regardless of prep list selection
    console.log("CRITICAL FIX: Showing all pending tasks regardless of prep list selection");
    
    // Force refresh data to ensure we load all pending tasks
    setTimeout(() => refreshData(), 100); // Add slight delay to ensure state is updated

    console.log("Available prep lists:", prepLists);
  }, [selectedPrepLists, prepLists]);

  // Use the custom hook to fetch and organize data
  const {
    weekDays,
    tasksByDay,
    setTasksByDay,
    isLoading,
    error,
    isRefreshing,
    cateringEvents,
    refreshData,
  } = useProductionData(selectedDate, filters);

  // Update assigned status of modules when tasks change
  useEffect(() => {
    if (selectedDay && availableModules.length > 0) {
      const tasksForDay = tasksByDay[selectedDay] || [];
      console.log(
        `Checking assigned modules for day ${selectedDay}:`,
        tasksForDay,
      );

      const assignedModuleIds = tasksForDay
        .map((task) => task.template_id)
        .filter(Boolean);

      console.log("Assigned module IDs:", assignedModuleIds);
      console.log(
        "Available modules before update:",
        availableModules.map((m) => ({
          id: m.id,
          title: m.title,
          template_id: m.template_id,
        })),
      );

      // Update assigned status for modules
      setAvailableModules((prevModules) => {
        const updated = prevModules.map((module) => ({
          ...module,
          assigned: assignedModuleIds.includes(module.template_id || module.id),
        }));
        console.log(
          "Available modules after update:",
          updated.map((m) => ({
            id: m.id,
            title: m.title,
            assigned: m.assigned,
          })),
        );
        return updated;
      });
    }
  }, [tasksByDay, selectedDay]);

  // Handle adding a module to a day
  const handleAddModule = async (
    module: PrepListTemplateTask & { assigned?: boolean },
  ) => {
    if (!selectedDay) {
      toast.error("No day selected. Please select a day first.");
      return;
    }

    // If the module is already assigned, don't add it again
    if (module.assigned) {
      toast.info(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <span>{module.title} is already assigned to this day</span>
        </div>,
      );
      return;
    }

    try {
      setProcessingModuleId(module.id);
      console.log("Adding module to day:", module, selectedDay);

      // Create a copy of the module without the id to prevent duplicate key issues
      const moduleCopy = { ...module };
      delete moduleCopy.id; // Remove the id to let Supabase generate a new one

      console.log("Creating new task from module copy:", moduleCopy);
      const newTask = await createTemplateTaskFromModule(
        moduleCopy,
        selectedDay,
      );

      if (newTask) {
        console.log("Successfully created new task:", newTask);
        // Manually update the local state to immediately show the new task
        setTasksByDay((prev) => {
          const updatedTasks = { ...prev };
          if (!updatedTasks[selectedDay]) {
            updatedTasks[selectedDay] = [];
          }
          updatedTasks[selectedDay] = [...updatedTasks[selectedDay], newTask];
          return updatedTasks;
        });

        // Mark the module as assigned instead of removing it
        setAvailableModules((prevModules) =>
          prevModules.map((m) =>
            m.id === module.id ? { ...m, assigned: true } : m,
          ),
        );

        // Don't refresh data immediately - this is causing the task to disappear
        // await refreshData();

        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>
              Added {module.title} to{" "}
              {format(parseISO(selectedDay), "EEEE, MMM d")}
            </span>
          </div>,
        );
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Error adding module to day:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>
            Failed to add module:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </span>
        </div>,
      );
    } finally {
      setProcessingModuleId(null);
    }
  };

  // Handle moving a task between days
  const handleTaskMove = async (
    taskId: string,
    fromDay: string,
    toDay: string,
  ) => {
    // Update the task's due date in the database
    await updateTaskDueDate(taskId, toDay);

    // Update local state
    setTasksByDay((prev) => {
      const newTasksByDay = { ...prev };

      // Find the task in the fromDay array
      const taskIndex = newTasksByDay[fromDay]?.findIndex(
        (t) => t.id === taskId,
      );
      if (taskIndex === -1 || taskIndex === undefined) return prev;

      // Get the task and update its due date
      const task = { ...newTasksByDay[fromDay][taskIndex], due_date: toDay };

      // Remove from old day
      newTasksByDay[fromDay] = newTasksByDay[fromDay].filter(
        (t) => t.id !== taskId,
      );

      // Add to new day
      newTasksByDay[toDay] = [...(newTasksByDay[toDay] || []), task];

      return newTasksByDay;
    });
  };

  // Handle completing a task
  const handleCompleteTask = async (taskId: string) => {
    await completeTemplateTask(taskId);

    // Update local state by removing the completed task
    setTasksByDay((prev) => {
      const newTasksByDay = { ...prev };

      // Find which day contains this task
      Object.keys(newTasksByDay).forEach((day) => {
        newTasksByDay[day] = newTasksByDay[day].filter((t) => t.id !== taskId);
      });

      return newTasksByDay;
    });
  };

  // Handle prep system update
  const handleUpdatePrepSystem = async (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => {
    try {
      await updateTaskPrepSystem(taskId, system);

      // Update local state
      setTasksByDay((prev) => {
        const newTasksByDay = { ...prev };

        // Find which day contains this task
        Object.keys(newTasksByDay).forEach((day) => {
          newTasksByDay[day] = newTasksByDay[day].map((task) =>
            task.id === taskId ? { ...task, prep_system: system } : task,
          );
        });

        return newTasksByDay;
      });

      toast.success(`Updated prep system to ${system.toUpperCase()}`);
      return true;
    } catch (error) {
      console.error("Error updating prep system:", error);
      toast.error("Failed to update prep system");
      return false;
    }
  };

  // Handle amount update
  const handleUpdateAmount = async (taskId: string, amount: number) => {
    try {
      await updateTaskAmount(taskId, amount);

      // Update local state
      setTasksByDay((prev) => {
        const newTasksByDay = { ...prev };

        // Find which day contains this task
        Object.keys(newTasksByDay).forEach((day) => {
          newTasksByDay[day] = newTasksByDay[day].map((task) =>
            task.id === taskId ? { ...task, amount_required: amount } : task,
          );
        });

        return newTasksByDay;
      });

      toast.success(`Updated required amount to ${amount}`);
      return true;
    } catch (error) {
      console.error("Error updating amount:", error);
      toast.error("Failed to update amount");
      return false;
    }
  };

  // Handle PAR level update
  const handleUpdateParLevel = async (taskId: string, parLevel: number) => {
    try {
      await updateTaskParLevel(taskId, parLevel);

      // Update local state
      setTasksByDay((prev) => {
        const newTasksByDay = { ...prev };

        // Find which day contains this task
        Object.keys(newTasksByDay).forEach((day) => {
          newTasksByDay[day] = newTasksByDay[day].map((task) =>
            task.id === taskId ? { ...task, par_level: parLevel } : task,
          );
        });

        return newTasksByDay;
      });

      toast.success(`Updated PAR level to ${parLevel}`);
      return true;
    } catch (error) {
      console.error("Error updating PAR level:", error);
      toast.error("Failed to update PAR level");
      return false;
    }
  };

  // Handle current level update
  const handleUpdateCurrentLevel = async (
    taskId: string,
    currentLevel: number,
  ) => {
    try {
      await updateTaskCurrentLevel(taskId, currentLevel);

      // Update local state
      setTasksByDay((prev) => {
        const newTasksByDay = { ...prev };

        // Find which day contains this task
        Object.keys(newTasksByDay).forEach((day) => {
          newTasksByDay[day] = newTasksByDay[day].map((task) =>
            task.id === taskId
              ? { ...task, current_level: currentLevel }
              : task,
          );
        });

        return newTasksByDay;
      });

      toast.success(`Updated current level to ${currentLevel}`);
      return true;
    } catch (error) {
      console.error("Error updating current level:", error);
      toast.error("Failed to update current level");
      return false;
    }
  };

  // Handle week change
  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Handle refresh - debounced to prevent multiple rapid refreshes
  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple refreshes while one is in progress
    await refreshData();
  };

  // Handle filter changes
  const togglePersonalFilter = () => {
    setFilters((prev) => ({
      ...prev,
      personalOnly: !prev.personalOnly,
    }));
  };

  // Handle kitchen station filter change
  const handleKitchenStationChange = (station: string) => {
    setFilters((prev) => ({
      ...prev,
      kitchenStation: station === prev.kitchenStation ? "" : station,
    }));
  };

  // Toggle admin view
  const toggleAdminView = () => {
    setFilters((prev) => ({
      ...prev,
      adminView: !prev.adminView,
    }));
  };

  // Toggle catering events
  const toggleCateringEvents = () => {
    setFilters((prev) => ({
      ...prev,
      showCateringEvents: !prev.showCateringEvents,
    }));
  };

  // Toggle between week and day view
  const toggleView = () => {
    setView(view === "week" ? "day" : "week");
    if (view === "day") {
      setSelectedDay(null);
    }
  };

  // Handle day click to switch to day view
  const handleDayClick = (day: string) => {
    console.log("=== DAY CLICK HANDLER START ====");
    setSelectedDate(day);
    setSelectedDay(day);
    setView("day");

    // CRITICAL FIX: Do NOT clear prepListIds when switching to day view
    // This was causing the tasks to disappear
    setFilters((prev) => ({
      ...prev,
      status: "pending",
      personalOnly: false,
      kitchenStation: "",
      adminView: true, // CRITICAL FIX: Set adminView to true to bypass filters
      showCateringEvents: true,
      // Keep existing prepListIds
    }));

    // Force refresh data when switching to day view
    setTimeout(() => {
      console.log("SIMPLIFIED: Forcing data refresh after day click");
      refreshData();
    }, 100);

    // Debug the current state
    console.log("Current tasksByDay:", tasksByDay);
    console.log("Selected day:", day);
    console.log(
      "Tasks for selected day:",
      tasksByDay[day] || "No tasks for this day",
    );

    console.log("=== DAY CLICK HANDLER START ====");
    console.log("Day clicked:", day);
    console.log("Current selected prep lists:", selectedPrepLists);

    // Force refresh templates to ensure we have the latest data with tasks
    fetchTemplates();

    // If there are selected prep lists, fetch their modules
    if (selectedPrepLists.length > 0) {
      try {
        console.log(
          `Fetching modules for ${selectedPrepLists.length} selected prep lists`,
        );
        // Find the prep lists that match the selected prep lists
        const selectedPrepListsData = prepLists.filter((prepList) =>
          selectedPrepLists.includes(prepList.id),
        );

        if (selectedPrepListsData.length === 0) {
          console.warn("No matching prep lists found in prepLists data");
          console.log(
            "Available prep lists:",
            prepLists.map((pl) => ({ id: pl.id, title: pl.title })),
          );
          console.log("Selected prep list IDs:", selectedPrepLists);
          setAvailableModules([]);
          return;
        }

        // Extract template IDs from selected prep lists
        const templateIds = selectedPrepListsData
          .flatMap((prepList) => {
            if (
              prepList.template_ids &&
              Array.isArray(prepList.template_ids) &&
              prepList.template_ids.length > 0
            ) {
              return prepList.template_ids;
            } else if (prepList.template_id) {
              return [prepList.template_id];
            }
            return [];
          })
          .filter(Boolean);

        console.log("Extracted template IDs:", templateIds);

        // Fetch modules directly from the database
        const fetchModulesDirectly = async (templateIds: string[]) => {
          try {
            const { data, error } = await supabase
              .from("prep_list_template_tasks")
              .select("*")
              .in("template_id", templateIds);

            if (error) {
              console.error("Error fetching modules directly:", error);
              return;
            }

            console.log(`Fetched ${data.length} modules directly from database`);
            setAvailableModules(data);
          } catch (err) {
            console.error("Error in fetchModulesDirectly:", err);
          }
        };

        if (templateIds.length > 0) {
          fetchModulesDirectly(templateIds);
        }
      }
    } catch (error) {
      console.error("Error fetching modules for day view:", error);
    }
  };

  // Handle header click to return to week view
  const handleHeaderClick = () => {
    setView("week");
    setSelectedDay(null);
    setFilters((prev) => ({
      ...prev,
      status: "pending",
      adminView: false,
    }));
    refreshData();
  };

  // Render the board
  return (
    <div className="flex flex-col h-full">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleWeekChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <button
            onClick={toggleView}
            className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-700 transition-colors"
            title={view === "week" ? "Switch to day view" : "Switch to week view"}
          >
            {view === "week" ? (
              <>
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Week View</span>
              </>
            ) : (
              <>
                <LayoutList className="w-4 h-4" />
                <span className="hidden md:inline">Day View</span>
              </>
            )}
          </button>

          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-700 transition-colors ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isRefreshing}
            title="Refresh data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPrepListFilter(!showPrepListFilter)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selectedPrepLists.length > 0 ? "bg-primary-500/20 text-primary-300 border border-primary-500/30" : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"}`}
            title="Filter by prep list"
          >
            <Filter className="w-4 h-4" />
            <span>
              {selectedPrepLists.length > 0
                ? `${selectedPrepLists.length} Prep List${selectedPrepLists.length > 1 ? "s" : ""}`
                : "Prep Lists"}
            </span>
          </button>

          <button
            onClick={togglePersonalFilter}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${filters.personalOnly ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"}`}
            title="Show only tasks assigned to you"
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">My Tasks</span>
          </button>

          {settings?.kitchen_stations && settings.kitchen_stations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.kitchen_stations.map((station) => (
                <button
                  key={station}
                  onClick={() => handleKitchenStationChange(station)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${filters.kitchenStation === station ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"}`}
                  title={`Filter by ${station} station`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>{station}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={toggleAdminView}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${filters.adminView ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"}`}
            title="Admin view shows all tasks"
          >
            <ListFilter className="w-4 h-4" />
            <span className="hidden md:inline">Admin View</span>
          </button>

          {cateringEvents.length > 0 && (
            <button
              onClick={toggleCateringEvents}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${filters.showCateringEvents ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"}`}
              title="Show catering events"
            >
              <HandPlatter className="w-4 h-4" />
              <span className="hidden md:inline">Catering</span>
            </button>
          )}
        </div>
      </div>

      {/* Prep list filter dropdown */}
      {showPrepListFilter && (
        <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Filter by Prep Lists</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {prepLists.length > 0 ? (
              prepLists.map((prepList) => (
                <label
                  key={prepList.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPrepLists.includes(prepList.id)}
                    onChange={() => {
                      setSelectedPrepLists((prev) =>
                        prev.includes(prepList.id)
                          ? prev.filter((id) => id !== prepList.id)
                          : [...prev, prepList.id],
                      );
                    }}
                    className="form-checkbox h-4 w-4 text-primary-500 rounded border-gray-700 bg-gray-900 focus:ring-primary-500"
                  />
                  <span>{prepList.title}</span>
                </label>
              ))
            ) : (
              <div className="col-span-full text-gray-400">
                No prep lists available for today. Create a prep list first.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <SectionLoadingLogo text="Loading production board..." />
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* Day view with modules */}
          {view === "day" && selectedDay ? (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Tasks column */}
              <div className="lg:col-span-3">
                <KanbanBoard
                  days={[selectedDay]}
                  tasks={tasksByDay}
                  onTaskMove={handleTaskMove}
                  onTaskComplete={handleCompleteTask}
                  onTaskAssign={onAssign}
                  onTaskSetForLottery={onSetForLottery}
                  onHeaderClick={handleHeaderClick}
                  isDayView={true}
                  onUpdatePrepSystem={handleUpdatePrepSystem}
                  onUpdateAmount={handleUpdateAmount}
                  onUpdateParLevel={handleUpdateParLevel}
                  onUpdateCurrentLevel={handleUpdateCurrentLevel}
                />
              </div>

              {/* Available modules column */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center justify-between">
                  <span>Available Modules</span>
                  <span className="text-sm bg-gray-700 px-2 py-0.5 rounded-full">
                    {availableModules.length}
                  </span>
                </h3>

                {/* Search input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>

                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin">
                  {availableModules.length > 0 ? (
                    availableModules
                      .filter((module) =>
                        module.title
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      )
                      .map((module) => (
                        <div
                          key={module.id}
                          className={`p-3 border rounded-lg transition-colors ${module.assigned ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-gray-700/50 border-gray-700 hover:bg-gray-700 cursor-pointer"}`}
                          onClick={() => !module.assigned && handleAddModule(module)}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{module.title}</h4>
                            {module.assigned ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : processingModuleId === module.id ? (
                              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddModule(module);
                                }}
                                className="text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded hover:bg-primary-500/30 transition-colors"
                              >
                                Add
                              </button>
                            )}
                          </div>
                          {module.description && (
                            <p className="text-xs text-gray-400 mt-1">
                              {module.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            {module.estimated_time && (
                              <span className="bg-gray-700 px-2 py-0.5 rounded-full">
                                {module.estimated_time} min
                              </span>
                            )}
                            {module.station && (
                              <span className="bg-gray-700 px-2 py-0.5 rounded-full">
                                {module.station}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No modules available for the selected prep lists.</p>
                      <p className="text-sm mt-2">
                        Select a prep list or create a new one to see available
                        modules.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Week view */
            <KanbanBoard
              days={weekDays}
              tasks={tasksByDay}
              onTaskMove={handleTaskMove}
              onTaskComplete={handleCompleteTask}
              onTaskAssign={onAssign}
              onTaskSetForLottery={onSetForLottery}
              onDayClick={handleDayClick}
              onUpdatePrepSystem={handleUpdatePrepSystem}
              onUpdateAmount={handleUpdateAmount}
              onUpdateParLevel={handleUpdateParLevel}
              onUpdateCurrentLevel={handleUpdateCurrentLevel}
            />
          )}
        </div>
      )}
    </div>
  );
};
