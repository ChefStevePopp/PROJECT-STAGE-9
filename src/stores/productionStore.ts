import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  Task,
  PrepList,
  PrepListTemplateTask,
  PrepListTemplate,
} from "../types/tasks";

interface OrganizationSchedule {
  team_schedule: number[]; // Days of the week (0-6, where 0 is Sunday)
}

interface ProductionState {
  prepLists: PrepList[];
  templates: PrepListTemplate[];
  templateTasks: PrepListTemplateTask[];
  isLoading: boolean;
  error: string | null;

  // Prep list operations
  fetchPrepLists: (date?: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchTemplateTasksByStatus: (
    status: "pending" | "in_progress" | "completed",
    personalOnly?: boolean,
    kitchenStation?: string,
    adminView?: boolean,
    prepListIds?: string[],
  ) => Promise<void>;
  updateTemplateTaskStatus: (taskId: string, status: string) => Promise<void>;
  completeTemplateTask: (taskId: string) => Promise<void>;
  assignTemplateTask: (taskId: string, assigneeId: string) => Promise<void>;
  updateTaskDueDate: (taskId: string, dueDate: string) => Promise<void>;
  fetchOrganizationSchedule: () => Promise<OrganizationSchedule | null>;
  createTemplateTaskFromModule: (
    module: PrepListTemplateTask,
    dueDate: string,
  ) => Promise<PrepListTemplateTask | null>;
  updateTaskPrepSystem: (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => Promise<void>;
  updateTaskAmount: (taskId: string, amount: number) => Promise<void>;
  updateTaskParLevel: (taskId: string, parLevel: number) => Promise<void>;
  updateTaskCurrentLevel: (
    taskId: string,
    currentLevel: number,
  ) => Promise<void>;
}

export const useProductionStore = create<ProductionState>((set, get) => ({
  prepLists: [],
  templates: [],
  templateTasks: [],
  isLoading: false,
  error: null,

  fetchPrepLists: async (date) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current date if not provided
      const targetDate = date || new Date().toISOString().split("T")[0];

      // Get organization_id from user context
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const organizationId = userData.user.user_metadata.organizationId;

      // Fetch prep lists for the given date
      const { data, error } = await supabase
        .from("prep_lists")
        .select(
          `
          *,
          tasks:tasks(*)  
        `,
        )
        .eq("organization_id", organizationId)
        .eq("date", targetDate)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Fetched prep lists:", data);
      set({ prepLists: data as PrepList[], isLoading: false });
    } catch (error) {
      console.error("Error fetching prep lists:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchTemplates: async () => {
    // Don't set isLoading here to prevent UI flashing when called from useProductionData
    // The parent component will handle the loading state
    set({ error: null });
    try {
      // Get organization_id from user context
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const organizationId = userData.user.user_metadata.organizationId;

      // Fetch prep list templates
      const { data: templatesData, error: templatesError } = await supabase
        .from("prep_list_templates")
        .select("*")
        .eq("organization_id", organizationId)
        .order("title");

      if (templatesError) throw templatesError;

      console.log("Fetched templates:", templatesData);

      // For each template, fetch its tasks separately
      const templatesWithTasks = await Promise.all(
        templatesData.map(async (template) => {
          const { data: tasksData, error: tasksError } = await supabase
            .from("prep_list_template_tasks")
            .select("*")
            .eq("template_id", template.id)
            .order("sequence", { ascending: true });

          if (tasksError) {
            console.error(
              `Error fetching tasks for template ${template.id}:`,
              tasksError,
            );
            return { ...template, tasks: [] };
          }

          console.log(
            `Fetched ${tasksData.length} tasks for template ${template.id}`,
          );
          return { ...template, tasks: tasksData || [] };
        }),
      );

      console.log("Templates with tasks:", templatesWithTasks);
      // Update state in a single operation
      set({ templates: templatesWithTasks as PrepListTemplate[] });
    } catch (error) {
      console.error("Error fetching prep list templates:", error);
      set({ error: (error as Error).message });
    }
  },

  fetchTemplateTasksByStatus: async (
    status: "pending" | "in_progress" | "completed",
    personalOnly: boolean = false,
    kitchenStation?: string,
    adminView?: boolean,
    prepListIds?: string[],
  ) => {
    console.log(
      "SIMPLIFIED: Starting fetchTemplateTasksByStatus with simplified approach",
    );
    console.log("=== FETCH TEMPLATE TASKS START ====");
    console.log("Fetching template tasks with status:", status);
    console.log("Personal only filter:", personalOnly);
    console.log("Kitchen station filter:", kitchenStation);
    console.log("Admin view:", adminView);
    console.log("Fetching template tasks with prepListIds:", prepListIds);

    // Validate prepListIds parameter
    if (prepListIds) {
      if (!Array.isArray(prepListIds)) {
        console.error("ERROR: prepListIds is not an array:", prepListIds);
        set({ error: "Invalid prep list IDs format", templateTasks: [] });
        return;
      }

      if (prepListIds.length === 0) {
        console.warn("WARNING: prepListIds array is empty");
        // Return empty array early instead of proceeding with empty filter
        set({ templateTasks: [] });
        return;
      } else {
        console.log(
          "PrepListIds validation passed, first few IDs:",
          prepListIds.slice(0, 3),
        );
      }
    }

    // Don't set isLoading here to prevent UI flashing when called from useProductionData
    // The parent component will handle the loading state
    set({ error: null });
    try {
      // Get organization_id from user context
      console.log("Getting user data from Supabase...");
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user data:", userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!userData.user) {
        console.error("No user data returned from Supabase");
        throw new Error("User not authenticated");
      }

      if (!userData.user?.user_metadata?.organizationId) {
        console.error(
          "User metadata missing organizationId:",
          userData.user?.user_metadata,
        );
        throw new Error("No organization ID found in user metadata");
      }

      const organizationId = userData.user.user_metadata.organizationId;
      const userId = userData.user.id;
      console.log(`User ID: ${userId}, Organization ID: ${organizationId}`);

      // If prepListIds are provided, get the template IDs from those prep lists
      let templateIds = [];
      if (prepListIds && prepListIds.length > 0) {
        console.log("Filtering by prep list IDs in query:", prepListIds);

        // First, get the template IDs associated with these prep lists
        console.log("Fetching prep lists data to extract template IDs...");
        const { data: prepListsData, error: prepListsError } = await supabase
          .from("prep_lists")
          .select("id, template_id, template_ids")
          .in("id", prepListIds);

        if (prepListsError) {
          console.error("Error fetching prep lists:", prepListsError);
          throw new Error(
            `Failed to fetch prep lists: ${prepListsError.message}`,
          );
        }

        if (!prepListsData || prepListsData.length === 0) {
          console.warn(
            "No prep lists found for the provided IDs:",
            prepListIds,
          );
          set({ templateTasks: [] });
          return;
        }

        console.log(
          "Fetched prep lists for template IDs:",
          JSON.stringify(prepListsData, null, 2),
        );

        // Extract all template IDs (from both template_id field and template_ids array)
        templateIds = prepListsData
          .flatMap((prepList) => {
            const ids = [];
            if (prepList.template_id) {
              console.log(
                `Prep list ${prepList.id} has template_id: ${prepList.template_id}`,
              );
              ids.push(prepList.template_id);
            }
            if (prepList.template_ids && Array.isArray(prepList.template_ids)) {
              console.log(
                `Prep list ${prepList.id} has template_ids array: ${JSON.stringify(prepList.template_ids)}`,
              );
              ids.push(...prepList.template_ids);
            }

            if (ids.length === 0) {
              console.warn(
                `Prep list ${prepList.id} has no template IDs (neither template_id nor template_ids array)`,
              );
            }

            return ids;
          })
          .filter((id) => {
            if (!id) {
              console.warn("Filtered out null/undefined template ID");
              return false;
            }
            return true;
          }); // Remove any null/undefined values

        console.log(
          "Final extracted template IDs after filtering:",
          templateIds,
        );

        console.log("Extracted template IDs from prep lists:", templateIds);

        if (templateIds.length === 0) {
          console.warn("No template IDs found in the selected prep lists");
          set({ templateTasks: [] });
          return;
        }
      } else {
        // Otherwise, get all templates for this organization
        console.log(
          "No prep list IDs provided, fetching all templates for organization",
        );
        const { data: templatesData, error: templatesError } = await supabase
          .from("prep_list_templates")
          .select("id")
          .eq("organization_id", organizationId);

        if (templatesError) {
          console.error("Error fetching templates:", templatesError);
          throw new Error(
            `Failed to fetch templates: ${templatesError.message}`,
          );
        }

        if (!templatesData || templatesData.length === 0) {
          console.warn("No templates found for this organization");
          set({ templateTasks: [] });
          return;
        }

        console.log("Found templates for organization:", templatesData);
        templateIds = templatesData.map((template) => template.id);
      }

      // IMPORTANT: We're only fetching from prep_list_template_tasks table for the Kanban board
      console.log(
        "Building query for prep_list_template_tasks with template IDs:",
        templateIds,
      );

      console.log(
        "This data will be used for both the Kanban board AND available modules",
      );

      // Now we can filter by organization_id since we've added it to the table
      console.log(
        "Building query for prep_list_template_tasks with organization_id filter",
      );
      let query = supabase
        .from("prep_list_template_tasks")
        .select("*, template:prep_list_templates(*)")
        .eq("organization_id", organizationId);

      console.log(`DEBUG: Filtering by organization_id: ${organizationId}`);

      // If we have template IDs, filter by them
      if (templateIds && templateIds.length > 0) {
        console.log("Filtering tasks by template IDs:", templateIds);
        query = query.in("template_id", templateIds);
      }

      // Add personal filter if requested
      if (personalOnly) {
        console.log(`Adding personal filter for user ID: ${userId}`);
        query = query.eq("assignee_id", userId);
      }

      // Add kitchen station filter if provided
      if (kitchenStation) {
        console.log(`Adding kitchen station filter: ${kitchenStation}`);
        query = query.eq("kitchen_station", kitchenStation);
      }

      // Admin view logic can be implemented here if needed
      if (adminView) {
        console.log("Admin view filter applied");
        // No specific filter for admin view yet
      }

      // Execute the query with ordering
      console.log("Executing query for template tasks...");
      const { data, error } = await query
        .select("*, template:prep_list_templates(*)")
        .order("sequence", {
          ascending: true,
        });

      if (error) {
        console.error("Error executing template tasks query:", error);
        throw new Error(`Failed to fetch template tasks: ${error.message}`);
      }

      // Since prep_list_template_tasks doesn't have a completed field,
      // we'll treat all tasks as pending for now
      const tasks = data as PrepListTemplateTask[];
      console.log(
        `Fetched ${tasks.length} template tasks from prep_list_template_tasks table`,
      );
      if (tasks.length > 0) {
        console.log("Sample task:", JSON.stringify(tasks[0], null, 2));
      } else {
        console.warn("No tasks found for the specified filters");
      }

      // Assign today's date to all tasks that don't have a due date
      console.log("Checking tasks for missing due dates...");
      // ALWAYS use the user's local date, NEVER server time
      const today = new Date();
      const userTimezoneOffset = today.getTimezoneOffset() * 60000;
      const localDate = new Date(today.getTime() - userTimezoneOffset);
      const todayStr = localDate.toISOString().split("T")[0];
      console.log(`Using user's local date: ${todayStr} (NOT server time)`);

      // Create a list of tasks that need master ingredient data
      const tasksNeedingMasterIngredientData = tasks.filter(
        (task) =>
          task.master_ingredient_id &&
          (!task.master_ingredient_name ||
            !task.case_size ||
            !task.units_per_case),
      );

      // If we have tasks that need master ingredient data, fetch it
      let masterIngredientsData = {};
      if (tasksNeedingMasterIngredientData.length > 0) {
        const masterIngredientIds = tasksNeedingMasterIngredientData
          .map((task) => task.master_ingredient_id)
          .filter((id) => id); // Remove any null/undefined values

        if (masterIngredientIds.length > 0) {
          console.log(
            "Fetching master ingredient data for tasks:",
            masterIngredientIds,
          );
          const { data: ingredientsData, error: ingredientsError } =
            await supabase
              .from("master_ingredients_with_categories")
              .select(
                "id, name, case_size, units_per_case, storage_area, recipe_unit_type",
              )
              .in("id", masterIngredientIds);

          if (ingredientsError) {
            console.error(
              "Error fetching master ingredients:",
              ingredientsError,
            );
          } else if (ingredientsData) {
            // Create a map of ingredient ID to ingredient data
            masterIngredientsData = ingredientsData.reduce(
              (acc, ingredient) => {
                acc[ingredient.id] = ingredient;
                return acc;
              },
              {},
            );
            console.log(
              "Retrieved master ingredients data:",
              masterIngredientsData,
            );
          }
        }
      }

      const modifiedTasks = tasks.map((task) => {
        // If the task already has a due_date, keep it
        if (task.due_date) {
          console.log(`Task ${task.id} already has due_date: ${task.due_date}`);
        } else {
          // Otherwise assign today's date
          console.log(`Assigning today's date ${todayStr} to task ${task.id}`);
          task.due_date = todayStr;
        }

        // Ensure assignment data is properly set
        if (task.assignee_id) {
          console.log(`Task ${task.id} has assignee: ${task.assignee_id}`);
          // Make sure assignment_type is set to direct if there's an assignee
          if (!task.assignment_type || task.assignment_type !== "direct") {
            task.assignment_type = "direct";
            console.log(
              `Setting assignment_type to direct for task ${task.id}`,
            );
          }
        } else if (
          task.kitchen_station &&
          (!task.assignment_type || task.assignment_type !== "station")
        ) {
          // Make sure assignment_type is set to station if there's a kitchen_station
          task.assignment_type = "station";
          console.log(`Setting assignment_type to station for task ${task.id}`);
        } else if (
          task.lottery &&
          (!task.assignment_type || task.assignment_type !== "lottery")
        ) {
          // Make sure assignment_type is set to lottery if lottery flag is true
          task.assignment_type = "lottery";
          console.log(`Setting assignment_type to lottery for task ${task.id}`);
        }

        // Copy prep system data from the template to the task if available
        if (task.template) {
          console.log(`Task ${task.id} has template data:`, task.template);
          // Copy prep system data from template if not already set on the task
          if (!task.prep_system && task.template.prep_system) {
            task.prep_system = task.template.prep_system;
          }
          if (!task.par_level && task.template.par_levels) {
            // Check if there's a par level for this specific task
            const parLevel = task.template.par_levels[task.id];
            if (parLevel) task.par_level = parLevel;
          }
          if (!task.kitchen_station && task.template.station) {
            task.kitchen_station = task.template.station;
          }
          if (!task.kitchen_stations && task.template.kitchen_stations) {
            task.kitchen_stations = task.template.kitchen_stations;
          }
          if (!task.kitchen_role && task.template.kitchen_role) {
            task.kitchen_role = task.template.kitchen_role;
          }
          if (
            !task.master_ingredient_id &&
            task.template.master_ingredient_id
          ) {
            task.master_ingredient_id = task.template.master_ingredient_id;
          }
          // CRITICAL FIX: Also set prep_item_id to master_ingredient_id for backward compatibility
          if (!task.prep_item_id && task.master_ingredient_id) {
            task.prep_item_id = task.master_ingredient_id;
          }
          if (!task.recipe_id && task.template.recipe_id) {
            task.recipe_id = task.template.recipe_id;
          }

          // Remove the template object to avoid circular references
          delete task.template;
        } else {
          console.log(`Task ${task.id} has no template data`);
        }

        // Add master ingredient data if available
        if (
          task.master_ingredient_id &&
          masterIngredientsData[task.master_ingredient_id]
        ) {
          const ingredientData =
            masterIngredientsData[task.master_ingredient_id];
          console.log(
            `Adding master ingredient data to task ${task.id}:`,
            ingredientData,
          );

          // Only set these if they're not already set
          if (!task.master_ingredient_name) {
            task.master_ingredient_name = ingredientData.name;
          }
          if (!task.case_size) {
            task.case_size = ingredientData.case_size;
          }
          if (!task.units_per_case) {
            task.units_per_case = ingredientData.units_per_case;
          }
          if (!task.storage_area) {
            task.storage_area = ingredientData.storage_area;
          }
          if (!task.unit_of_measure) {
            task.unit_of_measure = ingredientData.recipe_unit_type;
          }
        }

        return task;
      });

      // Filter tasks by status - SIMPLIFIED
      console.log(`Filtering tasks by status: ${status}`);
      let filteredTasks = modifiedTasks;

      // CRITICAL FIX: Log each task to see what we're working with
      console.log("CRITICAL DEBUG: Tasks before filtering:");
      modifiedTasks.forEach((task, index) => {
        console.log(`Task ${index + 1}:`, JSON.stringify(task, null, 2));
      });

      // Apply status filtering based on the requested status
      console.log(`Applying status filter: ${status}`);
      if (status === "all" || status === "pending") {
        console.log(
          "CRITICAL FIX: Showing all pending tasks regardless of other filters",
        );
        // For pending status, show ALL pending tasks regardless of other filters
        filteredTasks = modifiedTasks.filter((task) => {
          return !task.status || task.status === "pending";
        });
        console.log(
          `CRITICAL FIX: Found ${filteredTasks.length} pending tasks total`,
        );
      } else {
        filteredTasks = modifiedTasks.filter((task) => {
          // For other statuses, match exactly
          if (task.status === status) {
            return true;
          }
          return false;
        });
        console.log(
          `Filtered to ${filteredTasks.length} tasks with status ${status}`,
        );
      }

      // CRITICAL FIX: Log the final filtered tasks
      console.log(
        "CRITICAL DEBUG: Final filtered tasks count:",
        filteredTasks.length,
      );
      if (filteredTasks.length > 0) {
        console.log(
          "CRITICAL DEBUG: Sample task:",
          JSON.stringify(filteredTasks[0], null, 2),
        );
      } else {
        console.log("CRITICAL DEBUG: NO TASKS FOUND - THIS IS THE ISSUE");
      }

      console.log(
        `Final filtered tasks count after status filtering: ${filteredTasks.length}`,
      );
      console.log(`Status filter applied: ${status}`);

      // Update state in a single operation
      set({ templateTasks: filteredTasks });

      // Log the first few tasks for debugging
      if (filteredTasks.length > 0) {
        console.log("Sample tasks being loaded:", filteredTasks.slice(0, 3));
      }
      console.log("=== FETCH TEMPLATE TASKS COMPLETE ====");
    } catch (error) {
      console.error(`Error fetching ${status} template tasks:`, error);
      set({ error: error instanceof Error ? error.message : String(error) });
      console.log("=== FETCH TEMPLATE TASKS FAILED ====");
    }
  },

  updateTemplateTaskStatus: async (taskId, status) => {
    set({ isLoading: true, error: null });
    try {
      // Since there's no status column in prep_list_template_tasks,
      // we'll just log this action for now
      console.log(`Would update task ${taskId} to status ${status}`);

      // In a real implementation, you might want to add a status field to the table
      // or handle this differently

      set({ isLoading: false });
    } catch (error) {
      console.error("Error updating template task status:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  completeTemplateTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Since there's no completed field in prep_list_template_tasks,
      // we'll just log this action for now
      console.log(
        `Would mark task ${taskId} as completed by ${userData.user.id}`,
      );

      // In a real implementation, you might want to add a completed field to the table
      // or handle this differently

      // For now, we'll remove the task from the list to simulate completion
      set((state) => ({
        templateTasks: state.templateTasks.filter((task) => task.id !== taskId),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error completing template task:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  assignTemplateTask: async (taskId, assigneeId) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`Assigning task ${taskId} to ${assigneeId}`);

      // Get the current task to preserve existing values
      const { data: currentTask, error: fetchError } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (fetchError) {
        console.error("Error fetching current task data:", fetchError);
        throw fetchError;
      }

      // Determine if this is a user ID or station name
      const isUserId = assigneeId.length > 20; // User IDs are typically UUIDs

      // Prepare update data with all necessary fields
      const updateData = isUserId
        ? {
            assignment_type: "direct",
            assignee_id: assigneeId,
            kitchen_station: null,
            station: null, // Also clear the station field
            lottery: false,
            updated_at: new Date().toISOString(),
            status: currentTask?.status || "pending", // Preserve existing status
            priority: currentTask?.priority || "medium", // Preserve existing priority
            prep_system: currentTask?.prep_system || "as_needed", // Preserve existing prep system
            amount_required: currentTask?.amount_required || 0, // Preserve amount
            par_level: currentTask?.par_level || 0, // Preserve PAR level
            current_level: currentTask?.current_level || 0, // Preserve current level
          }
        : {
            assignment_type: "station",
            kitchen_station: assigneeId,
            station: assigneeId, // Also update the station field for backward compatibility
            assignee_id: null,
            lottery: false,
            updated_at: new Date().toISOString(),
            status: currentTask?.status || "pending", // Preserve existing status
            priority: currentTask?.priority || "medium", // Preserve existing priority
            prep_system: currentTask?.prep_system || "as_needed", // Preserve existing prep system
            amount_required: currentTask?.amount_required || 0, // Preserve amount
            par_level: currentTask?.par_level || 0, // Preserve PAR level
            current_level: currentTask?.current_level || 0, // Preserve current level
          };

      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .update(updateData)
        .eq("id", taskId)
        .select();

      if (error) throw error;

      console.log(
        `Successfully assigned task ${taskId} to ${assigneeId}`,
        data,
      );

      // Update the task in the local state
      set((state) => ({
        templateTasks: state.templateTasks.map((task) =>
          task.id === taskId ? { ...task, ...updateData } : task,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error assigning template task:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTaskDueDate: async (taskId, dueDate) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, you would update the due_date in the database
      console.log(`Would update task ${taskId} due date to ${dueDate}`);

      // For now, we'll update the task in our local state
      set((state) => ({
        templateTasks: state.templateTasks.map((task) =>
          task.id === taskId ? { ...task, due_date: dueDate } : task,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating task due date:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchOrganizationSchedule: async () => {
    try {
      // Get organization_id from user context
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const organizationId = userData.user.user_metadata.organizationId;

      // Fetch organization settings
      const { data, error } = await supabase
        .from("operations_settings")
        .select("team_schedule")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching organization schedule:", error);
        return null;
      }

      return data as OrganizationSchedule;
    } catch (error) {
      console.error("Error fetching organization schedule:", error);
      return null;
    }
  },

  createTemplateTaskFromModule: async (module, dueDate) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Try to get organization ID from user metadata
      let organizationId = userData.user?.user_metadata?.organizationId;

      // If not found in metadata, try to get from organization_members table
      if (!organizationId) {
        const { data: orgData, error: orgError } = await supabase
          .from("organization_team_members")
          .select("organization_id")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        if (orgError && orgError.code !== "PGRST116") {
          console.error("Error fetching organization:", orgError);
          throw new Error("Failed to fetch organization data");
        }

        if (orgData) {
          organizationId = orgData.organization_id;
        }
      }

      if (!organizationId) throw new Error("No organization found for user");

      // If module is a template (from the Available Modules column), fetch the full template data
      let templateData = null;
      if (module.template_id === module.id) {
        console.log(
          "Module appears to be a template, fetching full template data",
        );
        const { data, error } = await supabase
          .from("prep_list_templates")
          .select("*")
          .eq("id", module.id)
          .single();

        if (!error && data) {
          templateData = data;
          console.log("Retrieved template data:", templateData);
        }
      }

      // Fetch master ingredient data if available
      let masterIngredientData = null;
      const masterIngredientId =
        module.master_ingredient_id || templateData?.master_ingredient_id;

      if (masterIngredientId) {
        console.log(
          `Fetching master ingredient data for ID: ${masterIngredientId}`,
        );
        const { data: ingredientData, error: ingredientError } = await supabase
          .from("master_ingredients_with_categories")
          .select("*")
          .eq("id", masterIngredientId)
          .maybeSingle();

        if (ingredientError) {
          console.error("Error fetching master ingredient:", ingredientError);
        } else if (ingredientData) {
          masterIngredientData = ingredientData;
          console.log(
            "Retrieved master ingredient data:",
            masterIngredientData,
          );
        }
      }

      // Create a new task based on the module template with ALL relevant data
      const newTask: Partial<PrepListTemplateTask> = {
        title: module.title,
        description: module.description || "",
        estimated_time: module.estimated_time || 0,
        station: module.station || templateData?.station || "",
        template_id: module.template_id || module.id,
        sequence: module.sequence || 0,
        kitchen_station:
          module.kitchen_station || templateData?.kitchen_stations?.[0] || "",
        assignee_id: userData.user.id, // Assign to current user by default
        due_date: dueDate,
        status: "pending",
        organization_id: organizationId,
        // Include prep system data if available from the template
        prep_system:
          templateData?.prep_system || module.prep_system || "as_needed",
        // Include PAR levels if available
        par_level:
          module.par_level ||
          (templateData?.par_levels
            ? templateData.par_levels[module.id] || 0
            : 0),
        // Include current level if available
        current_level: module.current_level || 0,
        // Include amount required if available
        amount_required: module.amount_required || 0,
        // Include priority if available
        priority: module.priority || "medium",
        // Include recipe ID if available
        recipe_id: module.recipe_id || templateData?.recipe_id,
        // Include master ingredient ID and related data
        master_ingredient_id: masterIngredientId,
        master_ingredient_name:
          module.master_ingredient_name || masterIngredientData?.name,
        case_size: module.case_size || masterIngredientData?.case_size,
        units_per_case:
          module.units_per_case || masterIngredientData?.units_per_case,
        storage_area: module.storage_area || masterIngredientData?.storage_area,
        unit_of_measure:
          module.unit_of_measure || masterIngredientData?.recipe_unit_type,
        // Include assignment type
        assignment_type: "direct", // Default to direct assignment since we're assigning to current user
        // Include lottery flag
        lottery: false,
        // Include kitchen roles if available
        kitchen_role: module.kitchen_role || templateData?.kitchen_role,
        // Include requires certification if available
        requires_certification:
          module.requires_certification || templateData?.requires_certification,
      };

      // Insert the new task into the database
      console.log("Creating new task with data:", newTask);
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .insert(newTask)
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        throw new Error(`Failed to create task: ${error.message}`);
      }

      console.log("Successfully created task:", data);
      set({ isLoading: false });
      return data as PrepListTemplateTask;
    } catch (error) {
      console.error("Error creating task from module:", error);
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },

  updateTaskPrepSystem: async (taskId, system) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current task to preserve existing values
      const { data: currentTask, error: fetchError } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (fetchError) {
        console.error("Error fetching current task data:", fetchError);
        throw fetchError;
      }

      // Update the prep system in the database
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .update({
          prep_system: system,
          updated_at: new Date().toISOString(),
          // Preserve other important fields
          status: currentTask?.status || "pending",
          priority: currentTask?.priority || "medium",
          assignment_type: currentTask?.assignment_type,
          lottery: currentTask?.lottery || false,
          // Preserve kitchen station and assignee
          kitchen_station: currentTask?.kitchen_station,
          station: currentTask?.station,
          assignee_id: currentTask?.assignee_id,
          // Preserve amount, par level, and current level
          amount_required: currentTask?.amount_required || 0,
          par_level: currentTask?.par_level || 0,
          current_level: currentTask?.current_level || 0,
          // Preserve master ingredient data
          master_ingredient_id: currentTask?.master_ingredient_id,
          master_ingredient_name: currentTask?.master_ingredient_name,
          case_size: currentTask?.case_size,
          units_per_case: currentTask?.units_per_case,
          storage_area: currentTask?.storage_area,
          unit_of_measure: currentTask?.unit_of_measure,
          // Preserve recipe data
          recipe_id: currentTask?.recipe_id,
          // Preserve kitchen role
          kitchen_role: currentTask?.kitchen_role,
          // Preserve certification requirements
          requires_certification: currentTask?.requires_certification,
        })
        .eq("id", taskId)
        .select();

      if (error) throw error;

      console.log(
        `Successfully updated task ${taskId} prep system to ${system}`,
        data,
      );

      // Update the task in the local state
      set((state) => ({
        templateTasks: state.templateTasks.map((task) =>
          task.id === taskId ? { ...task, prep_system: system } : task,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating task prep system:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTaskAmount: async (taskId, amount) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current task to preserve existing values
      const { data: currentTask, error: fetchError } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (fetchError) {
        console.error("Error fetching current task data:", fetchError);
        throw fetchError;
      }

      // Update the amount in the database
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .update({
          amount_required: amount,
          updated_at: new Date().toISOString(),
          // Preserve other important fields
          status: currentTask?.status || "pending",
          priority: currentTask?.priority || "medium",
          prep_system: currentTask?.prep_system || "as_needed",
          assignment_type: currentTask?.assignment_type,
          lottery: currentTask?.lottery || false,
          // Preserve kitchen station and assignee
          kitchen_station: currentTask?.kitchen_station,
          station: currentTask?.station,
          assignee_id: currentTask?.assignee_id,
          // Preserve par level and current level
          par_level: currentTask?.par_level || 0,
          current_level: currentTask?.current_level || 0,
          // Preserve master ingredient data
          master_ingredient_id: currentTask?.master_ingredient_id,
          master_ingredient_name: currentTask?.master_ingredient_name,
          case_size: currentTask?.case_size,
          units_per_case: currentTask?.units_per_case,
          storage_area: currentTask?.storage_area,
          unit_of_measure: currentTask?.unit_of_measure,
          // Preserve recipe data
          recipe_id: currentTask?.recipe_id,
          // Preserve kitchen role
          kitchen_role: currentTask?.kitchen_role,
          // Preserve certification requirements
          requires_certification: currentTask?.requires_certification,
        })
        .eq("id", taskId)
        .select();

      if (error) throw error;

      console.log(
        `Successfully updated task ${taskId} amount to ${amount}`,
        data,
      );

      // Update the task in the local state
      set((state) => ({
        templateTasks: state.templateTasks.map((task) =>
          task.id === taskId ? { ...task, amount_required: amount } : task,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating task amount:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTaskParLevel: async (taskId, parLevel) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current task to preserve existing values
      const { data: currentTask, error: fetchError } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (fetchError) {
        console.error("Error fetching current task data:", fetchError);
        throw fetchError;
      }

      // Update the PAR level in the database
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .update({
          par_level: parLevel,
          updated_at: new Date().toISOString(),
          // Preserve other important fields
          status: currentTask?.status || "pending",
          priority: currentTask?.priority || "medium",
          prep_system: currentTask?.prep_system || "as_needed",
          assignment_type: currentTask?.assignment_type,
          lottery: currentTask?.lottery || false,
        })
        .eq("id", taskId)
        .select();

      if (error) throw error;

      console.log(
        `Successfully updated task ${taskId} PAR level to ${parLevel}`,
        data,
      );

      // Update the task in the local state
      set((state) => ({
        templateTasks: state.templateTasks.map((task) =>
          task.id === taskId ? { ...task, par_level: parLevel } : task,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating task PAR level:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTaskCurrentLevel: async (taskId, currentLevel) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current task to preserve existing values
      const { data: currentTask, error: fetchError } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (fetchError) {
        console.error("Error fetching current task data:", fetchError);
        throw fetchError;
      }

      // Update the current level in the database
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .update({
          current_level: currentLevel,
          updated_at: new Date().toISOString(),
          // Preserve other important fields
          status: currentTask?.status || "pending",
          priority: currentTask?.priority || "medium",
          prep_system: currentTask?.prep_system || "as_needed",
          assignment_type: currentTask?.assignment_type,
          lottery: currentTask?.lottery || false,
        })
        .eq("id", taskId)
        .select();

      if (error) throw error;

      console.log(
        `Successfully updated task ${taskId} current level to ${currentLevel}`,
        data,
      );

      // Update the task in the local state
      set((state) => ({
        templateTasks: state.templateTasks.map((task) =>
          task.id === taskId ? { ...task, current_level: currentLevel } : task,
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating task current level:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
