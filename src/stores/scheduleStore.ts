import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getShifts,
  testConnection,
  fetchSchedule,
  type Shift,
} from "../lib/7shifts";
import { supabase } from "@/lib/supabase";
import { parseScheduleCsv } from "@/lib/schedule-parser";
import { parseScheduleCsvWithMapping } from "@/lib/schedule-parser-enhanced";
import { matchEmployeeWithTeamMember } from "@/utils/employeeMatching";
import { Schedule, ScheduleShift } from "@/types/schedule";

interface ScheduleState {
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  lastUpcomingCheck: string | null;
  accessToken: string;
  companyId: string;
  locationId: string;

  // Current state
  currentSchedule: Schedule | null;
  upcomingSchedule: Schedule | null;
  previousSchedules: Schedule[];
  scheduleShifts: ScheduleShift[];

  // Actions
  syncSchedule: (startDate?: string, endDate?: string) => Promise<Shift[]>;
  testConnection: () => Promise<boolean>;
  setCredentials: (credentials: {
    accessToken: string;
    companyId: string;
    locationId: string;
  }) => void;

  // Schedule management
  checkUpcomingSchedules: () => Promise<boolean>;
  fetchCurrentSchedule: () => Promise<Schedule | null>;
  fetchUpcomingSchedule: () => Promise<void>;
  fetchPreviousSchedules: () => Promise<void>;
  fetchShifts: (scheduleId: string) => Promise<ScheduleShift[]>;
  uploadSchedule: (
    file: File,
    options: {
      startDate: string;
      endDate: string;
      activateImmediately?: boolean;
      source?: string;
      selectedMapping?: any;
      matchedShifts?: any[];
    },
  ) => Promise<void>;
  activateSchedule: (scheduleId: string) => Promise<void>;
  archiveSchedule: (scheduleId: string) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<boolean>;
  sync7shiftsSchedule: (
    apiKey: string,
    locationId: string,
    startDate: string,
    endDate: string,
  ) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      shifts: [],
      isLoading: false,
      error: null,
      lastSync: null,
      lastUpcomingCheck: null,
      accessToken:
        "39373134666131382d653765382d343134362d613331612d613034356638616666373232",
      companyId: "7140",
      locationId: "11975",

      // Current state
      currentSchedule: null,
      upcomingSchedule: null,
      previousSchedules: [],
      scheduleShifts: [],

      setCredentials: (credentials) => {
        set(credentials);
      },

      syncSchedule: async (startDate?: string, endDate?: string) => {
        const { accessToken, companyId, locationId } = get();
        set({ isLoading: true, error: null });

        try {
          // If no dates provided, use current week
          const today = new Date();
          const defaultStartDate =
            startDate || today.toISOString().split("T")[0];

          // Default to 7 days if no end date
          let defaultEndDate;
          if (!endDate) {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 6);
            defaultEndDate = nextWeek.toISOString().split("T")[0];
          } else {
            defaultEndDate = endDate;
          }

          const shifts = await getShifts({
            accessToken,
            companyId,
            locationId,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          });
          set({
            shifts,
            lastSync: new Date().toISOString(),
            error: null,
          });

          return shifts;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to sync schedule";
          set({ error: errorMessage });
          console.error("Error syncing schedule:", error);
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      testConnection: async () => {
        const { accessToken, companyId, locationId } = get();
        try {
          return await testConnection({ accessToken, companyId, locationId });
        } catch (error) {
          console.error("Connection test failed:", error);
          return false;
        }
      },

      // Schedule management functions
      checkUpcomingSchedules: async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          // Get today's date in YYYY-MM-DD format
          const today = new Date().toISOString().split("T")[0];

          // Find any upcoming schedules that should now be current (start date <= today)
          const { data: upcomingSchedules, error } = await supabase
            .from("schedules")
            .select("*")
            .eq("organization_id", organizationId)
            .eq("status", "upcoming")
            .lte("start_date", today); // start_date <= today

          if (error) throw error;

          // If we found any schedules that should be activated
          if (upcomingSchedules && upcomingSchedules.length > 0) {
            console.log(
              `Found ${upcomingSchedules.length} upcoming schedules that should be activated`,
            );

            // Get the current schedule if any
            const { data: currentSchedule } = await supabase
              .from("schedules")
              .select("*")
              .eq("organization_id", organizationId)
              .eq("status", "current")
              .single();

            // If there's a current schedule, mark it as previous
            if (currentSchedule) {
              await supabase
                .from("schedules")
                .update({ status: "previous" })
                .eq("id", currentSchedule.id);
            }

            // Activate the most recent upcoming schedule (sort by start date descending)
            const scheduleToActivate = upcomingSchedules.sort(
              (a, b) =>
                new Date(b.start_date).getTime() -
                new Date(a.start_date).getTime(),
            )[0];

            // Update its status to current
            await supabase
              .from("schedules")
              .update({ status: "current" })
              .eq("id", scheduleToActivate.id);

            // Mark any other upcoming schedules as previous
            if (upcomingSchedules.length > 1) {
              const otherScheduleIds = upcomingSchedules
                .filter((s) => s.id !== scheduleToActivate.id)
                .map((s) => s.id);

              await supabase
                .from("schedules")
                .update({ status: "previous" })
                .in("id", otherScheduleIds);
            }

            // Update the store state
            set({
              currentSchedule: scheduleToActivate,
              upcomingSchedule: null,
              previousSchedules: currentSchedule
                ? [
                    currentSchedule,
                    ...get().previousSchedules.filter(
                      (s) => s.id !== currentSchedule.id,
                    ),
                  ]
                : [...get().previousSchedules],
            });

            return true;
          }

          return false;
        } catch (error) {
          console.error("Error checking upcoming schedules:", error);
          return false;
        }
      },

      fetchCurrentSchedule: async () => {
        try {
          set({ isLoading: true, error: null });

          // Get the current state to check if we already have a schedule loaded
          const currentState = get();

          // Only check for upcoming schedules if we don't already have a current schedule
          // or if it's been more than 5 minutes since the last check
          const shouldCheckUpcoming =
            !currentState.currentSchedule ||
            !currentState.lastUpcomingCheck ||
            Date.now() - new Date(currentState.lastUpcomingCheck).getTime() >
              5 * 60 * 1000;

          if (shouldCheckUpcoming) {
            // Check for any upcoming schedules that should now be current
            await get().checkUpcomingSchedules();
            // Update the last check timestamp
            set({ lastUpcomingCheck: new Date().toISOString() });
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          // First try to get the schedule marked as "current"
          const { data: currentSchedule, error: currentError } = await supabase
            .from("schedules")
            .select("*")
            .eq("organization_id", organizationId)
            .eq("status", "current")
            .single();

          if (currentSchedule) {
            set({ currentSchedule });
            return currentSchedule;
          }

          // If no current schedule found, look for a schedule that includes today's date
          const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

          const { data: dateBasedSchedule, error: dateError } = await supabase
            .from("schedules")
            .select("*")
            .eq("organization_id", organizationId)
            .lte("start_date", today) // start_date <= today
            .gte("end_date", today) // end_date >= today
            .order("created_at", { ascending: false })
            .limit(1);

          if (dateBasedSchedule && dateBasedSchedule.length > 0) {
            // Found a schedule that includes today's date
            const schedule = dateBasedSchedule[0];

            // Update its status to current
            await supabase
              .from("schedules")
              .update({ status: "current" })
              .eq("id", schedule.id);

            // Update any other current schedules to previous
            if (currentSchedule) {
              await supabase
                .from("schedules")
                .update({ status: "previous" })
                .eq("id", currentSchedule.id);
            }

            set({ currentSchedule: schedule });
            return schedule;
          }

          // No schedule found
          set({ currentSchedule: null });
          return null;
        } catch (error) {
          console.error("Error fetching current schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load current schedule",
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUpcomingSchedule: async () => {
        try {
          set({ isLoading: true, error: null });

          // First check if any upcoming schedules should be activated
          await get().checkUpcomingSchedules();

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          const { data, error } = await supabase
            .from("schedules")
            .select("*")
            .eq("organization_id", organizationId)
            .eq("status", "upcoming")
            .single();

          if (error && error.code !== "PGRST116") {
            throw error;
          }

          set({ upcomingSchedule: data || null });
        } catch (error) {
          console.error("Error fetching upcoming schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load upcoming schedule",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPreviousSchedules: async () => {
        try {
          set({ isLoading: true, error: null });

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          const { data, error } = await supabase
            .from("schedules")
            .select("*")
            .eq("organization_id", organizationId)
            .eq("status", "previous")
            .order("end_date", { ascending: false });

          if (error) {
            throw error;
          }

          set({ previousSchedules: data || [] });
        } catch (error) {
          console.error("Error fetching previous schedules:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load previous schedules",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchShifts: async (scheduleId: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from("schedule_shifts")
            .select("*")
            .eq("schedule_id", scheduleId);

          if (error) {
            throw error;
          }

          const shifts = data || [];
          set({ scheduleShifts: shifts });
          return shifts;
        } catch (error) {
          console.error("Error fetching shifts:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to load shifts",
          });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      uploadSchedule: async (file, options) => {
        const selectedMapping = options.selectedMapping;
        try {
          set({ isLoading: true, error: null });

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          console.log("Auth user:", user);
          console.log("Organization ID:", organizationId);

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          // Use pre-matched shifts if provided, otherwise parse the CSV
          const shifts =
            options.matchedShifts ||
            (await parseScheduleCsvWithMapping(
              file,
              selectedMapping,
              options.startDate,
            ));

          if (shifts.length === 0) {
            throw new Error("No valid shifts found in the uploaded file");
          }

          // Upload the file to storage
          const timestamp = Date.now();
          const filePath = `${organizationId}/schedules/${timestamp}_${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("schedules")
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("schedules").getPublicUrl(filePath);

          // Create a new schedule record
          const scheduleData = {
            organization_id: organizationId,
            start_date: options.startDate,
            end_date: options.endDate,
            file_url: publicUrl,
            status: options.activateImmediately ? "current" : "upcoming",
            created_by: user.id,
            source: options.source || "csv",
          };

          console.log("Schedule data to insert:", scheduleData);

          // If activating immediately, update any current schedule to previous
          if (options.activateImmediately) {
            // Get the current schedule if any
            const { data: currentSchedule } = await supabase
              .from("schedules")
              .select("*")
              .eq("organization_id", organizationId)
              .eq("status", "current")
              .single();

            // If there's a current schedule, mark it as previous
            if (currentSchedule) {
              await supabase
                .from("schedules")
                .update({ status: "previous" })
                .eq("id", currentSchedule.id);
            }
          }

          // Insert the new schedule
          const { data: newSchedule, error: insertError } = await supabase
            .from("schedules")
            .insert([scheduleData])
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          console.log("New schedule created:", newSchedule);

          // Now insert all the shifts
          const shiftsToInsert = shifts.map((shift) => ({
            schedule_id: newSchedule.id,
            employee_name: shift.employee_name,
            employee_id: shift.employee_id || null,
            first_name: shift.first_name || null,
            last_name: shift.last_name || null,
            role: shift.role || null,
            shift_date:
              shift.shift_date ||
              shift.date ||
              new Date().toISOString().split("T")[0], // Ensure shift_date is never null
            start_time: shift.start_time,
            end_time: shift.end_time,
            break_duration: shift.break_duration || null,
            notes: shift.notes || null,
          }));

          // Insert shifts in batches to avoid payload size limits
          const batchSize = 100;
          for (let i = 0; i < shiftsToInsert.length; i += batchSize) {
            const batch = shiftsToInsert.slice(i, i + batchSize);
            const { error: shiftsError } = await supabase
              .from("schedule_shifts")
              .insert(batch);

            if (shiftsError) {
              throw shiftsError;
            }
          }

          // Update the store state
          if (options.activateImmediately) {
            set({ currentSchedule: newSchedule });
          } else {
            set({ upcomingSchedule: newSchedule });
          }

          return newSchedule;
        } catch (error) {
          console.error("Error uploading schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload schedule",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      activateSchedule: async (scheduleId: string) => {
        try {
          set({ isLoading: true, error: null });

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          // Get the schedule to activate
          const { data: scheduleToActivate, error: scheduleError } =
            await supabase
              .from("schedules")
              .select("*")
              .eq("id", scheduleId)
              .single();

          if (scheduleError) {
            throw scheduleError;
          }

          if (!scheduleToActivate) {
            throw new Error("Schedule not found");
          }

          // Get the current schedule if any
          const { data: currentSchedule, error: currentError } = await supabase
            .from("schedules")
            .select("*")
            .eq("organization_id", organizationId)
            .eq("status", "current")
            .single();

          // If there's a current schedule, mark it as previous
          if (currentSchedule && !currentError) {
            await supabase
              .from("schedules")
              .update({ status: "previous" })
              .eq("id", currentSchedule.id);
          }

          // Update the schedule to activate
          const { data: updatedSchedule, error: updateError } = await supabase
            .from("schedules")
            .update({ status: "current" })
            .eq("id", scheduleId)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          // Update the store state
          set({
            currentSchedule: updatedSchedule,
            upcomingSchedule:
              get().upcomingSchedule?.id === scheduleId
                ? null
                : get().upcomingSchedule,
            previousSchedules: currentSchedule
              ? [
                  currentSchedule,
                  ...get().previousSchedules.filter(
                    (s) => s.id !== currentSchedule.id,
                  ),
                ]
              : [...get().previousSchedules],
          });

          return updatedSchedule;
        } catch (error) {
          console.error("Error activating schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to activate schedule",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      archiveSchedule: async (scheduleId: string) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase
            .from("schedules")
            .update({ status: "previous" })
            .eq("id", scheduleId);

          if (error) {
            throw error;
          }

          // Update the store state
          if (get().currentSchedule?.id === scheduleId) {
            set({ currentSchedule: null });
          } else if (get().upcomingSchedule?.id === scheduleId) {
            set({ upcomingSchedule: null });
          }

          // Refresh the previous schedules
          await get().fetchPreviousSchedules();
        } catch (error) {
          console.error("Error archiving schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to archive schedule",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteSchedule: async (scheduleId: string) => {
        try {
          set({ isLoading: true, error: null });

          // First delete all shifts associated with this schedule
          const { error: shiftsError } = await supabase
            .from("schedule_shifts")
            .delete()
            .eq("schedule_id", scheduleId);

          if (shiftsError) {
            throw shiftsError;
          }

          // Then delete the schedule itself
          const { error } = await supabase
            .from("schedules")
            .delete()
            .eq("id", scheduleId);

          if (error) {
            throw error;
          }

          // Update the store state
          if (get().currentSchedule?.id === scheduleId) {
            set({ currentSchedule: null });
          } else if (get().upcomingSchedule?.id === scheduleId) {
            set({ upcomingSchedule: null });
          } else {
            set({
              previousSchedules: get().previousSchedules.filter(
                (s) => s.id !== scheduleId,
              ),
            });
          }

          return true;
        } catch (error) {
          console.error("Error deleting schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete schedule",
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      sync7shiftsSchedule: async (
        apiKey: string,
        locationId: string,
        startDate: string,
        endDate: string,
      ) => {
        try {
          set({ isLoading: true, error: null });

          // Set the credentials
          set({
            accessToken: apiKey,
            locationId: locationId,
            companyId: "7140", // Default company ID for 7shifts
          });

          // Fetch shifts from 7shifts
          const shifts = await get().syncSchedule(startDate, endDate);

          if (shifts.length === 0) {
            throw new Error("No shifts found for the selected date range");
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          // Create a new schedule record
          const scheduleData = {
            organization_id: organizationId,
            start_date: startDate,
            end_date: endDate,
            status: "upcoming",
            created_by: user.id,
            source: "7shifts",
          };

          // Insert the new schedule
          const { data: newSchedule, error: insertError } = await supabase
            .from("schedules")
            .insert([scheduleData])
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          // Transform 7shifts shifts to our format
          const shiftsToInsert = shifts.map((shift) => ({
            schedule_id: newSchedule.id,
            employee_name: shift.employee.name,
            employee_id: shift.employee.id.toString(),
            role: shift.role.name,
            shift_date: shift.date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            break_duration: shift.break_length || 0,
            notes: shift.notes || "",
          }));

          // Insert shifts in batches to avoid payload size limits
          const batchSize = 100;
          for (let i = 0; i < shiftsToInsert.length; i += batchSize) {
            const batch = shiftsToInsert.slice(i, i + batchSize);
            const { error: shiftsError } = await supabase
              .from("schedule_shifts")
              .insert(batch);

            if (shiftsError) {
              throw shiftsError;
            }
          }

          // Update the store state
          set({ upcomingSchedule: newSchedule });

          return newSchedule;
        } catch (error) {
          console.error("Error syncing 7shifts schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to sync 7shifts schedule",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "schedule-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        companyId: state.companyId,
        locationId: state.locationId,
        lastSync: state.lastSync,
      }),
    },
  ),
);
