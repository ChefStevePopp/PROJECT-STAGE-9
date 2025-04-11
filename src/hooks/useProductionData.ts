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

  // Force refresh when component mounts - include essential filter dependencies
  useEffect(() => {
    console.log("Component mounted, refreshing data with current filters");
    refreshData();
  }, [
    selectedDate,
    filters.status,
    filters.personalOnly,
    filters.kitchenStation,
    filters.adminView,
    filters.prepListIds,
  ]);

  // Fetch organization schedule and tasks on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      // Only set refreshing state once at the beginning
      setIsRefreshing(true);
      console.log("Starting fetchAllData with selectedDate:", selectedDate);
      console.log("SIMPLIFIED: Fetching ALL tasks without filtering");

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

        // Generate days based on whether we're in admin view, have specific prep lists, or in day view mode
        if (filters.adminView) {
          // Admin view should always show the selected date
          console.log("Using admin view - including selected date directly");
          days.push(selectedDate);
        } else {
          // Normal week view generation
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

                // Use the filters provided in the component props
                await fetchTemplateTasksByStatus(
                  filters.status === "pending" ||
                    filters.status === "in_progress" ||
                    filters.status === "completed"
                    ? filters.status
                    : "all", // Use status from filters or default to all
                  filters.personalOnly, // Use personal filter from props
                  filters.kitchenStation, // Use kitchen station filter from props
                  filters.adminView, // Use admin view setting from props
                  filters.prepListIds, // Use prep list IDs from props
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

  // COMPLETELY SIMPLIFIED APPROACH - Just put all tasks in the day view
  useEffect(() => {
    if (!templateTasks || weekDays.length === 0) return;

    console.log(
      "SUPER SIMPLIFIED: Organizing ALL tasks by day with templateTasks:",
      templateTasks.length,
    );
    console.log("SUPER SIMPLIFIED: Current view days:", weekDays);
    console.log("SUPER SIMPLIFIED: Raw template tasks:", templateTasks);

    // Create task map once and update it efficiently
    const taskMap: Record<string, Task[]> = {};

    // Initialize empty arrays for each day
    weekDays.forEach((day) => {
      taskMap[day] = [];
    });

    // CRITICAL FIX: Log the raw template tasks data to see what we're working with
    console.log(
      "CRITICAL DEBUG: Raw template tasks data:",
      JSON.stringify(templateTasks, null, 2),
    );

    const isDayView = weekDays.length === 1;
    const selectedDay = weekDays[0]; // First day in the array

    // For day view, put ALL tasks on the selected day
    if (isDayView) {
      console.log(
        `CRITICAL FIX: Day view detected - putting ALL ${templateTasks.length} tasks on ${selectedDay}`,
      );

      // Convert all template tasks to regular tasks and put them on the selected day
      const regularTasks = templateTasks.map((task) => {
        console.log(`CRITICAL DEBUG: Processing task ${task.id}:`, task);

        // Calculate days late based on created_at date, not due_date
        let daysLate = 0;
        let isLate = false;

        // FIXED: Always check created_at date to determine if task is late
        if (task.created_at) {
          const createdDate = new Date(task.created_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day
          createdDate.setHours(0, 0, 0, 0); // Reset time to start of day

          // If task was created before today, it's late by that many days
          if (createdDate < today) {
            const timeDiff = today.getTime() - createdDate.getTime();
            daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));
            isLate = daysLate > 0;
            console.log(
              `Task ${task.id} is ${daysLate} days late since creation on ${task.created_at}`,
            );
          }
        }

        // Automatically set priority to high for late tasks
        const taskPriority = isLate
          ? "high"
          : task.priority
            ? task.priority.toString()
            : "medium";

        return {
          id: task.id,
          title: task.title || "Untitled Task", // Provide fallback for title
          description: task.description || "",
          priority: taskPriority, // Set high priority for late tasks
          estimated_time: task.estimated_time || 0,
          station: task.station || task.kitchen_station || "", // Try both station fields
          assignee_id: task.assignee_id,
          completed: task.status === "completed" || false, // Check status field
          organization_id: task.organization_id || "", // Use the organization_id from the task if available
          due_date: selectedDay, // Force all tasks to the selected day
          template_id: task.template_id,
          prep_list_id: task.prep_list_id,
          // Ensure all prep system data is included
          prep_system: task.prep_system,
          par_level: task.par_level,
          current_level: task.current_level,
          amount_required: task.amount_required,
          kitchen_station: task.kitchen_station,
          kitchen_stations: task.kitchen_stations,
          kitchen_role: task.kitchen_role,
          master_ingredient_id: task.master_ingredient_id,
          recipe_id: task.recipe_id,
          // Add late information
          isLate: isLate,
          daysLate: daysLate,
          status: task.status || "pending", // Ensure status is preserved
          created_at: task.created_at, // Preserve created_at date
        };
      });

      // Put all tasks on the selected day
      taskMap[selectedDay] = regularTasks;
      console.log(
        `SIMPLIFIED: Added ${regularTasks.length} tasks to ${selectedDay}`,
      );
    }
    // For week view, organize tasks by their due dates
    else {
      console.log("SIMPLIFIED: Week view - organizing tasks by due date");

      templateTasks.forEach((task) => {
        // Get or default the due date
        const dueDate = task.due_date || selectedDate;
        const dueDateClean = dueDate.split("T")[0];

        // Find which day in the week this task belongs to
        const matchingDay = weekDays.find(
          (day) => day.split("T")[0] === dueDateClean,
        );

        if (matchingDay) {
          // Calculate days late based on created_at date, not due_date
          let daysLate = 0;
          let isLate = false;

          // FIXED: Always check created_at date to determine if task is late
          if (task.created_at) {
            const createdDate = new Date(task.created_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            createdDate.setHours(0, 0, 0, 0); // Reset time to start of day

            // If task was created before today, it's late by that many days
            if (createdDate < today) {
              const timeDiff = today.getTime() - createdDate.getTime();
              daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));
              isLate = daysLate > 0;
              console.log(
                `Task ${task.id} is ${daysLate} days late since creation on ${task.created_at}`,
              );
            }
          }

          // Create a regular task
          const regularTask: Task = {
            id: task.id,
            title: task.title,
            description: task.description || "",
            priority: task.priority || "medium",
            estimated_time: task.estimated_time || 0,
            station: task.station || "",
            assignee_id: task.assignee_id,
            completed: task.completed || false,
            organization_id: task.organization_id || "", // Use the organization_id from the task if available
            due_date: matchingDay,
            template_id: task.template_id,
            prep_list_id: task.prep_list_id,
            // Ensure prep system data is included
            prep_system: task.prep_system,
            par_level: task.par_level,
            current_level: task.current_level,
            amount_required: task.amount_required,
            kitchen_station: task.kitchen_station,
            kitchen_stations: task.kitchen_stations,
            kitchen_role: task.kitchen_role,
            master_ingredient_id: task.master_ingredient_id,
            recipe_id: task.recipe_id,
            // Add late information
            isLate: isLate,
            daysLate: daysLate,
            created_at: task.created_at, // Preserve created_at date
          };

          // Add to the matching day
          taskMap[matchingDay].push(regularTask);
        }
      });
    }

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

    // SIMPLIFIED: Log the final task count for each day
    Object.keys(taskMap).forEach((day) => {
      console.log(`SIMPLIFIED: Day ${day} has ${taskMap[day].length} tasks`);
    });

    console.log("SIMPLIFIED: Setting tasksByDay with tasks");
    setTasksByDay(taskMap);
  }, [
    templateTasks,
    weekDays,
    selectedDate,
    cateringEvents,
    filters.showCateringEvents,
    filters.prepListIds,
  ]);

  // Define refreshData function outside of the return to make it available to other effects
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      console.log("Refreshing data with filters:", filters);
      console.log("Selected date:", selectedDate);
      console.log("Prep list IDs:", filters.prepListIds);

      // Fetch data in parallel to reduce loading time
      await Promise.all([
        fetchTemplates(),
        // Use the filters provided in the component props
        fetchTemplateTasksByStatus(
          filters.status === "pending" ||
            filters.status === "in_progress" ||
            filters.status === "completed"
            ? filters.status
            : "all", // Use status from filters or default to all
          filters.personalOnly, // Use personal filter from props
          filters.kitchenStation, // Use kitchen station filter from props
          filters.adminView, // Use admin view setting from props
          filters.prepListIds, // Use prep list IDs from props
        ),
      ]);

      // Add a small delay to ensure the database has time to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Data refresh completed");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    weekDays,
    tasksByDay,
    setTasksByDay,
    isLoading,
    error,
    isRefreshing,
    setIsRefreshing,
    cateringEvents,
    refreshData,
  };
};
