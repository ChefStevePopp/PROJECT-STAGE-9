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

      // Log activity
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: "task_created",
        details: {
          task_id: data.id,
          task_title: data.title,
        },
      });

      // Update local state
      set({ tasks: [...get().tasks, data] });
    } catch (error) {
      console.error("Error creating task:", error);
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

      // Add updated_at timestamp
      const updatedTask = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // If marking as completed, add completed_at and completed_by
      if (updates.completed === true) {
        updatedTask.completed_at = new Date().toISOString();
        updatedTask.completed_by = user.id;
      }

      const { error } = await supabase
        .from("tasks")
        .update(updatedTask)
        .eq("id", id)
        .eq("organization_id", user.user_metadata.organizationId);

      if (error) throw error;

      // Log activity
      await logActivity({
        organization_id: user.user_metadata.organizationId,
        user_id: user.id,
        activity_type: updates.completed ? "task_completed" : "task_updated",
        details: {
          task_id: id,
          changes: updates,
        },
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
    return get().updateTask(id, {
      assignee_id: assigneeId,
      assignment_type: "direct",
    });
  },

  assignToStation: async (id, stationId) => {
    return get().updateTask(id, {
      kitchen_station_id: stationId,
      assignment_type: "station", // Change to station assignment type
      assignee_id: undefined, // Clear any direct assignee
    });
  },

  setTaskForLottery: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    // Remove any direct assignment
    const updates = {
      assignment_type: "lottery",
      assignee_id: undefined,
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
    return get().updateTask(id, {
      completed: true,
      completed_by: completedBy,
      completed_at: new Date().toISOString(),
    });
  },
}));
