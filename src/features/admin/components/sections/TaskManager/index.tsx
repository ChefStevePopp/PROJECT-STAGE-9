import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Clock,
  Users,
  Filter,
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { useTaskStore } from "@/stores/taskStore";
import { useTeamStore } from "@/stores/teamStore";
import { useScheduleStore } from "@/stores/scheduleStore";
import { usePrepListTemplateStore } from "@/stores/prepListTemplateStore";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { TaskList } from "./components/TaskList";
import { TaskFilters } from "./components/TaskFilters";
import { TaskStats } from "./components/TaskStats";
import { LoadingLogo } from "@/features/shared/components";
import toast from "react-hot-toast";
import { Task, PrepListTemplateTask } from "@/types/tasks";

export const TaskManager: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "today" | "upcoming" | "completed"
  >("today");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [filterOptions, setFilterOptions] = useState({
    station: "all",
    assignee: "all",
    priority: "all",
    source: "all",
  });

  const {
    tasks: regularTasks,
    isLoading: tasksLoading,
    error: tasksError,
    fetchTasks,
    assignTask,
    assignToStation,
    setTaskForLottery,
  } = useTaskStore();

  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    fetchTemplates,
  } = usePrepListTemplateStore();

  const { members, fetchTeamMembers } = useTeamStore();
  const { currentSchedule, fetchCurrentSchedule } = useScheduleStore();

  // Combined tasks from both sources
  const [combinedTasks, setCombinedTasks] = useState<Task[]>([]);
  const isLoading = tasksLoading || templatesLoading;
  const error = tasksError || templatesError;

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTasks(),
        fetchTemplates(),
        fetchTeamMembers(),
        fetchCurrentSchedule(),
      ]);
    };
    loadData();
  }, [fetchTasks, fetchTemplates, fetchTeamMembers, fetchCurrentSchedule]);

  // Combine and transform tasks from both sources
  useEffect(() => {
    if (!regularTasks || !templates) return;

    // Process regular tasks
    const processedRegularTasks = regularTasks.map((task) => {
      // Calculate days late if the task is not completed and past due date
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const isLate = !task.completed && dueDate < today;
      const daysLate = isLate
        ? Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 0;

      return {
        ...task,
        source: task.source || "manual",
        source_name: task.source_name || "Manual Entry",
        isLate,
        daysLate,
      };
    });

    // Process template tasks and convert them to regular Task format
    const templateTasks: Task[] = [];

    templates.forEach((template) => {
      if (!template.tasks) return;

      template.tasks.forEach((templateTask: PrepListTemplateTask) => {
        // Convert PrepListTemplateTask to Task format
        const convertedTask: Task = {
          id: templateTask.id,
          organization_id: templateTask.organization_id || "",
          title: templateTask.title,
          description: templateTask.description || "",
          due_date: templateTask.due_date || new Date().toISOString(),
          assignee_id: templateTask.assignee_id,
          station: templateTask.station || templateTask.kitchen_station,
          kitchen_station_id: "",
          kitchen_station: templateTask.kitchen_station,
          priority: "medium",
          estimated_time: templateTask.estimated_time || 0,
          completed: false,
          source: "prep_list_template",
          source_name: template.title,
          source_id: template.id,
          prep_list_template_id: template.id,
          sequence: templateTask.sequence,
          recipe_id: templateTask.recipe_id,
          prep_unit_measure: templateTask.prep_unit_measure,
          amount_required: templateTask.amount_required,
          cases_required: templateTask.cases_required,
          units_required: templateTask.units_required,
        };

        templateTasks.push(convertedTask);
      });
    });

    // Combine both sources
    setCombinedTasks([...processedRegularTasks, ...templateTasks]);
  }, [regularTasks, templates]);

  // Filter tasks based on active tab and filter options
  const filteredTasks = combinedTasks.filter((task) => {
    // Filter by tab (date status)
    const taskDate = new Date(task.due_date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    if (activeTab === "today" && taskDate !== today) return false;
    if (activeTab === "upcoming" && taskDate <= today) return false;
    if (activeTab === "completed" && !task.completed) return false;
    if (activeTab !== "completed" && task.completed) return false;

    // Apply filters
    if (
      filterOptions.station !== "all" &&
      task.station !== filterOptions.station
    )
      return false;
    if (
      filterOptions.assignee !== "all" &&
      task.assignee_id !== filterOptions.assignee
    )
      return false;
    if (
      filterOptions.priority !== "all" &&
      task.priority !== filterOptions.priority
    )
      return false;
    if (filterOptions.source !== "all" && task.source !== filterOptions.source)
      return false;

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingLogo message="Loading task data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <UtensilsCrossed className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchTasks()}
          className="btn-ghost text-primary-400"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Task Manager</h1>
          <p className="text-gray-400">
            Create, assign and track kitchen prep tasks
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Task
        </button>
      </header>

      {/* Task Stats */}
      <TaskStats />

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("today")}
          className={`tab primary ${activeTab === "today" ? "active" : ""}`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Today's Tasks
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`tab green ${activeTab === "upcoming" ? "active" : ""}`}
        >
          <Clock className="w-5 h-5 mr-2" />
          Upcoming Tasks
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`tab amber ${activeTab === "completed" ? "active" : ""}`}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Completed Tasks
        </button>
      </div>

      {/* Filters */}
      <TaskFilters
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
      />

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        teamMembers={members}
        onTaskAssign={async (taskId, assigneeId) => {
          try {
            await assignTask(taskId, assigneeId);
            toast.success("Task assigned successfully");
            return Promise.resolve();
          } catch (error) {
            console.error("Error assigning task:", error);
            toast.error("Failed to assign task");
            return Promise.reject(error);
          }
        }}
        onTaskSetForLottery={async (taskId) => {
          try {
            await setTaskForLottery(taskId);
            toast.success("Task added to lottery pool");
            return Promise.resolve();
          } catch (error) {
            console.error("Error setting task for lottery:", error);
            toast.error("Failed to add task to lottery pool");
            return Promise.reject(error);
          }
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        teamMembers={members}
      />
    </div>
  );
};
