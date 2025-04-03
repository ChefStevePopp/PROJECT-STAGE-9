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
  ) => Promise<void>;
  updateTemplateTaskStatus: (taskId: string, status: string) => Promise<void>;
  completeTemplateTask: (taskId: string) => Promise<void>;
  assignTemplateTask: (taskId: string, assigneeId: string) => Promise<void>;
  updateTaskDueDate: (taskId: string, dueDate: string) => Promise<void>;
  fetchOrganizationSchedule: () => Promise<OrganizationSchedule | null>;
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

      set({ prepLists: data as PrepList[], isLoading: false });
    } catch (error) {
      console.error("Error fetching prep lists:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get organization_id from user context
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const organizationId = userData.user.user_metadata.organizationId;

      // Fetch prep list templates
      const { data, error } = await supabase
        .from("prep_list_templates")
        .select(
          `
          *,
          tasks:prep_list_template_tasks(*)
        `,
        )
        .eq("organization_id", organizationId)
        .order("title");

      if (error) throw error;

      set({ templates: data as PrepListTemplate[], isLoading: false });
    } catch (error) {
      console.error("Error fetching prep list templates:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchTemplateTasksByStatus: async (status) => {
    set({ isLoading: true, error: null });
    try {
      // Get organization_id from user context
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const organizationId = userData.user.user_metadata.organizationId;

      // First get all templates for this organization
      const { data: templatesData, error: templatesError } = await supabase
        .from("prep_list_templates")
        .select("id")
        .eq("organization_id", organizationId);

      if (templatesError) throw templatesError;

      if (!templatesData || templatesData.length === 0) {
        set({ templateTasks: [], isLoading: false });
        return;
      }

      const templateIds = templatesData.map((template) => template.id);

      // Now fetch all template tasks for these templates
      const { data, error } = await supabase
        .from("prep_list_template_tasks")
        .select("*")
        .in("template_id", templateIds)
        .order("sequence", { ascending: true });

      if (error) throw error;

      // Since prep_list_template_tasks doesn't have a completed field,
      // we'll treat all tasks as pending for now
      // In a real implementation, you might want to add a completed field to the table
      const tasks = data as PrepListTemplateTask[];

      // Distribute tasks across the week for demo purposes
      // In a real implementation, you'd use actual due dates
      const today = new Date();
      const modifiedTasks = tasks.map((task, index) => {
        // Assign due dates across the week for demonstration
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + (index % 7)); // Distribute across 7 days

        return {
          ...task,
          due_date: dueDate.toISOString().split("T")[0],
        };
      });

      // Filter based on the requested status
      // For now, we'll just return all tasks as pending since there's no status field
      const filteredTasks = status === "completed" ? [] : modifiedTasks;

      set({ templateTasks: filteredTasks, isLoading: false });
    } catch (error) {
      console.error(`Error fetching ${status} template tasks:`, error);
      set({ error: (error as Error).message, isLoading: false });
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

  fetchOrganizationSchedule: async () => {
    try {
      // Get organization_id from user context
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const organizationId = userData.user.user_metadata.organizationId;
      console.log("Organization ID:", organizationId);

      // Fetch organization settings
      const { data, error } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", organizationId)
        .single();

      if (error) {
        console.error("Error fetching organization settings:", error);
        throw error;
      }

      console.log("Raw organization data:", JSON.stringify(data, null, 2));

      // Extract team_schedule from settings
      let teamSchedule = [];

      if (data?.settings) {
        console.log("Settings found:", JSON.stringify(data.settings, null, 2));

        if (data.settings.team_schedule) {
          console.log(
            "Team schedule found in settings:",
            data.settings.team_schedule,
          );

          // Check if team_schedule is an object with day names as keys
          if (
            typeof data.settings.team_schedule === "object" &&
            !Array.isArray(data.settings.team_schedule)
          ) {
            // Convert day names to day numbers (0 = Sunday, 1 = Monday, etc.)
            const dayMapping = {
              Sunday: 0,
              Monday: 1,
              Tuesday: 2,
              Wednesday: 3,
              Thursday: 4,
              Friday: 5,
              Saturday: 6,
            };

            // Add day numbers for days that are not closed
            for (const [day, hours] of Object.entries(
              data.settings.team_schedule,
            )) {
              if (Array.isArray(hours) && hours.length > 0) {
                // Skip days marked as closed
                if (!hours[0].closed) {
                  const dayNumber = dayMapping[day];
                  if (dayNumber !== undefined) {
                    teamSchedule.push(dayNumber);
                  }
                }
              }
            }

            console.log(
              "Converted team schedule from day names to numbers:",
              teamSchedule,
            );
          } else if (Array.isArray(data.settings.team_schedule)) {
            // If it's already an array of day numbers, use it directly
            teamSchedule = data.settings.team_schedule;
          } else {
            // Default if format is unexpected
            console.log(
              "Unexpected team_schedule format, using default Wed-Sun",
            );
            teamSchedule = [3, 4, 5, 6, 0]; // Wed, Thu, Fri, Sat, Sun
          }
        } else {
          console.log("No team_schedule in settings, using default Wed-Sun");
          teamSchedule = [3, 4, 5, 6, 0]; // Wed, Thu, Fri, Sat, Sun
        }
      } else {
        console.log("No settings found, using default Wed-Sun");
        teamSchedule = [3, 4, 5, 6, 0]; // Wed, Thu, Fri, Sat, Sun
      }

      // Ensure we have at least some days in the schedule
      if (teamSchedule.length === 0) {
        console.log(
          "No valid days found in team_schedule, using default Wed-Sun",
        );
        teamSchedule = [3, 4, 5, 6, 0]; // Wed, Thu, Fri, Sat, Sun
      }

      console.log("Final organization schedule:", teamSchedule);
      return { team_schedule: teamSchedule };
    } catch (error) {
      console.error("Error fetching organization schedule:", error);
      // Default to Wednesday through Sunday (3-6) for this organization
      return { team_schedule: [3, 4, 5, 6, 0] }; // Wed, Thu, Fri, Sat, Sun
    }
  },
}));
