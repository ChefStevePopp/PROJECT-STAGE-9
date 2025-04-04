import { useState, useEffect } from "react";
import { useProductionStore } from "@/stores/productionStore";
import { format, addDays, parseISO, startOfWeek } from "date-fns";
import { PrepListTemplateTask, Task } from "@/types/tasks";

type FilterOptions = {
  status: "pending" | "in_progress" | "completed";
  personalOnly: boolean;
  kitchenStation?: string;
  adminView?: boolean;
  showCateringEvents?: boolean;
  prepListIds?: string[];
};

export const useProductionData = (
  selectedDate: string,
  filters: FilterOptions,
) => {
  const {
    templateTasks,
    isLoading,
    error,
    fetchTemplates,
    fetchTemplateTasksByStatus,
    fetchOrganizationSchedule,
  } = useProductionStore();

  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [tasksByDay, setTasksByDay] = useState<Record<string, Task[]>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cateringEvents, setCateringEvents] = useState<any[]>([]);

  // Fetch organization schedule and tasks on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      // Only set refreshing state once at the beginning
      setIsRefreshing(true);
      console.log("Starting fetchAllData with selectedDate:", selectedDate);
      console.log("Current filters:", JSON.stringify(filters, null, 2));
      console.log("Prep list IDs:", filters.prepListIds);

      try {
        // Fetch organization schedule to get operating days
        console.log("Fetching organization schedule...");
        const schedule = await fetchOrganizationSchedule();
        console.log(
          "Organization schedule received:",
          JSON.stringify(schedule, null, 2),
        );

        // Generate week days based on the selected date
        const startDate = startOfWeek(parseISO(selectedDate), {
          weekStartsOn: 1,
        }); // Start from Monday
        console.log("Week start date:", format(startDate, "yyyy-MM-dd"));
        const days = [];

        // If we have a schedule from the organization, use those days
        // Otherwise default to a full week
        // Ensure daysToShow is always an array
        const daysToShow =
          Array.isArray(schedule?.team_schedule) &&
          schedule.team_schedule.length > 0
            ? schedule.team_schedule
            : [3, 4, 5, 6, 0]; // Default to Wed-Sun

        console.log("Days to show in schedule:", daysToShow);

        // Map from day number (0-6) to day index in the week (0-6 starting from Monday)
        const dayNumberToWeekIndex = {
          0: 6, // Sunday is at index 6 when week starts on Monday
          1: 0, // Monday is at index 0
          2: 1, // Tuesday is at index 1
          3: 2, // Wednesday is at index 2
          4: 3, // Thursday is at index 3
          5: 4, // Friday is at index 4
          6: 5, // Saturday is at index 5
        };

        for (let i = 0; i < 7; i++) {
          // Convert loop index to day number (0-6, where 0 is Sunday)
          // When week starts on Monday (weekStartsOn: 1), the mapping is:
          // i=0 -> Monday (day 1), i=1 -> Tuesday (day 2), ..., i=6 -> Sunday (day 0)
          const dayNumber = i === 6 ? 0 : i + 1;

          // Only include days that are in the organization's schedule
          if (daysToShow.includes(dayNumber)) {
            const day = addDays(startDate, i);
            const formattedDay = format(day, "yyyy-MM-dd");
            days.push(formattedDay);
          }
        }

        console.log("Generated week days:", days);
        setWeekDays(days);

        // Fetch tasks and catering events in parallel
        console.log(
          "Starting parallel fetch of templates/tasks and catering events...",
        );
        try {
          const [_, events] = await Promise.all([
            // Fetch templates and tasks
            (async () => {
              try {
                console.log("Fetching templates...");
                await fetchTemplates();
                console.log("Templates fetched successfully");

                console.log("Fetching template tasks with filters:", {
                  status: filters.status,
                  personalOnly: filters.personalOnly,
                  kitchenStation: filters.kitchenStation,
                  adminView: filters.adminView,
                  prepListIds: filters.prepListIds,
                });

                if (filters.prepListIds && filters.prepListIds.length > 0) {
                  console.log(
                    "Selected prep list IDs for task filtering:",
                    filters.prepListIds,
                  );
                } else {
                  console.log(
                    "No prep list IDs selected, will fetch all tasks",
                  );
                }

                await fetchTemplateTasksByStatus(
                  filters.status,
                  filters.personalOnly,
                  filters.kitchenStation,
                  filters.adminView,
                  filters.prepListIds, // Pass the selected prep list IDs to the fetch function
                );
                console.log("Template tasks fetched successfully");
              } catch (err) {
                console.error("Error in template/task fetching:", err);
                throw err; // Re-throw to be caught by the outer try/catch
              }
            })(),
            // Fetch catering events
            (async () => {
              try {
                console.log(
                  `Fetching catering events from ${days[0]} to ${days[days.length - 1]}`,
                );
                // This is a placeholder for actual catering events fetching
                const cateringEvents = await fetchCateringEvents(
                  days[0],
                  days[days.length - 1],
                );
                console.log(`Fetched ${cateringEvents.length} catering events`);
                return cateringEvents;
              } catch (error) {
                console.error("Error fetching catering events:", error);
                return [];
              }
            })(),
          ]);

          console.log("Parallel fetch completed successfully");
          setCateringEvents(events);
        } catch (parallelError) {
          console.error("Error in parallel fetch operations:", parallelError);
          // Set error state but continue with what we have
        }
      } catch (error) {
        console.error("Error in fetchAllData:", error);
        // Set error state to display to user
        set({ error: error instanceof Error ? error.message : String(error) });
      } finally {
        // Only set refreshing state once at the end
        setIsRefreshing(false);
        console.log("fetchAllData completed");
      }
    };

    fetchAllData();
  }, [
    fetchTemplates,
    fetchTemplateTasksByStatus,
    fetchOrganizationSchedule,
    selectedDate,
    filters.status,
    filters.personalOnly,
    filters.kitchenStation,
    filters.adminView,
    filters.prepListIds,
  ]);

  // Placeholder function for fetching catering events
  // In a real implementation, this would call your API
  const fetchCateringEvents = async (startDate: string, endDate: string) => {
    console.log(`Fetching catering events from ${startDate} to ${endDate}`);
    // Placeholder data - in a real implementation, this would come from your API
    return [];
  };

  // Organize tasks by day - memoized to prevent unnecessary recalculations
  useEffect(() => {
    if (!templateTasks || weekDays.length === 0) return;

    console.log("Organizing tasks by day with templateTasks:", templateTasks);
    console.log("Current filters:", filters);
    console.log("Selected prep list IDs:", filters.prepListIds);

    // Create task map once and update it efficiently
    const taskMap: Record<string, Task[]> = {};

    // Initialize empty arrays for each day
    weekDays.forEach((day) => {
      taskMap[day] = [];
    });

    // Use all tasks regardless of filters to ensure we show everything in the database
    let filteredTasks = templateTasks;

    console.log(
      "Using all template tasks without filtering:",
      templateTasks.length,
    );

    // Log each task's details for debugging
    if (templateTasks && templateTasks.length > 0) {
      console.log(
        `Logging details for ${templateTasks.length} template tasks:`,
      );
      templateTasks.forEach((task) => {
        console.log(
          `Task ${task.id} has template_id: ${task.template_id || "UNDEFINED"}, due_date: ${task.due_date || "UNDEFINED"}`,
        );
      });
    } else {
      console.warn(
        "No template tasks available - this may indicate an upstream issue",
      );
    }

    // Convert template tasks to regular tasks and organize by due date
    filteredTasks.forEach((task) => {
      // Use the task's due_date if available, otherwise use the selected date
      const dueDate = task.due_date || selectedDate;

      console.log(`Processing task ${task.id} with due date ${dueDate}`);

      // Only add the task if the due date is in our week view
      if (weekDays.includes(dueDate)) {
        const regularTask: Task = {
          id: task.id,
          title: task.title,
          description: task.description || "",
          priority: task.priority || "medium",
          estimated_time: task.estimated_time || 0,
          station: task.station || "",
          assignee_id: task.assignee_id,
          completed: task.completed || false,
          organization_id: task.organization_id || "", // Preserve organization_id if available
          due_date: dueDate,
          template_id: task.template_id, // Preserve template_id for reference
          prep_list_id: task.prep_list_id, // Preserve prep_list_id for reference
        };

        console.log(`Adding task to ${dueDate}:`, regularTask);
        taskMap[dueDate] = [...(taskMap[dueDate] || []), regularTask];
      } else {
        console.log(
          `Task ${task.id} due date ${dueDate} not in week days:`,
          weekDays,
        );
      }
    });

    // Add catering events as tasks if they exist and the filter is enabled
    if (cateringEvents.length > 0 && filters.showCateringEvents) {
      cateringEvents.forEach((event) => {
        const eventDate = event.date;
        if (weekDays.includes(eventDate)) {
          const cateringTask: Task = {
            id: `catering-${event.id}`,
            title: `Catering: ${event.title}`,
            description: event.description || "",
            priority: "high",
            estimated_time: event.duration || 0,
            station: "catering",
            assignee_id: event.assignee_id || "",
            completed: false,
            organization_id: "",
            due_date: eventDate,
            is_catering_event: true,
          };

          taskMap[eventDate] = [...(taskMap[eventDate] || []), cateringTask];
        }
      });
    }

    console.log("Final tasksByDay:", taskMap);
    setTasksByDay(taskMap);
  }, [
    templateTasks,
    weekDays,
    selectedDate,
    cateringEvents,
    filters.showCateringEvents,
    filters.prepListIds,
  ]);

  return {
    weekDays,
    tasksByDay,
    setTasksByDay,
    isLoading,
    error,
    isRefreshing,
    setIsRefreshing,
    cateringEvents,
    refreshData: async () => {
      setIsRefreshing(true);
      try {
        // Fetch data in parallel to reduce loading time
        await Promise.all([
          fetchTemplates(),
          fetchTemplateTasksByStatus(
            filters.status,
            filters.personalOnly,
            filters.kitchenStation,
            filters.adminView,
            filters.prepListIds, // Pass the selected prep list IDs to the fetch function
          ),
        ]);

        // Add a small delay to ensure the database has time to update
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        setIsRefreshing(false);
      }
    },
  };
};
