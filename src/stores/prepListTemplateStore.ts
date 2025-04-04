import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  PrepListTemplate,
  PrepListTemplateTask,
  PrepList,
} from "../types/tasks";

interface PrepListTemplateState {
  templates: PrepListTemplate[];
  selectedTemplate: PrepListTemplate | null;
  isLoading: boolean;
  error: string | null;

  // Template operations
  fetchTemplates: () => Promise<void>;
  createTemplate: (
    template: Omit<
      PrepListTemplate,
      "id" | "organization_id" | "created_at" | "updated_at"
    >,
  ) => Promise<string | null>;
  updateTemplate: (
    id: string,
    updates: Partial<PrepListTemplate>,
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectTemplate: (id: string | null) => void;

  // Template task operations
  addTaskToTemplate: (
    templateId: string,
    task: Omit<
      PrepListTemplateTask,
      "id" | "template_id" | "created_at" | "updated_at"
    >,
  ) => Promise<void>;
  updateTemplateTask: (
    taskId: string,
    updates: Partial<PrepListTemplateTask>,
  ) => Promise<void>;
  removeTaskFromTemplate: (taskId: string) => Promise<void>;
  reorderTemplateTasks: (
    templateId: string,
    taskIds: string[],
  ) => Promise<void>;

  // Prep list generation
  generatePrepListFromTemplate: (
    templateId: string,
    date: string,
    assignedTo?: string,
  ) => Promise<string | null>;
}

export const usePrepListTemplateStore = create<PrepListTemplateState>(
  (set, get) => ({
    templates: [],
    selectedTemplate: null,
    isLoading: false,
    error: null,

    fetchTemplates: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log("Fetching prep list templates...");
        const { data, error } = await supabase
          .from("prep_list_templates")
          .select(
            `
          *,
          tasks:prep_list_template_tasks(*)
        `,
          )
          .order("title");

        if (error) throw error;

        console.log("Fetched prep list templates:", data);
        if (data && data.length > 0) {
          console.log("First template:", data[0]);
          console.log("First template tasks:", data[0].tasks);
        } else {
          console.log("No templates found");
        }

        set({ templates: data as PrepListTemplate[], isLoading: false });
      } catch (error) {
        console.error("Error fetching prep list templates:", error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    createTemplate: async (template) => {
      set({ isLoading: true, error: null });
      try {
        // Get organization_id from user context or auth
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

        // Create a copy of the template data
        let templateData = { ...template };

        // Log the incoming recipe_id for debugging
        console.log("Original recipe_id:", templateData.recipe_id);

        // IMPORTANT: We no longer modify the recipe_id if it's a stage ID
        // This allows us to store the full stage reference

        // Ensure organization_id is included in the insert
        const { data, error } = await supabase
          .from("prep_list_templates")
          .insert({
            ...templateData,
            organization_id: organizationId,
            created_by: userData.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Add the new template to the state
        const newTemplate = data as PrepListTemplate;
        set((state) => ({
          templates: [...state.templates, newTemplate],
          isLoading: false,
        }));

        return newTemplate.id;
      } catch (error) {
        console.error("Error creating prep list template:", error);
        set({ error: (error as Error).message, isLoading: false });
        return null;
      }
    },

    updateTemplate: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        // Ensure recipe_id is preserved correctly, especially for stage IDs
        const updatesToSend = { ...updates };

        // Log the updates for debugging
        console.log("Updating template with data:", updatesToSend);

        const { error } = await supabase
          .from("prep_list_templates")
          .update({
            ...updatesToSend,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // Update the template in the state
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? {
                  ...template,
                  ...updatesToSend,
                  updated_at: new Date().toISOString(),
                }
              : template,
          ),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error updating prep list template:", error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    deleteTemplate: async (id) => {
      set({ isLoading: true, error: null });
      try {
        // First delete all tasks associated with this template
        const { error: tasksError } = await supabase
          .from("prep_list_template_tasks")
          .delete()
          .eq("template_id", id);

        if (tasksError) throw tasksError;

        // Then delete the template
        const { error } = await supabase
          .from("prep_list_templates")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Remove the template from the state
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
          selectedTemplate:
            state.selectedTemplate?.id === id ? null : state.selectedTemplate,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error deleting prep list template:", error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    selectTemplate: (id) => {
      if (id === null) {
        set({ selectedTemplate: null });
        return;
      }

      const template = get().templates.find((t) => t.id === id) || null;
      set({ selectedTemplate: template });
    },

    addTaskToTemplate: async (templateId, task) => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase
          .from("prep_list_template_tasks")
          .insert({
            ...task,
            template_id: templateId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Add the new task to the template in the state
        const newTask = data as PrepListTemplateTask;
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id === templateId) {
              return {
                ...template,
                tasks: [...(template.tasks || []), newTask],
              };
            }
            return template;
          }),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error adding task to template:", error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    updateTemplateTask: async (taskId, updates) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase
          .from("prep_list_template_tasks")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId);

        if (error) throw error;

        // Update the task in the template in the state
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.tasks?.some((task) => task.id === taskId)) {
              return {
                ...template,
                tasks: template.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        ...updates,
                        updated_at: new Date().toISOString(),
                      }
                    : task,
                ),
              };
            }
            return template;
          }),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error updating template task:", error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    removeTaskFromTemplate: async (taskId) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase
          .from("prep_list_template_tasks")
          .delete()
          .eq("id", taskId);

        if (error) throw error;

        // Remove the task from the template in the state
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.tasks?.some((task) => task.id === taskId)) {
              return {
                ...template,
                tasks: template.tasks.filter((task) => task.id !== taskId),
              };
            }
            return template;
          }),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error removing task from template:", error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    reorderTemplateTasks: async (templateId, taskIds) => {
      set({ isLoading: true, error: null });
      try {
        // Update each task with its new sequence number
        const updatePromises = taskIds.map((taskId, index) => {
          return supabase
            .from("prep_list_template_tasks")
            .update({ sequence: index + 1 })
            .eq("id", taskId);
        });

        await Promise.all(updatePromises);

        // Update the tasks in the template in the state
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id === templateId && template.tasks) {
              const updatedTasks = [...template.tasks];
              // Sort the tasks based on the new order
              updatedTasks.sort((a, b) => {
                const aIndex = taskIds.indexOf(a.id);
                const bIndex = taskIds.indexOf(b.id);
                return aIndex - bIndex;
              });
              // Update sequence numbers
              updatedTasks.forEach((task, index) => {
                task.sequence = index + 1;
              });

              return {
                ...template,
                tasks: updatedTasks,
              };
            }
            return template;
          }),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error reordering template tasks:", error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    generatePrepListFromTemplate: async (templateId, date, assignedTo) => {
      set({ isLoading: true, error: null });
      try {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) throw new Error("Template not found");

        // Get organization_id from user context or auth
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("User not authenticated");

        // Try to get organization ID from user metadata
        let organizationId = userData.user?.user_metadata?.organizationId;

        // If not found in metadata, try to get from organization_members table
        if (!organizationId) {
          const { data: orgData, error: orgError } = await supabase
            .from("organization_team_members")
            .select("organization_id")
            .eq("user_id", userData.user?.id)
            .maybeSingle();

          if (orgError && orgError.code !== "PGRST116") {
            // PGRST116 is not found error
            console.error("Error fetching organization:", orgError);
            throw new Error("Failed to fetch organization data");
          }

          if (orgData) {
            organizationId = orgData.organization_id;
          }
        }

        // If still no organization ID, try organization_roles table
        if (!organizationId) {
          const { data: roleData, error: roleError } = await supabase
            .from("organization_roles")
            .select("organization_id")
            .eq("user_id", userData.user?.id)
            .maybeSingle();

          if (roleError && roleError.code !== "PGRST116") {
            console.error("Error fetching organization roles:", roleError);
          } else if (roleData) {
            organizationId = roleData.organization_id;
          }
        }

        if (!organizationId) throw new Error("No organization found for user");

        // Create the prep list
        const prepListToInsert = {
          template_id: templateId,
          organization_id: organizationId,
          title: template.title,
          description: template.description || "",
          date,
          prep_system: template.prep_system || "scheduled_production",
          status: "active",
          assigned_to: assignedTo || null,
          created_by: userData.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Creating prep list with data:", prepListToInsert);

        const { data: prepListData, error: prepListError } = await supabase
          .from("prep_lists")
          .insert(prepListToInsert)
          .select()
          .single();

        if (prepListError) {
          console.error("Error creating prep list:", prepListError);
          throw new Error(
            `Failed to create prep list: ${prepListError.message}`,
          );
        }

        if (!prepListData) {
          throw new Error("No data returned after creating prep list");
        }

        const prepList = prepListData as PrepList;
        console.log("Created prep list:", prepList);

        // Create tasks for the prep list based on template tasks
        if (template.tasks && template.tasks.length > 0) {
          const tasksToCreate = template.tasks.map((templateTask) => ({
            organization_id: organizationId,
            title: templateTask.title,
            description: templateTask.description || "",
            due_date: date,
            assignee_id: assignedTo || null,
            station: templateTask.station || null,
            priority: "medium" as const,
            estimated_time: templateTask.estimated_time || 0,
            completed: false,
            recipe_id: templateTask.recipe_id || null,
            prep_list_template_id: templateId,
            prep_list_id: prepList.id,
            sequence: templateTask.sequence,
            created_by: userData.user?.id,
            created_at: new Date().toISOString(),
          }));

          console.log(`Creating ${tasksToCreate.length} tasks for prep list`);

          const { data: tasksData, error: tasksError } = await supabase
            .from("tasks")
            .insert(tasksToCreate)
            .select();

          if (tasksError) {
            console.error("Error creating tasks:", tasksError);
            throw new Error(`Failed to create tasks: ${tasksError.message}`);
          }

          console.log(`Created ${tasksData?.length || 0} tasks successfully`);
        }

        set({ isLoading: false });
        return prepList.id;
      } catch (error) {
        console.error("Error generating prep list from template:", error);
        set({ error: (error as Error).message, isLoading: false });
        return null;
      }
    },
  }),
);
