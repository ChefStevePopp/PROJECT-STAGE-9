import React, { useState, useEffect } from "react";
import { Filter, ChevronDown, Search } from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import { useTeamStore } from "@/stores/teamStore";

interface TaskFiltersProps {
  filterOptions: {
    station: string;
    assignee: string;
    priority: string;
  };
  setFilterOptions: React.Dispatch<
    React.SetStateAction<{
      station: string;
      assignee: string;
      priority: string;
    }>
  >;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterOptions,
  setFilterOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { settings, fetchSettings } = useOperationsStore();
  const { members, fetchTeamMembers } = useTeamStore();

  useEffect(() => {
    fetchSettings();
    fetchTeamMembers();
  }, [fetchSettings, fetchTeamMembers]);

  const kitchenStations = settings?.kitchen_stations || [];
  const priorities = ["high", "medium", "low"];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg w-full text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Expanded Filters */}
      {isFiltersOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Station Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Station
            </label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterOptions.station}
              onChange={(e) =>
                setFilterOptions({ ...filterOptions, station: e.target.value })
              }
            >
              <option value="all">All Stations</option>
              {kitchenStations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Assignee
            </label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterOptions.assignee}
              onChange={(e) =>
                setFilterOptions({ ...filterOptions, assignee: e.target.value })
              }
            >
              <option value="all">All Team Members</option>
              <option value="unassigned">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Priority
            </label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterOptions.priority}
              onChange={(e) =>
                setFilterOptions({ ...filterOptions, priority: e.target.value })
              }
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
