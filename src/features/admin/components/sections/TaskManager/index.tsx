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
import { CreateTaskModal } from "./components/CreateTaskModal";
import { TaskList } from "./components/TaskList";
import { TaskFilters } from "./components/TaskFilters";
import { TaskStats } from "./components/TaskStats";
import { LoadingLogo } from "@/features/shared/components";

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
  });

  const { tasks, isLoading, error, fetchTasks } = useTaskStore();
  const { members, fetchTeamMembers } = useTeamStore();
  const { currentSchedule, fetchCurrentSchedule } = useScheduleStore();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTasks(),
        fetchTeamMembers(),
        fetchCurrentSchedule(),
      ]);
    };
    loadData();
  }, [fetchTasks, fetchTeamMembers, fetchCurrentSchedule]);

  // Filter tasks based on active tab and filter options
  const filteredTasks = tasks.filter((task) => {
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
      <TaskList tasks={filteredTasks} teamMembers={members} />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        teamMembers={members}
      />
    </div>
  );
};
