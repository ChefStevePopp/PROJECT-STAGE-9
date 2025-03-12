import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { TeamMemberData } from "@/features/team/types";
import { useScheduleStore } from "@/stores/scheduleStore";
import type { ScheduleShift } from "@/types/schedule";
import { useTeamStore } from "@/stores/teamStore";
import { useAuth } from "@/hooks/useAuth";

interface StaffScheduleProps {
  team: TeamMemberData[];
}

export const StaffSchedule: React.FC<StaffScheduleProps> = ({ team }) => {
  const { currentSchedule, fetchCurrentSchedule, fetchShifts, scheduleShifts } =
    useScheduleStore();
  const { members, fetchTeamMembers } = useTeamStore();
  const { organization } = useAuth();
  const [todayShifts, setTodayShifts] = useState<ScheduleShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load team members directly from the store
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Load the current schedule and shifts
  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true);
      try {
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

  // Filter shifts for today's date (using organization timezone)
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

    console.log(`Using timezone: ${orgTimezone}, Today's date: ${todayStr}`);

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

  // Format employee name (first name + last initial)
  const formatEmployeeName = (shift: ScheduleShift) => {
    // Try to find matching team member from the store
    const teamMember = members.find(
      (member) => String(member.punch_id) === String(shift.employee_id),
    );

    // Use display_name if available
    if (teamMember?.display_name) {
      return teamMember.display_name;
    }

    // Use first name and last initial from shift data
    const firstName =
      shift.first_name || shift.employee_name?.split(" ")[0] || "";
    const lastName =
      shift.last_name ||
      (shift.employee_name?.includes(" ")
        ? shift.employee_name.split(" ").pop()
        : "");

    // Special case for Chef
    if (firstName.includes("Chef")) {
      return `Chef ${lastName}`;
    }

    // Return first name and last initial
    return `${firstName} ${lastName ? lastName.charAt(0) + "." : ""}`;
  };

  // Get avatar URL
  const getAvatarUrl = (shift: ScheduleShift) => {
    // Try to find matching team member from the store
    const teamMember = members.find(
      (member) => String(member.punch_id) === String(shift.employee_id),
    );

    // Use team member's avatar if available
    if (teamMember?.avatar_url) {
      return teamMember.avatar_url;
    }

    // Generate consistent avatar based on employee_id or name
    const seed =
      shift.employee_id ||
      shift.employee_name?.replace(/\s+/g, "") ||
      "default";

    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  // Format time (24h to 12h with AM/PM) using organization timezone
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold text-white mb-3">
        Today's Team Members (
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: organization?.settings?.timezone || undefined,
        })}
        )
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto pr-1 relative">
          {/* Fade effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {todayShifts.length > 0 ? (
              todayShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {/* Avatar - smaller size */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getAvatarUrl(shift)}
                      alt={shift.employee_name || "Team member"}
                      className="w-8 h-8 rounded-full bg-gray-700 object-cover"
                      onError={(e) => {
                        const seed =
                          shift.employee_id ||
                          shift.employee_name?.replace(/\s+/g, "") ||
                          "default";
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                        e.onerror = null;
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-gray-800 rounded-full" />
                  </div>

                  {/* Member Info - more compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-white text-sm truncate">
                        {formatEmployeeName(shift)}
                      </h3>
                      <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
                        {shift.role || "Staff"}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        {formatTime(shift.start_time)} -{" "}
                        {formatTime(shift.end_time)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 col-span-2">
                <div className="w-12 h-12 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">🌞</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">
                  No Team Members Scheduled Today
                </h3>
                <p className="text-gray-400 text-sm">Enjoy your day! ✨</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
