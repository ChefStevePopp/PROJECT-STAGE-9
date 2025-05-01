import React from "react";
import { Calendar, CalendarClock } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TaskSchedulerProps {
  taskId: string;
  dueDate: string;
  priority: string;
  estimatedTime: number;
  autoAdvance: boolean;
  onUpdatePrepSystem?: (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => Promise<void>;
  onDueDateChange?: (taskId: string, dueDate: string) => void;
  onPriorityChange?: (taskId: string, priority: string) => void;
  onEstimatedTimeChange?: (taskId: string, minutes: number) => void;
  onAutoAdvanceChange?: (taskId: string, autoAdvance: boolean) => void;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({
  taskId,
  dueDate,
  priority,
  estimatedTime,
  autoAdvance,
  onUpdatePrepSystem,
  onDueDateChange,
  onPriorityChange,
  onEstimatedTimeChange,
  onAutoAdvanceChange,
}) => {
  const [isUpdated, setIsUpdated] = React.useState<boolean>(false);
  const [localDueDate, setLocalDueDate] = React.useState<string>(dueDate || "");
  const [localAutoAdvance, setLocalAutoAdvance] =
    React.useState<boolean>(autoAdvance);

  // Handle due date change
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newDueDate = e.target.value;
    setLocalDueDate(newDueDate);
    setIsUpdated(true);

    // Update due_date in database
    supabase
      .from("prep_list_template_tasks")
      .update({ due_date: newDueDate })
      .eq("id", taskId)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating due date:", error);
        } else {
          console.log(`Updated due date to ${newDueDate}`);

          // If prep system is not already set to scheduled_production and a due date is set,
          // ask the user if they want to change the prep system
          if (newDueDate && onUpdatePrepSystem) {
            if (
              confirm(
                "Would you like to change the prep system to Scheduled Production?",
              )
            ) {
              onUpdatePrepSystem(taskId, "scheduled_production");
            }
          }

          // Show visual feedback
          const taskElement = document.querySelector(
            `[data-task-id="${taskId}"]`,
          );
          if (taskElement) {
            taskElement.classList.add("task-updated");
            setTimeout(
              () => taskElement.classList.remove("task-updated"),
              3000,
            );
          }
        }
        setTimeout(() => setIsUpdated(false), 3000);
      });

    // Call the callback if provided
    if (onDueDateChange) {
      onDueDateChange(taskId, newDueDate);
    }
  };

  // Handle priority change
  const [localPriority, setLocalPriority] = React.useState<string>(
    priority || "medium",
  );

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    // Update local state first for immediate feedback
    const newPriority = e.target.value;
    setLocalPriority(newPriority);
    setIsUpdated(true);

    // Then update in database
    supabase
      .from("prep_list_template_tasks")
      .update({ priority: newPriority })
      .eq("id", taskId)
      .then(() => {
        // Show success message
        console.log(`Updated priority to ${newPriority}`);
        setTimeout(() => setIsUpdated(false), 1000);
      })
      .catch((error) => {
        console.error("Error updating priority:", error);
        // Revert on error
        setLocalPriority(priority || "medium");
      });

    // Call the callback if provided
    if (onPriorityChange) {
      onPriorityChange(taskId, newPriority);
    }
  };

  // Handle estimated time change
  const handleEstimatedTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();
    const minutes = parseInt(e.target.value) || 0;

    // Update estimated_time in database
    supabase
      .from("prep_list_template_tasks")
      .update({ estimated_time: minutes })
      .eq("id", taskId)
      .then(() => {
        // Show success message
        console.log(`Updated estimated time to ${minutes} minutes`);
        // Show visual feedback
        setIsUpdated(true);
        setTimeout(() => setIsUpdated(false), 3000);
        // Show visual feedback on the task card
        const taskElement = document.querySelector(
          `[data-task-id="${taskId}"]`,
        );
        if (taskElement) {
          taskElement.classList.add("task-updated");
          setTimeout(() => taskElement.classList.remove("task-updated"), 3000);
        }
      })
      .catch((error) => {
        console.error("Error updating estimated time:", error);
      });

    // Call the callback if provided
    if (onEstimatedTimeChange) {
      onEstimatedTimeChange(taskId, minutes);
    }
  };

  // Handle auto-advance toggle
  const handleAutoAdvanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newValue = e.target.checked;
    setLocalAutoAdvance(newValue);
    setIsUpdated(true);

    // Update in database
    supabase
      .from("prep_list_template_tasks")
      .update({ auto_advance: newValue })
      .eq("id", taskId)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating auto-advance setting:", error);
          setLocalAutoAdvance(!newValue); // Revert on error
        } else {
          console.log(`Updated auto-advance to ${newValue}`);

          // Show visual feedback
          const taskElement = document.querySelector(
            `[data-task-id="${taskId}"]`,
          );
          if (taskElement) {
            taskElement.classList.add("task-updated");
            setTimeout(
              () => taskElement.classList.remove("task-updated"),
              3000,
            );
          }
        }
        setTimeout(() => setIsUpdated(false), 3000);
      });

    // Call the callback if provided
    if (onAutoAdvanceChange) {
      onAutoAdvanceChange(taskId, newValue);
    }
  };

  return (
    <div className="bg-slate-900/40 text-primary-400/80 p-2 rounded border border-primary-500/30">
      <div className="flex items-center mb-3 mt-4">
        <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/30 rounded-full border border-emerald-300/50 mr-2">
          <CalendarClock className="w-5 h-5 text-emerald-400" />
        </div>
        <span className="text-m text-white pl-1 p-1 font-medium">
          Prep Task Planning
        </span>
      </div>

      {/* Prep Task Planning Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Due Date Selector */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Due Date</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={localDueDate}
              onChange={handleDueDateChange}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (localDueDate && onUpdatePrepSystem) {
                  onUpdatePrepSystem(taskId, "scheduled_production");
                }
              }}
              className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-500/30 transition-colors"
              title="Set as Scheduled Production"
            >
              <Calendar className="w-3 h-3" />
              Schedule
            </button>
          </div>
        </div>
        {/* Priority Selector */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Priority</label>
          <div className="relative">
            <select
              value={localPriority}
              onChange={handlePriorityChange}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Estimated Time Input */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Estimated Time (minutes)
          </label>
          <input
            type="number"
            min="0"
            defaultValue={estimatedTime || 0}
            onChange={handleEstimatedTimeChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-xs"
            placeholder="Enter time in minutes"
          />
        </div>
      </div>
      {/* Auto-advance toggle */}
      <div className="flex items-center justify-between mb-4 bg-gray-700/30 p-2 rounded border border-gray-600">
        <div className="flex items-center gap-1 text-xs text-gray-300">
          <CalendarClock className="w-3 h-3 text-blue-400" />
          <span>Auto-advance to next day if not completed</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={localAutoAdvance}
            onChange={handleAutoAdvanceChange}
          />
          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500/50"></div>
        </label>
      </div>
    </div>
  );
};
