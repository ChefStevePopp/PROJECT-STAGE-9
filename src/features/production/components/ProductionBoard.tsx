import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useProductionStore } from "@/stores/productionStore";
import { useOperationsStore } from "@/stores/operationsStore";
import { format } from "date-fns";
import { Task, PrepListTemplate } from "@/types/tasks";
import { KanbanBoard } from "./KanbanBoard";
import { useProductionData } from "@/hooks/useProductionData";
import { SectionLoadingLogo } from "@/components/SectionLoadingLogo";

export const ProductionBoard = () => {
  const { completeTemplateTask, updateTaskDueDate, templates, fetchTemplates } =
    useProductionStore();
  const { settings, fetchSettings } = useOperationsStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [view, setView] = useState<"week" | "day">("week");
  const [selectedPrepLists, setSelectedPrepLists] = useState<string[]>([]);
  const [showPrepListFilter, setShowPrepListFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: "pending" as "pending" | "in_progress" | "completed",
    personalOnly: false,
    kitchenStation: "",
    adminView: false,
    showCateringEvents: true,
    prepListIds: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch operations settings and templates on component mount
  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, [fetchSettings, fetchTemplates]);

  // Update filters when selected prep lists change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      prepListIds: selectedPrepLists,
    }));
  }, [selectedPrepLists]);

  // Use the custom hook to fetch and organize data
  const {
    weekDays,
    tasksByDay,
    isLoading,
    error,
    isRefreshing,
    setIsRefreshing,
    cateringEvents,
    refreshData,
  } = useProductionData(selectedDate, filters);

  // Handle moving a task between days
  const handleTaskMove = async (
    taskId: string,
    fromDay: string,
    toDay: string,
  ) => {
    // Update the task's due date in the database
    await updateTaskDueDate(taskId, toDay);

    // Update local state
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
  };

  // Handle completing a task
  const handleCompleteTask = async (taskId: string) => {
    await completeTemplateTask(taskId);

    // Update local state by removing the completed task
    setTasksByDay((prev) => {
      const newTasksByDay = { ...prev };

      // Find which day contains this task
      Object.keys(newTasksByDay).forEach((day) => {
        newTasksByDay[day] = newTasksByDay[day].filter((t) => t.id !== taskId);
      });

      return newTasksByDay;
    });
  };

  // Handle week change
  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Handle refresh
  const handleRefresh = async () => {
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
  };

  // Filter templates based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (template.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white">Production Schedule</h1>
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

            {/* Prep List Filter Toggle */}
            <div className="relative">
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
              {selectedPrepLists.length > 0 && !showPrepListFilter && (
                <div className="absolute top-full right-0 mt-1 bg-gray-800/90 border border-gray-700 rounded-lg p-2 z-10 w-48 max-h-32 overflow-y-auto">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-medium text-white">
                      Selected Lists
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPrepLists([]);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Clear
                    </button>
                  </div>
                  {templates
                    .filter((template) =>
                      selectedPrepLists.includes(template.id),
                    )
                    .map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between py-1 px-2 text-xs text-white bg-blue-500/20 rounded mb-1"
                      >
                        <span className="truncate">{template.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrepLists((prev) =>
                              prev.filter((id) => id !== template.id),
                            );
                          }}
                          className="text-gray-300 hover:text-white ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
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
              placeholder="Search templates..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
            {filteredTemplates.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-full">
                {templates.length === 0
                  ? "No prep list templates available"
                  : "No matching templates found"}
              </p>
            ) : (
              filteredTemplates.map((template: PrepListTemplate) => (
                <div
                  key={template.id}
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors ${selectedPrepLists.includes(template.id) ? "bg-blue-500/20 border border-blue-500/50" : "bg-gray-700/30 border border-gray-700 hover:bg-gray-700/50"}`}
                  onClick={() => {
                    setSelectedPrepLists((prev) =>
                      prev.includes(template.id)
                        ? prev.filter((id) => id !== template.id)
                        : [...prev, template.id],
                    );
                  }}
                >
                  <div className="flex-1 truncate">
                    <div className="flex items-center">
                      {selectedPrepLists.includes(template.id) && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      )}
                      <p className="text-sm text-white truncate">
                        {template.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400 truncate">
                        {template.category}
                      </p>
                      {template.station && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                          {template.station}
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
                {templates
                  .filter((template) => selectedPrepLists.includes(template.id))
                  .map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center bg-blue-500/30 text-blue-200 text-xs px-2 py-1 rounded-full"
                    >
                      <span className="truncate max-w-[100px]">
                        {template.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrepLists((prev) =>
                            prev.filter((id) => id !== template.id),
                          );
                        }}
                        className="ml-1.5 text-blue-300 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
        <KanbanBoard
          days={view === "week" ? weekDays : [selectedDate]}
          tasks={tasksByDay}
          onTaskMove={handleTaskMove}
          onTaskComplete={handleCompleteTask}
        />
      )}
    </div>
  );
};
