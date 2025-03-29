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
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", userData.user.id)
            .single();

          if (orgError) {
            console.error("Error fetching organization:", orgError);
            throw new Error("Failed to fetch organization data");
          }

          if (orgData) {
            organizationId = orgData.organization_id;
          }
        }

        if (!organizationId) throw new Error("No organization found for user");

        // Check if recipe_id is a valid UUID or a stage ID
        let templateData = { ...template };

        // If recipe_id starts with 'stage_', extract the actual recipe UUID
        if (
          templateData.recipe_id &&
          typeof templateData.recipe_id === "string" &&
          templateData.recipe_id.startsWith("stage_")
        ) {
          // Extract the recipe UUID from the stage ID (format: stage_UUID_stage-timestamp)
          const parts = templateData.recipe_id.split("_");
          if (parts.length >= 2) {
            // The UUID should be the second part
            templateData.recipe_id = parts[1];
          } else {
            // If we can't extract a valid UUID, set to null
            templateData.recipe_id = null;
          }
        }

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
        const { error } = await supabase
          .from("prep_list_templates")
          .update({
            ...updates,
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
                  ...updates,
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

        // Try to get organization ID from user metadata
        let organizationId = userData.user?.user_metadata?.organizationId;

        // If not found in metadata, try to get from organization_members table
        if (!organizationId) {
          const { data: orgData } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", userData.user?.id)
            .single();

          if (orgData) {
            organizationId = orgData.organization_id;
          }
        }

        if (!organizationId) throw new Error("No organization found for user");

        // Create the prep list
        const { data: prepListData, error: prepListError } = await supabase
          .from("prep_lists")
          .insert({
            template_id: templateId,
            organization_id: organizationId,
            title: template.title,
            description: template.description,
            date,
            prep_system:
              template.prep_system === "as_needed" && template.created_at
                ? "scheduled_production"
                : template.prep_system,
            status: "active",
            assigned_to: assignedTo,
            created_by: userData.user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (prepListError) throw prepListError;

        const prepList = prepListData as PrepList;

        // Create tasks for the prep list based on template tasks
        if (template.tasks && template.tasks.length > 0) {
          const tasksToCreate = template.tasks.map((templateTask) => ({
            organization_id: organizationId,
            title: templateTask.title,
            description: templateTask.description || "",
            due_date: date,
            assignee_id: assignedTo,
            station: templateTask.station,
            priority: "medium" as const,
            estimated_time: templateTask.estimated_time || 0,
            completed: false,
            recipe_id: templateTask.recipe_id,
            prep_list_template_id: templateId,
            prep_list_id: prepList.id,
            sequence: templateTask.sequence,
            created_by: userData.user?.id,
            created_at: new Date().toISOString(),
          }));

          const { error: tasksError } = await supabase
            .from("tasks")
            .insert(tasksToCreate);

          if (tasksError) throw tasksError;
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
