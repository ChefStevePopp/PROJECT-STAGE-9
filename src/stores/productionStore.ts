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

      // Build the query for template tasks
      console.log(
        "Building query for template tasks with template IDs:",
        templateIds,
      );
      // IMPORTANT: We're not filtering by template_id anymore to ensure all tasks show up
      // This allows tasks created from modules to appear on the Kanban board
      let query = supabase
        .from("prep_list_template_tasks")
        .select("*")
        .eq("organization_id", organizationId);

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
      const { data, error } = await query.order("sequence", {
        ascending: true,
      });

      if (error) {
        console.error("Error executing template tasks query:", error);
        throw new Error(`Failed to fetch template tasks: ${error.message}`);
      }

      // Since prep_list_template_tasks doesn't have a completed field,
      // we'll treat all tasks as pending for now
      const tasks = data as PrepListTemplateTask[];
      console.log(`Fetched ${tasks.length} template tasks`);
      if (tasks.length > 0) {
        console.log("Sample task:", JSON.stringify(tasks[0], null, 2));
      } else {
        console.warn("No tasks found for the specified filters");
      }

      // Only assign due dates to tasks that don't already have one
      console.log("Checking tasks for missing due dates...");
      const today = new Date();
      const modifiedTasks = tasks.map((task, index) => {
        // If the task already has a due_date, keep it
        if (task.due_date) {
          console.log(`Task ${task.id} already has due_date: ${task.due_date}`);
          return task;
        }

        // Otherwise assign a due date for demonstration
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + (index % 7)); // Distribute across 7 days
        console.log(
          `Assigning due_date ${dueDate.toISOString().split("T")[0]} to task ${task.id}`,
        );

        return {
          ...task,
          due_date: dueDate.toISOString().split("T")[0],
        };
      });

      // Filter based on the requested status
      const filteredTasks = status === "completed" ? [] : modifiedTasks;
      console.log(`Final filtered tasks count: ${filteredTasks.length}`);

      // Update state in a single operation
      set({ templateTasks: filteredTasks });
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
      // Since there's no assignee_id field in prep_list_template_tasks,
      // we'll just log this action for now
      console.log(`Would assign task ${taskId} to ${assigneeId}`);

      // In a real implementation, you might want to add an assignee_id field to the table
      // or handle this differently

      set({ isLoading: false });
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

      // Create a new task based on the module template
      const newTask: Partial<PrepListTemplateTask> = {
        title: module.title,
        description: module.description,
        estimated_time: module.estimated_time,
        station: module.station,
        template_id: module.template_id,
        sequence: module.sequence,
        kitchen_station: module.kitchen_station,
        assignee_id: userData.user.id, // Assign to current user by default
        due_date: dueDate,
        organization_id: organizationId,
        // Do not include id field at all to let Supabase generate a new ID
      };

      console.log("Creating new task from module:", newTask);

      // Insert the new task into the database
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .insert([newTask])
        .select()
        .single();

      if (error) {
        console.error("Error creating task from module:", error);
        throw new Error(`Failed to create task: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned after creating task");
      }

      // Update the local state with the new task
      set((state) => ({
        templateTasks: [...state.templateTasks, data as PrepListTemplateTask],
        isLoading: false,
      }));

      console.log(`Added module ${module.title} to day ${dueDate}`);
      return data as PrepListTemplateTask;
    } catch