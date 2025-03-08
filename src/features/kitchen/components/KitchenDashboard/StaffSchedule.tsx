import React, { useEffect, useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";
import type { TeamMemberData } from "@/features/team/types";
import { useScheduleStore } from "@/stores/scheduleStore";
import type { ScheduleShift } from "@/types/schedule";

interface StaffScheduleProps {
  team: TeamMemberData[];
}

export const StaffSchedule: React.FC<StaffScheduleProps> = ({ team }) => {
  const { currentSchedule, fetchCurrentSchedule, fetchShifts, scheduleShifts } =
    useScheduleStore();
  const [todayShifts, setTodayShifts] = useState<ScheduleShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true);
      try {
        // Fetch current schedule if not already loaded
        const schedule = await fetchCurrentSchedule();
        if (schedule?.id) {
          await fetchShifts(schedule.id);
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, [fetchCurrentSchedule, fetchShifts]);

  useEffect(() => {
    // Force refresh with current date to ensure we're showing today's schedule
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
    console.log(
      "Today is:",
      todayStr,
      "(",
      today.toLocaleDateString("en-US", { weekday: "long" }),
      ")",
    );

    const shiftsForToday = scheduleShifts.filter((shift) => {
      console.log(
        "Comparing shift date:",
        shift.shift_date,
        "with today:",
        todayStr,
      );
      return shift.shift_date === todayStr;
    });

    console.log("Found shifts for today:", shiftsForToday.length);
    setTodayShifts(shiftsForToday);

    // Set up an interval to refresh the date/time every minute
    const intervalId = setInterval(() => {
      const newToday = new Date().toISOString().split("T")[0];
      if (newToday !== todayStr) {
        // If the date has changed, refresh the shifts
        const newShifts = scheduleShifts.filter(
          (shift) => shift.shift_date === newToday,
        );
        setTodayShifts(newShifts);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [scheduleShifts]);

  // Format employee name according to requirements
  const formatEmployeeName = (shift: ScheduleShift) => {
    // If display_name is available from team data, use it
    const teamMember = team.find(
      (member) =>
        member.email?.toLowerCase() === shift.employee_name?.toLowerCase() ||
        `${member.firstName} ${member.lastName}`.toLowerCase() ===
          shift.employee_name?.toLowerCase(),
    );

    if (teamMember?.display_name) {
      return teamMember.display_name;
    }

    // Use first name and last initial
    const firstName =
      shift.first_name || shift.employee_name.split(" ")[0] || "";
    const lastName =
      shift.last_name ||
      (shift.employee_name.split(" ").length > 1
        ? shift.employee_name.split(" ").pop()
        : "");

    // Check if name contains "Chef"
    if (firstName.includes("Chef")) {
      return `Chef ${lastName}`;
    }

    // Return first name and last initial
    return `${firstName} ${lastName ? lastName.charAt(0) + "." : ""}`;
  };

  // Get avatar URL from team data if available
  const getAvatarUrl = (shift: ScheduleShift) => {
    const teamMember = team.find(
      (member) =>
        member.email?.toLowerCase() === shift.employee_name?.toLowerCase() ||
        `${member.firstName} ${member.lastName}`.toLowerCase() ===
          shift.employee_name?.toLowerCase(),
    );

    return (
      teamMember?.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${shift.employee_name}`
    );
  };

  // Format time (e.g., "9:00" to "9:00 AM")
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // If we have today's shifts, show them, otherwise fall back to team data
  const staffToShow = todayShifts.length > 0 ? todayShifts : team;

  return (
    <div className="card p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
        {new Date().toLocaleDateString("en-US", { weekday: "long" })}'s Team
        Members
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : staffToShow.length > 0 ? (
        <div className="space-y-4">
          {todayShifts.length > 0
            ? // Show today's scheduled shifts
              todayShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={getAvatarUrl(shift)}
                      alt={shift.employee_name}
                      className="w-10 h-10 rounded-full bg-gray-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${shift.employee_name}`;
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">
                        {formatEmployeeName(shift)}
                      </h3>
                      <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
                        {shift.role || "Staff"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                      {/* Shift Time */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(shift.start_time)} -{" "}
                          {formatTime(shift.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : // Fall back to team data if no shifts
              team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-10 h-10 rounded-full bg-gray-700"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">
                        {member.firstName} {member.lastName}
                      </h3>
                      {member.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                      {/* Shift Time */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>8:00 AM - 4:00 PM</span>
                      </div>

                      {/* Location */}
                      {member.locations?.[0] && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{member.locations[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="hidden sm:flex flex-wrap gap-2">
                    {member.departments.map((dept, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm">
            No staff members scheduled for today
          </p>
        </div>
      )}
    </div>
  );
};
