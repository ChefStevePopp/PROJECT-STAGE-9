import React from "react";
import { ThumbsUp, AlertTriangle, ChefHat } from "lucide-react";
import { useTeamStore } from "@/stores/teamStore";
import { StaffSchedule } from "./StaffSchedule";

export const KitchenDashboard: React.FC = () => {
  const team = useTeamStore((state) => state.members);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-orange to-accent-yellow bg-clip-text text-transparent">
          Kitchen Dashboard
        </h1>
        <div className="flex flex-col items-end">
          <div className="text-xl font-medium text-white">
            {new Date().toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prep Status */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-white">
                Prep Status
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-green-400">
                85%
              </p>
            </div>
          </div>
        </div>
        {/* Low Stock Items */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-white">
                Low Stock Items
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">8</p>
            </div>
          </div>
        </div>
        {/* Staff On Duty */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-white">
                Staff On Duty
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">
                {team.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Prep List */}
        <div className="card p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Today's Prep List
          </h2>
          <div className="text-gray-400 text-sm">
            No prep items scheduled for today
          </div>
        </div>
        {/* Staff Schedule */}
        <StaffSchedule team={team} />
      </div>
    </div>
  );
};
