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
import { useAuth } from "@/hooks/useSimplifiedAuth";
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
    toggleTaskAutoAdvance,
    advanceTasksDueDate,
  } = useProductionStore();
  const { settings, fetchSettings } = useOperationsStore();
  const { prepLists, fetchPrepLists } = usePrepListStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [view, setView] = useState<"week" | "day" | "config">("week");
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
    showCateringEvents: true,
    prepListIds: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [processingModuleId, setProcessingModuleId] = useState<string | null>(
    null,
  );
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<
    Array<{
      id: string;
      name: string;
      role: string;
      email?: string;
      kitchen_stations?: string[];
    }>
  >([]);

  // Fetch all team members without filtering
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log("Starting team member fetch...");

        // Get organization_id from user context
        const { data: userData } = await supabase.auth.getUser();
        console.log("User data:", userData);
        console.log("User metadata:", userData.user?.user_metadata);

        // Try a direct query to see if any team members exist at all
        const { data: allTeamMembers, error: allTeamMembersError } =
          await supabase.from("organization_team_members").select("count");

        console.log(
          "Direct query result (all team members):",
          allTeamMembers,
          allTeamMembersError,
        );

        // Fetch all team members without filtering by organization
        // This is a temporary change to see if we can get any team members at all
        const { data, error } = await supabase
          .from("organization_team_members")
          .select(
            "id, first_name, last_name, email, kitchen_role, display_name, kitchen_stations, organization_id, metadata",
          )
          .order("first_name");

        if (error) {
          console.error("Error fetching team members:", error);
          return;
        }

        console.log("Raw team member data (all orgs):", data);

        if (data && data.length > 0) {
          // Format team members for dropdown
          const formattedMembers = data.map((member) => {
            // Use display_name if available, otherwise construct from first_name and last_name
            const displayName =
              member.display_name ||
              (member.first_name && member.last_name
                ? `${member.first_name} ${member.last_name}`
                : `Team Member ${member.id.substring(0, 4)}`);

            // Format role for display - capitalize and clean up
            let formattedRole = "";
            if (member.kitchen_role) {
              formattedRole = member.kitchen_role
                .split("_")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
                )
                .join(" ");
            }

            // Get user_id from metadata if available
            const userId = member.metadata?.user_id || member.id;

            console.log("Member metadata:", member.metadata);
            console.log("Using user ID:", userId);

            return {
              id: userId, // Use user_id from metadata or fallback to id
              name: displayName,
              role: formattedRole,
              email: member.email,
              kitchen_stations: member.kitchen_stations || [],
              organization_id: member.organization_id, // Include organization_id for debugging
            };
          });

          setTeamMembers(formattedMembers);
          console.log("Fetched all team members:", formattedMembers.length);
          console.log("First few team members:", formattedMembers.slice(0, 3));

          // If we have user metadata with organization ID, filter the team members
          if (userData.user?.user_metadata?.organizationId) {
            const organizationId = userData.user.user_metadata.organizationId;
            console.log("Found organization ID in metadata:", organizationId);

            // Filter team members by organization ID
            const filteredMembers = formattedMembers.filter(
              (member) => member.organization_id === organizationId,
            );

            console.log(
              "Filtered team members for org:",
              filteredMembers.length,
            );
            console.log(
              "First few filtered members:",
              filteredMembers.slice(0, 3),
            );

            if (filteredMembers.length > 0) {
              setTeamMembers(filteredMembers);
            } else {
              console.log(
                "No team members found for this organization after filtering",
              );
              // Keep the unfiltered list if no members match the organization
            }
          } else {
            console.log(
              "No organization ID found in user metadata, using all team members",
            );
          }
        } else {
          console.log("No team members found in the database at all");
          setTeamMembers([]);
        }
      } catch (error) {
        console.error("Error in fetchTeamMembers:", error);
        setTeamMembers([]);
      }
    };

    fetchTeamMembers();
  }, []);

  // Fetch operations settings, templates, and prep lists on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Loading initial data...");
      await Promise.all([fetchSettings(), fetchTemplates(), fetchPrepLists()]);
      console.log("Initial data loaded");
      console.log("Templates loaded:", templates);
      console.log("Prep lists loaded:", prepLists);

      // Advance tasks with auto_advance flag set to true
      console.log("Checking for tasks that need to be advanced...");
      await advanceTasksDueDate();
      console.log("Task advancement check completed");
    };

    loadInitialData();
  }, [fetchSettings, fetchTemplates, fetchPrepLists, advanceTasksDueDate]);

  // Debug effect to log templates whenever they change
  useEffect(() => {
    console.log("Templates updated in component:", templates);
    if (templates.length > 0) {
      console.log("First template:", templates[0]);
      console.log("First template tasks:", templates[0].tasks);

      // Debug estimated_time values in template tasks
      if (templates[0].tasks && templates[0].tasks.length > 0) {
        templates[0].tasks.forEach((task) => {
          console.log(
            `Template task ${task.id} - ${task.title} estimated_time:`,
            task.estimated_time,
          );
        });
      }

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

        // If we have template IDs, fetch modules directly from prep_list_templates
        if (templateIds.length > 0) {
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
    if (selectedPrepLists.length > 0) {
      // Find the selected prep lists and extract their template IDs
      const selectedPrepListsData = prepLists.filter((prepList) =>
        selectedPrepLists.includes(prepList.id),
      );

      // Extract all template IDs from the selected prep lists
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
        .filter(Boolean); // Remove any null/undefined values

      // Update filters with template IDs instead of prep list IDs
      setFilters((prev) => ({
        ...prev,
        prepListIds: templateIds,
      }));

      console.log("Selected prep lists:", selectedPrepLists);
      console.log("Extracted template IDs:", templateIds);

      // Force refresh data to ensure we load tasks with the new filter
      setTimeout(() => refreshData(), 100); // Add slight delay to ensure state is updated
    } else {
      // If no prep lists selected, clear the filter
      setFilters((prev) => ({
        ...prev,
        prepListIds: [],
      }));

      // Force refresh with empty filter
      setTimeout(() => refreshData(), 100);
    }

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

      // Use task titles instead of IDs to identify assigned modules
      const assignedModuleTitles = tasksForDay
        .map((task) => task.title)
        .filter(Boolean);

      console.log("Assigned module titles:", assignedModuleTitles);
      console.log(
        "Available modules before update:",
        availableModules.map((m) => ({
          id: m.id,
          title: m.title,
          template_id: m.template_id,
        })),
      );

      // Update assigned status for modules based on title matching
      setAvailableModules((prevModules) => {
        // First mark assigned status
        const updated = prevModules.map((module) => ({
          ...module,
          assigned: assignedModuleTitles.includes(module.title),
        }));

        // Then filter out duplicates, keeping assigned ones first
        const uniqueTitles = new Set();
        const uniqueModules = updated
          // Sort so assigned modules come first
          .sort((a, b) => (a.assigned === b.assigned ? 0 : a.assigned ? -1 : 1))
          .filter((module) => {
            if (uniqueTitles.has(module.title)) {
              return false;
            }
            uniqueTitles.add(module.title);
            return true;
          });

        console.log(
          "Available modules after update:",
          uniqueModules.map((m) => ({
            id: m.id,
            title: m.title,
            assigned: m.assigned,
          })),
        );
        return uniqueModules;
      });
    }
  }, [tasksByDay, selectedDay]);

  // Get the current user from the useAuth hook at the component level
  const { user } = useAuth();

  // Handle adding a module to a day - SIMPLIFIED
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

    // Check if any task with the same title already exists for this day
    const tasksForDay = tasksByDay[selectedDay || ""] || [];
    const existingTask = tasksForDay.find(
      (task) => task.title === module.title,
    );
    if (existingTask) {
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

      // Create a new task based on the module template
      const newTaskData = {
        title: module.title,
        description: module.description
          ? module.description.replace(/\s*\[Auto-advanced from.*?\]/g, "")
          : "",
        template_id: module.template_id, // Keep reference to the original template
        sequence: module.sequence || 0,
        estimated_time:
          module.estimated_time !== undefined ? module.estimated_time : 0,
        default_station: module.station || null,
        kitchen_station: module.kitchen_station || null,
        recipe_id: module.recipe_id || null,
        required: module.required !== undefined ? module.required : true,
        prep_system: module.prep_system || "as_needed",
        par_level: module.par_level || null,
        current_level: module.current_level || null,
        amount_required: module.amount_required || null,
        priority: module.priority || "low",
        due_date: selectedDay,
        assignee_station: null,
        id: crypto.randomUUID(), // Generate a new UUID for each task instance
      };

      console.log(
        `Creating new task from module with estimated_time:`,
        module.estimated_time,
      );

      // Debug log to check where the estimated_time value is coming from
      console.log(`Module template data:`, {
        id: module.id,
        title: module.title,
        estimated_time: module.estimated_time,
        template_id: module.template_id,
      });

      // Ensure assignee_id is not included to avoid foreign key constraint issues
      delete newTaskData.assignee_id;

      const newTask = await createTemplateTaskFromModule(
        newTaskData,
        selectedDay,
      );

      if (newTask) {
        // Update local state to immediately show the new task
        setTasksByDay((prev) => {
          const updatedTasks = { ...prev };
          if (!updatedTasks[selectedDay]) {
            updatedTasks[selectedDay] = [];
          }
          updatedTasks[selectedDay] = [...updatedTasks[selectedDay], newTask];
          return updatedTasks;
        });

        // Mark all modules with the same title as assigned
        setAvailableModules((prevModules) => {
          return prevModules.map((m) =>
            m.title === module.title ? { ...m, assigned: true } : m,
          );
        });

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
    // First, find the task to update its isLate and daysLate properties
    let taskToComplete: Task | undefined;
    let dayOfTask: string | undefined;

    // Find the task in tasksByDay
    Object.entries(tasksByDay).forEach(([day, tasks]) => {
      const foundTask = tasks.find((t) => t.id === taskId);
      if (foundTask) {
        taskToComplete = foundTask;
        dayOfTask = day;
      }
    });

    if (taskToComplete) {
      // Clear the isLate and daysLate properties
      taskToComplete.isLate = false;
      taskToComplete.daysLate = 0;

      // Update the task in the database with these changes
      await supabase
        .from("prep_list_template_tasks")
        .update({
          isLate: false,
          daysLate: 0,
        })
        .eq("id", taskId);
    }

    // Complete the task using the existing function
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
      console.log(`Updating task ${taskId} prep system to ${system}`);
      await updateTaskPrepSystem(taskId, system);

      // Update local state
      setTasksByDay((prev) => {
        const newTasksByDay = { ...prev };

        // Find which day contains this task
        Object.keys(newTasksByDay).forEach((day) => {
          newTasksByDay[day] = newTasksByDay[day].map((task) => {
            if (task.id === taskId) {
              console.log(
                `Updated task ${taskId} prep system from ${task.prep_system} to ${system}`,
              );
              return { ...task, prep_system: system };
            }
            return task;
          });
        });

        return newTasksByDay;
      });

      // Force refresh data to ensure UI updates
      setTimeout(() => refreshData(), 100);

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

  // Handle toggle auto advance
  const handleToggleAutoAdvance = async (
    taskId: string,
    autoAdvance: boolean,
  ) => {
    try {
      await toggleTaskAutoAdvance(taskId, autoAdvance);

      // Update local state
      setTasksByDay((prev) => {
        const newTasksByDay = { ...prev };

        // Find which day contains this task
        Object.keys(newTasksByDay).forEach((day) => {
          newTasksByDay[day] = newTasksByDay[day].map((task) =>
            task.id === taskId ? { ...task, auto_advance: autoAdvance } : task,
          );
        });

        return newTasksByDay;
      });

      toast.success(
        autoAdvance
          ? "Task will automatically advance to the next day if not completed"
          : "Auto-advance disabled for this task",
      );
      return true;
    } catch (error) {
      console.error("Error toggling auto advance:", error);
      toast.error("Failed to update auto-advance setting");
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

  // Admin view is now always enabled by default

  // Toggle catering events
  const toggleCateringEvents = () => {
    setFilters((prev) => ({
      ...prev,
      showCateringEvents: !prev.showCateringEvents,
    }));
  };

  // Shared function to fetch modules based on selected prep lists and day - SIMPLIFIED
  const fetchModulesForSelectedDay = (day: string) => {
    console.log("=== FETCH MODULES FOR SELECTED DAY START ====");
    console.log("Fetching modules for day:", day);
    console.log("Current selected prep lists:", selectedPrepLists);

    // If there are selected prep lists, fetch their modules directly from prep_list_templates table
    if (selectedPrepLists.length > 0) {
      try {
        // Find the prep lists that match the selected prep lists
        const selectedPrepListsData = prepLists.filter((prepList) =>
          selectedPrepLists.includes(prepList.id),
        );

        if (selectedPrepListsData.length === 0) {
          console.log("No matching prep lists found");
          setAvailableModules([]);
          return;
        }

        // Collect all template IDs from the selected prep lists
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
          .filter(Boolean); // Remove any null/undefined values

        if (templateIds.length === 0) {
          console.log("No template IDs found in the selected prep lists");
          setAvailableModules([]);
          return;
        }

        // IMPORTANT: For the Available Modules column, we ONLY fetch from prep_list_templates
        fetchModulesDirectly(templateIds);
      } catch (error) {
        console.error("Error processing prep lists for modules:", error);
        setAvailableModules([]);
      }
    } else {
      console.log("No prep lists selected, clearing available modules");
      setAvailableModules([]);
    }
    console.log("=== FETCH MODULES FOR SELECTED DAY COMPLETE ====");
  };

  // Toggle between week, day, and config views
  const toggleView = () => {
    if (view === "week") {
      setView("day");
    } else if (view === "day") {
      setView("config");
      // Make sure we have a selected day for config view
      if (!selectedDay) {
        setSelectedDay(selectedDate);
      }
      // When switching to config view, fetch modules for the selected day
      if (selectedDay || selectedDate) {
        const dayToUse = selectedDay || selectedDate;
        console.log(
          "Fetching modules when switching to config view for day:",
          dayToUse,
        );
        fetchModulesForSelectedDay(dayToUse);
      }
    } else {
      setView("week");
      setSelectedDay(null);
      // Clear available modules when going back to week view
      setAvailableModules([]);
    }
    console.log(
      "View toggled to:",
      view === "week" ? "day" : view === "day" ? "config" : "week",
    );
    // Debug the current state after toggle
    console.log(
      "Current view:",
      view === "week" ? "day" : view === "day" ? "config" : "week",
    );
    console.log("Selected day:", selectedDay || selectedDate);
  };

  // Handle day click to switch to day view
  const handleDayClick = (day: string) => {
    console.log("=== DAY CLICK HANDLER START ====");
    setSelectedDate(day);
    setSelectedDay(day);
    setView("config"); // Always set to config view when clicking a day
    console.log("View set to config after day click");
    console.log("Selected day set to:", day);

    // Set a loading state for modules
    setProcessingModuleId("loading");

    // CRITICAL FIX: Do NOT clear prepListIds when switching to day view
    // This was causing the tasks to disappear
    setFilters((prev) => ({
      ...prev,
      status: "pending",
      personalOnly: false,
      kitchenStation: "",
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

    // Use the shared function to fetch modules
    fetchModulesForSelectedDay(day);

    console.log("=== DAY CLICK HANDLER COMPLETE ====");
  };

  // Function to fetch templates directly from the database for the Available Modules column - SIMPLIFIED
  const fetchModulesDirectly = async (templateIds: string[]) => {
    try {
      console.log("=== DIRECT MODULE FETCH START ====");

      if (!templateIds || templateIds.length === 0) {
        setAvailableModules([]);
        setProcessingModuleId(null); // Clear loading state
        return;
      }

      // IMPORTANT: For the Available Modules column, we ONLY fetch from prep_list_templates
      const { data, error } = await supabase
        .from("prep_list_templates")
        .select("*")
        .in("id", templateIds);

      if (error) {
        console.error("Error fetching templates:", error);
        setAvailableModules([]);
        setProcessingModuleId(null); // Clear loading state
        return;
      }

      if (data && data.length > 0) {
        // Debug log to check the raw template data
        console.log("Raw template data from database:", data);

        // Check which modules are already assigned to this day
        const tasksForDay = tasksByDay[selectedDay || ""] || [];
        const assignedModuleTitles = tasksForDay
          .map((task) => task.title)
          .filter(Boolean);

        // Convert templates to a format compatible with the modules display
        // Filter out duplicates by title - only keep the first occurrence of each title
        const uniqueTitles = new Set();
        const templatesAsModules = data
          .filter((template) => {
            if (uniqueTitles.has(template.title)) return false;
            uniqueTitles.add(template.title);
            return true;
          })
          .map((template) => {
            // Debug log for each template's estimated_time
            console.log(
              `Template ${template.id} - ${template.title} estimated_time:`,
              template.estimated_time,
            );

            return {
              id: template.id,
              title: template.title,
              description: template.description
                ? template.description.replace(
                    /\s*\[Auto-advanced from.*?\]/g,
                    "",
                  )
                : "",
              template_id: template.id,
              estimated_time:
                template.estimated_time !== undefined
                  ? template.estimated_time
                  : 0,
              station: template.station || "",
              sequence: template.sequence || 0,
              required: true,
              assigned: assignedModuleTitles.includes(template.title),
              prep_system: template.prep_system,
              par_level: template.par_level,
              current_level: template.current_level,
              amount_required: template.amount_required,
              kitchen_station:
                template.kitchen_station || template.kitchen_stations?.[0],
              recipe_id: template.recipe_id,
              requires_certification: template.requires_certification,
              priority: template.priority || "low",
            };
          });

        setAvailableModules(templatesAsModules);
        console.log(`Loaded ${templatesAsModules.length} unique modules`);
      } else {
        console.log("No templates found");
        setAvailableModules([]);
      }
      console.log("=== DIRECT MODULE FETCH COMPLETE ====");
      setProcessingModuleId(null); // Clear loading state
    } catch (err) {
      console.error("Error fetching templates:", err);
      setAvailableModules([]);
      setProcessingModuleId(null); // Clear loading state
    }
  };

  // This function is no longer needed - removing to simplify the code

  // This function is no longer needed as we're simplifying the approach
  // Keeping a minimal version for backward compatibility
  const fetchDirectlyFromPrepListIds = async (prepListIds: string[]) => {
    try {
      // Get template IDs from prep lists
      const { data: prepListsData, error: prepListsError } = await supabase
        .from("prep_lists")
        .select("template_id, template_ids")
        .in("id", prepListIds);

      if (prepListsError || !prepListsData || prepListsData.length === 0) {
        setAvailableModules([]);
        return;
      }

      // Extract template IDs
      const templateIds = prepListsData
        .flatMap((prepList) => {
          const ids = [];
          if (prepList.template_id) ids.push(prepList.template_id);
          if (prepList.template_ids && Array.isArray(prepList.template_ids)) {
            ids.push(...prepList.template_ids);
          }
          return ids;
        })
        .filter(Boolean);

      if (templateIds.length === 0) {
        setAvailableModules([]);
        return;
      }

      // Fetch the templates directly
      fetchModulesDirectly(templateIds);
    } catch (error) {
      console.error("Error fetching from prep list IDs:", error);
      setAvailableModules([]);
    }
  };

  // Filter prep lists based on search term
  const filteredPrepLists =
    prepLists && prepLists.length > 0
      ? prepLists.filter(
          (prepList) =>
            prepList.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (prepList.description || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        )
      : [];

  // State to track if the Kanban board is ready to be displayed
  const [kanbanReady, setKanbanReady] = useState(false);

  // Effect to set kanbanReady to true after data is loaded
  useEffect(() => {
    if (!isLoading && !isRefreshing) {
      // Add a small delay to ensure the board is fully rendered
      const timer = setTimeout(() => {
        setKanbanReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setKanbanReady(false);
    }
  }, [isLoading, isRefreshing]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Production Schedule</h1>

          {/* Prep List Dropdown - Show in both views but with different functionality */}
          <div className="relative ml-4 px-2 py-1">
            <select
              className="bg-gray-800/50 text-white border border-gray-700 rounded-lg p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[180px]"
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                  setSelectedPrepLists([selectedId]);
                  // Find the prep list that matches the selected ID
                  const selectedPrepList = prepLists.find(
                    (prepList) => prepList.id === selectedId,
                  );

                  console.log("Selected prep list:", selectedPrepList);
                  console.log("Selected prep list ID:", selectedId);
                  console.log(
                    "Selected prep list template_id:",
                    selectedPrepList?.template_id,
                  );
                  console.log(
                    "Selected prep list template_ids:",
                    selectedPrepList?.template_ids,
                  );

                  // Since prep_lists can have multiple templates, we'll use the template_ids array
                  // to find all associated template tasks
                  if (selectedPrepList) {
                    // Check for template_ids array first, then fall back to template_id if needed
                    let templateIds = [];

                    if (
                      selectedPrepList.template_ids &&
                      Array.isArray(selectedPrepList.template_ids) &&
                      selectedPrepList.template_ids.length > 0
                    ) {
                      console.log(
                        "Using template_ids array:",
                        selectedPrepList.template_ids,
                      );
                      templateIds = selectedPrepList.template_ids;
                    } else if (selectedPrepList.template_id) {
                      console.log(
                        "Using single template_id:",
                        selectedPrepList.template_id,
                      );
                      templateIds = [selectedPrepList.template_id];
                    } else {
                      console.log("No template IDs found in prep list");
                    }

                    // Update filters with the template IDs instead of prep list IDs
                    // This is the critical fix - we need to pass template IDs to the filter
                    setFilters((prev) => ({
                      ...prev,
                      prepListIds: templateIds,
                    }));

                    // Debug log to verify template IDs
                    console.log(
                      "Final template IDs to search for:",
                      templateIds,
                    );

                    console.log("Looking for templates with IDs:", templateIds);
                    console.log("Available templates:", templates);

                    if (templateIds.length > 0) {
                      // Instead of fetching tasks, fetch the templates directly
                      fetchModulesDirectly(templateIds);
                    } else {
                      console.log("No template IDs found");
                      setAvailableModules([]);
                    }
                  } else {
                    console.log("No prep list selected");
                    setAvailableModules([]);
                  }

                  // If in week view, switch to day view to show modules
                  if (view === "week") {
                    setView("config");
                    setSelectedDay(selectedDate);
                  }

                  // Refresh data to ensure we have the latest tasks with the new filter
                  refreshData();
                } else {
                  setSelectedPrepLists([]);
                  setAvailableModules([]);

                  // Clear the filter and refresh data
                  setFilters((prev) => ({
                    ...prev,
                    prepListIds: [],
                  }));
                  refreshData();
                }
              }}
              value={selectedPrepLists.length === 1 ? selectedPrepLists[0] : ""}
            >
              <option value="">Choose prep-list</option>
              {prepLists && prepLists.length > 0 ? (
                prepLists.map((prepList) => {
                  console.log("Rendering prep list:", prepList);
                  return (
                    <option key={prepList.id} value={prepList.id}>
                      {prepList.title} (
                      {format(new Date(prepList.date), "MMM d")})
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>
                  No prep lists available ({prepLists ? prepLists.length : 0})
                </option>
              )}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1.5 border border-gray-700">
            <Calendar className="w-3 h-3 text-blue-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleWeekChange}
              className="bg-transparent border-none text-white focus:outline-none text-sm w-32"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            {/* My Tasks Filter */}
            <button
              onClick={togglePersonalFilter}
              title="My Tasks"
              className={`p-1.5 rounded-lg ${filters.personalOnly ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Kitchen Station Filter Dropdown */}
            <div className="relative">
              <button
                className={`p-1.5 rounded-lg flex items-center gap-1 ${filters.kitchenStation ? "bg-amber-500/30 text-amber-300 border border-amber-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
                title="Kitchen Station"
              >
                <Filter className="w-5 h-5" />
                {filters.kitchenStation && (
                  <span className="text-xs">
                    {filters.kitchenStation
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </span>
                )}
              </button>
              <select
                value={filters.kitchenStation}
                onChange={(e) => handleKitchenStationChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Select kitchen station"
              >
                <option value="">All Stations</option>
                {settings?.kitchen_stations &&
                settings.kitchen_stations.length > 0 ? (
                  settings.kitchen_stations.map((station) => (
                    <option key={station} value={station}>
                      {station
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </option>
                  ))
                ) : (
                  // Fallback options if settings are not loaded
                  <>
                    <option value="hot_line">Hot Line</option>
                    <option value="cold_line">Cold Line</option>
                    <option value="pastry">Pastry</option>
                    <option value="prep">Prep</option>
                    <option value="dish">Dish</option>
                    <option value="catering">Catering</option>
                  </>
                )}
              </select>
            </div>

            {/* Catering Events Toggle */}
            <button
              onClick={toggleCateringEvents}
              title="Catering Events"
              className={`p-1.5 rounded-lg ${filters.showCateringEvents ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
            >
              <HandPlatter className="w-5 h-5" />
            </button>

            {/* Admin View button removed */}

            {/* Prep List Filter Toggle - Show in both views */}
            <button
              onClick={() => setShowPrepListFilter(!showPrepListFilter)}
              title="Filter by Prep Lists"
              className={`p-1.5 rounded-lg flex items-center gap-1 ${selectedPrepLists.length > 0 ? "bg-blue-500/30 text-blue-300 border border-blue-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
            >
              <ListFilter className="w-5 h-5" />
              {selectedPrepLists.length > 0 && (
                <span className="text-xs font-medium">
                  {selectedPrepLists.length}
                </span>
              )}
            </button>
          </div>

          {/* View Toggle */}
          <button
            onClick={toggleView}
            title={
              view === "week"
                ? "Switch to Day View"
                : view === "day"
                  ? "Switch to Config View"
                  : "Switch to Week View"
            }
            className="p-1.5 rounded-lg bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-700/50"
          >
            {view === "week" ? (
              <LayoutList className="w-5 h-5" />
            ) : view === "day" ? (
              <Coffee className="w-5 h-5" />
            ) : (
              <LayoutGrid className="w-5 h-5" />
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh Data"
            className="p-1.5 rounded-lg bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-700/50"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
            />
          </button>
        </div>
      </header>
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-4 rounded-lg">
          Error: {error}
        </div>
      )}
      {/* Prep List Filter Dropdown */}
      {showPrepListFilter && (
        <div className="bg-gray-800/90 border border-gray-700 rounded-lg p-4 mb-4 animate-fadeIn shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-white font-medium">Filter by Prep Lists</h3>
              <p className="text-gray-400 text-xs mt-1">
                Select prep lists to filter tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">
                {selectedPrepLists.length} selected
              </span>
              <button
                onClick={() => setSelectedPrepLists([])}
                className="text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-2 py-1 rounded"
                disabled={selectedPrepLists.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search prep lists..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
            {filteredPrepLists.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-full">
                {prepLists.length === 0
                  ? "No prep lists available"
                  : "No matching prep lists found"}
              </p>
            ) : (
              filteredPrepLists.map((prepList) => (
                <div
                  key={prepList.id}
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors ${selectedPrepLists.includes(prepList.id) ? "bg-blue-500/20 border border-blue-500/50" : "bg-gray-700/30 border border-gray-700 hover:bg-gray-700/50"}`}
                  onClick={() => {
                    setSelectedPrepLists((prev) =>
                      prev.includes(prepList.id)
                        ? prev.filter((id) => id !== prepList.id)
                        : [...prev, prepList.id],
                    );
                  }}
                >
                  <div className="flex-1 truncate">
                    <div className="flex items-center">
                      {selectedPrepLists.includes(prepList.id) && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      )}
                      <p className="text-sm text-white truncate">
                        {prepList.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400 truncate">
                        {format(new Date(prepList.date), "MMM d, yyyy")}
                      </p>
                      {prepList.status && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${prepList.status === "completed" ? "bg-green-700/50 text-green-300" : prepList.status === "active" ? "bg-blue-700/50 text-blue-300" : "bg-gray-700 text-gray-300"}`}
                        >
                          {prepList.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedPrepLists.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <h4 className="text-sm text-white font-medium mb-2">
                Selected Lists
              </h4>
              <div className="flex flex-wrap gap-2">
                {prepLists && prepLists.length > 0
                  ? prepLists
                      .filter((prepList) =>
                        selectedPrepLists.includes(prepList.id),
                      )
                      .map((prepList) => (
                        <div
                          key={prepList.id}
                          className="flex items-center bg-blue-500/30 text-blue-200 text-xs px-2 py-1 rounded-full"
                        >
                          <span className="truncate max-w-[100px]">
                            {prepList.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPrepLists((prev) =>
                                prev.filter((id) => id !== prepList.id),
                              );
                            }}
                            className="ml-1.5 text-blue-300 hover:text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))
                  : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading state - centered in the screen */}
      {(isLoading || isRefreshing) && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900/70">
          <SectionLoadingLogo
            section="tasks"
            message={
              filters.personalOnly
                ? "Loading your tasks..."
                : "Loading all tasks..."
            }
          />
        </div>
      )}

      {/* Content area - only shown when not loading */}
      <div
        className={`transition-opacity duration-300 ${kanbanReady ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className={`${(view === "day" || view === "config") && selectedDay ? "flex flex-col md:flex-row gap-[5%] w-full" : "w-full"}`}
        >
          <div
            className={
              (view === "day" || view === "config") && selectedDay
                ? "w-full md:w-[60%] min-w-0 flex-shrink-0"
                : "w-full"
            }
          >
            <KanbanBoard
              days={view === "week" ? weekDays : [selectedDate]}
              tasks={tasksByDay}
              onTaskMove={handleTaskMove}
              onTaskComplete={handleCompleteTask}
              onTaskAssign={async (taskId, assigneeId) => {
                try {
                  // First, get the current task to know its current assignment type
                  const { data: currentTask, error: fetchError } =
                    await supabase
                      .from("prep_list_template_tasks")
                      .select("*")
                      .eq("id", taskId)
                      .single();

                  if (fetchError) {
                    console.error("Error fetching current task:", fetchError);
                    throw fetchError;
                  }

                  // If assigneeId looks like a station name (not a UUID), treat it as a station assignment
                  if (
                    assigneeId &&
                    assigneeId.length < 36 &&
                    !assigneeId.includes("-")
                  ) {
                    await updateTaskDueDate(taskId, selectedDate); // Ensure due date is set
                    const { error } = await supabase
                      .from("prep_list_template_tasks")
                      .update({
                        assignment_type: "station",
                        assignee_station: assigneeId,
                        station: assigneeId,
                        assignee_id: null,
                        lottery: false,
                      })
                      .eq("id", taskId);

                    if (error) throw error;
                    toast.success(`Assigned to station: ${assigneeId}`);

                    // Log the transition if it's changing from another assignment type
                    if (
                      currentTask.assignment_type &&
                      currentTask.assignment_type !== "station"
                    ) {
                      console.log(
                        `Task ${taskId} changed from ${currentTask.assignment_type} to station assignment`,
                      );
                    }
                  } else {
                    // It's a team member assignment - check if this is a team member accepting a station/lottery task
                    const isAcceptingTask =
                      currentTask.assignment_type === "station" ||
                      currentTask.assignment_type === "lottery" ||
                      currentTask.lottery === true;

                    await updateTaskDueDate(taskId, selectedDate); // Ensure due date is set
                    const { error } = await supabase
                      .from("prep_list_template_tasks")
                      .update({
                        assignment_type: "direct",
                        assignee_id: assigneeId,
                        assignee_station: null,
                        station: null,
                        lottery: false,
                      })
                      .eq("id", taskId);

                    if (error) throw error;

                    // Show appropriate success message based on whether task was accepted
                    if (isAcceptingTask) {
                      toast.success("Task accepted and assigned to you");
                      console.log(
                        `Task ${taskId} accepted by team member ${assigneeId} from ${currentTask.assignment_type || "unassigned"} status`,
                      );
                    } else {
                      toast.success("Task assigned to team member");
                    }
                  }

                  // Force refresh data to ensure UI updates
                  setTimeout(() => refreshData(), 100);
                  return Promise.resolve();
                } catch (error) {
                  console.error("Error assigning task:", error);
                  toast.error("Failed to assign task");
                  return Promise.reject(error);
                }
              }}
              onTaskSetForLottery={async (taskId) => {
                try {
                  await updateTaskDueDate(taskId, selectedDate); // Ensure due date is set
                  const { error } = await supabase
                    .from("prep_list_template_tasks")
                    .update({
                      assignment_type: "lottery",
                      lottery: true,
                      assignee_id: null,
                      assignee_station: null,
                      station: null,
                    })
                    .eq("id", taskId);

                  if (error) throw error;
                  toast.success("Task added to lottery pool");

                  // Force refresh data to ensure UI updates
                  setTimeout(() => refreshData(), 100);
                  return Promise.resolve();
                } catch (error) {
                  console.error("Error setting task for lottery:", error);
                  toast.error("Failed to add task to lottery pool");
                  return Promise.reject(error);
                }
              }}
              onDayClick={handleDayClick}
              onHeaderClick={
                view === "day" || view === "config"
                  ? () => {
                      // When clicking the header to go back to week view, ensure we clear the selected day
                      toggleView();
                    }
                  : undefined
              }
              isDayView={view === "day" || view === "config"}
              onUpdatePrepSystem={handleUpdatePrepSystem}
              onUpdateAmount={handleUpdateAmount}
              onUpdateParLevel={handleUpdateParLevel}
              onUpdateCurrentLevel={handleUpdateCurrentLevel}
              onToggleAutoAdvance={handleToggleAutoAdvance}
            />
          </div>

          {view === "config" && selectedDay && (
            <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4 w-full md:w-[35%] min-w-0 flex-shrink-0">
              <div className="flex flex-col space-y-4 mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Available Modules
                </h2>

                {/* Assignee Dropdown */}
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="assignee-select"
                    className="text-sm text-gray-300 font-medium"
                  >
                    Assign tasks to:
                  </label>
                  <select
                    id="assignee-select"
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select assignee (optional)</option>
                    {teamMembers.length > 0 ? (
                      teamMembers.map((member) => {
                        // Determine role color class based on role
                        let roleColorClass = "";
                        if (member.role) {
                          const roleLower = member.role.toLowerCase();
                          if (
                            roleLower.includes("dev") ||
                            roleLower.includes("developer")
                          ) {
                            roleColorClass = "text-purple-300";
                          } else if (roleLower.includes("owner")) {
                            roleColorClass = "text-blue-400";
                          } else if (
                            roleLower.includes("chef") &&
                            !roleLower.includes("sous")
                          ) {
                            roleColorClass = "text-emerald-300";
                          } else if (roleLower.includes("sous chef")) {
                            roleColorClass = "text-amber-300";
                          } else if (roleLower.includes("supervisor")) {
                            roleColorClass = "text-rose-300";
                          } else if (
                            roleLower.includes("manager") ||
                            roleLower.includes("director")
                          ) {
                            roleColorClass = "text-blue-300";
                          } else if (roleLower.includes("lead")) {
                            roleColorClass = "text-amber-300";
                          } else if (roleLower.includes("senior")) {
                            roleColorClass = "text-rose-300";
                          } else {
                            roleColorClass = "text-white";
                          }
                        }

                        return (
                          <option key={member.id} value={member.id}>
                            {member.name}{" "}
                            {member.role ? (
                              <>
                                •{" "}
                                <span className={roleColorClass}>
                                  {member.role}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled>No team members available</option>
                    )}
                  </select>
                  {selectedAssignee && teamMembers.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-700/50 rounded-md border border-gray-600/50">
                      <p className="text-sm text-white font-medium">
                        {
                          teamMembers.find((m) => m.id === selectedAssignee)
                            ?.name
                        }
                      </p>
                      {teamMembers.find((m) => m.id === selectedAssignee)
                        ?.role && (
                        <p className="text-xs mt-0.5">
                          {(() => {
                            const member = teamMembers.find(
                              (m) => m.id === selectedAssignee,
                            );
                            const role = member?.role || "";
                            const roleLower = role.toLowerCase();
                            let roleColorClass = "text-white";

                            if (
                              roleLower.includes("dev") ||
                              roleLower.includes("developer")
                            ) {
                              roleColorClass = "text-purple-300";
                            } else if (roleLower.includes("owner")) {
                              roleColorClass = "text-blue-400";
                            } else if (
                              roleLower.includes("chef") &&
                              !roleLower.includes("sous")
                            ) {
                              roleColorClass = "text-emerald-300";
                            } else if (roleLower.includes("sous chef")) {
                              roleColorClass = "text-amber-300";
                            } else if (roleLower.includes("supervisor")) {
                              roleColorClass = "text-rose-300";
                            } else if (
                              roleLower.includes("manager") ||
                              roleLower.includes("director")
                            ) {
                              roleColorClass = "text-blue-300";
                            } else if (roleLower.includes("lead")) {
                              roleColorClass = "text-amber-300";
                            } else if (roleLower.includes("senior")) {
                              roleColorClass = "text-rose-300";
                            }

                            return (
                              <span className={roleColorClass}>{role}</span>
                            );
                          })()}
                        </p>
                      )}
                      {teamMembers.find((m) => m.id === selectedAssignee)
                        ?.kitchen_stations?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teamMembers
                            .find((m) => m.id === selectedAssignee)
                            ?.kitchen_stations?.map((station, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full"
                              >
                                {station}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  {teamMembers.length > 0 ? (
                    <p className="text-xs text-gray-400 mt-2">
                      Tasks will be assigned to the selected team member when
                      added ({teamMembers.length} team members available)
                    </p>
                  ) : (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
                      <p className="text-xs text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        No team members found. The user_id might be stored in
                        the metadata field.
                      </p>
                      <p className="text-xs text-amber-400 mt-1">
                        Make sure team members have been added to your
                        organization and check the console for debugging
                        information.
                      </p>
                      <button
                        onClick={() => {
                          // Force refresh team members
                          const fetchTeamMembers = async () => {
                            try {
                              console.log(
                                "Manually refreshing team members...",
                              );
                              const { data, error } = await supabase
                                .from("organization_team_members")
                                .select(
                                  "id, first_name, last_name, email, kitchen_role, display_name, kitchen_stations, organization_id, metadata",
                                );

                              if (error) {
                                console.error(
                                  "Error fetching team members:",
                                  error,
                                );
                                return;
                              }

                              console.log(
                                "Manual refresh - Raw team member data:",
                                data,
                              );

                              if (data && data.length > 0) {
                                const formattedMembers = data.map((member) => {
                                  const displayName =
                                    member.display_name ||
                                    (member.first_name && member.last_name
                                      ? `${member.first_name} ${member.last_name}`
                                      : `Team Member ${member.id.substring(0, 4)}`);

                                  let formattedRole = "";
                                  if (member.kitchen_role) {
                                    formattedRole = member.kitchen_role
                                      .split("_")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1).toLowerCase(),
                                      )
                                      .join(" ");
                                  }

                                  // Get user_id from metadata if available
                                  const userId =
                                    member.metadata?.user_id || member.id;
                                  console.log(
                                    "Manual refresh - Member metadata:",
                                    member.metadata,
                                  );
                                  console.log(
                                    "Manual refresh - Using user ID:",
                                    userId,
                                  );

                                  return {
                                    id: userId,
                                    name: displayName,
                                    role: formattedRole,
                                    email: member.email,
                                    kitchen_stations:
                                      member.kitchen_stations || [],
                                  };
                                });

                                setTeamMembers(formattedMembers);
                                toast.success(
                                  `Found ${formattedMembers.length} team members`,
                                );
                              } else {
                                toast.error(
                                  "No team members found in database",
                                );
                              }
                            } catch (error) {
                              console.error(
                                "Error in manual team member refresh:",
                                error,
                              );
                              toast.error("Error refreshing team members");
                            }
                          };

                          fetchTeamMembers();
                        }}
                        className="mt-2 w-full text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-1 rounded transition-colors"
                      >
                        Refresh Team Members
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedPrepLists.length === 0 ? (
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <p className="text-gray-400 mb-2">No prep lists selected</p>
                  <button
                    onClick={() => setShowPrepListFilter(true)}
                    className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Select Prep Lists
                  </button>
                </div>
              ) : isLoading || processingModuleId === "loading" ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <SectionLoadingLogo
                    section="tasks"
                    message="Loading modules..."
                    className="h-32"
                  />
                </div>
              ) : availableModules.length === 0 ? (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="text-rose-300 font-medium">
                      No Modules Found
                    </h3>
                  </div>
                  <p className="text-gray-300">
                    No modules available for the selected prep lists
                  </p>
                </div>
              ) : (
                <>
                  {/* List of available modules that can be added to the selected day */}
                  <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                    {availableModules.map((module) => (
                      <div
                        key={module.id}
                        className={`bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-3 cursor-pointer transition-colors border border-gray-600/50 ${processingModuleId === module.id ? "opacity-70 pointer-events-none" : ""} ${module.assigned ? "opacity-50 border-gray-500/30" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddModule(module);
                        }}
                      >
                        {/* Module header with title and add button */}
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl text-white font-medium">
                            {module.title}
                          </h3>
                          <button
                            className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded ${processingModuleId === module.id ? "bg-gray-600/50 text-gray-400" : module.assigned ? "bg-gray-600/50 text-gray-400" : "bg-blue-500/10 text-blue-400 hover:text-blue-300"}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the parent onClick from firing
                              handleAddModule(module);
                            }}
                            disabled={
                              processingModuleId === module.id ||
                              module.assigned
                            }
                          >
                            {/* Dynamic button state based on module status */}
                            {processingModuleId === module.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Adding...
                              </>
                            ) : module.assigned ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> Added
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" /> Add
                              </>
                            )}
                          </button>
                        </div>
                        {/* Module description if available */}
                        {module.description && (
                          <p className="text-gray-400 text-sm mt-1">
                            {module.description}
                          </p>
                        )}
                        {/* Module metadata badges */}
                        <div className="flex items-center gap-2 mt-2">
                          {/* Estimated time badge */}
                          {module.estimated_time > 0 && (
                            <span className="text-xs bg-gray-600/50 text-gray-300 px-2 py-0.5 rounded-full">
                              {module.estimated_time} min
                            </span>
                          )}
                          {/* Station badge */}
                          {module.station && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                              {module.station}
                            </span>
                          )}
                          {/* Prep system badge */}
                          {module.prep_system && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                              {module.prep_system.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
