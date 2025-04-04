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
    PrepListTemplateTask[]
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
    } else {
      // If no prep lists selected, clear the filter
      setFilters((prev) => ({
        ...prev,
        prepListIds: [],
      }));
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

  // Handle adding a module to a day
  const handleAddModule = async (module: PrepListTemplateTask) => {
    if (!selectedDay) {
      toast.error("No day selected. Please select a day first.");
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

        // Remove the module from available modules to prevent duplication
        setAvailableModules((prevModules) =>
          prevModules.filter((m) => m.id !== module.id),
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
    // Note: This function is commented out because setTasksByDay is not defined
    // Uncomment and fix once the proper state management is implemented
    /*
    setTasksByDay((prev) => {
      const newTasksByDay = { ...prev };

      // Find the task in the fromDay array
      const taskIndex = newTasksByDay[fromDay].findIndex(
        (t) => t.id === taskId,
      );
      if (taskIndex === -1) return prev;

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
    */
  };

  // Handle completing a task
  const handleCompleteTask = async (taskId: string) => {
    await completeTemplateTask(taskId);

    // Update local state by removing the completed task
    // Note: This function is commented out because setTasksByDay is not defined
    // Uncomment and fix once the proper state management is implemented
    /*
    setTasksByDay((prev) => {
      const newTasksByDay = { ...prev };

      // Find which day contains this task
      Object.keys(newTasksByDay).forEach((day) => {
        newTasksByDay[day] = newTasksByDay[day].filter((t) => t.id !== taskId);
      });

      return newTasksByDay;
    });
    */
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
    setSelectedDate(day);
    setSelectedDay(day);
    setView("day");

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

        console.log(
          "Selected prep lists data:",
          JSON.stringify(selectedPrepListsData, null, 2),
        );

        // Since prep_lists can have multiple templates, we need to collect all template IDs
        // from both template_ids array and legacy template_id field

        // Collect all template IDs from the selected prep lists
        const templateIds = selectedPrepListsData
          .flatMap((prepList) => {
            // Check for template_ids array first, then fall back to template_id if needed
            if (
              prepList.template_ids &&
              Array.isArray(prepList.template_ids) &&
              prepList.template_ids.length > 0
            ) {
              console.log(
                `Prep list ${prepList.id} has template_ids:`,
                JSON.stringify(prepList.template_ids),
              );
              return prepList.template_ids;
            } else if (prepList.template_id) {
              console.log(
                `Prep list ${prepList.id} has template_id:`,
                prepList.template_id,
              );
              return [prepList.template_id];
            }
            console.log(`Prep list ${prepList.id} has no template IDs`);
            return [];
          })
          .filter(Boolean); // Remove any null/undefined values

        if (templateIds.length === 0) {
          console.warn("No template IDs found in the selected prep lists");
          setAvailableModules([]);
          return;
        }

        console.log("Template IDs from selected prep lists:", templateIds);
        console.log("Available templates count:", templates.length);
        if (templates.length > 0) {
          console.log("First template sample:", {
            id: templates[0].id,
            title: templates[0].title,
            tasksCount: templates[0].tasks?.length || 0,
          });
        }

        // Find the templates that match the template IDs
        const selectedTemplates = templates.filter((template) => {
          const isIncluded = templateIds.includes(template.id);
          console.log(`Template ${template.id} included: ${isIncluded}`);
          return isIncluded;
        });

        console.log(`Found ${selectedTemplates.length} matching templates`);

        // Extract all tasks from the selected templates
        const modulesFromTemplates = selectedTemplates.flatMap((template) => {
          if (!template.tasks || template.tasks.length === 0) {
            console.warn(`Template ${template.id} has no tasks`);
            return [];
          }
          console.log(
            `Template ${template.id} has ${template.tasks.length} tasks`,
          );
          return template.tasks || [];
        });

        console.log(
          `Extracted ${modulesFromTemplates.length} modules from templates`,
        );

        if (modulesFromTemplates.length > 0) {
          console.log(
            "First module sample:",
            JSON.stringify(modulesFromTemplates[0], null, 2),
          );
          setAvailableModules(modulesFromTemplates);
        } else {
          console.warn(
            "No modules found in templates, attempting direct database query...",
          );
          // If no modules found in templates, try direct database query as fallback
          fetchModulesDirectly(templateIds);
        }
      } catch (error) {
        console.error("Error processing prep lists for modules:", error);
        // Attempt direct database query as fallback
        if (selectedPrepLists.length > 0) {
          console.log("Attempting direct database query as fallback...");
          fetchDirectlyFromPrepListIds(selectedPrepLists);
        }
      }
    } else {
      console.log("No prep lists selected, clearing available modules");
      setAvailableModules([]);
    }
    console.log("=== DAY CLICK HANDLER COMPLETE ====");
  };

  // Fallback function to fetch templates directly from the database
  const fetchModulesDirectly = async (templateIds: string[]) => {
    try {
      console.log("=== DIRECT MODULE FETCH START ====");
      console.log(
        "Attempting to fetch templates directly for template IDs:",
        templateIds,
      );

      if (!templateIds || templateIds.length === 0) {
        console.log("No template IDs to fetch templates for");
        setAvailableModules([]);
        return;
      }

      // Instead of fetching tasks, fetch the templates themselves
      const { data, error } = await supabase
        .from("prep_list_templates")
        .select("*")
        .in("id", templateIds);

      if (error) {
        console.error("Error fetching templates directly:", error);
        setAvailableModules([]);
        return;
      }

      if (data && data.length > 0) {
        console.log(`Directly fetched ${data.length} templates`);
        console.log("First template sample:", JSON.stringify(data[0], null, 2));
        // Convert templates to a format compatible with the modules display
        const templatesAsModules = data.map((template) => ({
          id: template.id,
          title: template.title,
          description: template.description || "",
          template_id: template.id, // Keep reference to template ID
          estimated_time: 0, // Default value
          station: template.station || "",
          sequence: 0, // Default value
        }));
        setAvailableModules(templatesAsModules);
      } else {
        console.log("No templates found directly either");
        setAvailableModules([]);
      }
      console.log("=== DIRECT MODULE FETCH COMPLETE ====");
    } catch (err) {
      console.error("Error in direct template fetch:", err);
      setAvailableModules([]);
      console.log("=== DIRECT MODULE FETCH FAILED ====");
    }
  };

  // Fetch tasks for a specific template
  const fetchTasksForTemplate = async (templateId: string) => {
    try {
      console.log(`Fetching tasks directly for template ID: ${templateId}`);

      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("template_id", templateId)
        .order("sequence", { ascending: true });

      if (error) {
        console.error(
          `Error fetching tasks for template ${templateId}:`,
          error,
        );
        return;
      }

      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} tasks for template ${templateId}`);
        setAvailableModules(data);
      } else {
        console.log(`No tasks found for template ${templateId}`);
      }
    } catch (err) {
      console.error(`Error fetching tasks for template ${templateId}:`, err);
    }
  };

  // Alternative fallback that starts from prep list IDs
  const fetchDirectlyFromPrepListIds = async (prepListIds: string[]) => {
    try {
      console.log("=== FETCH FROM PREP LIST IDS START ====");
      console.log(
        "Fetching template IDs directly from prep list IDs:",
        prepListIds,
      );

      // First get the template IDs from the prep lists
      const { data: prepListsData, error: prepListsError } = await supabase
        .from("prep_lists")
        .select("id, template_id, template_ids, title, description")
        .in("id", prepListIds);

      if (prepListsError) {
        console.error("Error fetching prep lists:", prepListsError);
        setAvailableModules([]);
        return;
      }

      if (!prepListsData || prepListsData.length === 0) {
        console.warn("No prep lists found for the provided IDs");
        setAvailableModules([]);
        return;
      }

      console.log(
        "Fetched prep lists:",
        JSON.stringify(prepListsData, null, 2),
      );

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

      console.log("Extracted template IDs:", templateIds);

      if (templateIds.length === 0) {
        console.warn("No template IDs found in prep lists");
        setAvailableModules([]);
        return;
      }

      // Now fetch the templates for these template IDs
      fetchModulesDirectly(templateIds);
      console.log("=== FETCH FROM PREP LIST IDS COMPLETE ====");
    } catch (error) {
      console.error("Error fetching from prep list IDs:", error);
      setAvailableModules([]);
      console.log("=== FETCH FROM PREP LIST IDS FAILED ====");
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
                      // Find all templates that match the template IDs
                      const selectedTemplates = templates.filter((template) => {
                        const isMatch = templateIds.includes(template.id);
                        console.log(
                          `Template ${template.id} match: ${isMatch}`,
                        );
                        return isMatch;
                      });
                      console.log("Found templates:", selectedTemplates);
                      console.log("All available templates:", templates);
                      console.log("Looking for template IDs:", templateIds);

                      // Extract all tasks from the selected templates
                      const allTemplateTasks = selectedTemplates.flatMap(
                        (template) => {
                          console.log(
                            `Template ${template.id} tasks:`,
                            template.tasks,
                          );
                          // Check if tasks is undefined or empty
                          if (!template.tasks || template.tasks.length === 0) {
                            console.warn(
                              `No tasks found for template ${template.id}, fetching directly`,
                            );
                            // Immediately fetch tasks for this template
                            fetchTasksForTemplate(template.id);
                            return [];
                          }
                          return template.tasks;
                        },
                      );

                      if (allTemplateTasks.length > 0) {
                        console.log("Template tasks:", allTemplateTasks);
                        setAvailableModules(allTemplateTasks);
                      } else {
                        console.log("No tasks found in templates");
                        console.log(
                          "Selected templates details:",
                          JSON.stringify(selectedTemplates, null, 2),
                        );

                        // If no tasks found in templates, try to fetch them directly
                        const fetchTasksDirectly = async () => {
                          try {
                            console.log(
                              "Attempting to fetch tasks directly for template IDs:",
                              templateIds,
                            );

                            if (!templateIds || templateIds.length === 0) {
                              console.log("No template IDs to fetch tasks for");
                              setAvailableModules([]);
                              return;
                            }

                            const { data, error } = await supabase
                              .from("prep_list_template_tasks")
                              .select("*")
                              .in("template_id", templateIds)
                              .order("sequence", { ascending: true });

                            if (error) {
                              console.error(
                                "Error fetching tasks directly:",
                                error,
                              );
                              return;
                            }

                            if (data && data.length > 0) {
                              console.log("Directly fetched tasks:", data);
                              console.log(
                                "Number of tasks found:",
                                data.length,
                              );
                              setAvailableModules(data);
                            } else {
                              console.log("No tasks found directly either");
                              setAvailableModules([]);
                            }
                          } catch (err) {
                            console.error("Error in direct task fetch:", err);
                            setAvailableModules([]);
                          }
                        };

                        fetchTasksDirectly();
                      }
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
                    setView("day");
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

            {/* Admin View Toggle */}
            <button
              onClick={toggleAdminView}
              title="Admin View"
              className={`p-1.5 rounded-lg ${filters.adminView ? "bg-purple-500/30 text-purple-300 border border-purple-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
            >
              <CheckSquare className="w-5 h-5" />
            </button>

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
              view === "week" ? "Switch to Day View" : "Switch to Week View"
            }
            className="p-1.5 rounded-lg bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-700/50"
          >
            {view === "week" ? (
              <LayoutList className="w-5 h-5" />
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
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <SectionLoadingLogo
            section="tasks"
            message={
              filters.personalOnly
                ? "Loading your tasks..."
                : "Loading all tasks..."
            }
          />
        </div>
      ) : (
        <div
          className={`${view === "day" && selectedDay ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}`}
        >
          <div className={view === "day" && selectedDay ? "" : "w-full"}>
            <KanbanBoard
              days={view === "week" ? weekDays : [selectedDate]}
              tasks={tasksByDay}
              onTaskMove={handleTaskMove}
              onTaskComplete={handleCompleteTask}
              onDayClick={handleDayClick}
              onHeaderClick={view === "day" ? toggleView : undefined}
              isDayView={view === "day"}
            />
          </div>

          {view === "day" && selectedDay && (
            <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Available Modules
              </h2>

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
                <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                  {availableModules.map((module) => (
                    <div
                      key={module.id}
                      className={`bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-3 cursor-pointer transition-colors border border-gray-600/50 ${processingModuleId === module.id ? "opacity-70 pointer-events-none" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddModule(module);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-medium">
                          {module.title}
                        </h3>
                        <button
                          className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded ${processingModuleId === module.id ? "bg-gray-600/50 text-gray-400" : "bg-blue-500/10 text-blue-400 hover:text-blue-300"}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the parent onClick from firing
                            handleAddModule(module);
                          }}
                          disabled={processingModuleId === module.id}
                        >
                          {processingModuleId === module.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Add
                            </>
                          )}
                        </button>
                      </div>
                      {module.description && (
                        <p className="text-gray-400 text-sm mt-1">
                          {module.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {module.estimated_time > 0 && (
                          <span className="text-xs bg-gray-600/50 text-gray-300 px-2 py-0.5 rounded-full">
                            {module.estimated_time} min
                          </span>
                        )}
                        {module.station && (
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                            {module.station}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
