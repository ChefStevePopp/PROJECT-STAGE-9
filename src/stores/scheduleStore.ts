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
  accessToken: string;
  companyId: string;
  locationId: string;

  // Current state
  currentSchedule: Schedule | null;
  upcomingSchedule: Schedule | null;
  previousSchedules: Schedule[];
  scheduleShifts: ScheduleShift[];

  // Actions
  syncSchedule: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  setCredentials: (credentials: {
    accessToken: string;
    companyId: string;
    locationId: string;
  }) => void;

  // Schedule management
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
    },
  ) => Promise<void>;
  activateSchedule: (scheduleId: string) => Promise<void>;
  archiveSchedule: (scheduleId: string) => Promise<void>;
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

      syncSchedule: async () => {
        const { accessToken, companyId, locationId } = get();
        set({ isLoading: true, error: null });

        try {
          const shifts = await getShifts({
            accessToken,
            companyId,
            locationId,
          });
          set({
            shifts,
            lastSync: new Date().toISOString(),
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to sync schedule";
          set({ error: errorMessage });
          console.error("Error syncing schedule:", error);
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
      fetchCurrentSchedule: async () => {
        try {
          set({ isLoading: true, error: null });

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

          // Parse the CSV file using the selected mapping
          const shifts = await parseScheduleCsvWithMapping(
            file,
            selectedMapping,
            options.startDate,
          );

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
            const { error: updateError } = await supabase
              .from("schedules")
              .update({ status: "previous" })
              .eq("organization_id", organizationId)
              .eq("status", "current");

            if (updateError) {
              throw updateError;
            }
          } else {
            // If not activating immediately, update any existing upcoming schedule
            const { error: updateError } = await supabase
              .from("schedules")
              .update({ status: "previous" })
              .eq("organization_id", organizationId)
              .eq("status", "upcoming");

            if (updateError) {
              throw updateError;
            }
          }

          // Insert the new schedule
          console.log("Inserting schedule into supabase...");
          const { data: schedule, error: insertError } = await supabase
            .from("schedules")
            .insert([scheduleData])
            .select()
            .single();

          console.log("Insert result:", { schedule, error: insertError });

          if (insertError) {
            throw insertError;
          }

          // Insert all shifts
          // Process shifts and try to match with team members
          const shiftsToInsert = await Promise.all(
            shifts.map(async (shift) => {
              // Try to match with team members if no employee_id is provided
              let employeeData = {
                employee_id: shift.employee_id || "",
                first_name: shift.first_name || "",
                last_name: shift.last_name || "",
              };

              // If we don't have employee data yet, try to match by name
              if (!employeeData.employee_id || !employeeData.first_name) {
                employeeData = await matchEmployeeWithTeamMember(
                  shift.employee_name,
                );
              }

              return {
                schedule_id: schedule.id,
                employee_name: shift.employee_name, // Keep for backward compatibility
                first_name: employeeData.first_name,
                last_name: employeeData.last_name,
                employee_id: employeeData.employee_id || shift.employee_id,
                role: shift.role,
                shift_date: shift.date,
                start_time: shift.start_time,
                end_time: shift.end_time,
                break_duration: shift.break_duration,
                notes: shift.notes,
              };
            }),
          );

          const { error: shiftsError } = await supabase
            .from("schedule_shifts")
            .insert(shiftsToInsert);

          if (shiftsError) {
            throw shiftsError;
          }

          // Update the store state
          if (options.activateImmediately) {
            const currentSchedule = get().currentSchedule;
            if (currentSchedule) {
              set({
                currentSchedule: schedule,
                previousSchedules: [
                  currentSchedule,
                  ...get().previousSchedules,
                ],
              });
            } else {
              set({ currentSchedule: schedule });
            }
          } else {
            set({ upcomingSchedule: schedule });
          }
        } catch (error) {
          console.error("Error uploading schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload schedule",
          });
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

          // Get the current schedule
          const currentSchedule = get().currentSchedule;

          // Update the current schedule to previous
          if (currentSchedule) {
            const { error: updateCurrentError } = await supabase
              .from("schedules")
              .update({ status: "previous" })
              .eq("id", currentSchedule.id);

            if (updateCurrentError) {
              throw updateCurrentError;
            }
          }

          // Update the upcoming schedule to current
          const { data: activatedSchedule, error: updateUpcomingError } =
            await supabase
              .from("schedules")
              .update({ status: "current" })
              .eq("id", scheduleId)
              .select()
              .single();

          if (updateUpcomingError) {
            throw updateUpcomingError;
          }

          // Update the store state
          set({
            currentSchedule: activatedSchedule,
            upcomingSchedule: null,
            previousSchedules: currentSchedule
              ? [currentSchedule, ...get().previousSchedules]
              : get().previousSchedules,
          });
        } catch (error) {
          console.error("Error activating schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to activate schedule",
          });
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

          // Update the store state based on which schedule was archived
          const currentSchedule = get().currentSchedule;
          const upcomingSchedule = get().upcomingSchedule;

          if (currentSchedule?.id === scheduleId) {
            set({
              currentSchedule: null,
              previousSchedules: [currentSchedule, ...get().previousSchedules],
            });
          } else if (upcomingSchedule?.id === scheduleId) {
            set({
              upcomingSchedule: null,
              previousSchedules: [upcomingSchedule, ...get().previousSchedules],
            });
          }
        } catch (error) {
          console.error("Error archiving schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to archive schedule",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      sync7shiftsSchedule: async (apiKey, locationId, startDate, endDate) => {
        try {
          set({ isLoading: true, error: null });

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const organizationId = user?.user_metadata?.organizationId;

          if (!organizationId) {
            throw new Error("No organization ID found");
          }

          // Fetch schedule from 7shifts API
          const scheduleData = await fetchSchedule(
            { apiKey, locationId },
            startDate,
            endDate,
          );

          if (!scheduleData.shifts || scheduleData.shifts.length === 0) {
            throw new Error("No shifts found in the specified date range");
          }

          // Create a new schedule record
          const scheduleRecord = {
            organization_id: organizationId,
            start_date: startDate,
            end_date: endDate,
            status: "upcoming", // Default to upcoming
            created_by: user.id,
            source: "7shifts",
            metadata: {
              location_id: locationId,
              total_shifts: scheduleData.shifts.length,
            },
          };

          // Insert the new schedule
          const { data: schedule, error: insertError } = await supabase
            .from("schedules")
            .insert([scheduleRecord])
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          // Transform and insert shifts
          const shiftsToInsert = scheduleData.shifts.map((shift) => ({
            schedule_id: schedule.id,
            employee_id: shift.user_id?.toString(),
            employee_name: shift.user?.name || "Unknown Employee",
            role: shift.role?.name || "",
            shift_date: shift.date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            break_duration: shift.break_time || 0,
            notes: shift.notes || "",
          }));

          const { error: shiftsError } = await supabase
            .from("schedule_shifts")
            .insert(shiftsToInsert);

          if (shiftsError) {
            throw shiftsError;
          }

          // Update the store state
          set({ upcomingSchedule: schedule });
        } catch (error) {
          console.error("Error syncing 7shifts schedule:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to sync 7shifts schedule",
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "schedule-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        companyId: state.companyId,
        locationId: state.locationId,
        lastSync: state.lastSync,
      }),
    },
  ),
);
