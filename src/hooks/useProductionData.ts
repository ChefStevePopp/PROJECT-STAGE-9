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
      setIsRefreshing(true);

      // Fetch organization schedule to get operating days
      const schedule = await fetchOrganizationSchedule();
      console.log("Fetched schedule in useProductionData:", schedule);

      // Generate week days based on the selected date
      const startDate = startOfWeek(parseISO(selectedDate), {
        weekStartsOn: 1,
      }); // Start from Monday
      const days = [];

      // If we have a schedule from the organization, use those days
      // Otherwise default to a full week
      // Ensure daysToShow is always an array
      const daysToShow =
        Array.isArray(schedule?.team_schedule) &&
        schedule.team_schedule.length > 0
          ? schedule.team_schedule
          : [3, 4, 5, 6, 0]; // Default to Wed-Sun

      console.log("Days to show in useProductionData:", daysToShow);

      // Map from day number (0-6) to day index in the week (0-6 starting from Monday)
      // This ensures we're correctly mapping the day numbers to the right positions in the week
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
          console.log(
            `Adding day ${dayNumber} (${format(day, "EEE")}) to week days: ${formattedDay}`,
          );
          days.push(formattedDay);
        } else {
          console.log(
            `Skipping day ${dayNumber} (${format(addDays(startDate, i), "EEE")}) - not in schedule`,
          );
        }
      }

      console.log("Final week days:", days);

      setWeekDays(days);

      // Fetch tasks with filters
      await fetchTemplates();
      await fetchTemplateTasksByStatus(
        filters.status,
        filters.personalOnly,
        filters.kitchenStation,
        filters.adminView,
      );

      // Fetch catering events for the selected week
      try {
        // This is a placeholder for actual catering events fetching
        // In a real implementation, you would fetch from your API or database
        const events = await fetchCateringEvents(
          days[0],
          days[days.length - 1],
        );
        setCateringEvents(events);
      } catch (error) {
        console.error("Error fetching catering events:", error);
      }

      setIsRefreshing(false);
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

  // Organize tasks by day
  useEffect(() => {
    if (templateTasks) {
      const taskMap: Record<string, Task[]> = {};

      // Initialize empty arrays for each day
      weekDays.forEach((day) => {
        taskMap[day] = [];
      });

      // Filter tasks by selected prep lists if any are selected
      const filteredTasks =
        filters.prepListIds && filters.prepListIds.length > 0
          ? templateTasks.filter((task) =>
              filters.prepListIds!.includes(task.template_id),
            )
          : templateTasks;

      // Convert template tasks to regular tasks and organize by due date
      filteredTasks.forEach((task) => {
        // For demo purposes, distribute tasks across the week
        // In a real implementation, you'd use the actual due_date from the task
        const dueDate = task.due_date || selectedDate;

        // Only add the task if the due date is in our week view
        if (weekDays.includes(dueDate)) {
          const regularTask: Task = {
            id: task.id,
            title: task.title,
            description: task.description || "",
            priority: "medium",
            estimated_time: task.estimated_time || 0,
            station: task.station || "",
            assignee_id: task.assignee_id,
            completed: false,
            organization_id: "", // Not needed for display
            due_date: dueDate,
          };

          taskMap[dueDate] = [...(taskMap[dueDate] || []), regularTask];
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

      setTasksByDay(taskMap);
    }
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
      await fetchTemplates();
      await fetchTemplateTasksByStatus(
        filters.status,
        filters.personalOnly,
        filters.kitchenStation,
        filters.adminView,
      );
      setIsRefreshing(false);
    },
  };
};
