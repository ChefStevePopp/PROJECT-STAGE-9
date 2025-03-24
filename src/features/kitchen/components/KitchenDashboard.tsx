import React, { useState, useEffect } from "react";
import {
  ThumbsUp,
  AlertTriangle,
  Truck,
  ChefHat,
  CookingPot,
  Users,
} from "lucide-react";
import { useTeamStore } from "@/stores/teamStore";
import { StaffSchedule } from "./StaffSchedule";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useAuth } from "@/hooks/useAuth";

export const KitchenDashboard: React.FC = () => {
  const team = useTeamStore((state) => state.members);
  const { scheduleShifts, fetchCurrentSchedule, fetchShifts } =
    useScheduleStore();
  const { organization } = useAuth();
  const [todayShifts, setTodayShifts] = useState([]);

  // Load the current schedule and shifts
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const schedule = await fetchCurrentSchedule();
        if (schedule?.id) {
          await fetchShifts(schedule.id);
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      }
    };

    loadSchedule();
  }, [fetchCurrentSchedule, fetchShifts]);

  // Filter shifts for today's date
  useEffect(() => {
    // Get the organization's timezone or default to local browser timezone
    const orgTimezone =
      organization?.settings?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create today's date in the organization's timezone
    const today = new Date();

    // Format the date in YYYY-MM-DD format for the organization's timezone
    let todayStr;
    try {
      todayStr = today
        .toLocaleDateString("en-CA", {
          timeZone: orgTimezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");
    } catch (e) {
      // Fallback if timezone is invalid
      console.error("Invalid timezone:", orgTimezone, e);
      todayStr = today.toISOString().split("T")[0]; // Default to ISO format
    }

    // Filter shifts for today
    const shiftsForToday = scheduleShifts.filter(
      (shift) => shift.shift_date === todayStr,
    );

    // Deduplicate shifts by employee
    const uniqueShifts = {};
    shiftsForToday.forEach((shift) => {
      const key = shift.employee_id || shift.employee_name;
      if (!key) return;

      // Keep the most recent shift for each employee
      if (
        !uniqueShifts[key] ||
        parseInt(shift.id) > parseInt(uniqueShifts[key].id)
      ) {
        uniqueShifts[key] = shift;
      }
    });

    setTodayShifts(Object.values(uniqueShifts));
  }, [scheduleShifts, organization?.settings?.timezone]);
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-orange to-accent-yellow bg-clip-text text-transparent">
              Kitchen Dashboard
            </h1>
            {/* Alert Icons Row */}
            <div className="flex items-center space-x-4 ml-4">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
                    <CookingPot className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">85%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-1 p-3">
                  <p className="font-semibold text-center text-xs p-1 rounded-lg bg-green-500/30 text-green-300">
                    Prep Lists
                  </p>
                  <p className="text-xs text-center text-gray-300 p-1">
                    85% Complete
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 bg-rose-500/20 px-3 py-1 rounded-full">
                    <Truck className="w-5 h-5 text-rose-400" />
                    <span className="text-rose-400 font-medium">8</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-1 p-3">
                  <p className="font-semibold text-center text-xs p-1 rounded-lg bg-rose-500/30 text-rose-300">
                    Low Stock
                  </p>
                  <p className="text-xs text-center text-gray-300 p-1">
                    8 Items for Order
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-medium">
                      {todayShifts.length}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-1 p-3">
                  <p className="font-semibold text-center text-xs p-1 rounded-lg bg-blue-500/30 text-blue-300">
                    Staff On Duty
                  </p>
                  <p className="text-xs text-center text-gray-300 p-1">
                    {todayShifts.length} team members
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
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
    </TooltipProvider>
  );
};
