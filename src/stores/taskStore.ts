import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Task, TaskStore } from "@/types/tasks";
import { logActivity } from "@/lib/activity-logger";
import toast from "react-hot-toast";

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  lotteryTasks: [], // Tasks available for lottery assignment

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("organization_id", user.user_metadata.organizationId)
        .order("due_date", { ascending: true });

      // Process tasks to ensure assignment_type is set correctly
      if (data) {
        data.forEach((task) => {
          // If assignment_type is not set but we have station information, set it to "station"
          if (
            !task.assignment_type &&
            (task.assignee_station || task.kitchen_station || task.station)
          ) {
            task.assignment_type = "station";
          }
          // If assignment_type is not set but we have assignee_id, set it to "direct"
          else if (!task.assignment_type && task.assignee_id) {
            task.assignment_type = "direct";
          }
          // If assignment_type is not set but lottery is true, set it to "lottery"
          else if (!task.assignment_type && task.lottery) {
            task.assignment_type = "lottery";
          }
        });
      }

      if (error) throw error;
      set({ tasks: data || [], error: null });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ error: "Failed to load tasks", tasks: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (task) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const newTask = {
        ...task,
        organization_id: user.user_metadata.organizationId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      // Enhanced activity logging for task creation
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "task_created",
        details: {
          task_id: data.id,
          task_title: data.title,
          due_date: data.due_date,
          priority: data.priority,
          estimated_time: data.estimated_time,
          assignment_type: data.assignment_type,
          assignee_id: data.assignee_id,
          station: data.station || data.kitchen_station,
          prep_list_id: data.prep_list_id,
          user_name: user.user_metadata?.name || user.email,
        },
      });

      // Update local state
      set({ tasks: [...get().tasks, data] });
    } catch (error) {
      console.error("Error creating task:", error);

      // Check for foreign key constraint violation
      if (
        error.message &&
        error.message.includes("violates foreign key constraint")
      ) {
        if (
          error.message.includes("prep_list_template_tasks_assignee_id_fkey")
        ) {
          const friendlyError = new Error(
            "This task already exists on the prep list",
          );
          set({ error: friendlyError.message });
          throw friendlyError;
        }
      }

      set({ error: "Failed to create task" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // Get the current task to compare changes
      const currentTask = get().tasks.find((task) => task.id === id);
      if (!currentTask) {
        throw new Error("Task not found");
      }

      // Add updated_at timestamp
      const updatedTask = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // If marking as completed, add completed_at and completed_by
      // Also clear isLate and daysLate when completing a task
      if (updates.completed === true) {
        updatedTask.completed_at = new Date().toISOString();
        updatedTask.completed_by = user.id;
        updatedTask.isLate = false;
        updatedTask.daysLate = 0;
      }

      const { error } = await supabase
        .from("tasks")
        .update(updatedTask)
        .eq("id", id)
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;

      // Determine the specific type of update for better activity logging
      let activityType = "task_updated";
      let activityDetails = {
        task_id: id,
        task_title: currentTask.title,
        changes: updates,
        user_name: user.user_metadata?.name || user.email,
      };

      if (updates.completed === true) {
        activityType = "task_completed";
        activityDetails = {
          ...activityDetails,
          completed_at: updatedTask.completed_at,
        };
      } else if (
        updates.assignee_id &&
        updates.assignee_id !== currentTask.assignee_id
      ) {
        activityType = "task_assigned";
        activityDetails = {
          ...activityDetails,
          previous_assignee: currentTask.assignee_id,
          new_assignee: updates.assignee_id,
        };
      } else if (
        updates.assignment_type === "station" &&
        (updates.station !== currentTask.station ||
          updates.kitchen_station !== currentTask.kitchen_station ||
          updates.assignee_station !== currentTask.assignee_station)
      ) {
        activityType = "task_assigned_to_station";
        activityDetails = {
          ...activityDetails,
          previous_station:
            currentTask.station ||
            currentTask.kitchen_station ||
            currentTask.assignee_station,
          new_station:
            updates.station ||
            updates.kitchen_station ||
            updates.assignee_station,
        };
      } else if (
        updates.assignment_type === "lottery" &&
        currentTask.assignment_type !== "lottery"
      ) {
        activityType = "task_set_for_lottery";
      } else if (updates.auto_advance === true && !currentTask.auto_advance) {
        activityType = "task_auto_advance_enabled";
      } else if (updates.auto_advance === false && currentTask.auto_advance) {
        activityType = "task_auto_advance_disabled";
      }

      // Log activity with enhanced details
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: activityType,
        details: activityDetails,
      });

      // Update local state
      set({
        tasks: get().tasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task,
        ),
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;

      // Log activity
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "task_deleted",
        details: {
          task_id: id,
        },
      });

      // Update local state
      set({ tasks: get().tasks.filter((task) => task.id !== id) });
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
      throw error;
    }
  },

  assignTask: async (id, assigneeId) => {
    try {
      // First update local state for immediate UI feedback
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              assignee_id: assigneeId,
              assignment_type: "direct",
              kitchen_station: null,
              assignee_station: null,
              station: null,
              claimed_at: null,
              claimed_by: null,
            }
          : task,
      );

      set({ tasks: updatedTasks });

      // Then update in database
      return get().updateTask(id, {
        assignee_id: assigneeId,
        assignment_type: "direct",
        kitchen_station: null,
        assignee_station: null,
        station: null,
        claimed_at: null,
        claimed_by: null,
      });
    } catch (error) {
      console.error("Error assigning task to team member:", error);
      toast.error("Failed to assign task to team member");
      throw error;
    }
  },

  assignToStation: async (id, stationId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      // Get the station name from operations settings
      const { data: settingsData } = await supabase
        .from("operations_settings")
        .select("kitchen_stations")
        .eq("organization_id", user.user_metadata.organizationId)
        .single();

      // Find the station name that matches the stationId
      const stationName =
        settingsData?.kitchen_stations?.find(
          (station: string) => station === stationId,
        ) || stationId;

      // First update local state for immediate UI feedback
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,

              assignee_station: stationName, // Use assignee_station for the assigned station
              station: stationName, // Keep station updated for backward compatibility
              assignment_type: "station",
              assignee_id: null,
              claimed_at: null,
              claimed_by: null,
            }
          : task,
      );

      set({ tasks: updatedTasks });

      return get().updateTask(id, {
        assignee_station: stationName, // Use assignee_station for the assigned station
        station: stationName, // Keep station updated for backward compatibility
        assignment_type: "station", // Change to station assignment type
        assignee_id: null, // Clear any direct assignee
        claimed_at: null, // Clear claimed info
        claimed_by: null,
      });
    } catch (error) {
      console.error("Error assigning task to station:", error);
      toast.error("Failed to assign task to station");
      throw error;
    }
  },

  setTaskForLottery: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    // Remove any direct assignment
    const updates = {
      assignment_type: "lottery",
      assignee_id: undefined,
      kitchen_station: null,
      assignee_station: null,
      station: null,
      claimed_at: undefined,
    };

    await get().updateTask(id, updates);

    // Update lottery tasks list
    const updatedTask = get().tasks.find((t) => t.id === id);
    if (updatedTask) {
      set({
        lotteryTasks: [
          ...get().lotteryTasks.filter((t) => t.id !== id),
          updatedTask,
        ],
      });
    }
  },

  claimLotteryTask: async (id, userId) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task || task.assignment_type !== "lottery") return;

    await get().updateTask(id, {
      assignee_id: userId,
      claimed_at: new Date().toISOString(),
      claimed_by: userId,
      assignment_type: "direct", // Change to direct assignment after claiming
    });

    // Remove from lottery tasks
    set({ lotteryTasks: get().lotteryTasks.filter((t) => t.id !== id) });
  },

  completeTask: async (id, completedBy) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Get user for activity logging
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.user_metadata?.organizationId) {
      throw new Error("No organization ID found");
    }

    // Log specific completion activity before updating the task
    await logActivity({
      organization_id: user.user_metadata.organizationId,
      user_id: user.id,
      activity_type: "task_completed",
      details: {
        task_id: id,
        task_title: task.title,
        completed_by: completedBy,
        completed_at: new Date().toISOString(),
        due_date: task.due_date,
        was_late: task.isLate || false,
        days_late: task.daysLate || 0,
        user_name: user.user_metadata?.name || user.email,
      },
    });

    return get().updateTask(id, {
      completed: true,
      completed_by: completedBy,
      completed_at: new Date().toISOString(),
    });
  },
}));
