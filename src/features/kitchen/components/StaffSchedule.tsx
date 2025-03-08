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

    // Log the raw date for debugging
    console.log("Raw today date:", today);

    // Format to match YYYY-MM-DD format in database (ISO format)
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    console.log(
      "Today is:",
      todayStr,
      "(",
      today.toLocaleDateString("en-US", { weekday: "long" }),
      ")",
    );

    // Log all available shifts to see what dates are actually in the database
    console.log(
      "All available shifts:",
      scheduleShifts.map((s) => ({
        id: s.id,
        date: s.shift_date,
        employee: s.employee_name,
        role: s.role,
      })),
    );

    // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
    const currentDayOfWeek = today.getDay();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    console.log(
      `Current day of week: ${dayNames[currentDayOfWeek]} (${currentDayOfWeek})`,
    );

    // Filter shifts for the current date (not just day of week)
    const shiftsForToday = scheduleShifts.filter((shift) => {
      if (!shift.shift_date) return false;

      try {
        // Direct string comparison with the shift_date field
        // This is more reliable than parsing dates which can be affected by timezones
        const isMatchingDate = shift.shift_date === todayStr;

        console.log(
          `Shift date: ${shift.shift_date}, today: ${todayStr}, match: ${isMatchingDate}`,
        );

        return isMatchingDate;
      } catch (error) {
        console.error("Error comparing dates:", shift.shift_date, error);
        return false;
      }
    });

    console.log("Found shifts for today:", shiftsForToday.length);

    // Deduplicate shifts - keep only the most recent shift for each employee
    const uniqueShifts = {};
    shiftsForToday.forEach((shift) => {
      const key = shift.employee_id || shift.employee_name;
      if (!key) return;

      // If we don't have this employee yet, or this shift has a more recent created_at timestamp
      if (
        !uniqueShifts[key] ||
        (shift.created_at &&
          uniqueShifts[key].created_at &&
          new Date(shift.created_at) >
            new Date(uniqueShifts[key].created_at)) ||
        // Fall back to ID comparison if created_at is not available
        (!shift.created_at &&
          parseInt(shift.id) > parseInt(uniqueShifts[key].id))
      ) {
        uniqueShifts[key] = shift;
      }
    });

    const deduplicatedShifts = Object.values(uniqueShifts);
    console.log(
      `Deduplicated from ${shiftsForToday.length} to ${deduplicatedShifts.length} shifts`,
    );

    setTodayShifts(deduplicatedShifts);

    // Set up an interval to refresh the date/time every minute
    const intervalId = setInterval(() => {
      const newDate = new Date();
      const newTodayStr = newDate.toISOString().split("T")[0];

      if (newTodayStr !== todayStr) {
        // If the date has changed, refresh the shifts
        const newShifts = scheduleShifts.filter((shift) => {
          if (!shift.shift_date) return false;
          // Direct string comparison is more reliable
          return shift.shift_date === newTodayStr;
        });
        setTodayShifts(newShifts);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [scheduleShifts]);

  // Format employee name according to requirements
  const formatEmployeeName = (shift: ScheduleShift) => {
    // If display_name is available from team data, use it
    const teamMember = findMatchingTeamMember(shift);

    if (teamMember?.display_name) {
      return teamMember.display_name;
    }

    // Use first name and last initial
    const firstName =
      shift.first_name || shift.employee_name?.split(" ")[0] || "";
    const lastName =
      shift.last_name ||
      (shift.employee_name && shift.employee_name.split(" ").length > 1
        ? shift.employee_name.split(" ").pop()
        : "");

    // Check if name contains "Chef"
    if (firstName.includes("Chef")) {
      return `Chef ${lastName}`;
    }

    // Return first name and last initial
    return `${firstName} ${lastName ? lastName.charAt(0) + "." : ""}`;
  };

  // Find matching team member with improved logic for people with two first names
  const findMatchingTeamMember = (shift: ScheduleShift) => {
    if (!shift) return undefined;

    // First try matching by punch_id/employee_id if available
    if (shift.employee_id) {
      const byPunchId = team.find(
        (member) => member.punch_id === shift.employee_id,
      );
      if (byPunchId) return byPunchId;
    }

    // If no employee_name, we can't do name matching
    if (!shift.employee_name) return undefined;

    // Try exact match by name
    let teamMember = team.find(
      (member) =>
        member.email?.toLowerCase() === shift.employee_name?.toLowerCase() ||
        (member.firstName &&
          member.lastName &&
          `${member.firstName} ${member.lastName}`.toLowerCase() ===
            shift.employee_name.toLowerCase()),
    );

    // If no exact match, try matching by first and last name separately
    if (!teamMember && shift.first_name && shift.last_name) {
      teamMember = team.find(
        (member) =>
          member.firstName?.toLowerCase() === shift.first_name?.toLowerCase() &&
          member.lastName?.toLowerCase() === shift.last_name?.toLowerCase(),
      );
    }

    // If no exact match, try matching by last name only
    if (!teamMember && shift.last_name) {
      teamMember = team.find(
        (member) =>
          member.lastName &&
          member.lastName.toLowerCase() === shift.last_name?.toLowerCase(),
      );
    }

    // If still no match and we have a multi-part name, try matching the last part
    if (
      !teamMember &&
      shift.employee_name &&
      shift.employee_name.includes(" ")
    ) {
      const nameParts = shift.employee_name.split(" ");
      const lastPart = nameParts[nameParts.length - 1].toLowerCase();

      teamMember = team.find(
        (member) =>
          (member.lastName && member.lastName.toLowerCase() === lastPart) ||
          (member.firstName && member.firstName.toLowerCase() === lastPart),
      );
    }

    return teamMember;
  };

  // Get avatar URL from team data if available
  const getAvatarUrl = (shift: ScheduleShift) => {
    if (!shift) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;
    }

    const teamMember = findMatchingTeamMember(shift);

    // If we found a matching team member with an avatar, use it
    if (
      teamMember?.avatar_url &&
      typeof teamMember.avatar_url === "string" &&
      teamMember.avatar_url.trim() !== ""
    ) {
      return teamMember.avatar_url;
    }

    // Fallback to avatar property if available
    if (
      teamMember?.avatar &&
      typeof teamMember.avatar === "string" &&
      teamMember.avatar.trim() !== ""
    ) {
      return teamMember.avatar;
    }

    // Generate a consistent avatar based on name
    const seed = shift.employee_name
      ? shift.employee_name.replace(/\s+/g, "")
      : shift.first_name && shift.last_name
        ? `${shift.first_name}${shift.last_name}`.replace(/\s+/g, "")
        : "default";

    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  // Format time (e.g., "9:00" to "9:00 AM")
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Try to show today's shifts first, fall back to team data if none found
  const staffToShow = todayShifts.length > 0 ? todayShifts : team;

  return (
    <div className="card p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
        Today's Team Members (
        {new Date().toLocaleDateString("en-US", { weekday: "long" })})
      </h2>
      <div className="text-xs text-gray-500 mb-4">
        Debug: Found {todayShifts.length} shifts for today | Total shifts:{" "}
        {scheduleShifts.length}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {todayShifts.length > 0 ? (
            // Show today's scheduled shifts
            todayShifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={getAvatarUrl(shift)}
                    alt={shift.employee_name || "Unknown"}
                    className="w-10 h-10 rounded-full bg-gray-700 object-cover"
                    onError={(e) => {
                      // Create a consistent seed for the fallback avatar
                      const seed = shift.employee_name
                        ? shift.employee_name.replace(/\s+/g, "")
                        : shift.first_name && shift.last_name
                          ? `${shift.first_name}${shift.last_name}`.replace(
                              /\s+/g,
                              "",
                            )
                          : shift.employee_id || "default";
                      (e.target as HTMLImageElement).src =
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                      // Prevent infinite error loop if the dicebear URL also fails
                      e.onerror = null;
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
          ) : (
            // Show a nice message when no shifts are scheduled
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🌞</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                No Team Members Scheduled Today
              </h3>
              <p className="text-gray-400">Enjoy your day! ✨</p>
            </div>
          )}

          {/* Only show team members as fallback if explicitly requested */}
          {false &&
            todayShifts.length === 0 &&
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`;
                      // Prevent infinite error loop
                      e.onerror = null;
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white truncate">
                      {member.firstName} {member.lastName}
                    </h3>
                    {member.roles && member.roles.length > 0 ? (
                      member.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-medium"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
                        Staff
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-1">
                    {/* Shift Time */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>8:00 AM - 4:00 PM</span>
                    </div>

                    {/* Location */}
                    {member.locations && member.locations.length > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{member.locations[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Departments */}
                {member.departments && member.departments.length > 0 && (
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
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
